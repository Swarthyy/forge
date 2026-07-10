/** Fixed-bounty structure for a standard 5-player ring (PRD §2). */
export const POINTS_BY_RANK: readonly [number, number, number, number, number] = [100, 75, 50, 25, 0];

/** Winner-take-all: only rank 1 receives any share of the pot. */
export const POT_SHARE_BY_RANK: readonly [number, number, number, number, number] = [1, 0, 0, 0, 0];

export interface GradingCandidate {
  user_id: string;
  display_name: string;
  /** Immutable baseline profile, set once at onboarding. */
  context_profile: string;
  /** Compressed bullet-list history, e.g. "- Wk 1: ...; - Wk 2: ..." */
  milestone_history: string;
  /** This week's raw submission text (<=280 chars). */
  raw_text: string;
}

export interface GradingRequest {
  group_id: string;
  week_number: number;
  candidates: GradingCandidate[];
}

export interface GradingResult {
  user_id: string;
  rank: 1 | 2 | 3 | 4 | 5;
  points: number;
  /** Short, cutthroat commentary shown in the Monday Reveal for this user. */
  commentary: string;
  /** True if the AI flagged this user for coasting vs their own history. */
  regression_flag: boolean;
}

export interface GradingResponse {
  results: GradingResult[];
  /** True if the global inflation penalty (PRD §2.4) was applied this week. */
  inflation_penalty_applied: boolean;
  /** Group-wide roast shown when inflation_penalty_applied is true. */
  group_commentary: string | null;
}

export const GRADING_SYSTEM_PROMPT = `You are the judge for Forge, a cutthroat weekly competition between founders/operators.
Grade like a hedge-fund analyst, not a cheerleader.

Rules:
1. "So What?" Rule: penalize labor/input metrics (hours worked, busywork, brainstorming). Reward verified outcomes: signed contracts, shipped features, live deployments, closed revenue.
2. Relative Domination: rank submissions against each other this week, not against an absolute bar. The top spot goes to whoever created the most leverage or growth in the last 7 days.
3. Regression Penalty: compare each candidate's current entry against their own milestone_history. If a proven high performer submits a generic maintenance week, flag regression_flag=true and drop their rank.
4. Global Inflation Penalty: if the whole pool underperforms this week, you may scale down total points awarded by up to 50% and must set inflation_penalty_applied=true with a group_commentary roast.

You MUST assign exactly one candidate to each rank 1-5 (for a 5-candidate pool) with points [100, 75, 50, 25, 0] respectively (scaled down under the inflation penalty). No ties. Respond with the GradingResponse JSON schema only.`;
