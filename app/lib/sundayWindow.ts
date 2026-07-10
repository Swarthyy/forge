// Client-side mirror of the server check in supabase/functions/submit-entry.
// UX gating only — the edge function is the source of truth.
export function isSundayPortalOpen(now: Date = new Date()): boolean {
  const day = now.getDay(); // 0 = Sunday
  const hour = now.getHours();
  return day === 0 && hour >= 18;
}
