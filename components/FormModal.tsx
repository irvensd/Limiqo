import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [keyboard, setKeyboard] = useState(0);

  useEffect(() => {
    if (!open) {
      setKeyboard(0);
      return;
    }
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => setKeyboard(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboard(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, [open]);

  const rest = keyboard > 0 ? 12 : Math.max(insets.bottom, 16);
  const maxHeight = Math.max(240, height - keyboard - 20);

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.lift, { paddingBottom: keyboard }]}>
          <View style={[styles.sheet, { maxHeight, paddingBottom: rest }]}>
            <Text style={styles.kicker}>{title}</Text>
            <Text style={styles.heading}>{heading}</Text>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {children}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.overlay,
  },
  lift: {
    width: "100%",
  },
  sheet: {
    backgroundColor: colors.popover,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingTop: 24,
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
