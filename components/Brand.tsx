import { Image, StyleSheet, View, type ImageStyle, type StyleProp, type ViewStyle } from "react-native";

const icon = require("@/assets/images/IconLogo.png");
const wordmark = require("@/assets/images/Logo_wordmark.png");
const WORDMARK_ASPECT = 1086 / 1448;

export function AppIcon({
  size = 56,
  style,
}: {
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={icon}
      accessibilityLabel="Limiqo"
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
}

export function Wordmark({
  width = 200,
  light = true,
  style,
}: {
  width?: number;
  light?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const drawnHeight = width * WORDMARK_ASPECT;
  const cropHeight = width * 0.34;
  return (
    <View style={[{ width, height: cropHeight, overflow: "hidden" }, style]}>
      <Image
        source={wordmark}
        accessibilityLabel="Limiqo"
        style={[
          { width, height: drawnHeight, marginTop: -(drawnHeight - cropHeight) / 2 },
          light ? styles.light : null,
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  light: {
    tintColor: "#E7E9E4",
  },
});
