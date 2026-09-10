import { StyleSheet, View } from "react-native";
import { colors } from "@/constants/theme";

export default function ProgressBar({ value, dimmed = false }: { value: number; dimmed?: boolean }) {
  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          { width: `${Math.max(0, Math.min(100, value))}%`, opacity: dimmed ? 0.6 : 1 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: colors.secondary,
    borderRadius: 99,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 99,
  },
});
