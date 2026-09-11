import { useState } from "react";
import { ArrowUpRight } from "phosphor-react-native";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AreaDot from "@/components/AreaDot";
import ConfirmSheet from "@/components/ConfirmSheet";
import CreateGoalModal from "@/components/CreateGoalModal";
import FormModal from "@/components/FormModal";
import { fieldStyles, SheetActions } from "@/components/fields";
import PrimaryButton from "@/components/PrimaryButton";
import ProgressBar from "@/components/ProgressBar";
import ScreenHead from "@/components/ScreenHead";
import SwapTodaySheet from "@/components/SwapTodaySheet";
import { SectionLabel, Subtitle, Title } from "@/components/Type";
import { colors, floatingTab, fonts } from "@/constants/theme";
import type { Goal, GoalStatus } from "@/lib/data";
import { pad, todayIsFull } from "@/lib/helpers";
import { linkedCounts } from "@/lib/progress";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";

export default function GoalsScreen() {
  const { state, dispatch } = useStore();
  const { openGoal, say } = useUI();
  const router = useRouter();
  const todayFull = todayIsFull(state.tasks);
  const holding = state.goals.filter((goal) => goal.status === "active");
  const closed = state.goals.filter((goal) => goal.status !== "active");
  const [pending, setPending] = useState<
    | { kind: "status"; goal: Goal; status: Exclude<GoalStatus, "active"> }
    | { kind: "delete"; goal: Goal }
    | null
  >(null);
  const [swapFor, setSwapFor] = useState<{
    goal: Goal;
    inId?: string;
    step?: string;
  } | null>(null);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [ask, setAsk] = useState<Goal | null>(null);
  const [askStep, setAskStep] = useState("");

  function waitingFor(goal: Goal) {
    return state.tasks.find((task) => task.goalId === goal.id && !task.today && !task.done);
  }

  function placeGoal(goal: Goal, step?: string, inId?: string) {
    if (todayFull) {
      setSwapFor({ goal, step, inId });
      return;
    }
    if (inId) {
      dispatch({ type: "bring-task-to-today", id: inId });
      return;
    }
    dispatch({ type: "bring-goal-to-today", id: goal.id, step });
  }

  function addToToday(goal: Goal) {
    const waiting = waitingFor(goal);
    if (waiting) {
      placeGoal(goal, waiting.title, waiting.id);
      return;
    }
    setAskStep("");
    setAsk(goal);
  }

  function submitStep(asAim = false) {
    if (!ask) return;
    const step = asAim ? ask.title : askStep.trim();
    if (!step) return;
    const goal = ask;
    setAsk(null);
    setAskStep("");
    placeGoal(goal, step);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHead kicker="Hold the line" />
        <Title>Goals</Title>
        <Subtitle>Aims you hold on purpose. Not a schedule.</Subtitle>
        <View style={styles.rules}>
          <Text style={styles.rule}>No deadline. You decide when it ends — mark it reached, or let it go. That door does not open again.</Text>
          <Text style={styles.rule}>
            It does not show up every day. Use Add to Today when you want one step on the Today tab.
          </Text>
        </View>
        <PrimaryButton label="Add a goal" onPress={openGoal} />
        {holding.length === 0 ? (
          <Text style={styles.empty}>No goals yet. Add one when you know what you are aiming at.</Text>
        ) : null}

        {holding.map((goal, index) => {
          const todayTask = state.tasks.find(
            (task) => task.goalId === goal.id && task.today && !task.done,
          );
          const waiting = state.tasks.find(
            (task) => task.goalId === goal.id && !task.today && !task.done,
          );
          const counts = linkedCounts(state.tasks, "goalId", goal.id);
          const project = state.projects.find((item) => item.id === goal.projectId);
          return (
            <View key={goal.id} style={styles.row}>
              <Text style={styles.num}>{pad(index + 1)}</Text>
              <View style={styles.body}>
                <Text style={styles.name}>{goal.title}</Text>
                <Text style={styles.note}>{goal.note}</Text>
                <View style={styles.meta}>
                  <AreaDot area={goal.area} />
                  {todayTask ? <Text style={styles.onToday}>On today</Text> : null}
                  {project ? (
                    <Pressable
                      onPress={() => router.push(`/project/${project.id}`)}
                      style={styles.link}
                    >
                      <Text style={styles.linkText}>{project.name}</Text>
                      <ArrowUpRight size={12} color={colors.mutedForeground} />
                    </Pressable>
                  ) : null}
                </View>
                <Text style={styles.step}>
                  {todayTask
                    ? `On Today: ${todayTask.title}`
                    : waiting
                      ? `Waiting in Up next: ${waiting.title}`
                      : "No step on Today yet."}
                </Text>
                {todayTask ? (
                  <Text style={styles.hint}>This is already one of today’s three.</Text>
                ) : (
                  <View style={styles.addWrap}>
                    <PrimaryButton
                      label={todayFull ? "Add to Today — swap a slot" : "Add to Today"}
                      onPress={() => addToToday(goal)}
                      showPlus={false}
                    />
                  </View>
                )}
                <View style={styles.progress}>
                  <Text style={styles.pct}>{goal.progress}%</Text>
                  <ProgressBar value={goal.progress} />
                  <Text style={styles.stepCount}>
                    {counts.total === 0 ? "No steps yet" : `${counts.done} of ${counts.total} steps`}
                  </Text>
                </View>
                <View style={styles.quietActions}>
                  <Pressable onPress={() => setEditing(goal)} hitSlop={8}>
                    <Text style={styles.quiet}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => setPending({ kind: "status", goal, status: "reached" })} hitSlop={8}>
                    <Text style={styles.quiet}>Mark reached</Text>
                  </Pressable>
                  <Pressable onPress={() => setPending({ kind: "status", goal, status: "released" })} hitSlop={8}>
                    <Text style={styles.quiet}>Let go</Text>
                  </Pressable>
                  <Pressable onPress={() => setPending({ kind: "delete", goal })} hitSlop={8}>
                    <Text style={styles.quiet}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}

        {closed.length > 0 ? (
          <View style={styles.closedBlock}>
            <SectionLabel>Closed</SectionLabel>
            <Text style={styles.closedLead}>
              Reached and let go stay here. They do not return to the holding list.
            </Text>
            {closed.map((goal) => (
              <View key={goal.id} style={styles.closedRow}>
                <Text style={styles.closedTitle}>{goal.title}</Text>
                <View style={styles.closedMetaRow}>
                  <Text style={styles.closedMeta}>
                    {goal.status === "reached" ? "Reached" : "Let go"}
                  </Text>
                  <Pressable onPress={() => setPending({ kind: "delete", goal })} hitSlop={8}>
                    <Text style={styles.quiet}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <CreateGoalModal open={Boolean(editing)} goal={editing} onClose={() => setEditing(null)} />
      <SwapTodaySheet
        open={Boolean(swapFor)}
        incomingTitle={swapFor?.step ?? swapFor?.goal.title ?? ""}
        onClose={() => setSwapFor(null)}
        onChoose={(outId) => {
          if (!swapFor) return;
          dispatch({
            type: "swap-today-task",
            outId,
            inId: swapFor.inId,
            goalId: swapFor.inId ? undefined : swapFor.goal.id,
            step: swapFor.step,
          });
          setSwapFor(null);
        }}
      />
      <FormModal
        open={Boolean(ask)}
        title="Goals"
        heading="The next step"
        onClose={() => {
          setAsk(null);
          setAskStep("");
        }}
      >
        <Text style={styles.askBody}>
          Today needs a step, not just the aim. Write the next thing you would actually do, or put the aim itself on Today.
        </Text>
        <Text style={fieldStyles.label}>The step</Text>
        <TextInput
          value={askStep}
          onChangeText={setAskStep}
          placeholder="The next thing you would actually do"
          placeholderTextColor={colors.mutedForeground}
          style={fieldStyles.input}
        />
        <SheetActions
          confirmLabel={todayFull ? "Swap onto Today" : "Add to Today"}
          onCancel={() => {
            setAsk(null);
            setAskStep("");
          }}
          onConfirm={() => submitStep(false)}
        />
        <Pressable onPress={() => submitStep(true)} hitSlop={8} style={styles.useAim}>
          <Text style={styles.quiet}>Put the aim on Today</Text>
        </Pressable>
      </FormModal>

      <ConfirmSheet
        open={pending?.kind === "status"}
        kicker="Goals"
        heading={pending?.kind === "status" && pending.status === "reached" ? "Mark this reached?" : "Let this go?"}
        body={
          pending?.kind === "status" && pending.status === "reached"
            ? "No deadline was waiting. You are saying this aim is complete. It does not come back. Any open step leaves Today."
            : "This is not failure. The goal leaves the holding list and does not come back. Any open step leaves Today."
        }
        confirmLabel={pending?.kind === "status" && pending.status === "reached" ? "Mark reached" : "Let go"}
        destructive={pending?.kind === "status" && pending.status === "released"}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending?.kind !== "status") return;
          dispatch({ type: "set-goal-status", id: pending.goal.id, status: pending.status });
          setPending(null);
        }}
      />
      <ConfirmSheet
        open={pending?.kind === "delete"}
        kicker="Goals"
        heading="Delete this goal?"
        body={`${pending?.goal.title ?? "This goal"} is removed for good. Its steps leave Today. This is not the same as letting it go.`}
        confirmLabel="Delete"
        destructive
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending?.kind !== "delete") return;
          dispatch({ type: "delete-goal", id: pending.goal.id });
          setPending(null);
          say("Deleted.");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: floatingTab.clearance },
  empty: {
    color: colors.mutedForeground,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.regular,
    marginTop: 20,
  },
  rules: {
    marginTop: 20,
    marginBottom: 22,
    gap: 8,
  },
  rule: {
    color: colors.mutedForeground,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 24,
  },
  num: {
    width: 36,
    color: "rgba(150,157,148,0.8)",
    fontSize: 28,
    fontFamily: fonts.regular,
  },
  body: { flex: 1 },
  name: {
    color: colors.foreground,
    fontSize: 22,
    fontFamily: fonts.semibold,
    letterSpacing: -0.4,
  },
  note: {
    color: colors.mutedForeground,
    fontSize: 14,
    marginTop: 8,
    fontFamily: fonts.regular,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    flexWrap: "wrap",
  },
  onToday: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  link: { flexDirection: "row", alignItems: "center", gap: 4 },
  linkText: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.regular },
  step: {
    color: colors.foreground,
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 14,
    lineHeight: 20,
  },
  addWrap: { marginTop: 14 },
  progress: { marginTop: 16, gap: 8 },
  pct: {
    color: colors.foreground,
    fontSize: 24,
    fontFamily: fonts.semibold,
  },
  stepCount: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.regular },
  quietActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    marginTop: 16,
  },
  quiet: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  hint: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 10,
  },
  askBody: {
    color: colors.mutedForeground,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.regular,
    marginBottom: 4,
  },
  useAim: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  closedBlock: { marginTop: 40 },
  closedLead: {
    color: colors.mutedForeground,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
    marginTop: 8,
    marginBottom: 8,
  },
  closedRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 16,
  },
  closedTitle: {
    color: colors.mutedForeground,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  closedMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  closedMeta: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
});
