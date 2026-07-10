import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, FadeIn, ZoomIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, spacing, radius } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { triggerAudit, castAuditVote } from "@/lib/api";

interface RevealRow {
  submission_id: string;
  user_id: string;
  display_name: string;
  rank: number;
  points: number;
  commentary: string | null;
}

interface OpenAudit {
  id: string;
  weekly_submission_id: string;
}

// Bottom-up sequential extraction per PRD §3 View 4: rank 5 first with a harsh
// roast, then the final 2-vs-1 duo, then the winner explosion.
// TODO: real audio (buzzer / heartbeat / cash-drop) and particle assets are out
// of scope for this pass — see plan's "explicitly out of scope" section.
export default function MondayRevealScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<RevealRow[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [potCents, setPotCents] = useState(0);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [openAudits, setOpenAudits] = useState<OpenAudit[]>([]);
  const [auditFormFor, setAuditFormFor] = useState<string | null>(null);
  const [evidenceUrl, setEvidenceUrl] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        setNotFound(true);
        return;
      }
      const { data: appUser } = await supabase.from("users").select("id").eq("auth_id", authUser.id).single();
      if (!appUser) {
        setNotFound(true);
        return;
      }
      setMyUserId(appUser.id);

      const { data: membership } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", appUser.id)
        .limit(1)
        .single();
      if (!membership) {
        setNotFound(true);
        return;
      }

      const { data: group } = await supabase
        .from("groups")
        .select("pot_cents, current_week_number")
        .eq("id", membership.group_id)
        .single();
      if (!group) {
        setNotFound(true);
        return;
      }

      const lastWeek = Math.max(1, group.current_week_number - 1);
      const { data: submissions } = await supabase
        .from("weekly_submissions")
        .select("id, user_id, rank, points, ai_commentary, users:user_id(display_name)")
        .eq("group_id", membership.group_id)
        .eq("week_number", lastWeek)
        .order("rank", { ascending: false });

      const submissionRows = submissions ?? [];
      setPotCents(group.pot_cents);
      setRows(
        submissionRows.map((s: any) => ({
          submission_id: s.id,
          user_id: s.user_id,
          display_name: s.users?.display_name ?? "?",
          rank: s.rank,
          points: s.points,
          commentary: s.ai_commentary,
        }))
      );

      if (submissionRows.length > 0) {
        const { data: audits } = await supabase
          .from("audits")
          .select("id, weekly_submission_id")
          .in(
            "weekly_submission_id",
            submissionRows.map((s: any) => s.id)
          )
          .eq("status", "open");
        setOpenAudits(audits ?? []);
      }
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

  async function handleCallBs(submissionId: string) {
    if (!evidenceUrl.trim()) return;
    try {
      await triggerAudit(submissionId, evidenceUrl.trim());
      setAuditFormFor(null);
      setEvidenceUrl("");
      const { data: audits } = await supabase
        .from("audits")
        .select("id, weekly_submission_id")
        .eq("weekly_submission_id", submissionId)
        .eq("status", "open");
      setOpenAudits((prev) => [...prev.filter((a) => a.weekly_submission_id !== submissionId), ...(audits ?? [])]);
    } catch {
      // Silently ignore — e.g. voting on your own submission is rejected server-side.
    }
  }

  async function handleVote(auditId: string, vote: boolean) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await castAuditVote(auditId, vote);
  }

  const visible = rows.slice(0, revealedCount);
  const winner = rows.find((r) => r.rank === 1);
  const doneRevealing = revealedCount >= rows.length && rows.length > 0;

  return (
    <View style={styles.container}>
      {notFound ? (
        <Text style={styles.loading}>Nothing to show yet.</Text>
      ) : rows.length === 0 ? (
        <Text style={styles.loading}>Tallying the week...</Text>
      ) : (
        <>
          <View style={{ gap: spacing.md, width: "100%" }}>
            {visible.map((row) => {
              const audit = openAudits.find((a) => a.weekly_submission_id === row.submission_id);
              const isSelf = row.user_id === myUserId;

              return (
                <Animated.View
                  key={row.user_id}
                  entering={row.rank === 1 ? ZoomIn.duration(500) : FadeInDown.duration(500)}
                  style={[styles.card, row.rank === 1 && styles.cardWinner, row.rank === rows.length && styles.cardLast]}
                >
                  <Text style={styles.cardRank}>#{row.rank}</Text>
                  <Text style={styles.cardName}>{row.display_name}</Text>
                  <Text style={styles.cardPoints}>{row.points}pts</Text>
                  {row.commentary && <Text style={styles.cardCommentary}>{row.commentary}</Text>}

                  {!isSelf && !audit && auditFormFor !== row.submission_id && (
                    <Pressable style={styles.bsButton} onPress={() => setAuditFormFor(row.submission_id)}>
                      <Text style={styles.bsButtonText}>Call BS</Text>
                    </Pressable>
                  )}

                  {auditFormFor === row.submission_id && (
                    <View style={styles.auditForm}>
                      <TextInput
                        style={styles.auditInput}
                        placeholder="Evidence link"
                        placeholderTextColor={colors.textMuted}
                        value={evidenceUrl}
                        onChangeText={setEvidenceUrl}
                      />
                      <Pressable
                        style={[styles.bsButton, !evidenceUrl.trim() && styles.buttonDisabled]}
                        onPress={() => handleCallBs(row.submission_id)}
                        disabled={!evidenceUrl.trim()}
                      >
                        <Text style={styles.bsButtonText}>Submit dispute</Text>
                      </Pressable>
                    </View>
                  )}

                  {audit && !isSelf && (
                    <View style={styles.voteRow}>
                      <Text style={styles.voteLabel}>Dispute open — uphold?</Text>
                      <Pressable style={styles.voteYes} onPress={() => handleVote(audit.id, true)}>
                        <Text style={styles.voteYesText}>Yes</Text>
                      </Pressable>
                      <Pressable style={styles.voteNo} onPress={() => handleVote(audit.id, false)}>
                        <Text style={styles.voteNoText}>No</Text>
                      </Pressable>
                    </View>
                  )}
                </Animated.View>
              );
            })}
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
  bsButton: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.crimson,
    borderRadius: radius.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  bsButtonText: { color: colors.crimson, fontSize: 11, fontWeight: "600" },
  buttonDisabled: { opacity: 0.35 },
  auditForm: { marginTop: spacing.sm, gap: spacing.sm },
  auditInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    color: colors.textPrimary,
    fontSize: 12,
  },
  voteRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm },
  voteLabel: { color: colors.textMuted, fontSize: 11, flex: 1 },
  voteYes: { borderWidth: 1, borderColor: colors.matrixGreen, borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: spacing.sm },
  voteYesText: { color: colors.matrixGreen, fontSize: 11, fontWeight: "600" },
  voteNo: { borderWidth: 1, borderColor: colors.textMuted, borderRadius: radius.sm, paddingVertical: 4, paddingHorizontal: spacing.sm },
  voteNoText: { color: colors.textMuted, fontSize: 11, fontWeight: "600" },
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
