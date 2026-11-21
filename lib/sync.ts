import { createSeed, DEFAULT_AREAS, type AppState } from "./data";
import { getSupabase } from "./supabase";

type ProfileRow = {
  name: string;
  quarantine_days: number;
  onboarded: boolean;
  review_cleared_inbox: boolean;
  review_chose_tomorrow: boolean;
  review_archived_one: boolean;
};

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export function cloudMessage(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error ?? "");
  if (/schema cache|Could not find the table|relation .* does not exist|PGRST205/i.test(text)) {
    return "Cloud lists are not set up yet. This phone still has your lists.";
  }
  if (/Failed to fetch|Network request failed|network request|timeout|offline/i.test(text)) {
    return "Could not reach the cloud. This phone still has your lists.";
  }
  return "Not saved to the cloud. This phone still has your lists.";
}

async function syncTable(
  table: "projects" | "goals" | "ideas" | "tasks",
  userId: string,
  rows: Record<string, unknown>[],
) {
  const supabase = getSupabase();
  if (rows.length > 0) {
    const { error } = await supabase.from(table).upsert(rows);
    throwIf(error);
  }

  const { data, error } = await supabase.from(table).select("id").eq("user_id", userId);
  throwIf(error);
  const keep = new Set(rows.map((row) => String(row.id)));
  const gone = (data ?? []).map((row) => row.id as string).filter((id) => !keep.has(id));
  if (gone.length === 0) return;
  const { error: deleteError } = await supabase.from(table).delete().in("id", gone);
  throwIf(deleteError);
}

export async function loadRemote(userId: string): Promise<AppState | null> {
  const supabase = getSupabase();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "name, quarantine_days, onboarded, review_cleared_inbox, review_chose_tomorrow, review_archived_one",
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile) return null;

  const typed = profile as ProfileRow;
  const [areas, projects, goals, ideas, tasks] = await Promise.all([
    supabase.from("areas").select("name").eq("user_id", userId),
    supabase.from("projects").select("id, name, description, area, status").eq("user_id", userId),
    supabase.from("goals").select("id, title, note, area, project_id, status").eq("user_id", userId),
    supabase.from("ideas").select("id, title, description, area, status, captured_at").eq("user_id", userId),
    supabase
      .from("tasks")
      .select("id, title, area, project_id, goal_id, done, today, sort_order")
      .eq("user_id", userId),
  ]);

  throwIf(areas.error);
  throwIf(projects.error);
  throwIf(goals.error);
  throwIf(ideas.error);
  throwIf(tasks.error);

  const areaNames = (areas.data ?? []).map((row) => row.name as string);
  const seed = createSeed(typed.name);

  return {
    user: {
      name: typed.name,
      quarantineDays: typed.quarantine_days ?? seed.user.quarantineDays,
      onboarded: typed.onboarded,
      dayKey: "",
    },
    areas: areaNames.length > 0 ? areaNames : [...DEFAULT_AREAS],
    projects: (projects.data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      area: row.area as string,
      status: row.status as AppState["projects"][number]["status"],
      progress: 0,
    })),
    goals: (goals.data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      note: row.note as string,
      area: row.area as string,
      projectId: (row.project_id as string | null) ?? null,
      status: row.status as AppState["goals"][number]["status"],
      progress: 0,
    })),
    ideas: (ideas.data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      area: row.area as string,
      status: row.status as AppState["ideas"][number]["status"],
      capturedAt: row.captured_at as string,
    })),
    tasks: (tasks.data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      area: row.area as string,
      projectId: (row.project_id as string | null) ?? null,
      goalId: (row.goal_id as string | null) ?? null,
      done: Boolean(row.done),
      today: Boolean(row.today),
      order: Number(row.sort_order ?? 0),
    })),
    review: {
      clearedInbox: typed.review_cleared_inbox,
      choseTomorrow: typed.review_chose_tomorrow,
      archivedOne: typed.review_archived_one,
    },
  };
}

export async function saveRemote(userId: string, state: AppState) {
  const supabase = getSupabase();
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    name: state.user.name,
    quarantine_days: state.user.quarantineDays,
    onboarded: state.user.onboarded,
    review_cleared_inbox: state.review.clearedInbox,
    review_chose_tomorrow: state.review.choseTomorrow,
    review_archived_one: state.review.archivedOne,
    updated_at: new Date().toISOString(),
  });
  throwIf(profileError);

  const { data: existingAreas, error: areaReadError } = await supabase
    .from("areas")
    .select("id, name")
    .eq("user_id", userId);
  throwIf(areaReadError);

  const wanted = new Set(state.areas);
  const have = new Set((existingAreas ?? []).map((row) => row.name as string));
  const extraIds = (existingAreas ?? [])
    .filter((row) => !wanted.has(row.name as string))
    .map((row) => row.id as string);
  const missing = state.areas.filter((name) => !have.has(name));

  if (extraIds.length > 0) {
    const { error } = await supabase.from("areas").delete().in("id", extraIds);
    throwIf(error);
  }
  if (missing.length > 0) {
    const { error } = await supabase
      .from("areas")
      .insert(missing.map((name) => ({ user_id: userId, name })));
    throwIf(error);
  }

  await syncTable(
    "projects",
    userId,
    state.projects.map((project) => ({
      id: project.id,
      user_id: userId,
      name: project.name,
      description: project.description,
      area: project.area,
      status: project.status,
    })),
  );
  await syncTable(
    "goals",
    userId,
    state.goals.map((goal) => ({
      id: goal.id,
      user_id: userId,
      title: goal.title,
      note: goal.note,
      area: goal.area,
      project_id: goal.projectId,
      status: goal.status,
    })),
  );
  await syncTable(
    "ideas",
    userId,
    state.ideas.map((idea) => ({
      id: idea.id,
      user_id: userId,
      title: idea.title,
      description: idea.description,
      area: idea.area,
      status: idea.status,
      captured_at: idea.capturedAt,
    })),
  );
  await syncTable(
    "tasks",
    userId,
    state.tasks.map((task) => ({
      id: task.id,
      user_id: userId,
      title: task.title,
      area: task.area,
      project_id: task.projectId,
      goal_id: task.goalId,
      done: task.done,
      today: task.today,
      sort_order: task.order,
    })),
  );
}
