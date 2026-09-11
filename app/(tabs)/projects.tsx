import { ArrowUpRight } from "phosphor-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AreaDot from "@/components/AreaDot";
import ConfirmSheet from "@/components/ConfirmSheet";
import CreateProjectModal from "@/components/CreateProjectModal";
import PrimaryButton from "@/components/PrimaryButton";
import ProgressBar from "@/components/ProgressBar";
import ScreenHead from "@/components/ScreenHead";
import { Subtitle, Title } from "@/components/Type";
import { colors, floatingTab, fonts } from "@/constants/theme";
import { pad } from "@/lib/helpers";
import { linkedCounts } from "@/lib/progress";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import type { Project } from "@/lib/data";

const tabs = ["Overview", "Active", "Paused", "Maintain", "Archived"] as const;

function matches(project: Project, tab: (typeof tabs)[number]) {
  if (tab === "Overview") return true;
  return project.status === tab.toLowerCase();
}

export default function ProjectsScreen() {
  const { state, dispatch } = useStore();
  const { openProject, say } = useUI();
  const router = useRouter();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [pending, setPending] = useState<Project | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);
  const visible = useMemo(
    () => state.projects.filter((project) => matches(project, tab)),
    [state.projects, tab],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHead kicker="Less, but better" />
        <Title>Projects</Title>
        <Subtitle>Create as many as you hold. The three that matter are the ones you put on Today.</Subtitle>
        <View style={{ height: 22 }} />
        <PrimaryButton label="Create project" onPress={openProject} />

        <View style={styles.tabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {tabs.map((item) => (
              <Pressable
                key={item}
                onPress={() => setTab(item)}
                style={[styles.tab, item === tab && styles.tabOn]}
              >
                <Text style={[styles.tabText, item === tab && styles.tabTextOn]}>{item}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {visible.length === 0 ? (
          <Text style={styles.empty}>Nothing in this lane right now.</Text>
        ) : null}

        {visible.map((project, index) => {
          const counts = linkedCounts(state.tasks, "projectId", project.id);
          return (
          <View
            key={project.id}
            style={[styles.row, project.status === "maintain" && { opacity: 0.75 }]}
          >
            <Text style={styles.num}>{pad(index + 1)}</Text>
            <View style={styles.body}>
              <Pressable onPress={() => router.push(`/project/${project.id}`)}>
                <View style={styles.titleRow}>
                  <Text style={styles.name}>{project.name}</Text>
                  <ArrowUpRight size={16} color={colors.mutedForeground} />
                </View>
                <Text style={styles.note}>{project.description}</Text>
                <View style={styles.meta}>
                  <AreaDot area={project.area} />
                  <Text style={styles.status}>{project.status}</Text>
                </View>
                <View style={styles.progress}>
                  <Text style={styles.pct}>{project.progress}%</Text>
                  <ProgressBar value={project.progress} dimmed={project.status === "maintain"} />
                  <Text style={styles.stepCount}>
                    {counts.total === 0 ? "No steps yet" : `${counts.done} of ${counts.total} steps`}
                  </Text>
                </View>
              </Pressable>
              {project.status === "maintain" ? (
                <Pressable
                  onPress={() => dispatch({ type: "set-project-status", id: project.id, status: "active" })}
                  style={styles.activate}
                >
                  <Text style={styles.activateText}>Activate</Text>
                  <ArrowUpRight size={14} color={colors.mutedForeground} />
                </Pressable>
              ) : null}
              <Pressable onPress={() => setEditing(project)} hitSlop={8} style={styles.delete}>
                <Text style={styles.deleteText}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => setPending(project)} hitSlop={8} style={styles.delete}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          </View>
          );
        })}
      </ScrollView>
      <CreateProjectModal open={Boolean(editing)} project={editing} onClose={() => setEditing(null)} />
      <ConfirmSheet
        open={Boolean(pending)}
        kicker="Projects"
        heading="Delete this project?"
        body={`${pending?.name ?? "This project"} is removed for good. Linked goals stay. Work that only belonged to this project is removed.`}
        confirmLabel="Delete"
        destructive
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          dispatch({ type: "delete-project", id: pending.id });
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
  tabs: {
    marginTop: 28,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: 14,
    gap: 12,
  },
  tabRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  tabOn: { backgroundColor: colors.secondary },
  tabText: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.regular },
  tabTextOn: { color: colors.foreground },
  empty: { color: colors.mutedForeground, fontSize: 14, marginTop: 24, fontFamily: fonts.regular },
  row: {
    flexDirection: "row",
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 26,
  },
  num: {
    width: 36,
    color: "rgba(150,157,148,0.8)",
    fontSize: 28,
    fontFamily: fonts.regular,
  },
  body: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: {
    color: colors.foreground,
    fontSize: 24,
    fontFamily: fonts.semibold,
    letterSpacing: -0.4,
  },
  note: {
    color: colors.mutedForeground,
    fontSize: 14,
    marginTop: 8,
    fontFamily: fonts.regular,
  },
  meta: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  status: { color: colors.mutedForeground, fontSize: 12, textTransform: "capitalize", fontFamily: fonts.regular },
  progress: { marginTop: 16, gap: 8 },
  pct: { color: colors.foreground, fontSize: 28, fontFamily: fonts.semibold },
  stepCount: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.regular },
  activate: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
  activateText: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.regular },
  delete: { marginTop: 14, alignSelf: "flex-start" },
  deleteText: { color: colors.mutedForeground, fontSize: 13, fontFamily: fonts.regular },
});
