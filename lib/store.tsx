import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  createSeed,
  DEFAULT_AREAS,
  type AppState,
  type Area,
  type GoalStatus,
  type IdeaStatus,
  type ProjectStatus,
} from "./data";
import { localDateKey, todayIsFull, uid } from "./helpers";
import { withLinkedProgress } from "./progress";
import { cloudMessage, loadRemote, saveRemote } from "./sync";

export type CloudStatus = "idle" | "saving" | "saved" | "error";

export type CloudState = {
  status: CloudStatus;
  message: string;
};
import { useNow } from "./useNow";

const STORAGE_KEY = "limiqo.v2";

type Action =
  | { type: "hydrate"; payload: AppState }
  | { type: "toggle-task"; id: string }
  | { type: "create-project"; name: string; description: string; area: Area }
  | { type: "edit-project"; id: string; name: string; description: string; area: Area }
  | { type: "create-project-task"; projectId: string; title: string }
  | { type: "edit-task"; id: string; title: string }
  | { type: "delete-task"; id: string }
  | { type: "set-project-status"; id: string; status: ProjectStatus }
  | { type: "create-idea"; title: string; description: string; area: Area }
  | { type: "edit-idea"; id: string; title: string; description: string; area: Area }
  | { type: "set-idea-status"; id: string; status: IdeaStatus }
  | { type: "promote-idea"; id: string }
  | {
      type: "create-goal";
      title: string;
      note: string;
      area: Area;
      nextStep: string;
      projectId: string | null;
    }
  | { type: "edit-goal"; id: string; title: string; note: string; area: Area; projectId: string | null }
  | { type: "bring-goal-to-today"; id: string; step?: string }
  | { type: "bring-task-to-today"; id: string }
  | { type: "set-goal-status"; id: string; status: GoalStatus }
  | { type: "delete-goal"; id: string }
  | { type: "delete-project"; id: string }
  | { type: "delete-idea"; id: string }
  | { type: "add-area"; name: string }
  | { type: "delete-area"; name: string }
  | { type: "edit-today-task"; id: string; title: string }
  | { type: "park-today-task"; id: string }
  | { type: "swap-today-task"; outId: string; inId: string }
  | { type: "swap-today-task"; outId: string; goalId: string; step?: string }
  | { type: "set-review"; key: keyof AppState["review"] }
  | { type: "set-name"; name: string }
  | { type: "complete-onboarding"; name?: string }
  | { type: "set-day-key"; dayKey: string }
  | { type: "roll-day"; dayKey: string }
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
        user: {
          ...createSeed().user,
          ...incoming.user,
          name: incoming.user?.name ?? "",
          onboarded: incoming.user?.onboarded ?? true,
          dayKey: incoming.user?.dayKey ?? "",
        },
      };
    }
    case "toggle-task": {
      const full = todayIsFull(state.tasks);
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? { ...task, done: !task.done, today: task.today && !(task.done && full) }
            : task,
        ),
      };
    }
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
    case "edit-task":
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
    case "delete-task":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
      };
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
    case "edit-project": {
      const name = action.name.trim();
      if (!name) return state;
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.id
            ? {
                ...project,
                name,
                description: action.description.trim() || project.description,
                area: action.area,
              }
            : project,
        ),
        tasks: state.tasks.map((task) =>
          task.projectId === action.id ? { ...task, area: action.area } : task,
        ),
        goals: state.goals.map((goal) =>
          goal.projectId === action.id ? { ...goal, area: action.area } : goal,
        ),
      };
    }
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
    case "edit-idea": {
      const title = action.title.trim();
      if (!title) return state;
      return {
        ...state,
        ideas: state.ideas.map((idea) =>
          idea.id === action.id
            ? {
                ...idea,
                title,
                description: action.description.trim() || idea.description,
                area: action.area,
              }
            : idea,
        ),
      };
    }
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
      const nextOrder = state.tasks.reduce((max, task) => Math.max(max, task.order), 0) + 1;
      const step = action.nextStep.trim();
      const projectId = state.projects.some((item) => item.id === action.projectId)
        ? action.projectId
        : null;
      return {
        ...state,
        goals: [
          {
            id: goalId,
            title: action.title.trim(),
            note: action.note.trim() || "A deliberate commitment to what matters.",
            area: action.area,
            progress: 0,
            projectId,
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
                projectId,
                goalId,
                done: false,
                today: false,
                order: nextOrder,
              },
              ...state.tasks,
            ]
          : state.tasks,
      };
    }
    case "edit-goal": {
      const title = action.title.trim();
      if (!title) return state;
      const projectId = state.projects.some((item) => item.id === action.projectId)
        ? action.projectId
        : null;
      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === action.id
            ? {
                ...goal,
                title,
                note: action.note.trim() || goal.note,
                area: action.area,
                projectId,
              }
            : goal,
        ),
        tasks: state.tasks.map((task) =>
          task.goalId === action.id ? { ...task, area: action.area, projectId } : task,
        ),
      };
    }
    case "set-goal-status": {
      const goal = state.goals.find((item) => item.id === action.id);
      if (!goal || goal.status !== "active") return state;
      if (action.status === "active") return state;
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
      if (todayIsFull(state.tasks)) return state;
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
      const step = action.step?.trim();
      if (!step) return state;
      const nextOrder = state.tasks.reduce((max, task) => Math.max(max, task.order), 0) + 1;
      return {
        ...state,
        tasks: [
          {
            id: uid("t"),
            title: step,
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
    case "bring-task-to-today": {
      const target = state.tasks.find((task) => task.id === action.id);
      if (!target || target.done || target.today) return state;
      if (todayIsFull(state.tasks)) return state;
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, today: true } : task,
        ),
      };
    }
    case "park-today-task":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id && !task.done ? { ...task, today: false } : task,
        ),
      };
    case "swap-today-task": {
      const outgoing = state.tasks.find((task) => task.id === action.outId);
      if (!outgoing?.today || outgoing.done) return state;

      const afterParking = {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.outId ? { ...task, today: false } : task,
        ),
      };
      if ("inId" in action) {
        if (action.inId === outgoing.id) return state;
        const next = reduce(afterParking, { type: "bring-task-to-today", id: action.inId });
        return next === afterParking ? state : next;
      }

      if (outgoing.goalId === action.goalId) return state;
      const next = reduce(afterParking, {
        type: "bring-goal-to-today",
        id: action.goalId,
        step: action.step,
      });
      return next === afterParking ? state : next;
    }
    case "set-review":
      return { ...state, review: { ...state.review, [action.key]: !state.review[action.key] } };
    case "set-name":
      return { ...state, user: { ...state.user, name: action.name } };
    case "complete-onboarding": {
      const name = action.name?.trim() || state.user.name.trim();
      return { ...state, user: { ...state.user, name, onboarded: true } };
    }
    case "set-day-key":
      if (state.user.dayKey === action.dayKey) return state;
      return { ...state, user: { ...state.user, dayKey: action.dayKey } };
    case "roll-day": {
      if (state.user.dayKey === action.dayKey) return state;
      return {
        ...state,
        user: { ...state.user, dayKey: action.dayKey },
        tasks: state.tasks.map((task) => (task.today ? { ...task, today: false } : task)),
      };
    }
    case "reset": {
      const next = createSeed(state.user.name);
      return { ...next, user: { ...next.user, onboarded: true } };
    }
    default:
      return state;
  }
}

