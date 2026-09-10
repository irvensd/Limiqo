export const DEFAULT_AREAS = ["Career", "Product", "Fitness", "Ministry", "Life"] as const;
export type Area = string;
export type ProjectStatus = "active" | "paused" | "maintain" | "archived";
export type IdeaStatus = "quarantined" | "reviewing" | "archived";
export type GoalStatus = "active" | "reached" | "released";

export type Task = {
  id: string;
  title: string;
  area: Area;
  projectId: string | null;
  goalId: string | null;
  done: boolean;
  today: boolean;
  order: number;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  area: Area;
  status: ProjectStatus;
  progress: number;
};

export type Idea = {
  id: string;
  title: string;
  description: string;
  area: Area;
  status: IdeaStatus;
  capturedAt: string;
};

export type Goal = {
  id: string;
  title: string;
  note: string;
  area: Area;
  progress: number;
  projectId: string | null;
  status: GoalStatus;
};

export type AppState = {
  user: { name: string; quarantineDays: number };
  tasks: Task[];
  projects: Project[];
  ideas: Idea[];
  goals: Goal[];
  areas: string[];
  review: {
    clearedInbox: boolean;
    choseTomorrow: boolean;
    archivedOne: boolean;
  };
};

function daysAgo(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function createSeed(name = "Irvens"): AppState {
  return {
    user: { name, quarantineDays: 14 },
    areas: [...DEFAULT_AREAS],
    tasks: [
      {
        id: "t1",
        title: "Complete Security+ Domain 4 review",
        area: "Career",
        projectId: "p-security",
        goalId: "g1",
        done: false,
        today: true,
        order: 1,
      },
      {
        id: "t2",
        title: "Push Resolvebase playbook flow",
        area: "Product",
        projectId: "p-resolvebase",
        goalId: "g2",
        done: false,
        today: true,
        order: 2,
      },
      {
        id: "t3",
        title: "Upper-body training session",
        area: "Fitness",
        projectId: null,
        goalId: "g3",
        done: false,
        today: true,
        order: 3,
      },
      {
        id: "t4",
        title: "Outline the next BibleStem post",
        area: "Ministry",
        projectId: "p-biblestem",
        goalId: "g4",
        done: false,
        today: false,
        order: 4,
      },
    ],
    projects: [
      {
        id: "p-resolvebase",
        name: "Resolvebase",
        description: "A focused operating system for moving work without noise.",
        area: "Product",
        status: "active",
        progress: 68,
      },
      {
        id: "p-security",
        name: "Security+",
        description: "Domain-by-domain mastery toward certification.",
        area: "Career",
        status: "active",
        progress: 62,
      },
      {
        id: "p-biblestem",
        name: "BibleStem Content",
        description: "Weekly teaching that stays rooted and shareable.",
        area: "Ministry",
        status: "active",
        progress: 28,
      },
      {
        id: "p-veyrivo",
        name: "Veyrivo",
        description: "Keep it healthy, not hungry. Maintenance over momentum.",
        area: "Product",
        status: "maintain",
        progress: 15,
      },
    ],
    ideas: [
      {
        id: "i1",
        title: "AI Bible debate platform",
        description: "A space to argue Scripture with care, not heat.",
        area: "Life",
        status: "quarantined",
        capturedAt: daysAgo(0),
      },
      {
        id: "i2",
        title: "Speaker booking marketplace",
        description: "Connect voices with rooms that need them.",
        area: "Life",
        status: "quarantined",
        capturedAt: daysAgo(3),
      },
      {
        id: "i3",
        title: "HYROX social network",
        description: "Training partners who show up when it counts.",
        area: "Life",
        status: "quarantined",
        capturedAt: daysAgo(6),
      },
    ],
    goals: [
      {
        id: "g1",
        title: "Pass Security+",
        note: "Finish Domain 4, then a full practice exam.",
        area: "Career",
        progress: 62,
        projectId: "p-security",
        status: "active",
      },
      {
        id: "g2",
        title: "Ship the Resolvebase playbook",
        note: "One focused session at a time. No extra surface area.",
        area: "Product",
        progress: 68,
        projectId: "p-resolvebase",
        status: "active",
      },
      {
        id: "g3",
        title: "Train with consistency",
        note: "Three sessions a week. Strength over spectacle.",
        area: "Fitness",
        progress: 40,
        projectId: null,
        status: "active",
      },
      {
        id: "g4",
        title: "Keep BibleStem weekly",
        note: "Publish before the week asks for more of you.",
        area: "Ministry",
        progress: 28,
        projectId: "p-biblestem",
        status: "active",
      },
    ],
    review: {
      clearedInbox: false,
      choseTomorrow: false,
      archivedOne: false,
    },
  };
}
