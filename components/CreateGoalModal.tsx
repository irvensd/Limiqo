import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts } from "@/constants/theme";
import type { Area } from "@/lib/data";
import { useStore } from "@/lib/store";
import AreaChips from "./AreaChips";
import FormModal from "./FormModal";

export default function CreateGoalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [area, setArea] = useState<Area>("Career");
  const todayFull = state.tasks.filter((task) => task.today).length >= 3;

  function submit() {
    if (!title.trim()) return;
    dispatch({
      type: "create-goal",
      title,
      note,
      area,
      nextStep,
      addToToday: true,
    });
    setTitle("");
    setNote("");
    setNextStep("");
    setArea("Career");
    onClose();
  }

  return (
    <FormModal open={open} title="Hold the line" heading="Add a goal" onClose={onClose}>
      <Text style={styles.label}>The aim</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="What are you actually aiming at?"
        placeholderTextColor={colors.mutedForeground}
        style={styles.input}
      />
      <Text style={styles.label}>Why it matters</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="One sentence. Then stop."
        placeholderTextColor={colors.mutedForeground}
        style={[styles.input, styles.area]}
        multiline
      />
      <Text style={styles.label}>One step, optional</Text>
      <TextInput
        value={nextStep}
        onChangeText={setNextStep}
        placeholder="A single move. Not a repeating reminder."
        placeholderTextColor={colors.mutedForeground}
        style={styles.input}
      />
      <Text style={styles.hint}>
        No due date. This goal stays until you mark it reached or let it go. A step
        only goes to Today if you write one
        {todayFull ? " — and Today is full, so it would wait in Up next." : "."} It
        will not come back tomorrow on its own.
      </Text>
      <Text style={styles.label}>Area</Text>
      <AreaChips value={area} onChange={setArea} />
      <View style={styles.actions}>
        <Pressable onPress={onClose}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Pressable onPress={submit} style={styles.submit}>
          <Text style={styles.submitText}>Add goal</Text>
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
    minHeight: 72,
    textAlignVertical: "top",
  },
  hint: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 8,
    lineHeight: 18,
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
