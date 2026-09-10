import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, fonts } from "@/constants/theme";

export default function FormModal({
  open,
  title,
  heading,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  heading: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrap}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.kicker}>{title}</Text>
          <Text style={styles.heading}>{heading}</Text>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.popover,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 24,
    paddingBottom: 36,
  },
  kicker: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.semibold,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  heading: {
    color: colors.foreground,
    fontSize: 26,
    fontFamily: fonts.semibold,
    letterSpacing: -0.6,
    marginBottom: 20,
  },
});
