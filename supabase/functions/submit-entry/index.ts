// Sunday Portal submission endpoint.
// Enforces the Sunday 6:00 PM - 11:59 PM window and the 280-char cap server-side
// (the client also gates the UI, but the server check is the source of truth).
import { withCors, corsHeaders } from "../_shared/cors.ts";
import { adminClient, userClient } from "../_shared/admin-client.ts";

const MAX_CHARS = 280;
// TODO: make timezone per-group/configurable. Defaults to UTC for local dev.
const TIMEZONE = Deno.env.get("FORGE_TIMEZONE") ?? "UTC";

function isWithinSundayWindow(now: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "-1");

  // Sunday 18:00 (6pm) through 23:59.
  return weekday === "Sun" && hour >= 18;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return withCors({ error: "method not allowed" }, { status: 405 });

  try {
    const body = await req.json();
    const { group_id, raw_text } = body as { group_id?: string; raw_text?: string };

    if (!group_id || !raw_text) {
      return withCors({ error: "group_id and raw_text are required" }, { status: 400 });
    }
    if (raw_text.length > MAX_CHARS) {
      return withCors({ error: `raw_text exceeds ${MAX_CHARS} characters` }, { status: 400 });
    }
    if (!isWithinSundayWindow(new Date())) {
      return withCors(
        { error: "The Sunday Portal is only open 6:00 PM - 11:59 PM on Sundays." },
        { status: 403 }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const supabase = userClient(authHeader);

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return withCors({ error: "unauthorized" }, { status: 401 });

    // Resolve app user + confirm group membership under RLS.
    const admin = adminClient();
    const { data: appUser, error: userErr } = await admin
      .from("users")
      .select("id")
      .eq("auth_id", authUser.id)
      .single();
    if (userErr || !appUser) return withCors({ error: "user not found" }, { status: 404 });

    const { data: group, error: groupErr } = await admin
      .from("groups")
      .select("id, current_week_number")
      .eq("id", group_id)
      .single();
    if (groupErr || !group) return withCors({ error: "group not found" }, { status: 404 });

    const { data: submission, error: insertErr } = await admin
      .from("weekly_submissions")
      .insert({
        user_id: appUser.id,
        group_id,
        week_number: group.current_week_number,
        raw_text,
      })
      .select()
      .single();

    if (insertErr) return withCors({ error: insertErr.message }, { status: 400 });

    return withCors({ submission }, { status: 201 });
  } catch (err) {
    return withCors({ error: (err as Error).message }, { status: 500 });
  }
});
