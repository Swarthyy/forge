import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radius } from "@/lib/theme";
import { supabase } from "@/lib/supabase";
import { submitEntry } from "@/lib/api";
import { isSundayPortalOpen } from "@/lib/sundayWindow";

const MAX_CHARS = 280;

export default function SundayPortalScreen() {
  const router = useRouter();
  const [groupId, setGroupId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isOpen = isSundayPortalOpen();

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
      if (membership) setGroupId(membership.group_id);
    })();
  }, []);

  async function handleSubmit() {
    if (!groupId || !text.trim()) return;
    setSubmitting(true);
    try {
      await submitEntry(groupId, text.trim());
      router.back();
    } catch (err) {
      Alert.alert("Couldn't submit", (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>State your milestone</Text>
      <Text style={styles.microcopy}>No fluff, no stories. The judge values outcomes over hours.</Text>

      {!isOpen && (
        <Text style={styles.closedNotice}>
          The Sunday Portal is only open 6:00 PM - 11:59 PM on Sundays.
        </Text>
      )}

      <TextInput
        style={styles.input}
        multiline
        maxLength={MAX_CHARS}
        placeholder="Closed a $9k/mo contract..."
        placeholderTextColor={colors.textMuted}
        value={text}
        onChangeText={setText}
        editable={isOpen}
      />
      <Text style={styles.counter}>{text.length}/{MAX_CHARS}</Text>

      <Pressable
        style={[styles.button, (!isOpen || !text.trim() || submitting) && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!isOpen || !text.trim() || submitting}
      >
        <Text style={styles.buttonText}>{submitting ? "Submitting..." : "Lock it in"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.obsidian, padding: spacing.xl, paddingTop: spacing.xxl },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: "600", marginBottom: spacing.xs },
  microcopy: { color: colors.textSecondary, fontSize: 13, marginBottom: spacing.xl },
  closedNotice: { color: colors.crimson, fontSize: 12, marginBottom: spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    color: colors.textPrimary,
    fontSize: 15,
    minHeight: 140,
    textAlignVertical: "top",
  },
  counter: { color: colors.textMuted, fontSize: 11, textAlign: "right", marginTop: spacing.xs, marginBottom: spacing.xl },
  button: {
    backgroundColor: colors.matrixGreen,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.35 },
  buttonText: { color: "#04340F", fontSize: 15, fontWeight: "600" },
});
