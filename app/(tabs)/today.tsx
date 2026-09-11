import { useState } from "react";
import { SunDim } from "phosphor-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ScreenHead from "@/components/ScreenHead";
import SwapTodaySheet from "@/components/SwapTodaySheet";
import TodaySlotSheet from "@/components/TodaySlotSheet";
import TodayTask from "@/components/TodayTask";
import { SectionLabel, Subtitle, Title } from "@/components/Type";
import { colors, floatingTab, fonts } from "@/constants/theme";
import type { Task } from "@/lib/data";
import { completeTaskHaptic, undoTaskHaptic } from "@/lib/haptics";
import { formatLongDate, greeting, todayIsFull } from "@/lib/helpers";
import { useStore } from "@/lib/store";

export default function TodayScreen() {
  const router = useRouter();
  const { state, dispatch, now } = useStore();
  const [slot, setSlot] = useState<Task | null>(null);
  const [swapFor, setSwapFor] = useState<Task | null>(null);
  const today = [...state.tasks.filter((task) => task.today)].sort((a, b) => a.order - b.order);
  const done = today.filter((task) => task.done).length;
  const allDone = today.length > 0 && done === today.length;
  const todayFull = todayIsFull(state.tasks);
  const waiting = [...state.tasks.filter((task) => !task.today && !task.done)].sort(
    (a, b) => a.order - b.order,
  );

  function addToToday(task: Task) {
    if (todayFull) {
      setSwapFor(task);
      return;
    }
    dispatch({ type: "bring-task-to-today", id: task.id });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHead kicker="Your space. Your pace." />
        <Title>
          {state.user.name.trim()
            ? `${greeting(now)}, ${state.user.name}.`
            : `${greeting(now)}.`}
        </Title>
        <Subtitle>{formatLongDate(now)}</Subtitle>
        <View style={styles.insight}>
          <SunDim size={20} color={colors.primary} />
          <Text style={styles.insightText}>A little less noise. A little more intention.</Text>
        </View>

        {today.length === 0 ? (
          <View style={styles.doneBlock}>
            <Text style={styles.doneTitle}>Nothing on Today yet.</Text>
            <Text style={styles.doneNote}>
              Pick a step from Goals or from Projects, then tap Add to Today. This list stays empty until you choose three.
            </Text>
            <View style={styles.emptyLinks}>
              <Pressable onPress={() => router.push("/(tabs)/goals")} hitSlop={8}>
                <Text style={styles.emptyLink}>Goals</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(tabs)/projects")} hitSlop={8}>
                <Text style={styles.emptyLink}>Projects</Text>
              </Pressable>
            </View>
          </View>
        ) : allDone ? (
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
                projectTitle={state.projects.find((project) => project.id === task.projectId)?.name}
                onOpenSlot={() => setSlot(task)}
                onOpenGoal={() => router.push("/(tabs)/goals")}
                onOpenProject={() => {
                  if (task.projectId) router.push(`/project/${task.projectId}`);
                }}
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
            Not a separate list. These are steps waiting off Today — from a goal or a project, or something you moved off today’s three.
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
                  <Pressable onPress={() => addToToday(task)} hitSlop={8}>
                    <Text style={styles.addToday}>
                      {todayFull ? "Add to Today — swap a slot" : "Add to Today"}
                    </Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
      <TodaySlotSheet task={slot} onClose={() => setSlot(null)} />
      <SwapTodaySheet
        open={Boolean(swapFor)}
        incomingTitle={swapFor?.title ?? ""}
        onClose={() => setSwapFor(null)}
        onChoose={(outId) => {
          if (!swapFor) return;
          dispatch({ type: "swap-today-task", outId, inId: swapFor.id });
          setSwapFor(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: floatingTab.clearance },
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
    lineHeight: 21,
    fontFamily: fonts.regular,
  },
  emptyLinks: {
    flexDirection: "row",
    gap: 20,
    marginTop: 4,
  },
  emptyLink: {
    color: colors.mutedForeground,
    fontSize: 13,
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
  addToday: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 10,
  },
});
