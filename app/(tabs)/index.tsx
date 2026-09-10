import { useState } from "react";
import { Gear, SunDim } from "phosphor-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import TodaySlotSheet from "@/components/TodaySlotSheet";
import TodayTask from "@/components/TodayTask";
import { Kicker, SectionLabel, Subtitle, Title } from "@/components/Type";
import { colors, floatingTab, fonts } from "@/constants/theme";
import type { Task } from "@/lib/data";
import { completeTaskHaptic, undoTaskHaptic } from "@/lib/haptics";
import { formatLongDate, greeting } from "@/lib/helpers";
import { useStore } from "@/lib/store";

export default function TodayScreen() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const [slot, setSlot] = useState<Task | null>(null);
  const today = [...state.tasks.filter((task) => task.today)].sort((a, b) => a.order - b.order);
  const done = today.filter((task) => task.done).length;
  const allDone = today.length > 0 && done === today.length;
  const waiting = [...state.tasks.filter((task) => !task.today && !task.done)].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <Kicker>Your space. Your pace.</Kicker>
          <Pressable
            onPress={() => router.push("/settings")}
            hitSlop={12}
            accessibilityLabel="Settings"
            style={styles.settings}
          >
            <Gear size={20} color={colors.mutedForeground} />
          </Pressable>
        </View>
        <Title>{`${greeting()}, ${state.user.name}.`}</Title>
        <Subtitle>{formatLongDate()}</Subtitle>
        <View style={styles.insight}>
          <SunDim size={20} color={colors.primary} />
          <Text style={styles.insightText}>A little less noise. A little more intention.</Text>
        </View>

        {allDone ? (
          <View style={styles.doneBlock}>
            <SunDim size={28} color={colors.primary} />
            <Text style={styles.doneTitle}>That’s enough for today.</Text>
            <Text style={styles.doneNote}>Protect the rest of the evening.</Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHead}>
              <SectionLabel>Today’s three</SectionLabel>
              <Text style={styles.meta}>
                {done} of {today.length} complete
              </Text>
            </View>
            {today.map((task, index) => (
              <TodayTask
                key={task.id}
                task={task}
                index={index}
                goalTitle={state.goals.find((goal) => goal.id === task.goalId)?.title}
                onOpenSlot={() => setSlot(task)}
                onOpenGoal={() => router.push("/(tabs)/goals")}
                onToggle={() => {
                  if (task.done) {
                    undoTaskHaptic();
                  } else {
                    completeTaskHaptic(done === today.length - 1);
                  }
                  dispatch({ type: "toggle-task", id: task.id });
                }}
              />
            ))}
            <Text style={styles.footer}>Three priorities. Enough to move forward.</Text>
          </>
        )}

        <View style={styles.nextBlock}>
          <SectionLabel>Up next</SectionLabel>
          <Text style={[styles.meta, { marginTop: 10, marginBottom: 16 }]}>
            Not a separate list. These are steps waiting off Today — from a goal, or something you moved off today’s three.
          </Text>
          <View style={styles.line} />
          {waiting.length === 0 ? (
            <Text style={styles.nextTitle}>The queue is empty. That’s a gift.</Text>
          ) : (
            waiting.map((task) => {
              const fromGoal = state.goals.find((goal) => goal.id === task.goalId);
              const fromProject = state.projects.find((project) => project.id === task.projectId);
              return (
                <View key={task.id} style={styles.nextItem}>
                  <Text style={styles.nextTitle}>{task.title}</Text>
                  {fromGoal ? (
                    <Pressable onPress={() => router.push("/(tabs)/goals")} hitSlop={6}>
                      <Text style={styles.from}>From goal · {fromGoal.title}</Text>
                    </Pressable>
                  ) : fromProject ? (
                    <Pressable onPress={() => router.push(`/project/${fromProject.id}`)} hitSlop={6}>
                      <Text style={styles.from}>From project · {fromProject.name}</Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.from}>Parked from Today</Text>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
      <TodaySlotSheet task={slot} onClose={() => setSlot(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: floatingTab.clearance },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  settings: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  insight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 36,
    marginBottom: 40,
  },
  insightText: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontFamily: fonts.regular,
    flex: 1,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  meta: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  footer: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 18,
  },
  doneBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 40,
    gap: 12,
  },
  doneTitle: {
    color: colors.foreground,
    fontSize: 22,
    fontFamily: fonts.semibold,
    letterSpacing: -0.4,
  },
  doneNote: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  nextBlock: { marginTop: 48 },
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  nextItem: {
    paddingBottom: 16,
    marginBottom: 4,
  },
  nextTitle: {
    color: colors.foreground,
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  from: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.medium,
    marginTop: 6,
  },
});
