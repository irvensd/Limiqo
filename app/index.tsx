import { Redirect, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "@/constants/theme";
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

  if (!ready) return null;
  if (state.user.onboarded) {
    return <Redirect href="/(tabs)/today" />;
  }

  function enter() {
    dispatch({ type: "complete-onboarding" });
    router.replace("/(tabs)/today");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.page}>
        <Text style={styles.kicker}>Limiqo</Text>
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

        <Pressable onPress={enter} style={styles.cta}>
          <Text style={styles.ctaText}>Begin</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  page: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 24,
    justifyContent: "center",
  },
  kicker: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.semibold,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    marginBottom: 18,
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
  rules: { gap: 22, marginBottom: 40 },
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
  ctaText: {
    color: colors.primaryForeground,
    fontFamily: fonts.medium,
    fontSize: 15,
  },
});
