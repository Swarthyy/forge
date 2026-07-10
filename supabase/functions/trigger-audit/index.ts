// The BS Button. Any group member (other than the accused) can dispute a
// ranking within 1 hour of the reveal, with evidence attached. RLS on the
// audits table already enforces "not your own submission" and group
// membership; this function additionally notifies the rest of the group.
import { withCors, corsHeaders } from "../_shared/cors.ts";
import { adminClient, userClient } from "../_shared/admin-client.ts";
import { sendPush } from "../_shared/push.ts";
import { auditOpenedTemplate } from "../_shared/notifications.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return withCors({ error: "method not allowed" }, { status: 405 });

  try {
    const { weekly_submission_id, evidence_url } = (await req.json()) as {
      weekly_submission_id?: string;
      evidence_url?: string;
    };
    if (!weekly_submission_id || !evidence_url) {
      return withCors({ error: "weekly_submission_id and evidence_url are required" }, { status: 400 });
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

    const { data: submission, error: subErr } = await admin
      .from("weekly_submissions")
      .select("id, user_id, group_id, rank, users:user_id(display_name)")
      .eq("id", weekly_submission_id)
      .single();
    if (subErr || !submission) return withCors({ error: "submission not found" }, { status: 404 });
    if (submission.user_id === appUser.id) {
      return withCors({ error: "can't call BS on your own ranking" }, { status: 400 });
    }

    const { data: audit, error: auditErr } = await admin
      .from("audits")
      .insert({ weekly_submission_id, accuser_user_id: appUser.id, evidence_url })
      .select()
      .single();
    if (auditErr) return withCors({ error: auditErr.message }, { status: 400 });

    const { data: members } = await admin
      .from("group_members")
      .select("users:user_id(expo_push_token)")
      .eq("group_id", submission.group_id);

    const notif = auditOpenedTemplate({
      accuserName: appUser.display_name,
      accusedName: (submission.users as any)?.display_name ?? "Unknown",
    });
    const pushMessages = (members ?? [])
      .map((m: any) => m.users?.expo_push_token)
      .filter((t: string | null): t is string => !!t)
      .map((to: string) => ({ to, title: notif.title, body: notif.body }));
    await sendPush(pushMessages);

    return withCors({ audit }, { status: 201 });
  } catch (err) {
    return withCors({ error: (err as Error).message }, { status: 500 });
  }
});
