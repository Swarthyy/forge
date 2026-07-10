import { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { colors, spacing, radius } from "@/lib/theme";
import { useArenaData } from "@/lib/useArenaData";
import { RollingOdometer } from "@/components/RollingOdometer";

export default function ArenaScreen() {
  const { groupName, myUserId, potCents, vaultCents, weekNumber, standings, loading } = useArenaData();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.matrixGreen} />
      </View>
    );
  }

  const myRow = standings.find((s) => s.user_id === myUserId);
  const iAmLast = myRow?.rank === 5;

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.wordmark}>FORGE</Text>
        {groupName && <Text style={styles.groupName}>{groupName}</Text>}

        <View style={styles.potCard}>
          <Text style={styles.potLabel}>WEEKLY LIVE POT</Text>
          <RollingOdometer cents={potCents} />
          {vaultCents > 0 && (
            <Text style={styles.vaultLine}>Vulture Vault holding ${(vaultCents / 100).toFixed(2)} — rolls in next week</Text>
          )}
        </View>

        <Text style={styles.sectionLabel}>STANDINGS {weekNumber ? `· WK ${weekNumber}` : ""}</Text>

        <View style={{ gap: spacing.md }}>
          {standings.length === 0 && <Text style={styles.empty}>No submissions graded yet this week.</Text>}
          {standings.map((s) => (
            <StandingCard key={s.user_id} row={s} />
          ))}
        </View>
      </ScrollView>

      {iAmLast && <RedVignetteOverlay />}
    </View>
  );
}

function RedVignetteOverlay() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: 0.5 + pulse.value * 0.5,
  }));

  return <Animated.View pointerEvents="none" style={[styles.vignette, style]} />;
}

function StandingCard({
  row,
}: {
  row: { user_id: string; display_name: string; points: number | null; rank: number | null; is_turbo: boolean };
}) {
  const isLast = row.rank === 5;
  const isFirst = row.rank === 1;

  const card = (
    <View style={[styles.card, isFirst && styles.cardFirst, isLast && styles.cardLast]}>
      <View style={styles.cardLeft}>
        <Text style={[styles.rank, isFirst && styles.rankFirst, isLast && styles.rankLast]}>{row.rank ?? "-"}</Text>
        <Text style={[styles.name, isLast && styles.nameLast]}>{row.display_name}</Text>
        {row.is_turbo && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>TURBO</Text>
          </View>
        )}
        {isLast && (
          <View style={[styles.badge, styles.badgeCrimson]}>
            <Text style={[styles.badgeText, styles.badgeTextCrimson]}>DRIFT</Text>
          </View>
        )}
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.points, isLast && styles.nameLast]}>{row.points ?? 0}pts</Text>
        <Text style={isFirst ? styles.arrowUp : isLast ? styles.arrowDown : styles.arrowFlat}>
          {isFirst ? "▲" : isLast ? "▼" : "—"}
        </Text>
      </View>
    </View>
  );

  return isFirst ? <Rank1Glow>{card}</Rank1Glow> : card;
}

function Rank1Glow({ children }: { children: React.ReactNode }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.65,
  }));

  return (
    <View style={styles.glowWrap}>
      <Animated.View pointerEvents="none" style={[styles.glowRing, ringStyle]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.obsidian },
  container: { flex: 1, backgroundColor: colors.obsidian },
  center: { flex: 1, backgroundColor: colors.obsidian, justifyContent: "center", alignItems: "center" },
  content: { padding: spacing.lg, paddingTop: spacing.xxl },
  wordmark: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 3,
    textAlign: "center",
  },
  groupName: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  potCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xl,
    backgroundColor: "rgba(57,255,20,0.04)",
  },
  potLabel: { color: colors.textSecondary, fontSize: 11, letterSpacing: 1.5, marginBottom: spacing.sm },
  vaultLine: { color: colors.textMuted, fontSize: 11, marginTop: spacing.sm },
  sectionLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 1.5, marginBottom: spacing.md },
  empty: { color: colors.textMuted, fontSize: 13 },
  glowWrap: { position: "relative" },
  glowRing: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: radius.md + 3,
    borderWidth: 2,
    borderColor: colors.matrixGreen,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  cardFirst: { borderColor: "rgba(57,255,20,0.5)" },
  cardLast: { backgroundColor: colors.surfaceMuted, borderColor: "rgba(255,49,49,0.35)" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  cardRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  rank: { color: colors.textSecondary, fontSize: 14, fontWeight: "600", width: 14 },
  rankFirst: { color: colors.matrixGreen },
  rankLast: { color: colors.textMuted },
  name: { color: colors.textPrimary, fontSize: 14, fontWeight: "600" },
  nameLast: { color: colors.textGhost },
  points: { color: colors.textPrimary, fontSize: 13 },
  arrowUp: { color: colors.matrixGreen, fontSize: 13 },
  arrowDown: { color: colors.crimson, fontSize: 13 },
  arrowFlat: { color: colors.textMuted, fontSize: 13 },
  badge: {
    backgroundColor: "rgba(57,255,20,0.12)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { color: colors.matrixGreen, fontSize: 10, letterSpacing: 0.5 },
  badgeCrimson: { backgroundColor: "rgba(255,49,49,0.1)" },
  badgeTextCrimson: { color: colors.crimson },
  vignette: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 28,
    borderColor: "rgba(255,49,49,0.14)",
  },
});
