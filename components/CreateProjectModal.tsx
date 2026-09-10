import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts } from "@/constants/theme";
import type { Area } from "@/lib/data";
import { useStore } from "@/lib/store";
import AreaChips from "./AreaChips";
import FormModal from "./FormModal";

export default function CreateProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<Area>("Product");

  function submit() {
    if (!name.trim()) return;
    dispatch({ type: "create-project", name, description, area });
    setName("");
    setDescription("");
    setArea("Product");
    onClose();
  }

  return (
    <FormModal open={open} title="Less, but better" heading="Create project" onClose={onClose}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="What deserves a name?"
        placeholderTextColor={colors.mutedForeground}
        style={styles.input}
      />
      <Text style={styles.label}>Why it exists</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="One sentence. Then stop."
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, styles.area]}
        multiline
      />
      <Text style={styles.label}>Area</Text>
      <AreaChips value={area} onChange={setArea} />
      <View style={styles.actions}>
        <Pressable onPress={onClose}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Pressable onPress={submit} style={styles.submit}>
          <Text style={styles.submitText}>Create project</Text>
        </Pressable>
      </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.regular,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.foreground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  area: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    marginTop: 20,
  },
  cancel: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  submit: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  submitText: {
    color: colors.primaryForeground,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
});
