import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  CircleCheck,
  Crown,
  Gauge,
  History,
  Inbox as InboxIcon,
  Menu,
  LockKeyhole,
  Medal,
  Radio,
  Settings,
  ShieldAlert,
  Skull,
  Swords,
  Timer,
  UserRound,
  UsersRound,
  Vault,
  WalletCards,
  X
} from "lucide-react";
import { calculateVultureProtocol, judgeWeeklyPool } from "./aiJudge";
import {
  forgeState,
  notifications,
  players,
  type NotificationItem,
  type Player
} from "./data";

type MainView = "arena" | "inbox" | "stakes" | "profile";
type AppTab = "week" | "members" | "stakes" | "account";

function nextSundayPrompt(now: Date) {
  const target = new Date(now);
  const daysUntilSunday = (7 - target.getDay()) % 7;
  target.setDate(target.getDate() + daysUntilSunday);
  target.setHours(18, 0, 0, 0);

  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 7);
  return target;
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function haptic(pattern: number | number[] = 12) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

export function App() {
  const stage = forgeState.week_stage;
  const [view, setView] = useState<MainView>("arena");
  const [activeTab, setActiveTab] = useState<AppTab>("week");
  const [submission, setSubmission] = useState("");
  const [showVault, setShowVault] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [inboxItems, setInboxItems] = useState<NotificationItem[]>(notifications);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [now, setNow] = useState(() => new Date());
  const judged = useMemo(() => (stage === "reveal" ? judgeWeeklyPool(players) : null), [stage]);
  const vulture = useMemo(() => calculateVultureProtocol(forgeState), []);
  const countdown = formatCountdown(nextSundayPrompt(now).getTime() - now.getTime());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const openNotification = (item: NotificationItem) => {
    haptic(8);
    setInboxItems((current) =>
      current.map((notification) =>
        notification.id === item.id ? { ...notification, unread: false } : notification
      )
    );
    setSelectedNotification({ ...item, unread: false });
  };

  if (stage === "reveal" && judged) {
    return (
      <main className="app-shell hard-lock-shell">
        <RevealEngine judged={judged} />
      </main>
    );
  }

  if (stage === "submission") {
    return (
      <main className="app-shell">
        <section className="phone-frame stage-frame">
          <SubmissionStage
            submission={submission}
            setSubmission={setSubmission}
            players={players}
          />
        </section>
      </main>
    );
  }

  if (stage === "lockout") {
    return (
      <main className="app-shell">
        <section className="phone-frame stage-frame">
          <LockoutStage vulture={vulture} />
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-green" />
      <div className="ambient ambient-red" />

        <section className="phone-frame active-phone">
        {view === "arena" && activeTab === "week" && (
          <Arena
            vulture={vulture}
            countdown={countdown}
            onOpenStakes={() => {
              haptic(10);
              setActiveTab("stakes");
              setView("stakes");
            }}
            onOpenVault={() => setShowVault(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}
        {view === "arena" && activeTab === "members" && (
          <MembersView players={players} onBackToWeek={() => setActiveTab("week")} />
        )}
        {view === "arena" && activeTab === "account" && (
          <AccountView
            onOpenSettings={() => setShowSettings(true)}
            onOpenProfileEdit={() => {
              setActiveTab("account");
              setView("profile");
            }}
          />
        )}
        {view === "stakes" && <StakesPage onClose={() => { setActiveTab("week"); setView("arena"); }} />}
        {view === "profile" && <ProfileEditView onBack={() => setView("arena")} />}
        {view === "inbox" && (
          <Inbox
            items={inboxItems}
            onBack={() => setView("arena")}
            onOpen={openNotification}
            onMarkAllRead={() => {
              haptic(10);
              setInboxItems((current) => current.map((item) => ({ ...item, unread: false })));
            }}
          />
        )}
        {(view === "arena" || view === "stakes" || view === "profile") && (
          <ActiveBottomNav
            activeTab={view === "stakes" ? "stakes" : view === "profile" ? "account" : activeTab}
            onSelect={(tab) => {
              haptic(8);
              setView(tab === "stakes" ? "stakes" : "arena");
              setActiveTab(tab);
            }}
          />
        )}
      </section>

      {showVault && <VaultSheet onClose={() => setShowVault(false)} />}
      {showSettings && (
        <SettingsSheet
          unreadCount={inboxItems.filter((item) => item.unread).length}
          onClose={() => setShowSettings(false)}
          onProfile={() => {
            setShowSettings(false);
            setActiveTab("account");
            setView("profile");
          }}
          onInbox={() => {
            setShowSettings(false);
            setView("inbox");
          }}
        />
      )}

      {selectedNotification && (
        <div className="sheet-backdrop" onClick={() => setSelectedNotification(null)}>
          <section
            className="detail-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <div className="sheet-heading">
              <div>
                <span className={`category-label ${selectedNotification.severity}`}>
                  {selectedNotification.category}
                </span>
                <h2 id="notification-detail-title">{selectedNotification.title}</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close notification detail"
                onClick={() => setSelectedNotification(null)}
              >
                <X size={18} />
              </button>
            </div>
            <p>{selectedNotification.body}</p>
            <span className="sheet-time">Received {selectedNotification.time}</span>
          </section>
        </div>
      )}
    </main>
  );
}

function CompactHeader({
  eyebrow,
  title,
  onBack
}: {
  eyebrow: string;
  title: string;
  onBack: () => void;
}) {
  return (
    <header className="compact-header">
      <button className="back-button" onClick={onBack} aria-label="Return to Arena">
        <ChevronRight size={18} className="back-chevron" />
      </button>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="header-spacer" />
    </header>
  );
}

function Arena({
  vulture,
  countdown,
  onOpenStakes,
  onOpenVault,
  onOpenSettings
}: {
  vulture: ReturnType<typeof calculateVultureProtocol>;
  countdown: string;
  onOpenStakes: () => void;
  onOpenVault: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div className="view arena-view">
      <header className="arena-header">
        <button className="vault-status" onClick={onOpenVault} aria-label="Open Vulture Vault status">
          <LockKeyhole size={15} />
          <span>Vault</span>
          <strong>${forgeState.vultureVaultBalance}</strong>
        </button>
        <div className="arena-brand">
          <p className="eyebrow">Private ring · Week {forgeState.weekId}</p>
          <h1>FORGE</h1>
          <span><i /> Blind weekly state</span>
        </div>
        <button className="icon-button gear-button" onClick={onOpenSettings} aria-label="Open Forge menu">
          <Menu size={19} />
        </button>
      </header>

      <section className="hero-pot-card">
        <div className="pot-kicker"><Radio size={13} /> Weekly live pot</div>
        <div className="odometer" aria-label={`$${forgeState.weeklyPot}.00`}>
          {`$${forgeState.weeklyPot}.00`.split("").map((char, index) => (
            <span key={`${char}-${index}`} style={{ animationDelay: `${index * 55}ms` }}>
              {char}
            </span>
          ))}
        </div>
        <div className="hero-countdown" aria-label={`${countdown} until the Sunday achievement prompt`}>
          <Timer size={14} />
          <span><strong>{countdown}</strong> until your greatest achievement prompt</span>
        </div>
        <p>Winner-take-all · Monday 8:00 AM verdict</p>
        <button className="stakes-link" onClick={onOpenStakes}>
          Enter the Stakes Room <ChevronRight size={17} />
        </button>
      </section>

      <section className="monthly-standings">
        <div className="section-title standings-title">
          <Swords size={16} />
          <h2>Blind weekly field</h2>
          <span>Ranks hidden until Monday</span>
        </div>
        <div className="monthly-list">
          {[...players]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((player) => <BlindPlayerCard key={player.id} player={player} />)}
        </div>
      </section>

      <div className="arena-footnote">
        <LockKeyhole size={12} /> Current submissions and ranks are sealed
      </div>
    </div>
  );
}

function MembersView({ players, onBackToWeek }: { players: Player[]; onBackToWeek: () => void }) {
  return (
    <div className="view members-view">
      <header className="secondary-header">
        <div><p className="eyebrow">Private ring · Week {forgeState.weekId}</p><h1>Members</h1></div>
        <span className="invite-token">+ INVITE</span>
      </header>
      <div className="member-column-labels"><span>Member</span><span>Stake</span><span>Recent form</span></div>
      <div className="member-list">
        {[...players].sort((a, b) => a.name.localeCompare(b.name)).map((player) => (
          <BlindPlayerCard key={player.id} player={player} />
        ))}
      </div>
      <button className="add-member-button" onClick={onBackToWeek}><UsersRound size={15} /> Return to This Week</button>
    </div>
  );
}

function AccountView({ onOpenSettings, onOpenProfileEdit }: { onOpenSettings: () => void; onOpenProfileEdit: () => void }) {
  return (
    <div className="view account-view">
      <header className="secondary-header">
        <div><p className="eyebrow">Forge identity</p><h1>Account</h1></div>
        <button className="icon-button" onClick={onOpenSettings} aria-label="Open account settings"><Settings size={18} /></button>
      </header>
      <section className="profile-card">
        <div className="profile-medallion">N</div>
        <h2>NOAH</h2>
        <span>SOFTWARE DEVELOPER · MEMBER</span>
        <div className="profile-grid"><span>Focus<strong>Software launches</strong></span><span>Lifetime balance<strong>${players.find((player) => player.id === "noah")?.lifetimeBalance ?? 0}</strong></span><span>Member ID<strong>FORGE-042</strong></span><span>Current form<strong className="down-copy">▼ Drift</strong></span></div>
      </section>
      <div className="account-actions"><button><WalletCards size={16} /> Wallet history <ChevronRight size={15} /></button><button><Medal size={16} /> Career Hall of Fame <ChevronRight size={15} /></button><button><Bell size={16} /> Notifications <ChevronRight size={15} /></button></div>
      <button className="account-edit-button" onClick={onOpenProfileEdit}>Edit profile <ChevronRight size={15} /></button>
    </div>
  );
}

function ActiveBottomNav({
  activeTab,
  onSelect
}: {
  activeTab: AppTab;
  onSelect: (tab: AppTab | "stakes") => void;
}) {
  return (
    <nav className="forge-bottom-nav" aria-label="Forge primary navigation">
      <button className={activeTab === "week" ? "active" : ""} onClick={() => onSelect("week")}><Radio size={15} /><span>This Week</span></button>
      <button className={activeTab === "members" ? "active" : ""} onClick={() => onSelect("members")}><UsersRound size={15} /><span>Members</span></button>
      <button className="forge-mark-button" onClick={() => onSelect("week")} aria-label="Return to Forge home"><span>F</span></button>
      <button onClick={() => onSelect("stakes")}><WalletCards size={15} /><span>Stakes</span></button>
      <button className={activeTab === "account" ? "active" : ""} onClick={() => onSelect("account")}><UserRound size={15} /><span>Account</span></button>
    </nav>
  );
}

function BlindPlayerCard({ player, secured = false }: { player: Player; secured?: boolean }) {
  return (
    <article className="monthly-player blind-player">
      <span className="player-avatar">{player.name.slice(0, 1)}</span>
      <div className="monthly-player-copy">
        <div className="monthly-name-line">
          <h3>{player.name}</h3>
          {secured && player.submissionSecured && <span className="secured-badge">SECURED</span>}
        </div>
        <span className="monthly-role">{player.contextBaseline}</span>
        <div className="blind-financials">
          <span>Ante ${player.currentWeekAnte}</span>
          <span>{player.currentWeekRaise ? `Raise +$${player.currentWeekRaise}` : "No raise"}</span>
        </div>
      </div>
      <span className={`monthly-velocity ${player.direction}`} aria-label="Previous week momentum">
        {player.direction === "up" ? "▲" : player.direction === "down" ? "▼" : "—"}
      </span>
    </article>
  );
}

function StakesPage({ onClose }: { onClose: () => void }) {
  const [raise, setRaise] = useState(50);
  const [nukeState, setNukeState] = useState<"idle" | "arming" | "confirmed">("idle");
  const holdTimer = useRef<number | undefined>(undefined);
  const baseExposure = 50;
  const projectedPayout = Math.round(forgeState.weeklyPot / 5 + raise);

  const beginHold = () => {
    if (nukeState === "confirmed") return;
    haptic([18, 30, 18]);
    setNukeState("arming");
    holdTimer.current = window.setTimeout(() => {
      haptic([70, 40, 120]);
      setNukeState("confirmed");
      window.setTimeout(onClose, 650);
    }, 2000);
  };

  const cancelHold = () => {
    window.clearTimeout(holdTimer.current);
    if (nukeState === "arming") setNukeState("idle");
  };

  return (
    <div className="view stakes-view">
        <header className="sheet-topline">
          <div>
            <p className="eyebrow">Mid-week action · Week {forgeState.weekId}</p>
            <h2 id="stakes-title">Stakes Room</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close Stakes Room"><X size={18} /></button>
        </header>

        <section className="payout-estimate">
          <span>Real-time payout estimate</span>
          <div><strong>Your Current Exposure: ${baseExposure}</strong><strong>Projected Payout: ${projectedPayout}</strong></div>
          <small>Gross pool ${forgeState.weeklyPot} · your raise is held pending match lock</small>
        </section>

        <section className="bet-slider-panel">
          <div className="slider-label-row">
            <div><span>Extra cash injection</span><strong>+${raise}</strong></div>
            <Gauge size={18} />
          </div>
          <input
            aria-label="Extra cash injection"
            type="range"
            min="10"
            max="100"
            step="10"
            value={raise}
            onChange={(event) => {
              haptic(10);
              setRaise(Number(event.target.value));
            }}
          />
          <div className="slider-milestones"><span>+$10</span><span>+$50</span><span>+$100</span></div>
          <div className="crimson-tick-meter"><span style={{ width: `${raise}%` }} /></div>
          <p>Slide right to increase exposure. Every milestone is broadcast to the ring.</p>
        </section>

        <div className="nuke-zone">
          <button
            className={`confirm-double-button ${nukeState}`}
            onPointerDown={beginHold}
            onPointerUp={cancelHold}
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
          >
            {nukeState === "confirmed" ? <Check size={24} /> : <Skull size={22} />}
            {nukeState === "confirmed" ? "Double Down Locked" : "Confirm Double Down"}
            <span className="hold-ring" />
          </button>
          <button className="cancel-link" onClick={onClose}>Cancel and Return</button>
          <span className="hold-caption">Hold continuously for 2 seconds to lock</span>
        </div>
    </div>
  );
}

function ProfileEditView({ onBack }: { onBack: () => void }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="view profile-edit-view">
      <CompactHeader eyebrow="Account management" title="Edit profile" onBack={onBack} />
      <div className="profile-edit-form">
        <label>Display name<input defaultValue="Noah" onChange={() => setSaved(false)} /></label>
        <label>Role<input defaultValue="Software Developer" onChange={() => setSaved(false)} /></label>
        <label>Primary focus<input defaultValue="Software launches" onChange={() => setSaved(false)} /></label>
        <label>Monthly baseline<input defaultValue="$0" onChange={() => setSaved(false)} /></label>
        <p><LockKeyhole size={14} /> Profile context is used to judge outcomes relative to your operating baseline.</p>
      </div>
      <button className={`profile-save-button ${saved ? "saved" : ""}`} onClick={() => { haptic([15, 30, 15]); setSaved(true); }}>
        {saved ? <><Check size={18} /> Profile Saved</> : <>Save Profile <ChevronRight size={17} /></>}
      </button>
    </div>
  );
}

function SubmissionStage({
  submission,
  setSubmission,
  players
}: {
  submission: string;
  setSubmission: (value: string) => void;
  players: Player[];
}) {
  return (
    <SundayPortal
      submission={submission}
      setSubmission={setSubmission}
      players={players}
      isolated
    />
  );
}

function SundayPortal({
  submission,
  setSubmission,
  players,
  isolated = false,
  onBack
}: {
  submission: string;
  setSubmission: (value: string) => void;
  players: Player[];
  isolated?: boolean;
  onBack?: () => void;
}) {
  const [locked, setLocked] = useState(false);
  const charsLeft = 280 - submission.length;
  const countSeverity = charsLeft < 40 ? "critical" : charsLeft < 90 ? "warning" : "safe";
  const ready = submission.trim().length >= 10;

  return (
    <div className={`view submission-view ${isolated ? "isolated-submission" : ""}`}>
      {isolated ? (
        <header className="stage-lock-header">
          <div>
            <p className="eyebrow">Sunday 6:00 PM · submission window</p>
            <h1>Sunday Portal</h1>
          </div>
          <span className="stage-token">BLIND MODE</span>
        </header>
      ) : onBack ? (
        <CompactHeader eyebrow="Sunday 6:00 PM · submission window" title="Sunday Portal" onBack={onBack} />
      ) : null}
      <section className="submission-intro">
        <span className="submission-live"><i /> Portal open</span>
        <p>One milestone. One clean claim. No actions, no hours logged. Your text is sealed until Monday.</p>
      </section>
      <div className={`submission-input-shell ${locked ? "locked" : ""}`}>
        <textarea
          aria-label="Milestone submission"
          maxLength={280}
          disabled={locked}
          value={submission}
          onChange={(event) => setSubmission(event.target.value.slice(0, 280))}
          placeholder="State your milestone. No actions, no hours logged. The judge values outcomes over labor."
        />
        <span className={`submission-counter ${countSeverity}`}>{charsLeft}</span>
        <span className="counter-label">characters left</span>
      </div>
      <div className="submission-bottom">
        <p className="submission-proof-note"><ShieldAlert size={14} /> Claims may be challenged during the Monday audit window.</p>
        <button
          className={`commit-button ${locked ? "locked" : ""}`}
          disabled={!ready || locked}
          onClick={() => {
            haptic([20, 35, 20]);
            setLocked(true);
          }}
        >
          {locked ? <><CircleCheck size={20} /> Milestone Committed</> : <>Commit Milestone <ChevronRight size={18} /></>}
        </button>
        {!locked && !ready && <span className="minimum-copy">10 characters minimum to submit</span>}
      </div>
      {isolated && (
        <section className="submission-roster">
          <div className="section-title">
            <LockKeyhole size={14} />
            <h2>Blind submission status</h2>
            <span>Payloads hidden</span>
          </div>
          <div className="secured-roster">
            {[...players]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((player) => (
                <BlindPlayerCard
                  key={player.id}
                  player={{
                    ...player,
                    submissionSecured:
                      player.submissionSecured ||
                      (locked && player.id === forgeState.authenticatedUserId)
                  }}
                  secured
                />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

function LockoutStage({ vulture }: { vulture: ReturnType<typeof calculateVultureProtocol> }) {
  return (
    <div className="view lockout-stage">
      <div className="stage-lock-header">
        <div>
          <p className="eyebrow">Sunday midnight · Monday 8:00 AM</p>
          <h1>Submissions Sealed</h1>
        </div>
        <span className="stage-token">HARD LOCK</span>
      </div>
      <section className="lockout-card">
        <LockKeyhole size={30} />
        <span>Information asymmetry preserved</span>
        <h2>The room is blind.</h2>
        <p>All claims are encrypted and queued for the Monday Judge. Ranks, scores, and payout remain unavailable until the reveal sequence completes.</p>
        <div className="lockout-metrics"><span>Weekly pot <strong>${forgeState.weeklyPot}</strong></span><span>Vault <strong>${vulture.vaultAfterCapture}</strong></span></div>
      </section>
      <div className="lockout-footer"><Radio size={14} /> Reveal unlocks Monday at 8:00 AM · bottom-up extraction</div>
    </div>
  );
}

function RevealEngine({ judged }: { judged: ReturnType<typeof judgeWeeklyPool> }) {
  const revealOrder = useMemo(() => [...judged].sort((a, b) => b.rank - a.rank), [judged]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [typedRoast, setTypedRoast] = useState("");
  const [payoutReleased, setPayoutReleased] = useState(false);
  const current = revealOrder[visibleCount - 1];

  useEffect(() => {
    if (visibleCount >= revealOrder.length) return;
    const timeout = window.setTimeout(
      () => setVisibleCount((count) => count + 1),
      visibleCount === 0 ? 450 : 1500
    );
    return () => window.clearTimeout(timeout);
  }, [revealOrder.length, visibleCount]);

  useEffect(() => {
    if (!current) {
      setTypedRoast("");
      return;
    }

    let cursor = 0;
    setTypedRoast("");
    setPayoutReleased(false);
    const interval = window.setInterval(() => {
      cursor += 1;
      setTypedRoast(current.roast.slice(0, cursor));
      if (cursor >= current.roast.length) {
        window.clearInterval(interval);
        if (current.rank === 1) setPayoutReleased(true);
      }
    }, 24);

    return () => window.clearInterval(interval);
  }, [current?.id]);

  return (
    <section className="reveal-lock-shell">
      <div className="reveal-lock-header">
        <div><p className="eyebrow">Monday 8:00 AM · judge execution</p><h1>The Showdown</h1></div>
        <span className="stage-token">HARD LOCK</span>
      </div>
      <div className="reveal-status"><span className="reveal-pulse" /> Extracting ranks {visibleCount} / {revealOrder.length} from the basement up</div>
      <div className="sequential-reveal-list">
        {revealOrder.slice(0, visibleCount).map((player) => {
          const active = player.id === current?.id;
          return (
            <article key={player.id} className={`sequential-card rank-${player.rank} ${active ? "reveal-active" : ""}`}>
              <div className="sequential-card-heading"><span>Rank #{player.rank}</span><h2>{player.name}</h2><strong>{player.rankAward} pts</strong></div>
              <p>{active ? typedRoast || "Judge commentary loading..." : player.roast}</p>
              <small>Proof gate: {player.proofRequired}</small>
            </article>
          );
        })}
      </div>
      {payoutReleased ? (
        <div className="payout-climax"><Crown size={21} /><div><strong>Rank #1 payout cleared</strong><span>${forgeState.weeklyPot} transferred to the champion ledger.</span></div><Check size={21} /></div>
      ) : (
        <div className="payout-pending"><LockKeyhole size={14} /> Payout ledger remains locked until Rank #1 climax</div>
      )}
    </section>
  );
}

function VaultSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="vault-sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <LockKeyhole size={22} className="vault-sheet-icon" />
        <p className="eyebrow">Vulture Vault status</p>
        <h2>${forgeState.vultureVaultBalance}</h2>
        <p>Drained from slump weeks. Paid to the Monthly Champion.</p>
        <button className="sheet-action" onClick={onClose}>Understood</button>
      </section>
    </div>
  );
}

function SettingsSheet({
  unreadCount,
  onClose,
  onProfile,
  onInbox
}: {
  unreadCount: number;
  onClose: () => void;
  onProfile: () => void;
  onInbox: () => void;
}) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section className="settings-sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <header className="sheet-topline">
          <div><p className="eyebrow">Forge control center</p><h2>Settings</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close settings"><X size={18} /></button>
        </header>
        <div className="settings-list">
          <button className="settings-row"><UserRound size={19} /><span><strong>Profile management</strong><small>Noah · Software Developer</small></span><ChevronRight size={16} /></button>
          <button className="settings-row"><WalletCards size={19} /><span><strong>Wallet history</strong><small>$0.00 available · $420 vault protected</small></span><ChevronRight size={16} /></button>
          <button className="settings-row"><Medal size={19} /><span><strong>Career Hall of Fame</strong><small>James leads Week 3</small></span><ChevronRight size={16} /></button>
          <button className="settings-row" onClick={onInbox}><Bell size={19} /><span><strong>Inbox</strong><small>{unreadCount} unread alerts</small></span><ChevronRight size={16} /></button>
        </div>
      </section>
    </div>
  );
}

function Inbox({
  items,
  onBack,
  onOpen,
  onMarkAllRead
}: {
  items: NotificationItem[];
  onBack: () => void;
  onOpen: (item: NotificationItem) => void;
  onMarkAllRead: () => void;
}) {
  const unreadCount = items.filter((item) => item.unread).length;
  return (
    <div className="view compact-view inbox-compact-view">
      <CompactHeader eyebrow="Private ring communications" title="Inbox" onBack={onBack} />
      <div className="inbox-summary"><span>{unreadCount} unread alerts</span><button className="text-button" onClick={onMarkAllRead}>Mark all read</button></div>
      <div className="compact-inbox-list">
        {items.slice(0, 5).map((item) => (
          <button key={item.id} className={`compact-notification ${item.unread ? "unread" : ""}`} onClick={() => onOpen(item)}>
            <span className={`notification-severity ${item.severity}`} />
            <span><small>{item.category} · {item.time}</small><strong>{item.title}</strong><em>{item.body}</em></span>
            {item.unread && <i />}
            <ChevronRight size={15} />
          </button>
        ))}
      </div>
      <div className="empty-inbox-footer"><InboxIcon size={15} /> Showing the latest ring alerts</div>
    </div>
  );
}
