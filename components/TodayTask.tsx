import { Check, Target } from "phosphor-react-native";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import AreaDot from "@/components/AreaDot";
import { colors, fonts } from "@/constants/theme";
import { pad } from "@/lib/helpers";
import type { Task } from "@/lib/data";

const ease = Easing.out(Easing.cubic);

export default function TodayTask({
  task,
  index,
  goalTitle,
  onToggle,
  onOpenSlot,
  onOpenGoal,
}: {
  task: Task;
  index: number;
  goalTitle?: string;
  projectTitle?: string;
  onToggle: () => void;
  onOpenSlot: () => void;
  onOpenGoal?: () => void;
  onOpenProject?: () => void;
}) {
  const fromTitle = goalTitle ?? projectTitle;
  const onOpenFrom = goalTitle ? onOpenGoal : onOpenProject;
  const progress = useSharedValue(task.done ? 1 : 0);
  const press = useSharedValue(1);
  const bounce = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(task.done ? 1 : 0, { duration: 320, easing: ease });
    bounce.value = task.done
      ? withSequence(
          withSpring(1.18, { damping: 14, stiffness: 260, mass: 0.6 }),
          withSpring(1, { damping: 16, stiffness: 180 }),
        )
      : withSpring(1, { damping: 18, stiffness: 200 });
  }, [bounce, progress, task.done]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: press.value * bounce.value }],
    backgroundColor: interpolateColor(progress.value, [0, 1], ["transparent", colors.primary]),
    borderColor: interpolateColor(progress.value, [0, 1], ["rgba(150,157,148,0.7)", colors.primary]),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.55 + progress.value * 0.45 }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [colors.foreground, colors.mutedForeground]),
    opacity: 1 - progress.value * 0.12,
  }));

  const numberStyle = useAnimatedStyle(() => ({
    opacity: 0.8 - progress.value * 0.25,
  }));

  return (
    <View style={styles.row}>
      <Animated.Text style={[styles.num, numberStyle]}>{pad(index + 1)}</Animated.Text>
      <View style={styles.rowBody}>
        <Pressable onPress={onOpenSlot} accessibilityLabel="Edit today’s slot">
          <Animated.Text style={[styles.task, titleStyle, task.done && styles.strike]}>
            {task.title}
          </Animated.Text>
        </Pressable>
        <View style={styles.areaWrap}>
          <AreaDot area={task.area} />
        </View>
        {fromTitle ? (
          <Pressable
            onPress={onOpenFrom}
            style={styles.from}
            accessibilityLabel={`From ${fromTitle}`}
          >
            <Target size={12} color={colors.mutedForeground} />
            <Text style={styles.fromText}>From {fromTitle}</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPressIn={() => {
          press.value = withTiming(0.88, { duration: 90 });
        }}
        onPressOut={() => {
          press.value = withSpring(1, { damping: 16, stiffness: 240 });
        }}
        onPress={onToggle}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={task.done ? "Mark incomplete" : "Complete task"}
      >
        <Animated.View style={[styles.check, circleStyle]}>
          <Animated.View style={checkStyle}>
            <Check size={14} color={colors.primaryForeground} weight="bold" />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 22,
  },
  num: {
    width: 36,
    color: "rgba(150,157,148,0.8)",
    fontSize: 28,
    fontFamily: fonts.regular,
  },
  rowBody: { flex: 1 },
  task: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: fonts.medium,
    letterSpacing: -0.3,
  },
  strike: {
    textDecorationLine: "line-through",
    textDecorationColor: colors.mutedForeground,
  },
  areaWrap: { marginTop: 8, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  from: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  fromText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
