import { StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native";
import { colors, fonts } from "@/constants/theme";

export function Kicker({ children, style }: { children: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.kicker, style]}>{children}</Text>;
}

export function Title({ children }: { children: string }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: string }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function Divider() {
  return <View style={styles.line} />;
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.semibold,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  title: {
    color: colors.foreground,
    fontSize: 40,
    lineHeight: 44,
    fontFamily: fonts.semibold,
    letterSpacing: -1.4,
    marginBottom: 14,
  },
  subtitle: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  section: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.semibold,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
