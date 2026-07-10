// Core weekly grading loop (PRD §1/§2). Triggered by cron Monday 8:00 AM.
// For each group: assemble compressed context, grade via OpenAI (or mock),
// write rank/points, append milestone snapshot bullet, transfer pot to the winner.
import { withCors, corsHeaders } from "../_shared/cors.ts";
import { adminClient } from "../_shared/admin-client.ts";
import { POINTS_BY_RANK, GradingCandidate } from "../_shared/grading.ts";
import { gradeCandidates } from "./openai.ts";
import { sendPush } from "../_shared/push.ts";
import { verdictTemplate } from "../_shared/notifications.ts";

async function gradeGroup(admin: ReturnType<typeof adminClient>, groupId: string) {
  const { data: group, error: groupErr } = await admin
    .from("groups")
    .select("id, name, pot_cents, current_week_number")
    .eq("id", groupId)
    .single();
  if (groupErr || !group) throw new Error(`group ${groupId} not found`);

  const weekNumber = group.current_week_number;

  const { data: submissions, error: subErr } = await admin
    .from("weekly_submissions")
    .select("id, user_id, raw_text")
    .eq("group_id", groupId)
    .eq("week_number", weekNumber);
  if (subErr) throw new Error(subErr.message);
  if (!submissions || submissions.length === 0) {
    return { group_id: groupId, skipped: "no submissions this week" };
  }

  const userIds = submissions.map((s) => s.user_id);

  const { data: users, error: usersErr } = await admin
    .from("users")
    .select("id, display_name, context_profile, expo_push_token")
    .in("id", userIds);
  if (usersErr) throw new Error(usersErr.message);

  const { data: snapshots, error: snapErr } = await admin
    .from("milestone_snapshots")
    .select("user_id, bulleted_text")
    .eq("group_id", groupId)
    .in("user_id", userIds);
  if (snapErr) throw new Error(snapErr.message);

  const usersById = new Map((users ?? []).map((u) => [u.id, u]));
  const snapshotsById = new Map((snapshots ?? []).map((s) => [s.user_id, s.bulleted_text]));

  const candidates: GradingCandidate[] = submissions.map((s) => {
    const u = usersById.get(s.user_id);
    return {
      user_id: s.user_id,
      display_name: u?.display_name ?? "Unknown",
      context_profile: u?.context_profile ?? "",
      milestone_history: snapshotsById.get(s.user_id) ?? "",
      raw_text: s.raw_text,
    };
  });

  const graded = await gradeCandidates(candidates);

  // Persist rank/points/commentary per submission.
  for (const result of graded.results) {
    const submission = submissions.find((s) => s.user_id === result.user_id);
    if (!submission) continue;
    const points = graded.inflation_penalty_applied
      ? Math.round(result.points * 0.5)
      : result.points ?? POINTS_BY_RANK[result.rank - 1];

    await admin
      .from("weekly_submissions")
      .update({ rank: result.rank, points, ai_commentary: result.commentary })
      .eq("id", submission.id);

    // Append distilled bullet to the running milestone snapshot string.
    const priorText = snapshotsById.get(result.user_id) ?? "";
    const displayName = usersById.get(result.user_id)?.display_name ?? "";
    const bullet = `- Wk ${weekNumber}: ${result.commentary} (Rank ${result.rank})`;
    const newText = priorText ? `${priorText}; ${bullet}` : bullet;

    await admin
      .from("milestone_snapshots")
      .upsert({ user_id: result.user_id, group_id: groupId, bulleted_text: newText, updated_at: new Date().toISOString() });
  }

  // Winner-take-all pot transfer.
  const winner = graded.results.find((r) => r.rank === 1);
  if (winner) {
    const { data: winnerUser } = await admin
      .from("users")
      .select("id, display_name, lifetime_balance_cents, expo_push_token")
      .eq("id", winner.user_id)
      .single();

    if (winnerUser) {
      await admin
        .from("users")
        .update({ lifetime_balance_cents: winnerUser.lifetime_balance_cents + group.pot_cents })
        .eq("id", winnerUser.id);
    }

    const regressed = graded.results.find((r) => r.regression_flag);
    const notif = verdictTemplate({
      weekNumber,
      winnerName: winnerUser?.display_name ?? "Unknown",
      potDollars: group.pot_cents / 100,
      regressedName: regressed ? usersById.get(regressed.user_id)?.display_name ?? null : null,
    });

    const pushMessages = (users ?? [])
      .filter((u) => !!u.expo_push_token)
      .map((u) => ({ to: u.expo_push_token as string, title: notif.title, body: notif.body }));
    await sendPush(pushMessages);
  }

  // Reset the pot and roll the group to next week.
  await admin
    .from("groups")
    .update({ pot_cents: 0, current_week_number: weekNumber + 1 })
    .eq("id", groupId);

  return { group_id: groupId, week_number: weekNumber, results: graded.results };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = adminClient();
    let groupIds: string[];

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      groupIds = body.group_id ? [body.group_id] : [];
    } else {
      groupIds = [];
    }

    if (groupIds.length === 0) {
      const { data: groups, error } = await admin.from("groups").select("id");
      if (error) throw error;
      groupIds = (groups ?? []).map((g) => g.id);
    }

    const results = [];
    for (const groupId of groupIds) {
      results.push(await gradeGroup(admin, groupId));
    }

    return withCors({ results });
  } catch (err) {
    return withCors({ error: (err as Error).message }, { status: 500 });
  }
});
