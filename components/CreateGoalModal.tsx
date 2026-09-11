import { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";
import AreaChips from "@/components/AreaChips";
import { fieldStyles, SheetActions } from "@/components/fields";
import FormModal from "@/components/FormModal";
import { colors } from "@/constants/theme";
import type { Area, Goal } from "@/lib/data";
import { useStore } from "@/lib/store";

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
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [area, setArea] = useState<Area>("Career");
  const todayFull = state.tasks.filter((task) => task.today).length >= 3;
  const editing = Boolean(goal);

  useEffect(() => {
    if (!open) return;
    setTitle(goal?.title ?? "");
    setNote(goal?.note ?? "");
    setNextStep("");
    setArea(goal?.area ?? "Career");
  }, [open, goal]);

  function submit() {
    if (!title.trim()) return;
    if (goal) {
      dispatch({ type: "edit-goal", id: goal.id, title, note, area });
    } else {
      dispatch({
        type: "create-goal",
        title,
        note,
        area,
        nextStep,
        addToToday: true,
      });
    }
    setTitle("");
    setNote("");
    setNextStep("");
    setArea("Career");
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
        onChangeText={setTitle}
        placeholder="What are you actually aiming at?"
        placeholderTextColor={colors.mutedForeground}
        style={fieldStyles.input}
      />
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
            {todayFull
              ? "Leave it blank to save the goal only. If you write a step, Today is full, so it waits in Up next until you swap it on."
              : "Leave it blank to save the goal only. If you write a step, it goes on Today. It will not come back tomorrow on its own."}
          </Text>
        </>
      )}
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
