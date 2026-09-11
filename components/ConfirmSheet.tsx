import { Pressable, StyleSheet, Text, View } from "react-native";
import FormModal from "@/components/FormModal";
import { colors, fonts } from "@/constants/theme";

export default function ConfirmSheet({
  open,
  kicker,
  heading,
  body,
  confirmLabel,
  destructive = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  kicker: string;
  heading: string;
  body: string;
  confirmLabel: string;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <FormModal open={open} title={kicker} heading={heading} onClose={onClose}>
      <Text style={styles.body}>{body}</Text>
      <View style={styles.actions}>
        <Pressable onPress={onClose} style={styles.cancel} hitSlop={8}>
          <Text style={styles.cancelText}>Not yet</Text>
        </Pressable>
        <Pressable
          onPress={onConfirm}
          style={[styles.confirm, destructive && styles.confirmQuiet]}
        >
          <Text style={[styles.confirmText, destructive && styles.confirmQuietText]}>
            {confirmLabel}
          </Text>
        </Pressable>
      </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.mutedForeground,
    fontSize: 15,
    lineHeight: 24,
    fontFamily: fonts.regular,
    marginBottom: 8,
    paddingTop: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },
  cancel: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cancelText: {
    color: colors.mutedForeground,
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  confirm: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  confirmText: {
    color: colors.primaryForeground,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  confirmQuiet: {
    backgroundColor: colors.secondary,
  },
  confirmQuietText: {
    color: colors.foreground,
  },
});
