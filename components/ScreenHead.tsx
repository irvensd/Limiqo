import { StyleSheet, View } from "react-native";
import SettingsButton from "@/components/SettingsButton";
import { Kicker } from "@/components/Type";

export default function ScreenHead({ kicker }: { kicker: string }) {
  return (
    <View style={styles.top}>
      <Kicker style={styles.kicker}>{kicker}</Kicker>
      <SettingsButton />
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  kicker: {
    flex: 1,
    marginBottom: 0,
    marginRight: 12,
  },
});
