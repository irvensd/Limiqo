import { useRef, useState } from "react";
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import BackLink from "@/components/BackLink";
import { Wordmark } from "@/components/Brand";
import CloudLine from "@/components/CloudLine";
import ConfirmSheet from "@/components/ConfirmSheet";
import WeeklyReview from "@/components/WeeklyReview";
import { Kicker, SectionLabel, Subtitle, Title } from "@/components/Type";
import { colors, fonts } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const { state, dispatch } = useStore();
  const { say } = useUI();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const backLabel = typeof from === "string" && from.trim() ? from : "Today";
  const [name, setName] = useState(state.user.name);
  const [clearOpen, setClearOpen] = useState(false);
  const [needName, setNeedName] = useState(false);
  const nameRef = useRef<TextInput>(null);
  const email = session?.user.email ?? "";

  function saveName() {
    const next = name.trim();
    nameRef.current?.blur();
    Keyboard.dismiss();
    if (!next) {
      setNeedName(true);
      return;
    }
    setNeedName(false);
    setName(next);
    dispatch({ type: "set-name", name: next });
    getSupabase().auth.updateUser({ data: { name: next } });
    say("Saved.");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.top}>
          <BackLink label={backLabel} style={styles.back} />
          <Wordmark width={92} />
        </View>
        <Kicker>Quiet controls</Kicker>
        <Title>Settings</Title>
        <Subtitle>Look back, then keep the workspace small.</Subtitle>

        <View style={styles.account}>
          <SectionLabel>Account</SectionLabel>
          <Text style={styles.email}>{email || "Signed in"}</Text>
          <Pressable
            onPress={() => {
              signOut();
            }}
            style={styles.signOut}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>

        <View style={styles.cloud}>
          <SectionLabel>Cloud</SectionLabel>
          <CloudLine always />
        </View>

        <View style={styles.rule} />
        <Text style={styles.label}>What should we call you?</Text>
        <View style={styles.row}>
          <TextInput
            ref={nameRef}
            value={name}
            onChangeText={(value) => {
              setName(value);
              setNeedName(false);
            }}
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="words"
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={saveName}
          />
          <Pressable onPress={saveName} style={styles.save}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>
        {needName ? <Text style={styles.nameHint}>Name it first.</Text> : null}

        <View style={styles.reviewHead}>
          <SectionLabel>Weekly review</SectionLabel>
        </View>
        <Text style={styles.reviewLead}>Ten quiet minutes. Then you already know what matters.</Text>
        <WeeklyReview />

        <View style={styles.rule} />
        <Text style={styles.blockTitle}>On this device</Text>
        <Text style={styles.blockNote}>
          Lists live on this phone. When the cloud is working, they also save to your account.
        </Text>
        <Pressable onPress={() => setClearOpen(true)}>
          <Text style={styles.reset}>Clear everything</Text>
        </Pressable>
      </ScrollView>
      <ConfirmSheet
        open={clearOpen}
        kicker="Settings"
        heading="Erase everything?"
        body="Today, goals, projects, and ideas on this phone go. Your account stays. This cannot be undone."
        confirmLabel="Erase"
        destructive
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          dispatch({ type: "reset" });
          setClearOpen(false);
          say("Cleared.");
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
  back: { marginBottom: 0 },
  account: { marginTop: 32, gap: 10 },
  email: {
    color: colors.foreground,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  signOut: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginTop: 4,
  },
  signOutText: {
    color: colors.foreground,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  cloud: { marginTop: 36, gap: 6 },
  reviewHead: { marginTop: 36, marginBottom: 10 },
  reviewLead: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontFamily: fonts.regular,
    marginBottom: 8,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginBottom: 10,
    fontFamily: fonts.regular,
  },
  row: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.foreground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: fonts.regular,
  },
  save: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  saveText: { color: colors.primaryForeground, fontFamily: fonts.medium },
  nameHint: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.regular,
    marginTop: 8,
    lineHeight: 18,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginTop: 36,
    marginBottom: 24,
  },
  blockTitle: { color: colors.foreground, fontSize: 16, fontFamily: fonts.medium, marginBottom: 8 },
  blockNote: {
    color: colors.mutedForeground,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.regular,
    marginBottom: 18,
  },
  reset: { color: colors.mutedForeground, fontSize: 14, fontFamily: fonts.regular },
});
