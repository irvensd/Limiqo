import * as Haptics from "expo-haptics";

export async function completeTaskHaptic(finishingTheSet: boolean) {
  try {
    if (finishingTheSet) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  } catch {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export function undoTaskHaptic() {
  void Haptics.selectionAsync();
}
