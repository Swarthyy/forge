// Casts a vote on an open BS Button dispute. Eligible voters are every group
// member except the accused (this includes the accuser, whose original
// trigger-audit call does not itself count as a vote). If a majority of
// eligible voters vote to uphold, the accused drops one rank — swapping with
// whoever was one rank below — and both rows' points are recalculated from
// the same fixed [100,75,50,25,0] array. Expired audits with no majority are
// lazily dismissed the next time they're touched.
import { withCors, corsHeaders } from "../_shared/cors.ts";
import { adminClient, userClient } from "../_shared/admin-client.ts";
import { POINTS_BY_RANK } from "../_shared/grading.ts";
import { sendPush } from "../_shared/push.ts";
import { auditResolvedTemplate } from "../_shared/notifications.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return withCors({ error: "method not allowed" }, { status: 405 });

  try {
    const { audit_id, vote } = (await req.json()) as { audit_id?: string; vote?: boolean };
    if (!audit_id || typeof vote !== "boolean") {
      return withCors({ error: "audit_id and a boolean vote are required" }, { status: 400 });
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
      .select("id")
      .eq("auth_id", authUser.id)
      .single();
    if (userErr || !appUser) return withCors({ error: "user not found" }, { status: 404 });

    const { data: audit, error: auditErr } = await admin
      .from("audits")
      .select("id, weekly_submission_id, status, resolves_at")
      .eq("id", audit_id)
      .single();
    if (auditErr || !audit) return withCors({ error: "audit not found" }, { status: 404 });

    if (audit.status !== "open") {
      return withCors({ audit });
    }
    if (new Date(audit.resolves_at).getTime() <= Date.now()) {
      const { data: dismissed } = await admin
        .from("audits")
        .update({ status: "dismissed" })
        .eq("id", audit_id)
        .select()
        .single();
      return withCors({ audit: dismissed });
    }

    const { data: submission, error: subErr } = await admin
      .from("weekly_submissions")
      .select("id, user_id, group_id, week_number, rank, points, users:user_id(display_name)")
      .eq("id", audit.weekly_submission_id)
      .single();
    if (subErr || !submission) return withCors({ error: "submission not found" }, { status: 404 });
    if (submission.user_id === appUser.id) {
      return withCors({ error: "the accused can't vote on their own audit" }, { status: 400 });
    }

    await admin.from("audit_votes").upsert({ audit_id, voter_user_id: appUser.id, vote });

    const { data: members } = await admin
      .from("group_members")
      .select("user_id, users:user_id(expo_push_token)")
      .eq("group_id", submission.group_id);
    const eligibleVoterIds = (members ?? []).map((m) => m.user_id).filter((id) => id !== submission.user_id);
    const majorityThreshold = Math.floor(eligibleVoterIds.length / 2) + 1;

    const { data: votes } = await admin.from("audit_votes").select("voter_user_id, vote").eq("audit_id", audit_id);
    const upvotes = (votes ?? []).filter((v) => v.vote && eligibleVoterIds.includes(v.voter_user_id)).length;

    if (upvotes < majorityThreshold) {
      return withCors({ audit, upheld: false, votes_so_far: upvotes, needed: majorityThreshold });
    }

    // Majority reached — swap the accused down one rank with whoever was
    // immediately below them, recomputing both rows' points from the fixed array.
    const { data: below } = await admin
      .from("weekly_submissions")
      .select("id, user_id, rank")
      .eq("group_id", submission.group_id)
      .eq("week_number", submission.week_number)
      .eq("rank", (submission.rank ?? 0) + 1)
      .maybeSingle();

    if (below) {
      await admin
        .from("weekly_submissions")
        .update({ rank: submission.rank, points: POINTS_BY_RANK[(submission.rank ?? 1) - 1] })
        .eq("id", below.id);
      await admin
        .from("weekly_submissions")
        .update({ rank: below.rank, points: POINTS_BY_RANK[(below.rank ?? 1) - 1] })
        .eq("id", submission.id);
    }

    const { data: upheldAudit } = await admin
      .from("audits")
      .update({ status: "upheld" })
      .eq("id", audit_id)
      .select()
      .single();

    const notif = auditResolvedTemplate({
      accusedName: (submission.users as any)?.display_name ?? "Unknown",
      upheld: true,
    });
    const pushMessages = (members ?? [])
      .map((m: any) => m.users?.expo_push_token)
      .filter((t: string | null): t is string => !!t)
      .map((to: string) => ({ to, title: notif.title, body: notif.body }));
    await sendPush(pushMessages);

    return withCors({ audit: upheldAudit, upheld: true });
  } catch (err) {
    return withCors({ error: (err as Error).message }, { status: 500 });
  }
});
