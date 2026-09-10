import { ArrowUpRight, Gear } from "phosphor-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Kicker, Subtitle, Title } from "@/components/Type";
import { colors, floatingTab, fonts } from "@/constants/theme";
import { pad } from "@/lib/helpers";

const items = [
  {
    href: "/settings" as const,
    title: "Settings",
    note: "Weekly review and quiet controls.",
    icon: Gear,
  },
];

export default function MoreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Kicker>The rest can wait</Kicker>
        <Title>More</Title>
        <Subtitle>Goals, review, and settings. Off the main path on purpose.</Subtitle>
        <View style={{ height: 20 }} />
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Text style={styles.num}>{pad(index + 1)}</Text>
              <View style={styles.body}>
                <View style={styles.titleRow}>
                  <Icon size={18} color={colors.primary} />
                  <Text style={styles.name}>{item.title}</Text>
                  <ArrowUpRight size={16} color={colors.mutedForeground} />
                </View>
                <Text style={styles.note}>{item.note}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: floatingTab.clearance },
  row: {
    flexDirection: "row",
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 26,
  },
  pressed: { opacity: 0.7 },
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
    flexShrink: 1,
  },
  note: {
    color: colors.mutedForeground,
    fontSize: 14,
    marginTop: 8,
    fontFamily: fonts.regular,
  },
});
