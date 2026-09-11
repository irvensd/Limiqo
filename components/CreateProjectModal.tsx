import { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";
import AreaChips from "@/components/AreaChips";
import { fieldStyles, SheetActions } from "@/components/fields";
import FormModal from "@/components/FormModal";
import { colors } from "@/constants/theme";
import type { Area, Project } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";

export default function CreateProjectModal({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
}) {
  const { dispatch } = useStore();
  const { say } = useUI();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<Area>("Product");
  const [needName, setNeedName] = useState(false);
  const editing = Boolean(project);

  useEffect(() => {
    if (!open) return;
    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setArea(project?.area ?? "Product");
    setNeedName(false);
  }, [open, project]);

  function submit() {
    if (!name.trim()) {
      setNeedName(true);
      return;
    }
    setNeedName(false);
    if (project) {
      dispatch({ type: "edit-project", id: project.id, name, description, area });
      say("Saved.");
    } else {
      dispatch({ type: "create-project", name, description, area });
      say("Project created.");
    }
    setName("");
    setDescription("");
    setArea("Product");
    onClose();
  }

  return (
    <FormModal
      open={open}
      title="Less, but better"
      heading={editing ? "Edit project" : "Create project"}
      onClose={onClose}
    >
      <Text style={fieldStyles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={(value) => {
          setName(value);
          setNeedName(false);
        }}
        placeholder="What deserves a name?"
        placeholderTextColor={colors.mutedForeground}
        style={fieldStyles.input}
      />
      {needName ? <Text style={fieldStyles.hint}>Name it first.</Text> : null}
      <Text style={fieldStyles.label}>Why it exists</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="One sentence. Then stop."
        placeholderTextColor={colors.mutedForeground}
        style={[fieldStyles.input, fieldStyles.multiline]}
        multiline
      />
      <Text style={fieldStyles.label}>Area</Text>
      <AreaChips value={area} onChange={setArea} />
      <SheetActions
        confirmLabel={editing ? "Save" : "Create project"}
        onCancel={onClose}
        onConfirm={submit}
      />
    </FormModal>
  );
}
