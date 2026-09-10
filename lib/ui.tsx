import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type UIContextValue = {
  projectOpen: boolean;
  ideaOpen: boolean;
  goalOpen: boolean;
  openProject: () => void;
  openIdea: () => void;
  openGoal: () => void;
  closeProject: () => void;
  closeIdea: () => void;
  closeGoal: () => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [projectOpen, setProjectOpen] = useState(false);
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const value = useMemo(
    () => ({
      projectOpen,
      ideaOpen,
      goalOpen,
      openProject: () => setProjectOpen(true),
      openIdea: () => setIdeaOpen(true),
      openGoal: () => setGoalOpen(true),
      closeProject: () => setProjectOpen(false),
      closeIdea: () => setIdeaOpen(false),
      closeGoal: () => setGoalOpen(false),
    }),
    [projectOpen, ideaOpen, goalOpen],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used inside UIProvider");
  return context;
}
