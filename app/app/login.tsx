import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth";
import { colors, spacing, radius } from "@/lib/theme";

type Mode = "login" | "signup";

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [contextProfile, setContextProfile] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit =
    email.trim() && password.trim() && (mode === "login" || (displayName.trim() && contextProfile.trim()));

  async function handleSubmit() {
    if (!canSubmit) return;
    setStatus("working");
    try {
      if (mode === "login") {
        await signInWithPassword(email.trim(), password);
      } else {
        await signUpWithPassword(email.trim(), password, displayName.trim(), contextProfile.trim());
      }
      // Successful sign-in/sign-up flips the session, and the root layout's
      // redirect takes it from there.
    } catch (err) {
      setStatus("error");
      setErrorMessage((err as Error).message);
      return;
    }
    setStatus("idle");
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
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {mode === "signup" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Display name (e.g. JAMES)"
            placeholderTextColor={colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="What are you building? Business, scale, baseline — this never changes once set."
            placeholderTextColor={colors.textMuted}
            multiline
            value={contextProfile}
            onChangeText={setContextProfile}
          />
        </>
      )}

      <Pressable style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={handleSubmit} disabled={!canSubmit || status === "working"}>
        <Text style={styles.buttonText}>
          {status === "working" ? "Working..." : mode === "login" ? "Log in" : "Create account"}
        </Text>
      </Pressable>

      {status === "error" && <Text style={[styles.status, { color: colors.crimson }]}>{errorMessage}</Text>}

      <Pressable onPress={() => setMode(mode === "login" ? "signup" : "login")} style={styles.toggle}>
        <Text style={styles.toggleText}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </Text>
      </Pressable>
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
  multiline: { minHeight: 80, textAlignVertical: "top" },
  button: {
    backgroundColor: colors.matrixGreen,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.35 },
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
  toggle: { marginTop: spacing.xl, alignItems: "center" },
  toggleText: { color: colors.textSecondary, fontSize: 13 },
});
