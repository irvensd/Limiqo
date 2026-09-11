import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Wordmark } from "@/components/Brand";
import { colors, fonts } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/lib/store";

const lines = [
  {
    title: "Today is three",
    body: "That is the cap. When they are done, the day can end.",
  },
  {
    title: "Goals do not repeat",
    body: "No deadlines. You add a step when you want to work one.",
  },
  {
    title: "Ideas wait",
    body: "Quarantine first. A good idea does not have to become work.",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { state, dispatch, ready } = useStore();
  const [name, setName] = useState(state.user.name);

  if (!ready) return null;
  if (state.user.onboarded) {
    return <Redirect href="/(tabs)/today" />;
  }

  function enter() {
    const next = name.trim();
    if (!next) return;
    dispatch({ type: "complete-onboarding", name: next });
    supabase.auth.updateUser({ data: { name: next } });
    router.replace("/(tabs)/today");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Wordmark width={156} />

          <View style={styles.body}>
            <Text style={styles.headline}>Three things.{"\n"}Then stop.</Text>
            <Text style={styles.lede}>A brake for your day. Not another planner that asks for more.</Text>
            <View style={styles.rules}>
              {lines.map((item) => (
                <View key={item.title} style={styles.rule}>
                  <Text style={styles.ruleTitle}>{item.title}</Text>
                  <Text style={styles.ruleBody}>{item.body}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.nameLabel}>What should we call you?</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              style={styles.nameInput}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={enter}
            />
          </View>

          <Pressable onPress={enter} style={[styles.cta, !name.trim() && styles.ctaOff]}>
            <Text style={styles.ctaText}>Begin</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  page: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 24,
  },
  body: {
    flex: 1,
    justifyContent: "center",
  },
  headline: {
    color: colors.foreground,
    fontSize: 40,
    lineHeight: 44,
    fontFamily: fonts.semibold,
    letterSpacing: -1.4,
    marginBottom: 16,
  },
  lede: {
    color: colors.mutedForeground,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    marginBottom: 36,
  },
  rules: { gap: 22, marginBottom: 28 },
  nameLabel: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontFamily: fonts.regular,
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.foreground,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  rule: { gap: 6 },
  ruleTitle: {
    color: colors.foreground,
    fontSize: 17,
    fontFamily: fonts.medium,
  },
  ruleBody: {
    color: colors.mutedForeground,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.regular,
  },
  cta: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  ctaOff: { opacity: 0.4 },
  ctaText: {
    color: colors.primaryForeground,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
});
