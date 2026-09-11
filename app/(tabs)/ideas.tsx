import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ActionChip from "@/components/ActionChip";
import AreaDot from "@/components/AreaDot";
import ConfirmSheet from "@/components/ConfirmSheet";
import CaptureIdeaModal from "@/components/CaptureIdeaModal";
import PrimaryButton from "@/components/PrimaryButton";
import ScreenHead from "@/components/ScreenHead";
import { Subtitle, Title } from "@/components/Type";
import { colors, floatingTab, fonts } from "@/constants/theme";
import type { Idea } from "@/lib/data";
import { daysRemaining, formatShortDate, pad } from "@/lib/helpers";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";

const tabs = ["Overview", "Quarantined", "Reviewing", "Archived"] as const;

function matches(idea: Idea, tab: (typeof tabs)[number]) {
  if (tab === "Overview") return idea.status !== "archived";
  return idea.status === tab.toLowerCase();
}

export default function IdeasScreen() {
  const { state, dispatch, now } = useStore();
  const { openIdea, say } = useUI();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [editing, setEditing] = useState<Idea | null>(null);
  const [pending, setPending] = useState<{
    idea: Idea;
    action: "promote" | "archive" | "delete";
  } | null>(null);
  const visible = useMemo(
    () => state.ideas.filter((idea) => matches(idea, tab)),
    [state.ideas, tab],
  );

  function confirmPending() {
    if (!pending) return;
    if (pending.action === "promote") {
      dispatch({ type: "promote-idea", id: pending.idea.id });
    } else if (pending.action === "archive") {
      dispatch({ type: "set-idea-status", id: pending.idea.id, status: "archived" });
    } else {
      dispatch({ type: "delete-idea", id: pending.idea.id });
    }
    setPending(null);
    if (pending.action === "delete") say("Deleted.");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHead kicker="Space before commitment" />
        <Title>Idea Quarantine</Title>
        <Subtitle>Good ideas do not have to become commitments.</Subtitle>
        <View style={styles.rules}>
          <Text style={styles.rule}>
            Fourteen days of sitting still. That is the wait, not a lock. You can decide sooner.
          </Text>
        </View>
        <PrimaryButton label="Capture idea" onPress={openIdea} />

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
          <Text style={styles.empty}>This shelf is empty. That’s allowed.</Text>
        ) : null}

        {visible.map((idea, index) => {
          const remaining = daysRemaining(idea.capturedAt, state.user.quarantineDays, now);
          return (
            <View key={idea.id} style={styles.row}>
              <Text style={styles.num}>{pad(index + 1)}</Text>
              <View style={styles.body}>
                <Text style={styles.name}>{idea.title}</Text>
                <Text style={styles.note}>{idea.description}</Text>
                <View style={styles.meta}>
                  <AreaDot area={idea.area} />
                  <Text style={styles.status}>{idea.status}</Text>
                </View>
                <Text style={styles.wait}>
                  {remaining > 0
                    ? `${remaining} days of sitting still. You can decide anytime.`
                    : "Ready for a decision. Nothing is required."}
                </Text>
                <Text style={styles.wait}>Captured {formatShortDate(idea.capturedAt)}</Text>
                {idea.status !== "archived" ? (
                  <View style={styles.actions}>
                    <ActionChip
                      label={idea.status === "reviewing" ? "Hold" : "Review"}
                      onPress={() =>
                        dispatch({
                          type: "set-idea-status",
                          id: idea.id,
                          status: idea.status === "reviewing" ? "quarantined" : "reviewing",
                        })
                      }
                    />
                    <ActionChip
                      label="Promote"
                      tone="primary"
                      onPress={() => setPending({ idea, action: "promote" })}
                    />
                    <ActionChip
                      label="Archive"
                      onPress={() => setPending({ idea, action: "archive" })}
                    />
                  </View>
                ) : (
                  <View style={styles.actions}>
                    <ActionChip
                      label="Restore"
                      onPress={() =>
                        dispatch({ type: "set-idea-status", id: idea.id, status: "quarantined" })
                      }
                    />
                  </View>
                )}
                <Pressable onPress={() => setEditing(idea)} hitSlop={8}>
                  <Text style={styles.deleteText}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => setPending({ idea, action: "delete" })} hitSlop={8}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <CaptureIdeaModal open={Boolean(editing)} idea={editing} onClose={() => setEditing(null)} />
      <ConfirmSheet
        open={pending?.action === "promote"}
        kicker="Space before commitment"
        heading="Make this a project?"
        body={`${pending?.idea.title ?? "This idea"} leaves quarantine and joins your active list. That is a commitment.`}
        confirmLabel="Promote to project"
        onClose={() => setPending(null)}
        onConfirm={confirmPending}
      />
      <ConfirmSheet
        open={pending?.action === "archive"}
        kicker="Space before commitment"
        heading="Archive this idea?"
        body={`${pending?.idea.title ?? "This idea"} can wait. You can restore it later.`}
        confirmLabel="Archive"
        destructive
        onClose={() => setPending(null)}
        onConfirm={confirmPending}
      />
      <ConfirmSheet
        open={pending?.action === "delete"}
        kicker="Space before commitment"
        heading="Delete this idea?"
        body={`${pending?.idea.title ?? "This idea"} is removed for good. Archive it if you might want it later.`}
        confirmLabel="Delete"
        destructive
        onClose={() => setPending(null)}
        onConfirm={confirmPending}
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
  },
  tabRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  tabOn: { backgroundColor: colors.secondary },
  tabText: { color: colors.mutedForeground, fontSize: 12, fontFamily: fonts.regular },
  tabTextOn: { color: colors.foreground },
  empty: { color: colors.mutedForeground, fontSize: 14, marginTop: 24, fontFamily: fonts.regular },
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
    paddingVertical: 26,
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
  wait: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.regular,
    marginTop: 8,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  deleteText: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: fonts.regular,
    marginTop: 14,
  },
});
