import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { colors, spacing, radius } from "@/lib/theme";
import { useArenaData } from "@/lib/useArenaData";

export default function ArenaScreen() {
  const { groupName, potCents, weekNumber, standings, loading } = useArenaData();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.matrixGreen} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.wordmark}>FORGE</Text>
      {groupName && <Text style={styles.groupName}>{groupName}</Text>}

      <View style={styles.potCard}>
        <Text style={styles.potLabel}>WEEKLY LIVE POT</Text>
        <Text style={styles.potValue}>${(potCents / 100).toFixed(2)}</Text>
      </View>

      <Text style={styles.sectionLabel}>STANDINGS {weekNumber ? `· WK ${weekNumber}` : ""}</Text>

      <View style={{ gap: spacing.md }}>
        {standings.length === 0 && <Text style={styles.empty}>No submissions graded yet this week.</Text>}
        {standings.map((s) => (
          <StandingCard key={s.user_id} row={s} />
        ))}
      </View>
    </ScrollView>
  );
}

function StandingCard({
  row,
}: {
  row: { user_id: string; display_name: string; points: number | null; rank: number | null; is_turbo: boolean };
}) {
  const isLast = row.rank === 5;
  const isFirst = row.rank === 1;

  return (
    <View
      style={[
        styles.card,
        isFirst && styles.cardFirst,
        isLast && styles.cardLast,
      ]}
    >
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
}

const styles = StyleSheet.create({
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
  potValue: { color: colors.matrixGreen, fontSize: 40, fontWeight: "600" },
  sectionLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 1.5, marginBottom: spacing.md },
  empty: { color: colors.textMuted, fontSize: 13 },
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
});
