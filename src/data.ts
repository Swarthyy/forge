export type RankDirection = "up" | "flat" | "down";
export type PerformanceSignal = "elite" | "strong" | "slump" | "fraud-risk";
export type WeekStage = "active" | "submission" | "lockout" | "reveal";
export type WeeklyPhase = "aftermath" | "stakes" | "submission" | "reveal" | "audit";
export type NotificationCategory = "Stakes" | "Submissions" | "Roasts" | "System" | "BS Audits";
export type EventSeverity = "green" | "neutral" | "red" | "gold";
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
  contextBaseline: string;
  evaluationRule: string;
  currentWeekAnte: number;
  currentWeekRaise: number;
  submissionSecured: boolean;
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
  week_stage: WeekStage;
  phase: WeeklyPhase;
  phaseEndsAt: string;
  revealStartsAt: string;
  submissionOpensAt: string;
  raiseMatchEndsAt: string;
};

export type NotificationItem = {
  id: string;
  category: NotificationCategory;
  title: string;
  time: string;
  body: string;
  unread: boolean;
  severity: EventSeverity;
  playerId?: string;
};

export type ActivityEvent = {
  id: string;
  playerId?: string;
  actor: string;
  event: string;
  time: string;
  severity: EventSeverity;
};

export type PotTransaction = {
  id: string;
  playerId?: string;
  label: string;
  amount: number;
  status: "held" | "matched" | "pending" | "seized" | "projected";
  direction: "in" | "out";
  time: string;
};

export type SeasonStanding = {
  playerId: string;
  cumulativePoints: number;
  weeksWon: number;
  trend: RankDirection;
};

export type ArchiveEvidenceType = "revenue" | "contract" | "members" | "deployment" | "analytics";

export type ArchiveEntry = {
  playerId: string;
  rank: number;
  points: number;
  achievement: string;
  commentary: string;
  evidenceType: ArchiveEvidenceType;
  evidenceLabel: string;
  submittedAt: string;
};

export type WeekArchive = {
  weekId: number;
  label: string;
  pot: number;
  winnerId: string;
  winnerPayout: number;
  entries: ArchiveEntry[];
};

export type WalletTransaction = {
  id: string;
  label: string;
  detail: string;
  amount: number;
  direction: "credit" | "debit";
  status: "settled" | "held" | "released";
  time: string;
};

export const forgeState: ForgeState = {
  weekId: 3,
  weeklyPot: 650,
  vultureVaultBalance: 420,
  groupPerformance: "slump",
  vultureTaxRate: 0.3,
  bsAuditWindowHours: 2,
  authenticatedUserId: "noah",
  week_stage: "active",
  phase: "stakes",
  phaseEndsAt: "Thu 11:59 PM",
  revealStartsAt: "Mon 8:00 AM",
  submissionOpensAt: "Sun 6:00 PM",
  raiseMatchEndsAt: "Thu 4:00 PM"
};

export const weeklyPot = forgeState.weeklyPot;

