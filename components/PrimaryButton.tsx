import { Plus } from "phosphor-react-native";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts } from "@/constants/theme";

export default function PrimaryButton({
  label,
  onPress,
  showPlus = true,
}: {
  label: string;
  onPress: () => void;
  showPlus?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      {showPlus ? <Plus size={16} color={colors.primaryForeground} /> : null}
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pressed: {
    opacity: 0.88,
  },
  label: {
    color: colors.primaryForeground,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
});
