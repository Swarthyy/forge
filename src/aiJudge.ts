import type { ForgeState, Player } from "./data";

export type JudgedPlayer = Player & {
  rankAward: number;
  judgeSignal: "domination" | "solid" | "maintenance" | "regression";
};

export type VultureResult = {
  active: boolean;
  tax: number;
  winnerPayout: number;
  vaultAfterCapture: number;
  notification: string;
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

export function calculateVultureProtocol(state: ForgeState): VultureResult {
  if (state.groupPerformance !== "slump") {
    return {
      active: false,
      tax: 0,
      winnerPayout: state.weeklyPot,
      vaultAfterCapture: state.vultureVaultBalance,
      notification: "Vulture Protocol dormant. Winner takes full pot."
    };
  }

  const tax = Math.round(state.weeklyPot * state.vultureTaxRate);

  return {
    active: true,
    tax,
    winnerPayout: state.weeklyPot - tax,
    vaultAfterCapture: state.vultureVaultBalance + tax,
    notification: "Vulture Protocol Activated: Money Seized."
  };
}

export const judgeEndpointContract = {
  method: "POST",
  path: "/api/judge-week",
  runtime: "server-only",
  payload:
    "Baseline profile + milestone snapshots + current 280-char submission + proof metadata",
  response:
    "Strict JSON rankings, points, proof flags, Vulture state, compressed milestone snapshots"
};

export const judgePrompt = `You are Forge Judge, a ruthless weekly execution analyst.

You are judging a private 5-person ring: Jett, Angus, James, Ollie, Noah.
Rank exactly 5 users from #1 to #5. No ties. No shared victories.

Hardcoded business lanes:
- Jett: judge strictly on net-new $30/mo paying Skool members, community revenue, churn reduction, and conversion assets.
- Angus: judge on recurring agency retainer values, production contracts closed, upsells, and client acquisition.
- James: judge on media distribution metrics, streaming velocity, pre-sales, brand deals, and audience growth that compounds.
- Ollie: judge on software launch deployment milestones, production usage, active users, and shipped integrations. Ignore hours logged coding.
- Noah: judge on software launch deployment milestones, production usage, active users, and shipped integrations. Ignore hours logged coding.

Rules:
1. Outcomes beat inputs. Penalize hours worked, vague effort, brainstorming, maintenance, and emotional storytelling.
2. Compare the current pool relatively. Crown the highest leverage week.
3. Compare every entry against milestone_snapshots. Apply Regression Penalty when a strong performer coasts.
4. Flag fraud-risk when the claim is high-impact but proof metadata is weak.
5. If the whole room underperforms, activate Vulture Protocol and seize 30% to 50% of the pot into the championship vault.

Return strict JSON:
{
  "weekId": number,
  "globalInflationPenalty": boolean,
  "vultureProtocol": {
    "active": boolean,
    "taxRate": number,
    "amountSeized": number,
    "winnerPayout": number,
    "vaultBalanceAfter": number
  },
  "bsAuditWindowHours": 2,
  "groupRoast": string,
  "rankings": [
    {
      "userId": string,
      "rank": 1,
      "points": 100,
      "status": "TURBO | STABLE | DRIFT | AUDIT",
      "proofRequired": string,
      "reason": string,
      "compressedMilestone": string
    }
  ]
}`;