export const players: Player[] = [
  {
    id: "james",
    name: "James",
    role: "Media / Music Operator",
    lane: "music-distribution",
    contextBaseline: "Media distribution / music operator",
    evaluationRule:
      "Judge on media distribution metrics, streaming velocity, pre-sales, brand deal value, and audience growth that compounds.",
    currentWeekAnte: 50,
    currentWeekRaise: 150,
    submissionSecured: true,
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
      "Wk 2: Closed sponsorship package; Rank 1",
      "Wk 0: Built audience waitlist; Rank 3"
    ],
    roast:
      "James turned attention into measurable leverage. Distribution moved, money risked, weak weeks punished."
  },
  {
    id: "angus",
    name: "Angus",
    role: "Agency Video Director",
    lane: "agency-retainers",
    contextBaseline: "Recurring agency retainers",
    evaluationRule:
      "Judge on recurring retainer value, signed production contracts, expansion revenue, and client acquisition.",
    currentWeekAnte: 50,
    currentWeekRaise: 150,
    submissionSecured: true,
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
      "Wk 2: Booked 3 sales calls; Rank 2",
      "Wk 0: Cut first agency reel; Rank 4"
    ],
    roast:
      "A real revenue counterpunch. Strong enough to scare the room, not sharp enough to steal the crown."
  },
  {
    id: "jett",
    name: "Jett",
    role: "Skool Community Operator",
    lane: "skool-members",
    contextBaseline: "Net-new $30/mo Skool members",
    evaluationRule:
      "Judge strictly on net-new $30/mo paying Skool members, churn reduction, conversion assets, and community revenue.",
    currentWeekAnte: 50,
    currentWeekRaise: 0,
    submissionSecured: true,
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
      "Wk 2: Secured brand meeting; Rank 4",
      "Wk 0: Opened first community cohort; Rank 2"
    ],
    roast:
      "Finally pointed the machine at recurring money. Net-new paid members beat vanity content every day."
  },
  {
    id: "ollie",
    name: "Ollie",
    role: "Software Builder",
    lane: "software-launches",
    contextBaseline: "Software launch deployments",
    evaluationRule:
      "Judge on deployed software, active users, production usage, shipped integrations, and launch milestones. Ignore hours coded.",
    currentWeekAnte: 50,
    currentWeekRaise: 0,
    submissionSecured: false,
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
      "Wk 2: Added auth flow; Rank 3",
      "Wk 0: Shipped internal tool; Rank 5"
    ],
    roast:
      "Useful, but still hiding in builder cave fog. Testers are not traction unless they touch a live product."
  },
  {
    id: "noah",
    name: "Noah",
    role: "Software Developer",
    lane: "software-launches",
    contextBaseline: "Software launch deployments",
    evaluationRule:
      "Judge on deployment milestones, shipped product surfaces, production users, and revenue-adjacent software outcomes. Penalize hours logged coding.",
    currentWeekAnte: 50,
    currentWeekRaise: 0,
    submissionSecured: false,
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
      "Wk 2: Shipped prototype; Rank 3",
      "Wk 0: Scoped the product; Rank 4"
    ],
    roast:
      "Noah submitted a timesheet with cologne on it. Hours are not outcomes. This is regression dressed as grind."
  }
];

export const seasonStandings: SeasonStanding[] = [
  { playerId: "james", cumulativePoints: 325, weeksWon: 2, trend: "up" },
  { playerId: "angus", cumulativePoints: 250, weeksWon: 0, trend: "flat" },
  { playerId: "jett", cumulativePoints: 175, weeksWon: 0, trend: "up" },
  { playerId: "ollie", cumulativePoints: 150, weeksWon: 0, trend: "flat" },
  { playerId: "noah", cumulativePoints: 125, weeksWon: 1, trend: "down" }
];

