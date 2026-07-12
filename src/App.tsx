import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Crown,
  Eye,
  Flame,
  Gauge,
  Radio,
  ShieldAlert,
  Skull,
  Swords,
  Trophy,
  Vault,
  Zap
} from "lucide-react";
import {
  calculateVultureProtocol,
  judgeEndpointContract,
  judgePrompt,
  judgeWeeklyPool
} from "./aiJudge";
import { forgeState, notifications, players, weeklyPot, type Player } from "./data";

type View = "arena" | "stakes" | "submit" | "reveal" | "system";

const views: Array<{ id: View; label: string }> = [
  { id: "arena", label: "Arena" },
  { id: "stakes", label: "Stakes" },
  { id: "submit", label: "Sunday" },
  { id: "reveal", label: "Reveal" },
  { id: "system", label: "System" }
];

function haptic(pattern: number | number[] = 12) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

export function App() {
  const [view, setView] = useState<View>("arena");
  const [raise, setRaise] = useState(150);
  const [submission, setSubmission] = useState("");
  const judged = useMemo(() => judgeWeeklyPool(players), []);
  const vulture = useMemo(() => calculateVultureProtocol(forgeState), []);
  const authedPlayer = players.find((player) => player.id === forgeState.authenticatedUserId);
  const isBasementUser = authedPlayer?.rank === 5;

  return (
    <main className={`app-shell ${isBasementUser ? "basement-active" : ""}`}>
      <div className="ambient ambient-green" />
      <div className="ambient ambient-red" />
      {isBasementUser && <div className="punishment-overlay" />}

      <section className="phone-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">Private Ring - Week {forgeState.weekId}</p>
            <h1>FORGE</h1>
          </div>
          <div className="live-pill">
            <Radio size={14} />
            Live
          </div>
        </header>

        <nav className="tabs" aria-label="Forge views">
          {views.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => {
                haptic(8);
                setView(item.id);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {view === "arena" && <Arena players={players} vulture={vulture} />}
        {view === "stakes" && (
          <StakesRoom raise={raise} setRaise={setRaise} pot={weeklyPot} />
        )}
        {view === "submit" && (
          <SundayPortal submission={submission} setSubmission={setSubmission} />
        )}
        {view === "reveal" && <Reveal judged={judged} vulture={vulture} />}
        {view === "system" && <SystemSpec />}
      </section>
    </main>
  );
}

function Arena({
  players,
  vulture
}: {
  players: Player[];
  vulture: ReturnType<typeof calculateVultureProtocol>;
}) {
  return (
    <div className="view stack">
      <section className="pot-card">
        <p>Weekly Live Pot</p>
        <div className="odometer" aria-label={`$${weeklyPot}.00`}>
          {"$650.00".split("").map((char, index) => (
            <span key={`${char}-${index}`} style={{ animationDelay: `${index * 70}ms` }}>
              {char}
            </span>
          ))}
        </div>
        <span>Winner-take-all - Monday 8:00 AM verdict</span>
      </section>

      {vulture.active && (
        <section className="vulture-banner">
          <Vault size={18} />
          <div>
            <strong>Vulture Protocol Armed</strong>
            <p>${vulture.tax} seized into vault if the room keeps underperforming.</p>
          </div>
        </section>
      )}

      <section>
        <div className="section-title">
          <Swords size={18} />
          <h2>Standings</h2>
        </div>
        <div className="leaderboard">
          {[...players]
            .sort((a, b) => a.rank - b.rank)
            .map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
        </div>
      </section>
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const isFirst = player.rank === 1;
  const isLast = player.rank === 5;

  return (
    <article
      className={`player-card ${isFirst ? "champion" : ""} ${isLast ? "basement" : ""}`}
    >
      <div className="rank">{player.rank}</div>
      <div className="player-main">
        <div className="player-line">
          <h3>{player.name}</h3>
          {player.badge && (
            <span className={`badge ${player.badge.toLowerCase()}`}>{player.badge}</span>
          )}
        </div>
        <p>{player.role}</p>
        <small>{player.evaluationRule}</small>
      </div>
      <div className="points">
        <strong>{player.points}</strong>
        <span>pts</span>
      </div>
      <div className={`velocity ${player.direction}`}>
        {player.direction === "up" ? "▲" : player.direction === "down" ? "▼" : "—"}
      </div>
    </article>
  );
}

function StakesRoom({
  raise,
  setRaise,
  pot
}: {
  raise: number;
  setRaise: (value: number) => void;
  pot: number;
}) {
  const [nukeArmed, setNukeArmed] = useState(false);
  const holdTimer = useRef<number | undefined>(undefined);
  const matched = ["James", "Angus"];

  const beginHold = () => {
    haptic([20, 40, 20]);
    setNukeArmed(true);
    holdTimer.current = window.setTimeout(() => {
      haptic([80, 50, 120]);
      setNukeArmed(false);
    }, 2000);
  };

  const cancelHold = () => {
    window.clearTimeout(holdTimer.current);
    setNukeArmed(false);
  };

  return (
    <div className="view stack">
      <section className="danger-card">
        <div className="section-title">
          <ShieldAlert size={18} />
          <h2>Ante Engine</h2>
        </div>
        <p>
          Drag the exposure slider, hold the Nuke Trigger for 2 seconds, and blast
          the room with a match-or-fold notification.
        </p>
      </section>

      <section className="slider-card">
        <div className="raise-row">
          <span>Extra Injection</span>
          <strong>${raise}</strong>
        </div>
        <input
          aria-label="Extra injection"
          type="range"
          min="50"
          max="300"
          step="50"
          value={raise}
          onChange={(event) => {
            haptic(10);
            setRaise(Number(event.target.value));
          }}
        />
        <div className="synth-meter">
          <span style={{ width: `${(raise / 300) * 100}%` }} />
        </div>
        <div className="pot-preview">
          <Gauge size={16} />
          New pot if matched: <strong>${pot + raise * 5}</strong>
        </div>
      </section>

      <button
        className={`nuke-button ${nukeArmed ? "arming" : ""}`}
        onPointerDown={beginHold}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
      >
        <Skull size={22} />
        Hold 2s to Nuke +${raise}
        <span className="hold-ring" />
      </button>

      <section>
        <div className="section-title">
          <Zap size={18} />
          <h2>Match Grid</h2>
        </div>
        <div className="silhouette-grid">
          {players.map((player) => (
            <div
              key={player.id}
              className={matched.includes(player.name) ? "matched" : ""}
            >
              <span>{player.name[0]}</span>
              <p>{matched.includes(player.name) ? "Matched" : "Pending"}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SundayPortal({
  submission,
  setSubmission
}: {
  submission: string;
  setSubmission: (value: string) => void;
}) {
  const charsLeft = 280 - submission.length;

  return (
    <div className="view stack">
      <section className="terminal-card">
        <div className="section-title">
          <Flame size={18} />
          <h2>Submission Terminal</h2>
        </div>
        <p className="window-copy">Active Sunday 6:00 PM - 11:59 PM</p>
        <div className="textarea-shell" data-limit="280 MAX">
          <textarea
            maxLength={280}
            value={submission}
            onChange={(event) => setSubmission(event.target.value.slice(0, 280))}
            placeholder="State your milestone. No fluff, no stories. The judge values outcomes over hours."
          />
        </div>
        <div className={charsLeft < 40 ? "char-count warning" : "char-count"}>
          {charsLeft} characters remaining
        </div>
      </section>

      <button className="submit-button" disabled={!submission.trim()} onClick={() => haptic(20)}>
        Lock Submission
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function Reveal({
  judged,
  vulture
}: {
  judged: ReturnType<typeof judgeWeeklyPool>;
  vulture: ReturnType<typeof calculateVultureProtocol>;
}) {
  const bottomUp = [...judged].sort((a, b) => b.rank - a.rank);

  return (
    <div className="view stack reveal-view">
      <section className="showdown-hero">
        <Crown size={28} />
        <p>Monday 8:00 AM</p>
        <h2>The Showdown Loop</h2>
      </section>

      {vulture.active && (
        <section className="vulture-card">
          <Vault size={22} />
          <div>
            <strong>{vulture.notification}</strong>
            <p>
              ${vulture.tax} captured. Winner payout reduced to ${vulture.winnerPayout}.
              Vault rises to ${vulture.vaultAfterCapture}.
            </p>
          </div>
        </section>
      )}

      <div className="reveal-list">
        {bottomUp.map((player) => (
          <article key={player.id} className={`reveal-card rank-${player.rank}`}>
            <div>
              <span>Rank #{player.rank}</span>
              <h3>{player.name}</h3>
            </div>
            <p>{player.roast}</p>
            <small>Proof gate: {player.proofRequired}</small>
            <strong>{player.rankAward} awarded points</strong>
          </article>
        ))}
      </div>

      <button className="bs-button" onClick={() => haptic([30, 20, 30])}>
        <Eye size={18} />
        BS Button - 2 Hour Audit Window
      </button>
    </div>
  );
}

function SystemSpec() {
  return (
    <div className="view stack">
      <section className="system-card">
        <div className="section-title">
          <Trophy size={18} />
          <h2>Build Spine</h2>
        </div>
        <div className="architecture">
          <span>App</span>
          <ChevronRight size={14} />
          <span>Supabase</span>
          <ChevronRight size={14} />
          <span>Server Judge API</span>
          <ChevronRight size={14} />
          <span>OpenAI JSON</span>
          <ChevronRight size={14} />
          <span>Stripe Connect</span>
        </div>
      </section>

      <section className="system-card">
        <div className="section-title">
          <Vault size={18} />
          <h2>Vulture State Machine</h2>
        </div>
        <pre>{`if (group_performance === "slump") {
  const vultureTax = weekly_pot * 0.30;
  vulture_vault_balance += vultureTax;
  winner_payout = weekly_pot - vultureTax;
  triggerGlobalNotification("Vulture Protocol Activated: Money Seized.");
}`}</pre>
      </section>

      <section className="prompt-card">
        <div className="section-title">
          <AlertTriangle size={18} />
          <h2>Server Judge Contract</h2>
        </div>
        <pre>{JSON.stringify(judgeEndpointContract, null, 2)}</pre>
      </section>

      <section className="prompt-card">
        <div className="section-title">
          <AlertTriangle size={18} />
          <h2>Judge Prompt Seed</h2>
        </div>
        <pre>{judgePrompt}</pre>
      </section>

      <section>
        <div className="section-title">
          <Radio size={18} />
          <h2>Notification Lifecycle</h2>
        </div>
        <div className="notification-list">
          {notifications.map((note) => (
            <article key={note.title}>
              <span>{note.time}</span>
              <h3>{note.title}</h3>
              <p>{note.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
