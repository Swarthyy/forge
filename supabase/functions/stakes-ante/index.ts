// Stakes Room endpoint: the Nuke Trigger / Match Bet action.
// Inserts an ante into the ledger, bumps the group pot, and notifies the group.
import { withCors, corsHeaders } from "../_shared/cors.ts";
import { adminClient, userClient } from "../_shared/admin-client.ts";
import { sendPush } from "../_shared/push.ts";
import { speculationTemplate } from "../_shared/notifications.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return withCors({ error: "method not allowed" }, { status: 405 });

  try {
    const { group_id, amount_cents } = (await req.json()) as {
      group_id?: string;
      amount_cents?: number;
    };

    if (!group_id || !amount_cents || amount_cents <= 0) {
      return withCors({ error: "group_id and a positive amount_cents are required" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    const supabase = userClient(authHeader);
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) return withCors({ error: "unauthorized" }, { status: 401 });

    const admin = adminClient();
    const { data: appUser, error: userErr } = await admin
      .from("users")
      .select("id, display_name")
      .eq("auth_id", authUser.id)
      .single();
    if (userErr || !appUser) return withCors({ error: "user not found" }, { status: 404 });

    const { data: group, error: groupErr } = await admin
      .from("groups")
      .select("id, pot_cents, current_week_number")
      .eq("id", group_id)
      .single();
    if (groupErr || !group) return withCors({ error: "group not found" }, { status: 404 });

    const { data: stake, error: stakeErr } = await admin
      .from("stakes")
      .insert({
        group_id,
        week_number: group.current_week_number,
        user_id: appUser.id,
        amount_cents,
      })
      .select()
      .single();
    if (stakeErr) return withCors({ error: stakeErr.message }, { status: 400 });

    const newPot = group.pot_cents + amount_cents;
    await admin.from("groups").update({ pot_cents: newPot }).eq("id", group_id);

    const { data: members } = await admin
      .from("group_members")
      .select("users:user_id(expo_push_token)")
      .eq("group_id", group_id);

    const notif = speculationTemplate({
      raiserName: appUser.display_name,
      raiseDollars: amount_cents / 100,
      totalStakeDollars: newPot / 100,
    });

    const pushMessages = (members ?? [])
      .map((m: any) => m.users?.expo_push_token)
      .filter((t: string | null): t is string => !!t)
      .map((to: string) => ({ to, title: notif.title, body: notif.body }));
    await sendPush(pushMessages);

    return withCors({ stake, pot_cents: newPot }, { status: 201 });
  } catch (err) {
    return withCors({ error: (err as Error).message }, { status: 500 });
  }
});
