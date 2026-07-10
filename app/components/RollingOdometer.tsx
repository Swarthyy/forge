import { useEffect, useRef } from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { colors } from "@/lib/theme";

function RollingDigit({ char }: { char: string }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const prevChar = useRef(char);

  useEffect(() => {
    if (prevChar.current !== char) {
      translateY.value = -12;
      opacity.value = 0.25;
      translateY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 260 });
      prevChar.current = char;
    }
  }, [char]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return <Animated.Text style={[styles.digit, style]}>{char}</Animated.Text>;
}

// Mechanical odometer feel for the weekly pot: each character slides/fades in
// place when the formatted string changes, instead of a flat number swap.
export function RollingOdometer({ cents, style }: { cents: number; style?: StyleProp<ViewStyle> }) {
  const formatted = `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={[styles.row, style]}>
      {formatted.split("").map((c, i) => (
        <RollingDigit key={i} char={c} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  digit: {
    color: colors.matrixGreen,
    fontSize: 40,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
