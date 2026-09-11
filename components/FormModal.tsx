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
import { useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, floatingTab, fonts } from "@/constants/theme";

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
  const segments = useSegments();
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

  const onTabs = segments[0] === "(tabs)" && keyboard === 0;
  const dock = keyboard > 0
    ? keyboard
    : onTabs
      ? Math.max(insets.bottom, 12) + floatingTab.bottomGap + floatingTab.height + 8
      : 0;
  const rest = keyboard > 0 ? 12 : onTabs ? 20 : Math.max(insets.bottom, 16);
  const maxHeight = Math.max(240, height - dock - 20);

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.frame, { paddingBottom: dock }]}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View style={[styles.sheet, { maxHeight, paddingBottom: rest }]}>
            <View style={styles.head}>
              <Text style={styles.kicker}>{title}</Text>
              <Text style={styles.heading}>{heading}</Text>
            </View>
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
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
  frame: {
    flex: 1,
  },
  overlay: {
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
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  head: {
    flexShrink: 0,
  },
  body: {
    flexGrow: 0,
    flexShrink: 1,
  },
  bodyContent: {
    paddingTop: 4,
  },
  kicker: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: fonts.semibold,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  heading: {
    color: colors.foreground,
    fontSize: 26,
    lineHeight: 36,
    fontFamily: fonts.semibold,
    letterSpacing: -0.6,
    marginBottom: 20,
    paddingTop: 4,
    paddingLeft: 2,
    paddingRight: 4,
  },
});
