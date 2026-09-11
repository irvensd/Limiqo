import { StyleSheet, View } from "react-native";
import CloudLine from "@/components/CloudLine";
import SettingsButton from "@/components/SettingsButton";
import { Kicker } from "@/components/Type";

export default function ScreenHead({ kicker }: { kicker: string }) {
  return (
    <View style={styles.block}>
      <View style={styles.top}>
        <Kicker style={styles.kicker}>{kicker}</Kicker>
        <SettingsButton />
      </View>
      <CloudLine />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 16,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  kicker: {
    flex: 1,
    marginBottom: 0,
    marginRight: 12,
  },
});
