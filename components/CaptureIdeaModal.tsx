import { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";
import AreaChips from "@/components/AreaChips";
import { fieldStyles, SheetActions } from "@/components/fields";
import FormModal from "@/components/FormModal";
import { colors } from "@/constants/theme";
import type { Area, Idea } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";

export default function CaptureIdeaModal({
  open,
  onClose,
  idea,
}: {
  open: boolean;
  onClose: () => void;
  idea?: Idea | null;
}) {
  const { dispatch } = useStore();
  const { say } = useUI();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<Area>("Life");
  const [needName, setNeedName] = useState(false);
  const editing = Boolean(idea);

  useEffect(() => {
    if (!open) return;
    setTitle(idea?.title ?? "");
    setDescription(idea?.description ?? "");
    setArea(idea?.area ?? "Life");
    setNeedName(false);
  }, [open, idea]);

  function submit() {
    if (!title.trim()) {
      setNeedName(true);
      return;
    }
    setNeedName(false);
    if (idea) {
      dispatch({ type: "edit-idea", id: idea.id, title, description, area });
      say("Saved.");
    } else {
      dispatch({ type: "create-idea", title, description, area });
      say("Idea quarantined.");
    }
    setTitle("");
    setDescription("");
    setArea("Life");
    onClose();
  }

  return (
    <FormModal
      open={open}
      title="Space before commitment"
      heading={editing ? "Edit idea" : "Capture idea"}
      onClose={onClose}
    >
      <Text style={fieldStyles.label}>The spark</Text>
      <TextInput
        value={title}
        onChangeText={(value) => {
          setTitle(value);
          setNeedName(false);
        }}
        placeholder="Name it. Do not build it yet."
        placeholderTextColor={colors.mutedForeground}
        style={fieldStyles.input}
      />
      {needName ? <Text style={fieldStyles.hint}>Name it first.</Text> : null}
      <Text style={fieldStyles.label}>Why it arrived</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Enough to remember. Not enough to commit."
        placeholderTextColor={colors.mutedForeground}
        style={[fieldStyles.input, fieldStyles.multiline]}
        multiline
      />
      <Text style={fieldStyles.label}>Area</Text>
      <AreaChips value={area} onChange={setArea} />
      {editing ? null : (
        <Text style={fieldStyles.hint}>
          It sits for fourteen days. You can still decide anytime.
        </Text>
      )}
      <SheetActions
        confirmLabel={editing ? "Save" : "Quarantine it"}
        onCancel={onClose}
        onConfirm={submit}
      />
    </FormModal>
  );
}
