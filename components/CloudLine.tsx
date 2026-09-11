import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/constants/theme";
import { useStore } from "@/lib/store";

export default function CloudLine({ always = false }: { always?: boolean }) {
  const { cloud, retryCloud } = useStore();
  if (!always && !cloud.message) return null;

  const line = cloud.message
    ? cloud.message
    : cloud.status === "saving"
      ? "Saving to your account…"
      : cloud.status === "saved"
        ? "Saved to your account."
        : "Lists save to your account.";

  return (
    <View style={[styles.wrap, always && styles.wrapBlock]}>
      <Text style={styles.line}>{line}</Text>
      {cloud.message ? (
        <Pressable onPress={retryCloud} disabled={cloud.status === "saving"} hitSlop={8}>
          <Text style={styles.retry}>{cloud.status === "saving" ? "Saving…" : "Try again"}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
    gap: 8,
  },
  wrapBlock: {
    marginBottom: 0,
    marginTop: 8,
  },
  line: {
    color: colors.mutedForeground,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
    paddingTop: 2,
  },
  retry: {
    color: colors.foreground,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.medium,
    paddingTop: 2,
  },
});
