import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronRight,
  Crown,
  Flame,
  Gauge,
  Radio,
  ShieldAlert,
  Skull,
  Swords,
  Trophy,
  Zap
} from "lucide-react";
import { judgePrompt } from "./aiJudge";
import { notifications, players, weeklyPot, type Player } from "./data";
import { judgeWeeklyPool } from "./aiJudge";

type View = "arena" | "stakes" | "submit" | "reveal" | "system";

const views: Array<{ id: View; label: string }> = [
  { id: "arena", label: "Arena" },
  { id: "stakes", label: "Stakes" },
  { id: "submit", label: "Sunday" },
  { id: "reveal", label: "Reveal" },
  { id: "system", label: "System" }
];

export function App() {
  const [view, setView] = useState<View>("arena");
  const [raise, setRaise] = useState(150);
  const [submission, setSubmission] = useState("");
  const judged = useMemo(() => judgeWeeklyPool(players), []);

  return (
    <main className="app-shell">
      <div className="ambient ambient-green" />
      <div className="ambient ambient-red" />

      <section className="phone-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">Private Ring · Week 3</p>
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
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {view === "arena" && <Arena players={players} />}
        {view === "stakes" && (
          <StakesRoom raise={raise} setRaise={setRaise} pot={weeklyPot} />
        )}
        {view === "submit" && (
          <SundayPortal submission={submission} setSubmission={setSubmission} />
        )}
        {view === "reveal" && <Reveal judged={judged} />}
        {view === "system" && <SystemSpec />}
      </section>
    </main>
  );
}

function Arena({ players }: { players: Player[] }) {
  return (
    <div className="view stack">
      <section className="pot-card">
        <p>Weekly Live Pot</p>
        <div className="pot-amount">$650.00</div>
        <span>Winner-take-all · Monday 8:00 AM verdict</span>
      </section>

      <section>
        <div className="section-title">
          <Swords size={18} />
          <h2>Standings</h2>
        </div>
        <div className="leaderboard">
          {players
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
    <article className={`player-card ${isFirst ? "champion" : ""} ${isLast ? "basement" : ""}`}>
      <div className="rank">{player.rank}</div>
      <div className="player-main">
        <div className="player-line">
          <h3>{player.name}</h3>
          {player.badge && <span className={`badge ${player.badge.toLowerCase()}`}>{player.badge}</span>}
        </div>
        <p>{player.role}</p>
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
  const matched = ["James", "Angus"];

  return (
    <div className="view stack">
      <section className="danger-card">
        <div className="section-title">
          <ShieldAlert size={18} />
          <h2>Ante Engine</h2>
        </div>
        <p>
          Increase the current pool, trigger the network, and force everyone to
          decide whether they match or fold psychologically.
        </p>
      </section>

      <section className="slider-card">
        <div className="raise-row">
          <span>Extra Injection</span>
          <strong>${raise}</strong>
        </div>
        <input
          type="range"
          min="50"
          max="300"
          step="50"
          value={raise}
          onChange={(event) => setRaise(Number(event.target.value))}
        />
        <div className="pot-preview">
          <Gauge size={16} />
          New pot if matched: <strong>${pot + raise * 5}</strong>
        </div>
      </section>

      <button className="nuke-button">
        <Skull size={22} />
        Hold to Nuke +${raise}
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
        <p className="window-copy">Active Sunday 6:00 PM — 11:59 PM</p>
        <textarea
          maxLength={280}
          value={submission}
          onChange={(event) => setSubmission(event.target.value)}
          placeholder="State your milestone. No fluff, no stories. The judge values outcomes over hours."
        />
        <div className={charsLeft < 40 ? "char-count warning" : "char-count"}>
          {charsLeft} characters remaining
        </div>
      </section>

      <button className="submit-button" disabled={!submission.trim()}>
        Lock Submission
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function Reveal({ judged }: { judged: ReturnType<typeof judgeWeeklyPool> }) {
  const bottomUp = [...judged].sort((a, b) => b.rank - a.rank);

  return (
    <div className="view stack reveal-view">
      <section className="showdown-hero">
        <Crown size={28} />
        <p>Monday 8:00 AM</p>
        <h2>The Showdown Loop</h2>
      </section>

      <div className="reveal-list">
        {bottomUp.map((player) => (
          <article key={player.id} className={`reveal-card rank-${player.rank}`}>
            <div>
              <span>Rank #{player.rank}</span>
              <h3>{player.name}</h3>
            </div>
            <p>{player.roast}</p>
            <strong>{player.rankAward} awarded points</strong>
          </article>
        ))}
      </div>
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
          <span>Edge Judge</span>
          <ChevronRight size={14} />
          <span>OpenAI JSON</span>
        </div>
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
