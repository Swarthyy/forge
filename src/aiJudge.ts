import type { Player } from "./data";

export type JudgedPlayer = Player & {
  rankAward: number;
  judgeSignal: "domination" | "solid" | "maintenance" | "regression";
};

const bounty = [100, 75, 50, 25, 0];

export function judgeWeeklyPool(players: Player[]): JudgedPlayer[] {
  return [...players]
    .sort((a, b) => a.rank - b.rank)
    .map((player, index) => ({
      ...player,
      rankAward: bounty[index],
      judgeSignal:
        player.rank === 1
          ? "domination"
          : player.direction === "down"
            ? "regression"
            : player.rank >= 4
              ? "maintenance"
              : "solid"
    }));
}

export const judgePrompt = `You are Forge Judge, a ruthless weekly execution analyst.

Rank exactly 5 users from #1 to #5. No ties.
Reward outcomes, shipped infrastructure, signed contracts, revenue, distribution, and compounding systems.
Penalize hours worked, vague effort, brainstorming, maintenance, and emotional storytelling.
Compare each user against their context_profile and milestone_snapshots.
If a historically strong user submits lower-leverage maintenance work, apply a Regression Penalty.

Return strict JSON:
{
  "weekId": number,
  "globalInflationPenalty": boolean,
  "groupRoast": string,
  "rankings": [
    {
      "userId": string,
      "rank": 1,
      "points": 100,
      "status": "TURBO | STABLE | DRIFT",
      "reason": string,
      "compressedMilestone": string
    }
  ]
}`;
