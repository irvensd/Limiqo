import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackLink from "@/components/BackLink";
import WeeklyReview from "@/components/WeeklyReview";
import { Kicker, SectionLabel, Subtitle, Title } from "@/components/Type";
import { colors, fonts } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useStore } from "@/lib/store";

export default function SettingsScreen() {
  const router = useRouter();
  const { state, dispatch } = useStore();
  const [name, setName] = useState(state.user.name);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackLink label="Today" />
        <Kicker>Quiet controls</Kicker>
        <Title>Settings</Title>
        <Subtitle>Look back, then keep the workspace small.</Subtitle>

        <View style={styles.reviewHead}>
          <SectionLabel>Weekly review</SectionLabel>
        </View>
        <Text style={styles.reviewLead}>Ten quiet minutes. Then you already know what matters.</Text>
        <WeeklyReview />

        <View style={styles.rule} />
        <Text style={styles.label}>What should we call you?</Text>
        <View style={styles.row}>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholderTextColor={colors.mutedForeground}
          />
          <Pressable
            onPress={() => dispatch({ type: "set-name", name: name.trim() || "Irvens" })}
            style={styles.save}
          >
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>

        <View style={styles.rule} />
        <Text style={styles.blockTitle}>On this device</Text>
        <Text style={styles.blockNote}>
          Everything lives on your phone. No accounts. No feed. Capture an idea, keep the list small, and let the rest wait.
        </Text>
        <Pressable
          onPress={() => {
            dispatch({ type: "show-welcome" });
            router.replace("/");
          }}
        >
          <Text style={styles.reset}>Show welcome again</Text>
        </Pressable>
        <Pressable onPress={() => dispatch({ type: "reset" })} style={{ marginTop: 14 }}>
          <Text style={styles.reset}>Reset demo data</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 48 },
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