export const archiveWeeks: WeekArchive[] = [
  {
    weekId: 2,
    label: "Week 2 · Sponsorship pressure",
    pot: 500,
    winnerId: "james",
    winnerPayout: 350,
    entries: [
      {
        playerId: "james",
        rank: 1,
        points: 100,
        achievement: "Closed a $4,000 sponsorship package and converted the campaign into a three-month distribution deal.",
        commentary: "James submitted a signed commercial outcome with a compounding distribution path. Clean win.",
        evidenceType: "contract",
        evidenceLabel: "Signed sponsorship agreement",
        submittedAt: "Sun 8:42 PM"
      },
      {
        playerId: "angus",
        rank: 2,
        points: 75,
        achievement: "Booked three qualified agency sales calls with a repeatable outbound sequence.",
        commentary: "Useful pipeline, but calls are still upstream of cash. Strong movement, incomplete conversion.",
        evidenceType: "analytics",
        evidenceLabel: "Outbound pipeline snapshot",
        submittedAt: "Sun 9:03 PM"
      },
      {
        playerId: "jett",
        rank: 4,
        points: 25,
        achievement: "Reposted archive content and drafted a new community welcome sequence.",
        commentary: "Activity dressed as leverage. No net-new paid members, no meaningful scoreboard impact.",
        evidenceType: "members",
        evidenceLabel: "Community member dashboard",
        submittedAt: "Sun 10:18 PM"
      },
      {
        playerId: "ollie",
        rank: 3,
        points: 50,
        achievement: "Added an authentication flow and onboarded two private beta testers.",
        commentary: "A real shipped surface, though still trapped behind a private beta wall.",
        evidenceType: "deployment",
        evidenceLabel: "Private beta deployment log",
        submittedAt: "Sun 7:29 PM"
      },
      {
        playerId: "noah",
        rank: 5,
        points: 0,
        achievement: "Spent the week refining the architecture and mapping future product flows.",
        commentary: "Noah brought a roadmap to a results fight. Vaporware with excellent formatting.",
        evidenceType: "deployment",
        evidenceLabel: "No production proof attached",
        submittedAt: "Sun 11:41 PM"
      }
    ]
  },
  {
    weekId: 1,
    label: "Week 1 · First blood",
    pot: 400,
    winnerId: "noah",
    winnerPayout: 280,
    entries: [
      {
        playerId: "noah",
        rank: 1,
        points: 100,
        achievement: "Signed the first paying client for the software product and collected the opening invoice.",
        commentary: "A cash outcome from a cold start. Noah established the baseline everyone else now has to beat.",
        evidenceType: "revenue",
        evidenceLabel: "Stripe payment receipt",
        submittedAt: "Sun 7:12 PM"
      },
      {
        playerId: "james",
        rank: 2,
        points: 75,
        achievement: "Launched the paid funnel and collected the first 240 qualified leads.",
        commentary: "Strong asset creation with measurable demand. The funnel compounds, but no sale cleared yet.",
        evidenceType: "analytics",
        evidenceLabel: "Funnel conversion dashboard",
        submittedAt: "Sun 8:06 PM"
      },
      {
        playerId: "angus",
        rank: 3,
        points: 50,
        achievement: "Delivered the campaign asset pack and received a signed client testimonial.",
        commentary: "Professional delivery, but maintenance work needs a revenue consequence to dominate.",
        evidenceType: "contract",
        evidenceLabel: "Client delivery confirmation",
        submittedAt: "Sun 9:22 PM"
      },
      {
        playerId: "ollie",
        rank: 4,
        points: 25,
        achievement: "Built a private product prototype with a working onboarding flow.",
        commentary: "A functioning prototype beats a blank canvas, but there is no user or cash signal yet.",
        evidenceType: "deployment",
        evidenceLabel: "Prototype preview capture",
        submittedAt: "Sun 10:02 PM"
      },
      {
        playerId: "jett",
        rank: 5,
        points: 0,
        achievement: "Reposted content and planned a new member challenge for next week.",
        commentary: "Planning is not membership growth. The Forge records outcomes, not intentions.",
        evidenceType: "members",
        evidenceLabel: "No paid member delta attached",
        submittedAt: "Sun 11:53 PM"
      }
    ]
  }
];

export const walletTransactions: WalletTransaction[] = [
  { id: "wallet-week-2", label: "Week 2 winner payout", detail: "Stripe transfer · James champion ledger", amount: 350, direction: "credit", status: "settled", time: "Mon 8:04 AM" },
  { id: "wallet-week-3-ante", label: "Week 3 base ante", detail: "Card authorization held in weekly pot", amount: 50, direction: "debit", status: "held", time: "Mon 9:00 AM" },
  { id: "wallet-week-2-fee", label: "Stripe processing fee", detail: "2.9% + $0.30 estimated settlement fee", amount: 10.45, direction: "debit", status: "settled", time: "Mon 8:05 AM" },
  { id: "wallet-week-1-payout", label: "Week 1 payout", detail: "Champion payout after Vulture tax", amount: 280, direction: "credit", status: "settled", time: "Mon 8:03 AM" },
  { id: "wallet-vulture", label: "Vulture Vault contribution", detail: "30% slump-week seizure routed to vault", amount: 120, direction: "debit", status: "settled", time: "Mon 8:02 AM" },
  { id: "wallet-hold-release", label: "Unmatched raise released", detail: "James Week 3 raise hold returned", amount: 150, direction: "credit", status: "released", time: "Thu 4:00 PM" }
];

