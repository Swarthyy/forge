import { supabase, FUNCTIONS_URL } from "./supabase";

async function callFunction<T>(name: string, body: unknown): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `${name} failed`);
  return json as T;
}

export function submitEntry(groupId: string, rawText: string) {
  return callFunction<{ submission: unknown }>("submit-entry", { group_id: groupId, raw_text: rawText });
}

export function anteStake(groupId: string, amountCents: number) {
  return callFunction<{ stake: unknown; pot_cents: number }>("stakes-ante", {
    group_id: groupId,
    amount_cents: amountCents,
  });
}

export function submitTiebreaker(groupId: string, tiebreakerText?: string) {
  return callFunction<{ resolved?: boolean; waiting?: boolean; winner_id?: string }>("resolve-deadlock", {
    group_id: groupId,
    tiebreaker_text: tiebreakerText,
  });
}

export function triggerAudit(weeklySubmissionId: string, evidenceUrl: string) {
  return callFunction<{ audit: unknown }>("trigger-audit", {
    weekly_submission_id: weeklySubmissionId,
    evidence_url: evidenceUrl,
  });
}

export function castAuditVote(auditId: string, vote: boolean) {
  return callFunction<{ audit: unknown; upheld?: boolean }>("audit-vote", { audit_id: auditId, vote });
}
