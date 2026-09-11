import { Gear } from "phosphor-react-native";
import { Pressable, StyleSheet } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { colors } from "@/constants/theme";

function fromLabel(segments: readonly string[]) {
  if (segments[0] === "project") return "Project";
  const tabs = segments.indexOf("(tabs)");
  const tab = tabs >= 0 ? segments[tabs + 1] : segments[0];
  if (tab === "goals") return "Goals";
  if (tab === "projects") return "Projects";
  if (tab === "ideas") return "Ideas";
  return "Today";
}

export default function SettingsButton() {
  const router = useRouter();
  const segments = useSegments();
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/settings",
          params: { from: fromLabel(segments) },
        })
      }
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
