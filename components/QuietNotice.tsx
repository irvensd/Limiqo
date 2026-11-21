import { StyleSheet, Text, View } from "react-native";
import { useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, floatingTab, fonts } from "@/constants/theme";
import { useUI } from "@/lib/ui";

export default function QuietNotice() {
  const { notice } = useUI();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  if (!notice) return null;

  const onTabs = segments[0] === "(tabs)";
  const bottom = onTabs
    ? Math.max(insets.bottom, 12) + floatingTab.bottomGap + floatingTab.height + 12
    : Math.max(insets.bottom, 16) + 12;

  return (
    <View pointerEvents="none" style={[styles.wrap, { bottom }]}>
      <Text accessibilityLiveRegion="polite" style={styles.line}>{notice}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 24,
    right: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.popover,
  },
  line: {
    color: colors.foreground,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
});
