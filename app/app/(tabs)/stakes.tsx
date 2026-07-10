import { useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { colors, spacing, radius } from "@/lib/theme";
import { useStakesData } from "@/lib/useStakesData";
import { anteStake } from "@/lib/api";
import { NukeTrigger } from "@/components/NukeTrigger";

const STEP_DOLLARS = 25;
const MAX_DOLLARS = 300;

export default function StakesScreen() {
  const { groupId, potCents, members, loading, reload } = useStakesData();
  const [amount, setAmount] = useState(50);
  const [submitting, setSubmitting] = useState(false);

  function handleSlide(value: number) {
    const rounded = Math.round(value / STEP_DOLLARS) * STEP_DOLLARS;
    if (rounded !== amount) {
      // Escalating haptic weight as the raise climbs, so the slider itself
      // communicates how much is at stake rather than a flat tap every step.
      const style =
        rounded >= 150
          ? Haptics.ImpactFeedbackStyle.Heavy
          : rounded >= 50
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light;
      Haptics.impactAsync(style);
    }
    setAmount(rounded);
  }

  async function handleLock() {
    if (!groupId) return;
    setSubmitting(true);
    try {
      await anteStake(groupId, amount * 100);
      await reload();
    } catch (err) {
      Alert.alert("Couldn't lock in the raise", (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.matrixGreen} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stakes room</Text>
      <Text style={styles.potLine}>Current pot: ${(potCents / 100).toFixed(2)}</Text>

      <View style={styles.sliderCard}>
        <Text style={styles.sliderValue}>${amount}</Text>
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={MAX_DOLLARS}
          step={STEP_DOLLARS}
          value={amount}
          onValueChange={handleSlide}
          minimumTrackTintColor={colors.matrixGreen}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.matrixGreen}
        />
      </View>

      <Text style={styles.holdHint}>Hold for 2 seconds to lock in the raise</Text>
      <NukeTrigger onLocked={handleLock} disabled={submitting || amount === 0} />

      <Text style={styles.sectionLabel}>THE RING</Text>
      <View style={styles.grid}>
        {members.map((m) => (
          <View key={m.user_id} style={[styles.silhouette, m.has_staked && styles.silhouetteMatched]}>
            <Text style={[styles.silhouetteInitial, m.has_staked && styles.silhouetteInitialMatched]}>
              {m.display_name.charAt(0)}
            </Text>
            <Text style={styles.silhouetteName}>{m.display_name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian, padding: spacing.lg, paddingTop: spacing.xxl },
  center: { flex: 1, backgroundColor: colors.obsidian, justifyContent: "center", alignItems: "center" },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: "600", marginBottom: spacing.xs },
  potLine: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.xl },
  sliderCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  sliderValue: { color: colors.matrixGreen, fontSize: 32, fontWeight: "600", marginBottom: spacing.sm },
  holdHint: { color: colors.textMuted, fontSize: 12, textAlign: "center", marginBottom: spacing.lg },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.5,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
  silhouette: {
    width: 64,
    alignItems: "center",
    gap: spacing.xs,
  },
  silhouetteMatched: {},
  silhouetteInitial: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textMuted,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    fontWeight: "600",
    overflow: "hidden",
  },
  silhouetteInitialMatched: {
    backgroundColor: "rgba(57,255,20,0.15)",
    borderColor: colors.matrixGreen,
    color: colors.matrixGreen,
  },
  silhouetteName: { color: colors.textSecondary, fontSize: 11 },
});
