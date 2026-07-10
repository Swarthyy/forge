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
