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
  LockKeyhole,
  Medal,
  Radio,
  Settings,
  ShieldAlert,
  Skull,
  Swords,
  Timer,
  UserRound,
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

type MainView = "arena" | "submit" | "reveal" | "inbox";

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
  const [view, setView] = useState<MainView>(
    forgeState.phase === "submission" ? "submit" : "arena"
  );
  const [submission, setSubmission] = useState("");
  const [showStakes, setShowStakes] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [inboxItems, setInboxItems] = useState<NotificationItem[]>(notifications);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [now, setNow] = useState(() => new Date());
  const judged = useMemo(() => judgeWeeklyPool(players), []);
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

  return (
    <main className="app-shell">
      <div className="ambient ambient-green" />
      <div className="ambient ambient-red" />

      <section className="phone-frame">
        {view === "arena" && (
            <Arena
            vulture={vulture}
            countdown={countdown}
            onOpenStakes={() => {
              haptic(10);
              setShowStakes(true);
            }}
            onOpenVault={() => setShowVault(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}
        {view === "submit" && (
          <SundayPortal
            submission={submission}
            setSubmission={setSubmission}
            onBack={() => setView("arena")}
          />
        )}
        {view === "reveal" && <Reveal judged={judged} onBack={() => setView("arena")} />}
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
      </section>

      {showStakes && <StakesSheet onClose={() => setShowStakes(false)} />}
      {showVault && <VaultSheet onClose={() => setShowVault(false)} />}
      {showSettings && (
        <SettingsSheet
          unreadCount={inboxItems.filter((item) => item.unread).length}
          onClose={() => setShowSettings(false)}
          onInbox={() => {
            setShowSettings(false);
            setView("inbox");
          }}
          onReveal={() => {
            setShowSettings(false);
            setView("reveal");
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
          <span><i /> Live standings</span>
        </div>
        <button className="icon-button gear-button" onClick={onOpenSettings} aria-label="Open Forge settings">
          <Settings size={19} />
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
          <h2>Frozen monthly standings</h2>
          <span>Week {forgeState.weekId} snapshot</span>
        </div>
        <div className="monthly-list">
          {[...players]
            .sort((a, b) => a.rank - b.rank)
            .map((player) => <MonthlyPlayerCard key={player.id} player={player} />)}
        </div>
      </section>

      <div className="arena-footnote">
        <LockKeyhole size={12} /> Monthly points freeze at Monday reveal
      </div>
    </div>
  );
}

function MonthlyPlayerCard({ player }: { player: Player }) {
  const first = player.rank === 1;
  const last = player.rank === 5;
  return (
    <article className={`monthly-player ${first ? "monthly-champion" : ""} ${last ? "monthly-basement" : ""}`}>
      <span className="monthly-rank">{player.rank}</span>
      <span className="player-avatar">{player.name.slice(0, 1)}</span>
      <div className="monthly-player-copy">
        <div className="monthly-name-line">
          <h3>{player.name}</h3>
          {player.badge && <span className={`badge ${player.badge.toLowerCase()}`}>{player.badge}</span>}
        </div>
        <span className="monthly-role">{player.role}</span>
      </div>
      <span className={`monthly-velocity ${player.direction}`} aria-label={`${player.direction} velocity`}>
        {player.direction === "up" ? "▲" : player.direction === "down" ? "▼" : "—"}
      </span>
      <div className="monthly-points">
        <strong>{player.points}</strong>
        <span>pts</span>
      </div>
      <span className="monthly-status-line" />
    </article>
  );
}

function StakesSheet({ onClose }: { onClose: () => void }) {
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
    <div className="sheet-backdrop stakes-backdrop">
      <section className="stakes-sheet" role="dialog" aria-modal="true" aria-labelledby="stakes-title">
        <div className="sheet-handle" />
        <header className="sheet-topline">
          <div>
            <p className="eyebrow">Mid-week action · Week {forgeState.weekId}</p>
            <h2 id="stakes-title">Stakes Room</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close Stakes Room">
            <X size={18} />
          </button>
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
      </section>
    </div>
  );
}

function SundayPortal({
  submission,
  setSubmission,
  onBack
}: {
  submission: string;
  setSubmission: (value: string) => void;
  onBack: () => void;
}) {
  const [locked, setLocked] = useState(false);
  const charsLeft = 280 - submission.length;
  const countSeverity = charsLeft < 40 ? "critical" : charsLeft < 90 ? "warning" : "safe";
  const ready = submission.trim().length >= 10;

  return (
    <div className="view submission-view">
      <CompactHeader eyebrow="Sunday 6:00 PM · submission window" title="Sunday Portal" onBack={onBack} />
      <section className="submission-intro">
        <span className="submission-live"><i /> Portal open</span>
        <p>One milestone. One clean claim. No actions, no hours logged. The judge values outcomes over labor.</p>
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
    </div>
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
  onInbox,
  onReveal
}: {
  unreadCount: number;
  onClose: () => void;
  onInbox: () => void;
  onReveal: () => void;
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
          <button className="settings-row" onClick={onReveal}><Crown size={19} /><span><strong>Replay last reveal</strong><small>Review the Week 3 verdict</small></span><ChevronRight size={16} /></button>
        </div>
      </section>
    </div>
  );
}

function Reveal({ judged, onBack }: { judged: ReturnType<typeof judgeWeeklyPool>; onBack: () => void }) {
  const winner = judged.find((player) => player.rank === 1);
  return (
    <div className="view compact-view">
      <CompactHeader eyebrow="Monday 8:00 AM · completed" title="The Reveal" onBack={onBack} />
      <section className="reveal-winner-card"><Crown size={26} /><span>Week {forgeState.weekId} champion</span><h2>{winner?.name}</h2><strong>${forgeState.weeklyPot}</strong><p>Winner-take-all payout before vault transfer.</p></section>
      <div className="reveal-summary"><History size={17} /><span>Bottom-up extraction completed</span><span className="reveal-summary-count">5 ranks cleared</span></div>
      <div className="compact-rank-list">{judged.slice(1, 4).map((player) => <div key={player.id}><span>#{player.rank}</span><strong>{player.name}</strong><small>{player.rankAward} pts</small></div>)}</div>
      <button className="sheet-action" onClick={onBack}>Return to Arena</button>
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
