import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, createElement, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { Dispatch, ReactNode } from "react";
import {
  createSeed,
  DEFAULT_AREAS,
  type AppState,
  type Area,
  type GoalStatus,
  type IdeaStatus,
  type ProjectStatus,
} from "./data";
import { uid } from "./helpers";
import { withLinkedProgress } from "./progress";

const STORAGE_KEY = "northstar.v1";

type Action =
  | { type: "hydrate"; payload: AppState }
  | { type: "toggle-task"; id: string }
  | { type: "create-project"; name: string; description: string; area: Area }
  | { type: "create-project-task"; projectId: string; title: string }
  | { type: "set-project-status"; id: string; status: ProjectStatus }
  | { type: "create-idea"; title: string; description: string; area: Area }
  | { type: "set-idea-status"; id: string; status: IdeaStatus }
  | { type: "promote-idea"; id: string }
  | {
      type: "create-goal";
      title: string;
      note: string;
      area: Area;
      nextStep: string;
      addToToday: boolean;
    }
  | { type: "bring-goal-to-today"; id: string }
  | { type: "set-goal-status"; id: string; status: GoalStatus }
  | { type: "delete-goal"; id: string }
  | { type: "delete-project"; id: string }
  | { type: "delete-idea"; id: string }
  | { type: "add-area"; name: string }
  | { type: "delete-area"; name: string }
  | { type: "edit-today-task"; id: string; title: string }
  | { type: "park-today-task"; id: string }
  | { type: "swap-today-task"; outId: string; inId?: string; goalId?: string }
  | { type: "set-review"; key: keyof AppState["review"] }
  | { type: "set-name"; name: string }
  | { type: "reset" };

