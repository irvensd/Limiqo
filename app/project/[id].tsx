import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import AreaDot from "@/components/AreaDot";
import BackLink from "@/components/BackLink";
import ConfirmSheet from "@/components/ConfirmSheet";
import CreateProjectModal from "@/components/CreateProjectModal";
import SettingsButton from "@/components/SettingsButton";
import ProgressBar from "@/components/ProgressBar";
import { Kicker, SectionLabel, Subtitle, Title } from "@/components/Type";
import { colors, fonts } from "@/constants/theme";
import type { ProjectStatus } from "@/lib/data";
import { linkedCounts } from "@/lib/progress";
import { useStore } from "@/lib/store";

const statuses: ProjectStatus[] = ["active", "paused", "maintain", "archived"];

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, dispatch } = useStore();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState("");
  const project = state.projects.find((item) => item.id === id);
  const tasks = state.tasks.filter((task) => task.projectId === id);
  const counts = project ? linkedCounts(state.tasks, "projectId", project.id) : { done: 0, total: 0 };

  if (!project) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={[styles.top, styles.topPad]}>
          <BackLink label="All projects" style={styles.back} />
          <SettingsButton />
        </View>
        <Text style={styles.missing}>This project is no longer here.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.top}>
          <BackLink label="All projects" style={styles.back} />
          <SettingsButton />
        </View>
        <Kicker>One thing at a time</Kicker>
        <Title>{project.name}</Title>
        <Subtitle>{project.description}</Subtitle>
        <View style={styles.meta}>
          <AreaDot area={project.area} />
          <Text style={styles.status}>{project.status}</Text>
        </View>
        <Text style={styles.pct}>{project.progress}%</Text>
        <ProgressBar value={project.progress} />
        <Text style={styles.stepCount}>
          {counts.total === 0
            ? "No linked steps. Progress stays at 0 until you add one."
            : `${counts.done} of ${counts.total} steps complete`}
        </Text>

        <View style={styles.chips}>
          {statuses.map((status) => (
            <Pressable
              key={status}
              onPress={() => dispatch({ type: "set-project-status", id: project.id, status })}
              style={[styles.chip, project.status === status && styles.chipOn]}
            >
              <Text style={[styles.chipText, project.status === status && styles.chipTextOn]}>{status}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable onPress={() => setEditing(true)} hitSlop={8} style={styles.delete}>
          <Text style={styles.deleteText}>Edit</Text>
        </Pressable>
        <Pressable onPress={() => setDeleteOpen(true)} hitSlop={8} style={styles.delete}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>

        <View style={styles.sectionHead}>
          <SectionLabel>Linked work</SectionLabel>
        </View>
        {tasks.length === 0 ? (
          <Text style={styles.empty}>No steps yet. Add one below. Checking it off is what moves the percent.</Text>
        ) : (
          tasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => dispatch({ type: "toggle-task", id: task.id })}
              style={styles.row}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.task, task.done && styles.done]}>{task.title}</Text>
                <Text style={styles.hint}>{task.today ? "On today’s three" : "Waiting in Up next"}</Text>
              </View>
              <View style={[styles.check, task.done && styles.checkOn]} />
            </Pressable>
          ))
        )}
        <View style={styles.add}>
          <TextInput
            value={step}
            onChangeText={setStep}
            placeholder="Add a step for this project"
            placeholderTextColor={colors.mutedForeground}
            style={styles.input}
            onSubmitEditing={() => {
              if (!step.trim()) return;
              dispatch({ type: "create-project-task", projectId: project.id, title: step });
              setStep("");
            }}
            returnKeyType="done"
          />
          <Pressable
            onPress={() => {
              if (!step.trim()) return;
              dispatch({ type: "create-project-task", projectId: project.id, title: step });
              setStep("");
            }}
            hitSlop={8}
          >
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
      </ScrollView>
      <CreateProjectModal
        open={editing}
        project={project}
        onClose={() => setEditing(false)}
      />
      <ConfirmSheet
        open={deleteOpen}
        kicker="Projects"
        heading="Delete this project?"
        body={`${project.name} is removed for good. Linked goals stay. Work that only belonged to this project is removed.`}
        confirmLabel="Delete"
        destructive
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          dispatch({ type: "delete-project", id: project.id });
          setDeleteOpen(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  topPad: { paddingHorizontal: 24, paddingTop: 20 },
  back: { marginBottom: 0 },
  missing: {
    color: colors.mutedForeground,
    padding: 24,
    fontFamily: fonts.regular,
  },
  meta: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16, marginBottom: 24 },
  status: { color: colors.mutedForeground, fontSize: 12, textTransform: "capitalize", fontFamily: fonts.regular },
  pct: { color: colors.foreground, fontSize: 36, fontFamily: fonts.semibold, marginBottom: 10 },
  stepCount: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 10,
  },
  add: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  input: {
    flex: 1,
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
  addText: { color: colors.primary, fontSize: 14, fontFamily: fonts.medium },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 28 },
  delete: { marginTop: 16, marginBottom: 36, alignSelf: "flex-start" },
  deleteText: { color: colors.mutedForeground, fontSize: 13, fontFamily: fonts.regular },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  chipOn: { backgroundColor: colors.secondary },
  chipText: { color: colors.mutedForeground, fontSize: 12, textTransform: "capitalize", fontFamily: fonts.regular },
  chipTextOn: { color: colors.foreground },
  sectionHead: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: 16,
  },
  empty: { color: colors.mutedForeground, fontSize: 14, marginTop: 20, fontFamily: fonts.regular },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 22,
  },
  task: { color: colors.foreground, fontSize: 17, fontFamily: fonts.medium },
  done: { color: colors.mutedForeground, textDecorationLine: "line-through" },
  hint: { color: colors.mutedForeground, fontSize: 12, marginTop: 6, fontFamily: fonts.regular },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(150,157,148,0.7)",
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
