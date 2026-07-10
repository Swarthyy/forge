// Resolves a deadlocked week (PRD v1.1 Deadlock). Called by the Deadlock screen
// either when a finalist submits their tiebreaker text, or when the 60s window
// expires client-side — whichever happens first. Both paths funnel through
// this same endpoint, which only actually settles once both finalists have
// submitted (or the deadline has passed), and no-ops otherwise.
import { withCors, corsHeaders } from "../_shared/cors.ts";
import { adminClient, userClient } from "../_shared/admin-client.ts";
import { POINTS_BY_RANK } from "../_shared/grading.ts";
import { gradeCandidates } from "../_shared/openai.ts";
import { sendPush } from "../_shared/push.ts";
import { verdictTemplate } from "../_shared/notifications.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return withCors({ error: "method not allowed" }, { status: 405 });

  try {
    const { group_id, tiebreaker_text } = (await req.json()) as {
      group_id?: string;
      tiebreaker_text?: string;
    };
    if (!group_id) return withCors({ error: "group_id is required" }, { status: 400 });

    const admin = adminClient();
    const { data: group, error: groupErr } = await admin
      .from("groups")
      .select(
        "id, pot_cents, current_week_number, week_status, deadlock_finalist_ids, deadlock_deadline, deadlock_inflation_penalty"
      )
      .eq("id", group_id)
      .single();
    if (groupErr || !group) return withCors({ error: "group not found" }, { status: 404 });
    if (group.week_status !== "deadlocked" || !group.deadlock_finalist_ids) {
      return withCors({ error: "group is not in a deadlock" }, { status: 400 });
    }

    const weekNumber = group.current_week_number;
    const finalistIds = group.deadlock_finalist_ids as string[];

    // Record the caller's tiebreaker text if they're one of the finalists.
    if (tiebreaker_text) {
      const authHeader = req.headers.get("Authorization");
      const supabase = userClient(authHeader);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data: appUser } = await admin.from("users").select("id").eq("auth_id", authUser.id).single();
        if (appUser && finalistIds.includes(appUser.id)) {
          await admin
            .from("weekly_submissions")
            .update({ tiebreaker_text })
            .eq("group_id", group_id)
            .eq("week_number", weekNumber)
            .eq("user_id", appUser.id);
        }
      }
    }

    const { data: finalistSubs } = await admin
      .from("weekly_submissions")
      .select("id, user_id, raw_text, tiebreaker_text")
      .eq("group_id", group_id)
      .eq("week_number", weekNumber)
      .in("user_id", finalistIds);

    const bothSubmitted = (finalistSubs ?? []).length === 2 && (finalistSubs ?? []).every((s) => !!s.tiebreaker_text);
    const deadlinePassed = group.deadlock_deadline ? new Date(group.deadlock_deadline).getTime() <= Date.now() : true;

    if (!bothSubmitted && !deadlinePassed) {
      return withCors({ waiting: true });
    }

    const { data: users } = await admin
      .from("users")
      .select("id, display_name, context_profile, expo_push_token, lifetime_balance_cents")
      .in("id", finalistIds);
    const { data: snapshots } = await admin
      .from("milestone_snapshots")
      .select("user_id, bulleted_text")
      .eq("group_id", group_id)
      .in("user_id", finalistIds);

    const usersById = new Map((users ?? []).map((u) => [u.id, u]));
    const snapshotsById = new Map((snapshots ?? []).map((s) => [s.user_id, s.bulleted_text]));

    const candidates = (finalistSubs ?? []).map((s) => {
      const u = usersById.get(s.user_id);
      const extra = s.tiebreaker_text ? ` [Tiebreaker context: ${s.tiebreaker_text}]` : "";
      return {
        user_id: s.user_id,
        display_name: u?.display_name ?? "Unknown",
        context_profile: u?.context_profile ?? "",
        milestone_history: snapshotsById.get(s.user_id) ?? "",
        raw_text: `${s.raw_text}${extra}`,
      };
    });

    // Re-grade just the two finalists — a 2-candidate pool, same fixed-rank contract.
    const graded = await gradeCandidates(candidates);
    const rankOne = graded.results.find((r) => r.rank === 1) ?? graded.results[0];
    const rankTwo = graded.results.find((r) => r.user_id !== rankOne.user_id) ?? graded.results[1];

    // Honor the same inflation-penalty scaling ranks #3-5 already got at the
    // original grading pass, so #1/#2 aren't settled under a different rule.
    const scale = group.deadlock_inflation_penalty ? 0.5 : 1;
    const settlements = [
      { user_id: rankOne.user_id, rank: 1 as const, points: Math.round(POINTS_BY_RANK[0] * scale), commentary: rankOne.commentary },
      { user_id: rankTwo.user_id, rank: 2 as const, points: Math.round(POINTS_BY_RANK[1] * scale), commentary: rankTwo.commentary },
    ];

    for (const s of settlements) {
      const submission = (finalistSubs ?? []).find((f) => f.user_id === s.user_id);
      if (!submission) continue;

      await admin
        .from("weekly_submissions")
        .update({ rank: s.rank, points: s.points, ai_commentary: s.commentary })
        .eq("id", submission.id);

      const priorText = snapshotsById.get(s.user_id) ?? "";
      const bullet = `- Wk ${weekNumber}: ${s.commentary} (Rank ${s.rank})`;
      const newText = priorText ? `${priorText}; ${bullet}` : bullet;

      await admin
        .from("milestone_snapshots")
        .upsert({ user_id: s.user_id, group_id, bulleted_text: newText, updated_at: new Date().toISOString() });
    }

    // Winner-take-all payout, applying the vault seizure decided at the
    // original grading pass (before settlement paused for the deadlock).
    const winnerId = settlements[0].user_id;
    let seizedCents = 0;
    let payoutCents = group.pot_cents;
    if (group.deadlock_inflation_penalty) {
      seizedCents = Math.round(group.pot_cents * 0.3);
      payoutCents = group.pot_cents - seizedCents;
      await admin
        .from("vulture_vault_events")
        .insert({ group_id, week_number: weekNumber, seized_cents: seizedCents });
    }

    const winnerUser = usersById.get(winnerId);
    if (winnerUser) {
      await admin
        .from("users")
        .update({ lifetime_balance_cents: winnerUser.lifetime_balance_cents + payoutCents })
        .eq("id", winnerUser.id);
    }

    const notif = verdictTemplate({
      weekNumber,
      winnerName: winnerUser?.display_name ?? "Unknown",
      potDollars: payoutCents / 100,
      regressedName: null,
    });
    const pushMessages = (users ?? [])
      .filter((u) => !!u.expo_push_token)
      .map((u) => ({ to: u.expo_push_token as string, title: notif.title, body: notif.body }));
    await sendPush(pushMessages);

    await admin
      .from("groups")
      .update({
        pot_cents: 0,
        vault_cents: seizedCents,
        week_status: "open",
        deadlock_finalist_ids: null,
        deadlock_deadline: null,
        deadlock_inflation_penalty: false,
        current_week_number: weekNumber + 1,
      })
      .eq("id", group_id);

    return withCors({ resolved: true, winner_id: winnerId });
  } catch (err) {
    return withCors({ error: (err as Error).message }, { status: 500 });
  }
});
