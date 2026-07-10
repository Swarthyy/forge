import { supabase } from "./supabase";

// v1.2 auth: email + password. Works identically on-device for a friend
// group as it will in dev — no email round-trip, no deep-link redirect
// config. Google/Apple sign-in can layer on top of this later without
// touching the users table, since the DB trigger below (see migration
// 0004) creates the public.users row regardless of which provider signed
// someone up.
export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

// context_profile is the immutable free-text baseline set once at
// onboarding (PRD: business, scale, operating baseline). It's carried in
// the signup metadata so the on_auth_user_created trigger can write it
// straight into public.users without needing a client-side insert policy.
export async function signUpWithPassword(
  email: string,
  password: string,
  displayName: string,
  contextProfile: string
) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName, context_profile: contextProfile } },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
