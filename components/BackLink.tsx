import { ArrowLeft } from "phosphor-react-native";
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { colors, fonts } from "@/constants/theme";

export default function BackLink({
  label = "Back",
  style,
}: {
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} style={[styles.back, style]} hitSlop={12}>
      <ArrowLeft size={14} color={colors.mutedForeground} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 28,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
});
