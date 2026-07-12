export type RankDirection = "up" | "flat" | "down";

export type Player = {
  id: string;
  name: string;
  role: string;
  rank: number;
  points: number;
  lifetimeBalance: number;
  badge?: "TURBO" | "DRIFT";
  direction: RankDirection;
  currentSubmission: string;
  history: string[];
  roast: string;
};

export const weeklyPot = 650;

export const players: Player[] = [
  {
    id: "james",
    name: "James",
    role: "Musician Brand Manager",
    rank: 1,
    points: 175,
    lifetimeBalance: 2100,
    badge: "TURBO",
    direction: "up",
    currentSubmission:
      "Closed contract scaling baseline monthly revenue by 40%; deployed paid funnel and injected $150 into Week 3 pool.",
    history: [
      "Wk 1: Launched paid funnel; Rank 2",
      "Wk 2: Closed sponsorship package; Rank 1"
    ],
    roast:
      "James created leverage and backed it with exposure. Contracted revenue beats cosmetic motion."
  },
  {
    id: "angus",
    name: "Angus",
    role: "Agency Video Director",
    rank: 2,
    points: 150,
    lifetimeBalance: 850,
    direction: "flat",
    currentSubmission:
      "Matched James' raise and closed a $3k retainer upsell after pivoting from editing work.",
    history: [
      "Wk 1: Delivered campaign assets; Rank 3",
      "Wk 2: Booked 3 sales calls; Rank 2"
    ],
    roast:
      "Strong counterpunch. Revenue landed. Not quite enough to outrun James' compounding contract."
  },
  {
    id: "joono",
    name: "Joono",
    role: "E-commerce Brand Owner",
    rank: 3,
    points: 100,
    lifetimeBalance: 400,
    direction: "flat",
    currentSubmission:
      "Launched automated organic content funnel; scaled email list by 1,200 net-new subscribers in 72 hours.",
    history: [
      "Wk 1: Rebuilt landing page; Rank 4",
      "Wk 2: Launched influencer test; Rank 3"
    ],
    roast:
      "High-quality machine building. Leads compound while he sleeps. Needed revenue conversion to steal first."
  },
  {
    id: "jett",
    name: "Jett",
    role: "Fitness Creator",
    rank: 4,
    points: 75,
    lifetimeBalance: 50,
    direction: "flat",
    currentSubmission:
      "Published 12 pieces of short-form content and booked one brand intro call.",
    history: [
      "Wk 1: Reposted archive content; Rank 5",
      "Wk 2: Secured brand meeting; Rank 4"
    ],
    roast:
      "Some motion, limited force. Content volume is only useful when it produces a measurable door opening."
  },
  {
    id: "noah",
    name: "Noah",
    role: "Software Developer",
    rank: 5,
    points: 25,
    lifetimeBalance: 0,
    badge: "DRIFT",
    direction: "down",
    currentSubmission:
      "55+ hours coding, fixed 14 bugs, joined 4 discovery calls, redlined energy levels for the brand.",
    history: [
      "Wk 1: Acquired first client; Rank 1",
      "Wk 2: Shipped prototype; Rank 3"
    ],
    roast:
      "Noah submitted a diary entry. Hours are not outcomes. Compared to Week 1 client acquisition, this is maintenance drift."
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
      "James and Angus have submitted nuclear achievements. Jett has yet to type a word."
  },
  {
    title: "Verdict",
    time: "Mon 8:00 AM",
    body:
      "Week 3 cleared. James dominates the arena and secures the $650 pot."
  },
  {
    title: "Speculation Trigger",
    time: "Thu 2:00 PM",
    body:
      "James doubled down an additional $150. Match exposure or concede the pot."
  }
];
