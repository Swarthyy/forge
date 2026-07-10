// Deno-runtime copy of packages/shared/src/notifications.ts. Keep in sync.

export function verdictTemplate(vars: {
  weekNumber: number;
  winnerName: string;
  potDollars: number;
  regressedName: string | null;
}): { title: string; body: string } {
  return {
    title: "The Verdict",
    body: `Week ${vars.weekNumber} has cleared. ${vars.winnerName} dominates the arena, securing the $${vars.potDollars.toFixed(
      2
    )} pot.${vars.regressedName ? ` ${vars.regressedName} has been hit with a severe Regression Penalty.` : ""} Open to analyze the damage.`,
  };
}

export function speculationTemplate(vars: {
  raiserName: string;
  raiseDollars: number;
  totalStakeDollars: number;
}): { title: string; body: string } {
  return {
    title: "Stakes Raised",
    body: `${vars.raiserName} just doubled down an additional $${vars.raiseDollars.toFixed(
      0
    )}. Current Stakes: $${vars.totalStakeDollars.toFixed(0)}. Tap to match or concede the pot.`,
  };
}

export function deadlockTemplate(vars: { finalistNames: [string, string] }): { title: string; body: string } {
  return {
    title: "Deadlock",
    body: `${vars.finalistNames[0]} and ${vars.finalistNames[1]} are too close to call. 60 seconds to submit one more piece of evidence before the judge decides.`,
  };
}

export function auditOpenedTemplate(vars: { accuserName: string; accusedName: string }): {
  title: string;
  body: string;
} {
  return {
    title: "BS Called",
    body: `${vars.accuserName} is disputing ${vars.accusedName}'s ranking. You have 1 hour to vote.`,
  };
}

export function auditResolvedTemplate(vars: { accusedName: string; upheld: boolean }): {
  title: string;
  body: string;
} {
  return {
    title: "Audit Resolved",
    body: vars.upheld
      ? `The group upheld the dispute. ${vars.accusedName} drops a rank.`
      : `The group dismissed the dispute against ${vars.accusedName}. Ranking stands.`,
  };
}
