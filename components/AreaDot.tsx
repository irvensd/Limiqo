import { StyleSheet, Text, View } from "react-native";
import { colorForArea, colors, fonts } from "@/constants/theme";

export default function AreaDot({ area }: { area: string }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: colorForArea(area) }]} />
      <Text style={styles.label}>{area}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
});
