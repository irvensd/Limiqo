import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/constants/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Missing", headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.title}>This page is not on the map.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to Today</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: colors.foreground,
    fontSize: 22,
    fontFamily: fonts.semibold,
    textAlign: "center",
  },
  link: { marginTop: 16 },
  linkText: { color: colors.primary, fontFamily: fonts.medium },
});
