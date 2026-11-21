import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import FormModal from "@/components/FormModal";
import { colors, fonts } from "@/constants/theme";
import type { Task } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function TodaySlotSheet({
  task,
  onClose,
}: {
  task: Task | null;
  onClose: () => void;
}) {
  const { state, dispatch } = useStore();
  const [title, setTitle] = useState(task?.title ?? "");

  useEffect(() => {
    setTitle(task?.title ?? "");
  }, [task]);

  const waiting = useMemo(
    () => state.tasks.filter((item) => !item.today && !item.done && item.id !== task?.id),
    [state.tasks, task?.id],
  );

  const open = Boolean(task);
  const empty = waiting.length === 0;

  function save() {
    if (!task || !title.trim()) return;
    dispatch({ type: "edit-today-task", id: task.id, title });
    onClose();
  }

  function park() {
    if (!task) return;
    dispatch({ type: "park-today-task", id: task.id });
    onClose();
  }

  return (
    <FormModal open={open} title="Today" heading="Edit this step" onClose={onClose}>
      <Text style={styles.label}>The step</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="What is the next move?"
        placeholderTextColor={colors.mutedForeground}
        style={styles.input}
      />
      <View style={styles.editActions}>
        <Pressable onPress={onClose}>
          <Text style={styles.quiet}>Cancel</Text>
        </Pressable>
        <Pressable onPress={save} style={styles.save}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>

      {task && !task.done ? (
        <>
          <Pressable onPress={park} style={styles.park}>
            <Text style={styles.quiet}>Move to Up next</Text>
          </Pressable>

          <Text style={styles.swapLabel}>Swap with</Text>
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {empty ? (
              <Text style={styles.empty}>Nothing waiting. Add a step from a goal or a project, or leave this slot.</Text>
            ) : null}
            {waiting.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  dispatch({ type: "swap-today-task", outId: task.id, inId: item.id });
                  onClose();
                }}
                style={styles.option}
              >
                <Text style={styles.optionTitle}>{item.title}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.regular,
    marginBottom: 8,
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
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
  },
  save: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveText: {
    color: colors.primaryForeground,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  quiet: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  park: {
    marginTop: 20,
    paddingVertical: 8,
  },
  swapLabel: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.semibold,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 16,
    marginBottom: 8,
  },
  list: {
    maxHeight: 220,
  },
  empty: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: fonts.regular,
    paddingVertical: 12,
  },
  option: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 14,
  },
  optionTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
});
