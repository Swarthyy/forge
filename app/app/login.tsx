import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { signInWithMagicLink } from "@/lib/auth";
import { colors, spacing, radius } from "@/lib/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSend() {
    if (!email) return;
    setStatus("sending");
    try {
      await signInWithMagicLink(email.trim());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.wordmark}>FORGE</Text>
      <Text style={styles.subtitle}>No safe spaces. No shared victories.</Text>

      <TextInput
        style={styles.input}
        placeholder="you@yourbusiness.com"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Pressable style={styles.button} onPress={handleSend} disabled={status === "sending"}>
        <Text style={styles.buttonText}>{status === "sending" ? "Sending..." : "Send magic link"}</Text>
      </Pressable>

      {status === "sent" && <Text style={styles.status}>Check your email for the link.</Text>}
      {status === "error" && <Text style={[styles.status, { color: colors.crimson }]}>Couldn't send that link. Try again.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.obsidian,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  wordmark: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginBottom: spacing.xxl,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.matrixGreen,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonText: {
    color: "#04340F",
    fontSize: 15,
    fontWeight: "600",
  },
  status: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
