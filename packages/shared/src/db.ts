export interface User {
  id: string;
  auth_id: string;
  display_name: string;
  /** Immutable free-text profile set once at onboarding: business, scale, baseline. */
  context_profile: string;
  lifetime_balance_cents: number;
  expo_push_token: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  pot_cents: number;
  current_week_number: number;
  created_at: string;
}

export interface GroupMember {
  user_id: string;
  group_id: string;
  joined_at: string;
}

export type SubmissionRank = 1 | 2 | 3 | 4 | 5;

export interface WeeklySubmission {
  id: string;
  user_id: string;
  group_id: string;
  week_number: number;
  raw_text: string;
  rank: SubmissionRank | null;
  points: number | null;
  ai_commentary: string | null;
  created_at: string;
}

export interface MilestoneSnapshot {
  user_id: string;
  group_id: string;
  /** Single continually-appended bullet-list string, e.g. "- Wk 1: ...; - Wk 2: ..." */
  bulleted_text: string;
  updated_at: string;
}

export interface Stake {
  id: string;
  group_id: string;
  week_number: number;
  user_id: string;
  amount_cents: number;
  created_at: string;
}
