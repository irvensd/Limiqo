import { Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts } from "@/constants/theme";

export default function ActionChip({
  label,
  onPress,
  tone = "quiet",
}: {
  label: string;
  onPress: () => void;
  tone?: "quiet" | "primary";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        tone === "primary" && styles.primary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, tone === "primary" && styles.primaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    minWidth: 96,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.78,
  },
  label: {
    color: colors.foreground,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  primaryLabel: {
    color: colors.primaryForeground,
  },
});
