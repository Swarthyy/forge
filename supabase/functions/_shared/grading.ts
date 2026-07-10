// Deno-runtime copy of packages/shared/src/grading.ts.
// Supabase Edge Functions run on Deno and don't resolve npm workspace packages,
// so the grading contract is mirrored here. Keep the two files in sync.

export const POINTS_BY_RANK: readonly [number, number, number, number, number] = [100, 75, 50, 25, 0];

export interface GradingCandidate {
  user_id: string;
  display_name: string;
  context_profile: string;
  milestone_history: string;
  raw_text: string;
}

export interface GradingResult {
  user_id: string;
  rank: 1 | 2 | 3 | 4 | 5;
  points: number;
  commentary: string;
  regression_flag: boolean;
}

export interface GradingResponse {
  results: GradingResult[];
  inflation_penalty_applied: boolean;
  group_commentary: string | null;
  deadlock: boolean;
  deadlock_candidates: [string, string] | null;
}

export const GRADING_SYSTEM_PROMPT = `You are the judge for Forge, a cutthroat weekly competition between founders/operators.
Grade like a hedge-fund analyst, not a cheerleader.

Rules:
1. "So What?" Rule: penalize labor/input metrics (hours worked, busywork, brainstorming). Reward verified outcomes: signed contracts, shipped features, live deployments, closed revenue.
2. Relative Domination: rank submissions against each other this week, not against an absolute bar. The top spot goes to whoever created the most leverage or growth in the last 7 days.
3. Regression Penalty: compare each candidate's current entry against their own milestone_history. If a proven high performer submits a generic maintenance week, flag regression_flag=true and drop their rank.
4. Global Inflation Penalty: if the whole pool underperforms this week, you may scale down total points awarded by up to 50% and must set inflation_penalty_applied=true with a group_commentary roast.
5. Deadlock: if whoever you'd rank #1 and #2 are too close on merit to meaningfully separate (comparable leverage, comparable verified outcomes), set deadlock=true and deadlock_candidates=[user_id, user_id] for those two instead of confidently picking between them. Only use this when genuinely torn — it should be rare, not a way to avoid a hard call.

You MUST assign exactly one candidate to each rank 1-5 (for a 5-candidate pool) with points [100, 75, 50, 25, 0] respectively (scaled down under the inflation penalty). No ties, except the deadlock case above. Respond with the GradingResponse JSON schema only.`;

export function buildUserPrompt(candidates: GradingCandidate[]): string {
  // <1KB compressed payload: baseline profile + bullet history + this week's raw entry, per candidate.
  const compact = candidates.map((c) => ({
    id: c.user_id,
    name: c.display_name,
    profile: c.context_profile,
    history: c.milestone_history,
    entry: c.raw_text,
  }));
  return JSON.stringify({ candidates: compact });
}

/** Canned deterministic fixture used when OPENAI_API_KEY is unset, so the loop is testable for free. */
export function mockGrade(candidates: GradingCandidate[]): GradingResponse {
  const scored = candidates.map((c) => ({
    user_id: c.user_id,
    score: c.raw_text.length + (/\$|closed|signed|launched|shipped/i.test(c.raw_text) ? 100 : 0),
  }));
  scored.sort((a, b) => b.score - a.score);

  const results: GradingResult[] = scored.map((s, i) => ({
    user_id: s.user_id,
    rank: (i + 1) as 1 | 2 | 3 | 4 | 5,
    points: POINTS_BY_RANK[i] ?? 0,
    commentary: i === 0 ? "Mock grader: strongest verified outcome this week." : "Mock grader: outranked this week.",
    regression_flag: false,
  }));

  return {
    results,
    inflation_penalty_applied: false,
    group_commentary: null,
    deadlock: false,
    deadlock_candidates: null,
  };
}