function reduce(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate": {
      const incoming = action.payload;
      return {
        ...createSeed(),
        ...incoming,
        tasks: (incoming.tasks ?? []).map((task) => ({
          ...task,
          goalId: task.goalId ?? null,
          projectId: task.projectId ?? null,
        })),
        goals: (incoming.goals ?? []).map((goal) => ({
          ...goal,
          status: goal.status ?? "active",
        })),
        areas:
          incoming.areas && incoming.areas.length > 0
            ? incoming.areas
            : [...DEFAULT_AREAS],
      };
    }
    case "toggle-task":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, done: !task.done } : task,
        ),
      };
    case "create-project-task": {
      const project = state.projects.find((item) => item.id === action.projectId);
      const title = action.title.trim();
      if (!project || !title) return state;
      const nextOrder = state.tasks.reduce((max, task) => Math.max(max, task.order), 0) + 1;
      return {
        ...state,
        tasks: [
          {
            id: uid("t"),
            title,
            area: project.area,
            projectId: project.id,
            goalId: null,
            done: false,
            today: false,
            order: nextOrder,
          },
          ...state.tasks,
        ],
      };
    }
    case "create-project":
      return {
        ...state,
        projects: [
          {
            id: uid("p"),
            name: action.name.trim(),
            description: action.description.trim() || "A deliberate commitment to what matters.",
            area: action.area,
            status: "active",
            progress: 0,
          },
          ...state.projects,
        ],
      };
    case "set-project-status":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.id ? { ...project, status: action.status } : project,
        ),
      };
    case "create-idea":
      return {
        ...state,
        ideas: [
          {
            id: uid("i"),
            title: action.title.trim(),
            description: action.description.trim() || "Good ideas do not have to become commitments.",
            area: action.area,
            status: "quarantined",
            capturedAt: new Date().toISOString(),
          },
          ...state.ideas,
        ],
      };
    case "set-idea-status":
      return {
        ...state,
        ideas: state.ideas.map((idea) =>
          idea.id === action.id ? { ...idea, status: action.status } : idea,
        ),
      };
    case "promote-idea": {
      const idea = state.ideas.find((item) => item.id === action.id);
      if (!idea) return state;
      return {
        ...state,
        projects: [
          {
            id: uid("p"),
            name: idea.title,
            description: idea.description,
            area: idea.area === "Life" ? "Product" : idea.area,
            status: "active",
            progress: 0,
          },
          ...state.projects,
        ],
        ideas: state.ideas.map((item) =>
          item.id === idea.id ? { ...item, status: "archived" } : item,
        ),
      };
    }
    case "create-goal": {
      const goalId = uid("g");
      const todayCount = state.tasks.filter((task) => task.today).length;
      const placeToday = action.addToToday && todayCount < 3;
      const nextOrder = state.tasks.reduce((max, task) => Math.max(max, task.order), 0) + 1;
      const step = action.nextStep.trim();
      return {
        ...state,
        goals: [
          {
            id: goalId,
            title: action.title.trim(),
            note: action.note.trim() || "A deliberate commitment to what matters.",
            area: action.area,
            progress: 0,
            projectId: null,
            status: "active",
          },
          ...state.goals,
        ],
        tasks: step
          ? [
              {
                id: uid("t"),
                title: step,
                area: action.area,
                projectId: null,
                goalId,
                done: false,
                today: placeToday,
                order: nextOrder,
              },
              ...state.tasks,
            ]
          : state.tasks,
      };
    }
    case "set-goal-status": {
      const goal = state.goals.find((item) => item.id === action.id);
      if (!goal || goal.status === action.status) return state;
      return {
        ...state,
        goals: state.goals.map((item) =>
          item.id === action.id
            ? { ...item, status: action.status }
            : item,
        ),
        tasks: state.tasks.map((task) =>
          task.goalId === action.id && task.today && !task.done
            ? { ...task, today: false }
            : task,
        ),
      };
    }
    case "delete-goal":
      return {
        ...state,
        goals: state.goals.filter((goal) => goal.id !== action.id),
        tasks: state.tasks
          .filter((task) => !(task.goalId === action.id && !task.projectId))
          .map((task) =>
            task.goalId === action.id ? { ...task, goalId: null } : task,
          ),
      };
    case "delete-project":
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== action.id),
        goals: state.goals.map((goal) =>
          goal.projectId === action.id ? { ...goal, projectId: null } : goal,
        ),
        tasks: state.tasks
          .filter((task) => !(task.projectId === action.id && !task.goalId))
          .map((task) =>
            task.projectId === action.id ? { ...task, projectId: null } : task,
          ),
      };
    case "delete-idea":
      return {
        ...state,
        ideas: state.ideas.filter((idea) => idea.id !== action.id),
      };
    case "add-area": {
      const name = action.name.trim();
      if (!name) return state;
      const exists = state.areas.some((area) => area.toLowerCase() === name.toLowerCase());
      if (exists) return state;
      return { ...state, areas: [...state.areas, name] };
    }
    case "delete-area": {
      const remaining = state.areas.filter((area) => area !== action.name);
      if (remaining.length === 0) return state;
      const fallback = remaining[0];
      const move = <T extends { area: string }>(items: T[]) =>
        items.map((item) => (item.area === action.name ? { ...item, area: fallback } : item));
      return {
        ...state,
        areas: remaining,
        tasks: move(state.tasks),
        projects: move(state.projects),
        ideas: move(state.ideas),
        goals: move(state.goals),
      };
    }
    case "bring-goal-to-today": {
      const goal = state.goals.find((item) => item.id === action.id);
      if (!goal || goal.status !== "active") return state;
      const todayCount = state.tasks.filter((task) => task.today).length;
      if (todayCount >= 3) return state;
      const existing = state.tasks.find(
        (task) => task.goalId === goal.id && !task.done && !task.today,
      );
      if (existing) {
        return {
          ...state,
          tasks: state.tasks.map((task) =>
            task.id === existing.id ? { ...task, today: true } : task,
          ),
        };
      }
      const alreadyToday = state.tasks.some(
        (task) => task.goalId === goal.id && task.today && !task.done,
      );
      if (alreadyToday) return state;
      const nextOrder = state.tasks.reduce((max, task) => Math.max(max, task.order), 0) + 1;
      return {
        ...state,
        tasks: [
          {
            id: uid("t"),
            title: goal.title,
            area: goal.area,
            projectId: goal.projectId,
            goalId: goal.id,
            done: false,
            today: true,
            order: nextOrder,
          },
          ...state.tasks,
        ],
      };
    }
    case "edit-today-task": {
      const title = action.title.trim();
      if (!title) return state;
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, title } : task,
        ),
      };
    }
    case "park-today-task":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, today: false } : task,
        ),
      };
    case "swap-today-task": {
      const parked = state.tasks.map((task) =>
        task.id === action.outId ? { ...task, today: false } : task,
      );
      if (action.inId) {
        return {
          ...state,
          tasks: parked.map((task) =>
            task.id === action.inId ? { ...task, today: true, done: false } : task,
          ),
        };
      }
      if (action.goalId) {
        const goal = state.goals.find((item) => item.id === action.goalId);
        if (!goal || goal.status !== "active") return { ...state, tasks: parked };
        const existing = parked.find(
          (task) => task.goalId === goal.id && !task.done && !task.today,
        );
        if (existing) {
          return {
            ...state,
            tasks: parked.map((task) =>
              task.id === existing.id ? { ...task, today: true } : task,
            ),
          };
        }
        const nextOrder = parked.reduce((max, task) => Math.max(max, task.order), 0) + 1;
        return {
          ...state,
          tasks: [
            {
              id: uid("t"),
              title: goal.title,
              area: goal.area,
              projectId: goal.projectId,
              goalId: goal.id,
              done: false,
              today: true,
              order: nextOrder,
            },
            ...parked,
          ],
        };
      }
      return { ...state, tasks: parked };
    }
    case "set-review":
      return { ...state, review: { ...state.review, [action.key]: !state.review[action.key] } };
    case "set-name":
      return { ...state, user: { ...state.user, name: action.name } };
    case "reset":
      return createSeed(state.user.name);
    default:
      return state;
  }
}

function reducer(state: AppState, action: Action): AppState {
  const next = reduce(state, action);
  if (next === state) return state;
  return withLinkedProgress(next);
}

const StoreContext = createContext<{ state: AppState; dispatch: Dispatch<Action> } | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => withLinkedProgress(createSeed()));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) dispatch({ type: "hydrate", payload: JSON.parse(raw) as AppState });
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [ready, state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return createElement(StoreContext.Provider, { value }, children);
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
