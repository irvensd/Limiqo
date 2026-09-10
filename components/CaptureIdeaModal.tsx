import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts } from "@/constants/theme";
import type { Area } from "@/lib/data";
import { useStore } from "@/lib/store";
import AreaChips from "./AreaChips";
import FormModal from "./FormModal";

export default function CaptureIdeaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch } = useStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<Area>("Life");

  function submit() {
    if (!title.trim()) return;
    dispatch({ type: "create-idea", title, description, area });
    setTitle("");
    setDescription("");
    setArea("Life");
    onClose();
  }

  return (
    <FormModal open={open} title="Space before commitment" heading="Capture idea" onClose={onClose}>
      <Text style={styles.label}>The spark</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Name it. Do not build it yet."
        placeholderTextColor={colors.mutedForeground}
        style={styles.input}
      />
      <Text style={styles.label}>Why it arrived</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Enough to remember. Not enough to commit."
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
          <Text style={styles.submitText}>Quarantine it</Text>
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