function reducer(state: AppState, action: Action): AppState {
  const next = reduce(state, action);
  if (next === state) return state;
  return withLinkedProgress(next);
}

const StoreContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
  ready: boolean;
  now: Date;
  cloud: CloudState;
  retryCloud: () => void;
} | null>(null);

export function StoreProvider({
  children,
  userId,
  displayName = "",
}: {
  children: ReactNode;
  userId: string;
  displayName?: string;
}) {
  const now = useNow();
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    withLinkedProgress(createSeed(displayName)),
  );
  const [ready, setReady] = useState(false);
  const [cloud, setCloud] = useState<CloudState>({ status: "idle", message: "" });
  const storageKey = `${STORAGE_KEY}.${userId}`;
  const stateRef = useRef(state);
  const saveGen = useRef(0);
  stateRef.current = state;

  const persistCloud = useCallback(
    async (next: AppState) => {
      const gen = ++saveGen.current;
      setCloud((current) => ({ ...current, status: "saving" }));
      try {
        await saveRemote(userId, next);
        if (gen !== saveGen.current) return;
        setCloud({ status: "saved", message: "" });
      } catch (error) {
        if (gen !== saveGen.current) return;
        setCloud({ status: "error", message: cloudMessage(error) });
      }
    },
    [userId],
  );

  const retryCloud = useCallback(() => {
    persistCloud(stateRef.current);
  }, [persistCloud]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let loadFailed = "";
      try {
        const [raw, remote] = await Promise.all([
          AsyncStorage.getItem(storageKey),
          loadRemote(userId).catch((error) => {
            loadFailed = cloudMessage(error);
            return null;
          }),
        ]);
        if (cancelled) return;
        let localDayKey = "";
        if (raw) {
          try {
            localDayKey = (JSON.parse(raw) as AppState).user?.dayKey ?? "";
          } catch {
            localDayKey = "";
          }
        }
        if (remote) {
          dispatch({
            type: "hydrate",
            payload: {
              ...remote,
              user: { ...remote.user, dayKey: localDayKey || remote.user.dayKey || "" },
            },
          });
        } else if (raw) {
          dispatch({ type: "hydrate", payload: JSON.parse(raw) as AppState });
        }
        if (loadFailed) setCloud({ status: "error", message: loadFailed });
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storageKey, userId]);

  useEffect(() => {
    if (!ready) return;
    const today = localDateKey(now);
    if (state.user.dayKey === today) return;
    if (!state.user.dayKey) {
      dispatch({ type: "set-day-key", dayKey: today });
      return;
    }
    dispatch({ type: "roll-day", dayKey: today });
  }, [ready, now, state.user.dayKey]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(state));
    const timer = setTimeout(() => {
      persistCloud(state);
    }, 400);
    return () => clearTimeout(timer);
  }, [ready, state, storageKey, persistCloud]);

  const value = useMemo(
    () => ({ state, dispatch, ready, now, cloud, retryCloud }),
    [state, dispatch, ready, now, cloud, retryCloud],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
