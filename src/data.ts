export type RankDirection = "up" | "flat" | "down";
export type PerformanceSignal = "elite" | "strong" | "slump" | "fraud-risk";
export type BusinessLane =
  | "skool-members"
  | "agency-retainers"
  | "music-distribution"
  | "software-launches";

export type Player = {
  id: string;
  name: string;
  role: string;
  lane: BusinessLane;
  evaluationRule: string;
  rank: number;
  points: number;
  lifetimeBalance: number;
  badge?: "TURBO" | "DRIFT" | "AUDIT";
  direction: RankDirection;
  signal: PerformanceSignal;
  currentSubmission: string;
  proofRequired: string;
  history: string[];
  roast: string;
};

export type ForgeState = {
  weekId: number;
  weeklyPot: number;
  vultureVaultBalance: number;
  groupPerformance: "nuclear" | "acceptable" | "slump";
  vultureTaxRate: number;
  bsAuditWindowHours: number;
  authenticatedUserId: string;
};

export const forgeState: ForgeState = {
  weekId: 3,
  weeklyPot: 650,
  vultureVaultBalance: 420,
  groupPerformance: "slump",
  vultureTaxRate: 0.3,
  bsAuditWindowHours: 2,
  authenticatedUserId: "noah"
};

export const weeklyPot = forgeState.weeklyPot;

export const players: Player[] = [
  {
    id: "james",
    name: "James",
    role: "Media / Music Operator",
    lane: "music-distribution",
    evaluationRule:
      "Judge on media distribution metrics, streaming velocity, pre-sales, brand deal value, and audience growth that compounds.",
    rank: 1,
    points: 175,
    lifetimeBalance: 2100,
    badge: "TURBO",
    direction: "up",
    signal: "elite",
    currentSubmission:
      "Closed pre-sale campaign partner, lifted streaming velocity 38%, and injected $150 into Week 3 pool.",
    proofRequired: "Dashboard screenshot: streaming lift, pre-sale revenue, or signed partner confirmation.",
    history: [
      "Wk 1: Launched paid funnel; Rank 2",
      "Wk 2: Closed sponsorship package; Rank 1"
    ],
    roast:
      "James turned attention into measurable leverage. Distribution moved, money risked, weak weeks punished."
  },
  {
    id: "angus",
    name: "Angus",
    role: "Agency Video Director",
    lane: "agency-retainers",
    evaluationRule:
      "Judge on recurring retainer value, signed production contracts, expansion revenue, and client acquisition.",
    rank: 2,
    points: 150,
    lifetimeBalance: 850,
    direction: "flat",
    signal: "strong",
    currentSubmission:
      "Matched James' raise and closed a $3k/mo retainer upsell after pivoting from editing work.",
    proofRequired: "Signed retainer, Stripe invoice, or client confirmation screenshot.",
    history: [
      "Wk 1: Delivered campaign assets; Rank 3",
      "Wk 2: Booked 3 sales calls; Rank 2"
    ],
    roast:
      "A real revenue counterpunch. Strong enough to scare the room, not sharp enough to steal the crown."
  },
  {
    id: "jett",
    name: "Jett",
    role: "Skool Community Operator",
    lane: "skool-members",
    evaluationRule:
      "Judge strictly on net-new $30/mo paying Skool members, churn reduction, conversion assets, and community revenue.",
    rank: 3,
    points: 100,
    lifetimeBalance: 400,
    direction: "up",
    signal: "strong",
    currentSubmission:
      "Added 18 net-new $30/mo Skool members and launched referral DM script for member-led acquisition.",
    proofRequired: "Skool paid member count, payout dashboard, or Stripe subscription evidence.",
    history: [
      "Wk 1: Reposted archive content; Rank 5",
      "Wk 2: Secured brand meeting; Rank 4"
    ],
    roast:
      "Finally pointed the machine at recurring money. Net-new paid members beat vanity content every day."
  },
  {
    id: "ollie",
    name: "Ollie",
    role: "Software Builder",
    lane: "software-launches",
    evaluationRule:
      "Judge on deployed software, active users, production usage, shipped integrations, and launch milestones. Ignore hours coded.",
    rank: 4,
    points: 75,
    lifetimeBalance: 50,
    direction: "flat",
    signal: "slump",
    currentSubmission:
      "Pushed beta landing page and onboarded two testers, but no public launch or payment path shipped.",
    proofRequired: "Production URL, user analytics, deployment log, or customer usage proof.",
    history: [
      "Wk 1: Built private prototype; Rank 4",
      "Wk 2: Added auth flow; Rank 3"
    ],
    roast:
      "Useful, but still hiding in builder cave fog. Testers are not traction unless they touch a live product."
  },
  {
    id: "noah",
    name: "Noah",
    role: "Software Developer",
    lane: "software-launches",
    evaluationRule:
      "Judge on deployment milestones, shipped product surfaces, production users, and revenue-adjacent software outcomes. Penalize hours logged coding.",
    rank: 5,
    points: 25,
    lifetimeBalance: 0,
    badge: "DRIFT",
    direction: "down",
    signal: "slump",
    currentSubmission:
      "55+ hours coding, fixed 14 bugs, joined 4 discovery calls, redlined energy levels for the brand.",
    proofRequired: "Production deployment URL or user-facing shipped feature evidence.",
    history: [
      "Wk 1: Acquired first client; Rank 1",
      "Wk 2: Shipped prototype; Rank 3"
    ],
    roast:
      "Noah submitted a timesheet with cologne on it. Hours are not outcomes. This is regression dressed as grind."
  }
];

export const notifications = [
  {
    title: "Sunday Activation",
    time: "Sun 6:00 PM",
    body:
      "The Forge is open. 6 hours remain to state your milestone. No liability weeks."
  },
  {
    title: "Callout",
    time: "Sun 10:30 PM",
    body:
      "James and Angus have submitted nuclear achievements. Noah has yet to produce shipped proof."
  },
  {
    title: "Verdict",
    time: "Mon 8:00 AM",
    body:
      "Week 3 cleared. James dominates the arena. Vulture Protocol is active due to group slump."
  },
  {
    title: "Speculation Trigger",
    time: "Thu 2:00 PM",
    body:
      "James doubled down an additional $150. Match exposure or concede the pot."
  },
  {
    title: "Audit Window",
    time: "Mon 8:15 AM",
    body:
      "BS Button is live for 2 hours. Majority vote forces screenshot or asset verification."
  }
];
