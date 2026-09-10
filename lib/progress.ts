import type { AppState, Task } from "./data";

export function linkedProgress(tasks: Task[], key: "projectId" | "goalId", id: string) {
  const linked = tasks.filter((task) => task[key] === id);
  if (linked.length === 0) return 0;
  return Math.round((linked.filter((task) => task.done).length / linked.length) * 100);
}

export function linkedCounts(tasks: Task[], key: "projectId" | "goalId", id: string) {
  const linked = tasks.filter((task) => task[key] === id);
  return { total: linked.length, done: linked.filter((task) => task.done).length };
}

export function withLinkedProgress(state: AppState): AppState {
  return {
    ...state,
    projects: state.projects.map((project) => ({
      ...project,
      progress: linkedProgress(state.tasks, "projectId", project.id),
    })),
    goals: state.goals.map((goal) => ({
      ...goal,
      progress:
        goal.status === "reached" ? 100 : linkedProgress(state.tasks, "goalId", goal.id),
    })),
  };
}
