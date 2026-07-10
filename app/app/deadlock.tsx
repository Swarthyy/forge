import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, spacing, radius } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { useGroupWeekStatus } from "@/lib/useGroupWeekStatus";
import { submitTiebreaker } from "@/lib/api";

interface FinalistName {
  id: string;
  display_name: string;
}

// Full-screen, non-dismissable while a group is deadlocked (PRD v1.1). Both
// finalists get one shot at extra context before the 60s window closes;
// everyone else just watches. Resolution itself is driven by the
// week_status subscription in app/_layout.tsx — once resolve-deadlock
// clears it server-side, the redirect there takes everyone back to the Arena.
export default function DeadlockScreen() {
  const { groupId, myUserId, deadlockFinalistIds, deadlockDeadline } = useGroupWeekStatus();
  const [names, setNames] = useState<FinalistName[]>([]);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [resolving, setResolving] = useState(false);

  const amFinalist = !!myUserId && !!deadlockFinalistIds?.includes(myUserId);

  useEffect(() => {
    if (!deadlockFinalistIds) return;
    supabase
      .from("users")
      .select("id, display_name")
      .in("id", deadlockFinalistIds)
      .then(({ data }) => setNames(data ?? []));
  }, [deadlockFinalistIds]);

  useEffect(() => {
    if (!deadlockDeadline) return;
    const tick = () => {
      const remaining = Math.max(0, Math.round((new Date(deadlockDeadline).getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadlockDeadline]);

  useEffect(() => {
    if (secondsLeft === 0 && groupId && !resolving) {
      setResolving(true);
      submitTiebreaker(groupId).finally(() => setResolving(false));
    }
  }, [secondsLeft, groupId]);

  async function handleSubmit() {
    if (!groupId || !text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitted(true);
    await submitTiebreaker(groupId, text.trim());
  }

  const finalistOne = names[0];
  const finalistTwo = names[1];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>DEADLOCK</Text>
      <Text style={styles.title}>
        {finalistOne?.display_name ?? "..."} vs {finalistTwo?.display_name ?? "..."}
      </Text>
      <Text style={styles.subtitle}>Too close to call. The judge wants one more data point.</Text>

      <Text style={styles.countdown}>{secondsLeft}</Text>

      {amFinalist ? (
        submitted ? (
          <Text style={styles.waiting}>Submitted. Waiting on the other finalist...</Text>
        ) : (
          <>
            <TextInput
              style={styles.input}
              multiline
              maxLength={280}
              placeholder="One more piece of evidence..."
              placeholderTextColor={colors.textMuted}
              value={text}
              onChangeText={setText}
            />
            <Pressable style={[styles.button, !text.trim() && styles.buttonDisabled]} onPress={handleSubmit} disabled={!text.trim()}>
              <Text style={styles.buttonText}>Submit</Text>
            </Pressable>
          </>
        )
      ) : (
        <Text style={styles.waiting}>Watching the showdown. The judge decides when the clock runs out.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian, padding: spacing.xl, justifyContent: "center", alignItems: "center" },
  label: { color: colors.crimson, fontSize: 12, letterSpacing: 2, marginBottom: spacing.sm },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: "600", textAlign: "center" },
  subtitle: { color: colors.textSecondary, fontSize: 13, textAlign: "center", marginTop: spacing.xs, marginBottom: spacing.xl },
  countdown: { color: colors.matrixGreen, fontSize: 56, fontWeight: "700", marginBottom: spacing.xl },
  waiting: { color: colors.textMuted, fontSize: 13, textAlign: "center" },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    color: colors.textPrimary,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: spacing.lg,
  },
  button: { backgroundColor: colors.matrixGreen, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xxl },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: "#04340F", fontSize: 15, fontWeight: "600" },
});
