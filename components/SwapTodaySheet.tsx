import { Pressable, StyleSheet, Text } from "react-native";
import FormModal from "@/components/FormModal";
import { colors, fonts } from "@/constants/theme";
import { useStore } from "@/lib/store";

export default function SwapTodaySheet({
  open,
  incomingTitle,
  onClose,
  onChoose,
}: {
  open: boolean;
  incomingTitle: string;
  onClose: () => void;
  onChoose: (outId: string) => void;
}) {
  const { state } = useStore();
  const todaySlots = [...state.tasks.filter((task) => task.today)].sort((a, b) => a.order - b.order);

  return (
    <FormModal open={open} title="Today’s three" heading="Swap onto Today" onClose={onClose}>
      <Text style={styles.body}>
        Today already has three. Pick one to move to Up next. “{incomingTitle}” takes that slot.
      </Text>
      {todaySlots.map((task) => (
        <Pressable key={task.id} onPress={() => onChoose(task.id)} style={styles.option}>
          <Text style={styles.kicker}>{task.done ? "Done" : "Today"}</Text>
          <Text style={styles.title}>{task.title}</Text>
        </Pressable>
      ))}
      <Pressable onPress={onClose} style={styles.cancel}>
        <Text style={styles.quiet}>Cancel</Text>
      </Pressable>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.mutedForeground,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.regular,
    marginBottom: 8,
  },
  option: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 14,
  },
  kicker: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontFamily: fonts.regular,
    marginBottom: 4,
  },
  title: {
    color: colors.foreground,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  cancel: { marginTop: 16, alignSelf: "flex-end" },
  quiet: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
});
