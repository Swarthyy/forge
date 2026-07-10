import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Linking from "expo-linking";
import { colors } from "@/lib/theme";
import { useSession } from "@/lib/useSession";
import { registerPushToken } from "@/lib/registerPushToken";
import { supabase } from "@/lib/supabase";

export default function RootLayout() {
  const { session, loading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "login";

    if (!session && !inAuthGroup) {
      router.replace("/login");
    } else if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [session, loading, segments]);

  // Native only: the web client auto-detects the session from the URL
  // (detectSessionInUrl in lib/supabase.ts), but a deep link back into a
  // native app has to be exchanged for a session explicitly.
  useEffect(() => {
    if (Platform.OS === "web") return;

    const handleUrl = ({ url }: { url: string }) => {
      if (url.includes("auth-callback")) {
        supabase.auth.exchangeCodeForSession(url).catch((err) => {
          console.warn("Failed to complete magic-link sign-in:", err);
        });
      }
    };

    const subscription = Linking.addEventListener("url", handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (session) registerPushToken();
  }, [session]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.obsidian }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.obsidian },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="submit" options={{ presentation: "modal" }} />
        <Stack.Screen name="reveal" options={{ presentation: "fullScreenModal" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
