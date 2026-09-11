import { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";
import AreaChips from "@/components/AreaChips";
import { fieldStyles, SheetActions } from "@/components/fields";
import FormModal from "@/components/FormModal";
import { colors } from "@/constants/theme";
import type { Area, Project } from "@/lib/data";
import { useStore } from "@/lib/store";

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<Area>("Product");
  const editing = Boolean(project);

  useEffect(() => {
    if (!open) return;
    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setArea(project?.area ?? "Product");
  }, [open, project]);

  function submit() {
    if (!name.trim()) return;
    if (project) {
      dispatch({ type: "edit-project", id: project.id, name, description, area });
    } else {
      dispatch({ type: "create-project", name, description, area });
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
        onChangeText={setName}
        placeholder="What deserves a name?"
        placeholderTextColor={colors.mutedForeground}
        style={fieldStyles.input}
      />
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
