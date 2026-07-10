import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeIn, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, spacing, radius } from "@/lib/theme";
import { supabase } from "@/lib/supabase";

interface RevealRow {
  user_id: string;
  display_name: string;
  rank: number;
  points: number;
  commentary: string | null;
}

// Bottom-up sequential extraction per PRD §3 View 4: rank 5 first with a harsh
// roast, then the final 2-vs-1 duo, then the winner explosion.
// TODO: real audio (buzzer / heartbeat / cash-drop) and particle assets are out
// of scope for this pass — see plan's "explicitly out of scope" section.
export default function MondayRevealScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<RevealRow[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [potCents, setPotCents] = useState(0);

  useEffect(() => {
    (async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data: appUser } = await supabase.from("users").select("id").eq("auth_id", authUser.id).single();
      if (!appUser) return;
      const { data: membership } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", appUser.id)
        .limit(1)
        .single();
      if (!membership) return;

      const { data: group } = await supabase
        .from("groups")
        .select("pot_cents, current_week_number")
        .eq("id", membership.group_id)
        .single();
      if (!group) return;

      const lastWeek = Math.max(1, group.current_week_number - 1);
      const { data: submissions } = await supabase
        .from("weekly_submissions")
        .select("user_id, rank, points, ai_commentary, users:user_id(display_name)")
        .eq("group_id", membership.group_id)
        .eq("week_number", lastWeek)
        .order("rank", { ascending: false });

      setPotCents(group.pot_cents);
      setRows(
        (submissions ?? []).map((s: any) => ({
          user_id: s.user_id,
          display_name: s.users?.display_name ?? "?",
          rank: s.rank,
          points: s.points,
          commentary: s.ai_commentary,
        }))
      );
    })();
  }, []);

  useEffect(() => {
    if (rows.length === 0 || revealedCount >= rows.length) return;
    const isLast = revealedCount === 0;
    const isFinal = revealedCount === rows.length - 1;
    Haptics.impactAsync(isFinal ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
    const timer = setTimeout(() => setRevealedCount((c) => c + 1), isLast ? 900 : 1300);
    return () => clearTimeout(timer);
  }, [rows, revealedCount]);

  const visible = rows.slice(0, revealedCount);
  const winner = rows.find((r) => r.rank === 1);
  const doneRevealing = revealedCount >= rows.length && rows.length > 0;

  return (
    <View style={styles.container}>
      {rows.length === 0 ? (
        <Text style={styles.loading}>Tallying the week...</Text>
      ) : (
        <>
          <View style={{ gap: spacing.md, width: "100%" }}>
            {visible.map((row) => (
              <Animated.View
                key={row.user_id}
                entering={row.rank === 1 ? ZoomIn.duration(500) : FadeInDown.duration(500)}
                style={[styles.card, row.rank === 1 && styles.cardWinner, row.rank === rows.length && styles.cardLast]}
              >
                <Text style={styles.cardRank}>#{row.rank}</Text>
                <Text style={styles.cardName}>{row.display_name}</Text>
                <Text style={styles.cardPoints}>{row.points}pts</Text>
                {row.commentary && <Text style={styles.cardCommentary}>{row.commentary}</Text>}
              </Animated.View>
            ))}
          </View>

          {doneRevealing && winner && (
            <Animated.View entering={FadeIn.delay(300)} style={styles.winnerBanner}>
              <Text style={styles.winnerLabel}>CHAMPION</Text>
              <Text style={styles.winnerName}>{winner.display_name}</Text>
              <Text style={styles.winnerPot}>+${(potCents / 100).toFixed(2)}</Text>
            </Animated.View>
          )}

          {doneRevealing && (
            <Pressable style={styles.doneButton} onPress={() => router.back()}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.obsidian,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  loading: { color: colors.textSecondary, fontSize: 14 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: 4,
  },
  cardLast: { borderColor: "rgba(255,49,49,0.4)", backgroundColor: colors.surfaceMuted },
  cardWinner: {
    borderColor: colors.matrixGreen,
    backgroundColor: "rgba(57,255,20,0.08)",
  },
  cardRank: { color: colors.textMuted, fontSize: 11, letterSpacing: 1 },
  cardName: { color: colors.textPrimary, fontSize: 18, fontWeight: "600" },
  cardPoints: { color: colors.textSecondary, fontSize: 13 },
  cardCommentary: { color: colors.textSecondary, fontSize: 12, marginTop: 4, fontStyle: "italic" },
  winnerBanner: { alignItems: "center", marginTop: spacing.xxl },
  winnerLabel: { color: colors.textMuted, fontSize: 11, letterSpacing: 2 },
  winnerName: { color: colors.matrixGreen, fontSize: 28, fontWeight: "700", marginTop: spacing.xs },
  winnerPot: { color: colors.matrixGreen, fontSize: 20, fontWeight: "600", marginTop: spacing.xs },
  doneButton: {
    marginTop: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  doneButtonText: { color: colors.textPrimary, fontSize: 14, fontWeight: "600" },
});
