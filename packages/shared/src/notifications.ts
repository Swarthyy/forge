export type NotificationBeat =
  | "activation"
  | "callout"
  | "verdict"
  | "speculation"
  | "deadlock"
  | "auditOpened"
  | "auditResolved";

export interface NotificationTemplateVars {
  activation: {};
  callout: { leaders: string; laggard: string; minutesRemaining: number };
  verdict: { weekNumber: number; winnerName: string; potDollars: number; regressedName: string | null };
  speculation: { raiserName: string; raiseDollars: number; totalStakeDollars: number };
  deadlock: { finalistNames: [string, string] };
  auditOpened: { accuserName: string; accusedName: string };
  auditResolved: { accusedName: string; upheld: boolean };
}

export const NOTIFICATION_TEMPLATES: {
  [K in NotificationBeat]: (vars: NotificationTemplateVars[K]) => { title: string; body: string };
} = {
  activation: () => ({
    title: "The Forge is open",
    body: "6 hours remain to state your milestone. Don't be the liability that hits the group with a Global Inflation Penalty.",
  }),
  callout: ({ leaders, laggard, minutesRemaining }) => ({
    title: "The Callout",
    body: `${leaders} have submitted verifiable achievements. ${laggard} hasn't typed a word. ${minutesRemaining} minutes until a structural zero-point lockout.`,
  }),
  verdict: ({ weekNumber, winnerName, potDollars, regressedName }) => ({
    title: "The Verdict",
    body: `Week ${weekNumber} has cleared. ${winnerName} dominates the arena, securing the $${potDollars.toFixed(2)} pot.${
      regressedName ? ` ${regressedName} has been hit with a severe Regression Penalty.` : ""
    } Open to analyze the damage.`,
  }),
  speculation: ({ raiserName, raiseDollars, totalStakeDollars }) => ({
    title: "Stakes Raised",
    body: `${raiserName} just doubled down an additional $${raiseDollars.toFixed(0)}. Current Stakes: $${totalStakeDollars.toFixed(
      0
    )}. Tap to match or concede the pot.`,
  }),
  deadlock: ({ finalistNames }) => ({
    title: "Deadlock",
    body: `${finalistNames[0]} and ${finalistNames[1]} are too close to call. 60 seconds to submit one more piece of evidence before the judge decides.`,
  }),
  auditOpened: ({ accuserName, accusedName }) => ({
    title: "BS Called",
    body: `${accuserName} is disputing ${accusedName}'s ranking. You have 1 hour to vote.`,
  }),
  auditResolved: ({ accusedName, upheld }) => ({
    title: "Audit Resolved",
    body: upheld
      ? `The group upheld the dispute. ${accusedName} drops a rank.`
      : `The group dismissed the dispute against ${accusedName}. Ranking stands.`,
  }),
};
