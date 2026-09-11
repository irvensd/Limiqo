import { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";
import AreaChips from "@/components/AreaChips";
import { fieldStyles, SheetActions } from "@/components/fields";
import FormModal from "@/components/FormModal";
import ProjectChips from "@/components/ProjectChips";
import { colors } from "@/constants/theme";
import type { Area, Goal } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";

export default function CreateGoalModal({
  open,
  onClose,
  goal,
}: {
  open: boolean;
  onClose: () => void;
  goal?: Goal | null;
}) {
  const { state, dispatch } = useStore();
  const { say } = useUI();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [area, setArea] = useState<Area>("Career");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [needName, setNeedName] = useState(false);
  const editing = Boolean(goal);

  useEffect(() => {
    if (!open) return;
    setTitle(goal?.title ?? "");
    setNote(goal?.note ?? "");
    setNextStep("");
    setArea(goal?.area ?? "Career");
    setProjectId(goal?.projectId ?? null);
    setNeedName(false);
  }, [open, goal]);

  function pickProject(id: string | null) {
    setProjectId(id);
    const project = state.projects.find((item) => item.id === id);
    if (project) setArea(project.area);
  }

  function submit() {
    if (!title.trim()) {
      setNeedName(true);
      return;
    }
    setNeedName(false);
    if (goal) {
      dispatch({ type: "edit-goal", id: goal.id, title, note, area, projectId });
      say("Saved.");
    } else {
      dispatch({
        type: "create-goal",
        title,
        note,
        area,
        nextStep,
        projectId,
      });
      say("Goal added.");
    }
    setTitle("");
    setNote("");
    setNextStep("");
    setArea("Career");
    setProjectId(null);
    onClose();
  }

  return (
    <FormModal
      open={open}
      title="Hold the line"
      heading={editing ? "Edit goal" : "Add a goal"}
      onClose={onClose}
    >
      <Text style={fieldStyles.label}>The aim</Text>
      <TextInput
        value={title}
        onChangeText={(value) => {
          setTitle(value);
          setNeedName(false);
        }}
        placeholder="What are you actually aiming at?"
        placeholderTextColor={colors.mutedForeground}
        style={fieldStyles.input}
      />
      {needName ? <Text style={fieldStyles.hint}>Name it first.</Text> : null}
      <Text style={fieldStyles.label}>Why it matters</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="One sentence. Then stop."
        placeholderTextColor={colors.mutedForeground}
        style={[fieldStyles.input, fieldStyles.multiline]}
        multiline
      />
      {editing ? null : (
        <>
          <Text style={fieldStyles.label}>First step — you can skip this</Text>
          <TextInput
            value={nextStep}
            onChangeText={setNextStep}
            placeholder="The next thing you would actually do"
            placeholderTextColor={colors.mutedForeground}
            style={fieldStyles.input}
          />
          <Text style={fieldStyles.hint}>
            Leave it blank to save the goal only. A first step waits in Up next. You put it on Today when you choose today’s three.
          </Text>
        </>
      )}
      <Text style={fieldStyles.label}>Project</Text>
      <ProjectChips value={projectId} onChange={pickProject} />
      <Text style={fieldStyles.label}>Area</Text>
      <AreaChips value={area} onChange={setArea} />
      <SheetActions
        confirmLabel={editing ? "Save" : "Add goal"}
        onCancel={onClose}
        onConfirm={submit}
      />
    </FormModal>
  );
}
