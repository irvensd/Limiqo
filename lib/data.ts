import { localDateKey } from "./helpers";

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
  user: { name: string; quarantineDays: number; onboarded: boolean; dayKey: string };
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

export function createSeed(name = ""): AppState {
  return {
    user: { name, quarantineDays: 14, onboarded: false, dayKey: localDateKey() },
    areas: [...DEFAULT_AREAS],
    tasks: [],
    projects: [],
    ideas: [],
    goals: [],
    review: {
      clearedInbox: false,
      choseTomorrow: false,
      archivedOne: false,
    },
  };
}
