import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type UIContextValue = {
  projectOpen: boolean;
  ideaOpen: boolean;
  goalOpen: boolean;
  notice: string;
  openProject: () => void;
  openIdea: () => void;
  openGoal: () => void;
  closeProject: () => void;
  closeIdea: () => void;
  closeGoal: () => void;
  say: (message: string) => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [projectOpen, setProjectOpen] = useState(false);
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const value = useMemo(
    () => ({
      projectOpen,
      ideaOpen,
      goalOpen,
      notice,
      openProject: () => setProjectOpen(true),
      openIdea: () => setIdeaOpen(true),
      openGoal: () => setGoalOpen(true),
      closeProject: () => setProjectOpen(false),
      closeIdea: () => setIdeaOpen(false),
      closeGoal: () => setGoalOpen(false),
      say: (message: string) => {
        setNotice(message);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setNotice(""), 2200);
      },
    }),
    [projectOpen, ideaOpen, goalOpen, notice],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used inside UIProvider");
  return context;
}
