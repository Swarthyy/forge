import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import { colors, radius } from "@/lib/theme";

const HOLD_MS = 2000;
const SIZE = 96;

export function NukeTrigger({ onLocked, disabled }: { onLocked: () => void; disabled?: boolean }) {
  const progress = useSharedValue(0);

  const fireHaptic = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  function handlePressIn() {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    progress.value = withTiming(1, { duration: HOLD_MS, easing: Easing.linear }, (finished) => {
      if (finished) {
        runOnJS(fireHaptic)();
        runOnJS(onLocked)();
      }
    });
  }

  function handlePressOut() {
    cancelAnimation(progress);
    progress.value = withSequence(withTiming(0, { duration: 200 }));
  }

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progress.value }],
    opacity: 0.25 + progress.value * 0.75,
  }));

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.outer, disabled && styles.outerDisabled]}
    >
      <Animated.View style={[styles.fill, fillStyle]} />
      <Text style={styles.label}>NUKE</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: colors.crimson,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    overflow: "hidden",
  },
  outerDisabled: { opacity: 0.4 },
  fill: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.crimson,
  },
  label: { color: colors.textPrimary, fontWeight: "700", fontSize: 13, letterSpacing: 1 },
});
