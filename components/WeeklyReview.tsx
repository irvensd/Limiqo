import { Pressable, StyleSheet, Text, View } from "react-native";
import { SectionLabel } from "@/components/Type";
import { colors, fonts } from "@/constants/theme";
import { daysRemaining } from "@/lib/helpers";
import { useStore } from "@/lib/store";

export default function WeeklyReview() {
  const { state, dispatch, now } = useStore();
  const doneToday = state.tasks.filter((task) => task.today && task.done).length;
  const activeProjects = state.projects.filter((project) => project.status === "active");
  const dueIdeas = state.ideas.filter(
    (idea) =>
      idea.status !== "archived" &&
      daysRemaining(idea.capturedAt, state.user.quarantineDays, now) <= 3,
  );
  const checks = [
    { key: "clearedInbox" as const, label: "Cleared the idea inbox" },
    { key: "archivedOne" as const, label: "Archived one thing that no longer belongs" },
  ];

  return (
    <View>
      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardKicker}>Today</Text>
          <Text style={styles.cardNum}>{doneToday}/3</Text>
          <Text style={styles.cardNote}>Priorities completed.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardKicker}>Projects</Text>
          <Text style={styles.cardNum}>{activeProjects.length}</Text>
          <Text style={styles.cardNote}>Held in the active lane.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardKicker}>Ideas</Text>
          <Text style={styles.cardNum}>{dueIdeas.length}</Text>
          <Text style={styles.cardNote}>Approaching a decision.</Text>
        </View>
      </View>

      <View style={styles.sectionHead}>
        <SectionLabel>The ritual</SectionLabel>
      </View>
      {checks.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => dispatch({ type: "set-review", key: item.key })}
          style={styles.row}
        >
          <View style={[styles.check, state.review[item.key] && styles.checkOn]} />
          <Text style={[styles.rowText, state.review[item.key] && styles.done]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 12, marginTop: 8, marginBottom: 36 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 20,
  },
  cardKicker: {
    color: colors.mutedForeground,
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontFamily: fonts.regular,
  },
  cardNum: {
    color: colors.foreground,
    fontSize: 36,
    fontFamily: fonts.semibold,
    marginTop: 12,
  },
  cardNote: {
    color: colors.mutedForeground,
    fontSize: 14,
    marginTop: 8,
    fontFamily: fonts.regular,
  },
  sectionHead: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 22,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(150,157,148,0.7)",
  },
  checkOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rowText: {
    color: colors.foreground,
    fontSize: 17,
    flex: 1,
    fontFamily: fonts.medium,
  },
  done: {
    color: colors.mutedForeground,
    textDecorationLine: "line-through",
  },
});
