import { Gear } from "phosphor-react-native";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";

export default function SettingsButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push("/settings")}
      hitSlop={12}
      accessibilityLabel="Settings"
      style={styles.button}
    >
      <Gear size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
