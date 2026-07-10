import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY are not set. Copy .env.example to app/.env and fill in real values."
  );
}

// Placeholder fallbacks keep createClient from throwing (and blanking the whole
// app) when env vars are missing — auth calls will just fail with a network error.
export const supabase = createClient(supabaseUrl || "http://localhost:54321", supabaseAnonKey || "placeholder-anon-key", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // On web, the magic-link redirect lands back on this same page with the
    // session token in the URL — the client must parse it. On native, the
    // token arrives via a deep link instead, handled separately in auth.ts.
    detectSessionInUrl: Platform.OS === "web",
  },
});

export const FUNCTIONS_URL = supabaseUrl ? `${supabaseUrl}/functions/v1` : "";