export const activityFeed: ActivityEvent[] = [
  {
    id: "evt-raise-james",
    playerId: "james",
    actor: "James",
    event: "raised the pot by $150 and triggered match pressure.",
    time: "2m ago",
    severity: "green"
  },
  {
    id: "evt-angus-match",
    playerId: "angus",
    actor: "Angus",
    event: "matched the raise after closing a retainer upsell.",
    time: "9m ago",
    severity: "green"
  },
  {
    id: "evt-vulture-risk",
    actor: "Forge System",
    event: "flagged group output as slump-risk. Vulture tax is armed.",
    time: "31m ago",
    severity: "red"
  },
  {
    id: "evt-noah-drift",
    playerId: "noah",
    actor: "Noah",
    event: "is still sitting in Rank #5 with DRIFT active.",
    time: "1h ago",
    severity: "red"
  },
  {
    id: "evt-jett-members",
    playerId: "jett",
    actor: "Jett",
    event: "logged 18 net-new $30/mo Skool members.",
    time: "3h ago",
    severity: "gold"
  }
];

export const potLedger: PotTransaction[] = [
  {
    id: "pot-base",
    label: "Base weekly buy-ins",
    amount: 500,
    status: "held",
    direction: "in",
    time: "Mon 9:00 AM"
  },
  {
    id: "pot-james",
    playerId: "james",
    label: "James nuke raise",
    amount: 150,
    status: "held",
    direction: "in",
    time: "Thu 2:00 PM"
  },
  {
    id: "pot-angus",
    playerId: "angus",
    label: "Angus matched raise",
    amount: 150,
    status: "matched",
    direction: "in",
    time: "Thu 2:11 PM"
  },
  {
    id: "pot-vulture",
    label: "Projected Vulture seizure",
    amount: 195,
    status: "seized",
    direction: "out",
    time: "Mon 8:00 AM"
  }
];

export const notifications: NotificationItem[] = [
  {
    id: "notif-james-raised",
    category: "Stakes",
    title: "Sunday Activation",
    time: "Sun 6:00 PM",
    body:
      "The Forge is open. 6 hours remain to state your milestone. No liability weeks.",
    unread: false,
    severity: "neutral"
  },
  {
    id: "notif-callout",
    category: "Submissions",
    title: "Callout",
    time: "Sun 10:30 PM",
    body:
      "James and Angus have submitted nuclear achievements. Noah has yet to produce shipped proof.",
    unread: true,
    severity: "red",
    playerId: "noah"
  },
  {
    id: "notif-verdict",
    category: "Roasts",
    title: "Verdict",
    time: "Mon 8:00 AM",
    body:
      "Week 3 cleared. James dominates the arena. Vulture Protocol is active due to group slump.",
    unread: true,
    severity: "gold",
    playerId: "james"
  },
  {
    id: "notif-raise",
    category: "Stakes",
    title: "Speculation Trigger",
    time: "Thu 2:00 PM",
    body:
      "James doubled down an additional $150. Match exposure or concede the pot.",
    unread: true,
    severity: "green",
    playerId: "james"
  },
  {
    id: "notif-audit",
    category: "BS Audits",
    title: "Audit Window",
    time: "Mon 8:15 AM",
    body:
      "BS Button is live for 2 hours. Majority vote forces screenshot or asset verification.",
    unread: true,
    severity: "red"
  },
  {
    id: "notif-angus-match",
    category: "Stakes",
    title: "Angus Matched",
    time: "Thu 2:11 PM",
    body: "Angus matched the $150 raise. The table is no longer decorative.",
    unread: true,
    severity: "green",
    playerId: "angus"
  },
  {
    id: "notif-submission-opens",
    category: "System",
    title: "Portal Opens Soon",
    time: "Sun 4:00 PM",
    body: "Sunday Portal opens in 2 hours. Outcome claims only. Diary entries get buried.",
    unread: false,
    severity: "neutral"
  },
  {
    id: "notif-vulture-risk",
    category: "System",
    title: "Vulture Risk",
    time: "Sat 6:00 PM",
    body: "Group output is trending weak. Vulture Protocol may seize 30% of the pot.",
    unread: true,
    severity: "red"
  }
];
