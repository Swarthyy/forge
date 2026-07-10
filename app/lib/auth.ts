import { Platform } from "react-native";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";

// v1 auth: magic-link email. Simplest to stand up without extra OAuth provider setup.
//
// The redirect target must be reachable by whatever surface sent the request:
// on web the link has to come back to this same origin (a forge:// deep link
// means nothing to a browser); on native it has to be the app's own scheme.
// Whichever URL is used here must also be added to this Supabase project's
// Auth > URL Configuration > Redirect URLs allow list, or Supabase silently
// drops it and falls back to the default Site URL.
export async function signInWithMagicLink(email: string) {
  const redirectTo = Platform.OS === "web" ? window.location.origin : Linking.createURL("auth-callback");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
