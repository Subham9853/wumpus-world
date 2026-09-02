import { SIZE, key, DIRS, getPercepts, missionStep } from "../game/engine";

export function MissionTracker({ state }) {
  const step = missionStep(state);
  const steps = [
    { id: 1, label: "Find the golden box" },
    { id: 2, label: "Carry it home" },
    { id: 3, label: "Climb at (1,1)" },
    { id: 4, label: "You win!" },
  ];

  return (
    <ol className="mission">
      {steps.map((s) => (
        <li
          key={s.id}
          className={step > s.id || (step === 4 && s.id === 4) ? "done" : ""}
          data-active={step === s.id}
        >
          <span className="mission-num">{s.id}</span>
          <span>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

export function TipBanner({ tip, status }) {
  return (
    <div className="tip-banner">
      <strong>What to do</strong>
      <p>{tip}</p>
      <p className="status-line">{status}</p>
    </div>
  );
}

export function PerceptBar({ agent, world }) {
  const percepts = getPercepts(agent, world);
  const items = [];
  if (percepts.stench) items.push(["Stench = Wumpus near", "danger"]);
  if (percepts.breeze) items.push(["Breeze = Pit near", "warn"]);
  if (percepts.glitter) items.push(["Glitter = Treasure here!", "gold"]);
  if (percepts.bump) items.push(["Bump = Wall", "warn"]);
  if (percepts.scream) items.push(["Scream = Wumpus hit", "danger"]);

  return (
    <div className="percepts">
      <span className="percept-title">Sensors</span>
      <div className="percept-chips">
        {items.length === 0 ? (
          <span className="chip muted">All clear</span>
        ) : (
          items.map(([text, cls]) => (
            <span key={text} className={`chip ${cls}`}>
              {text}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

export function ScoreBoard({ agent, mode }) {
  return (
    <div className="scoreboard">
      <div className="stat">
        <span className="stat-label">Score</span>
        <span className="stat-value">{agent.score}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Steps</span>
        <span className="stat-value">{agent.steps}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Arrow</span>
        <span className="stat-value">{agent.hasArrow ? "Ready" : "Used"}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Facing</span>
        <span className="stat-value">
          {DIRS[agent.dir].arrow} {DIRS[agent.dir].name}
        </span>
      </div>
      <div className="stat">
        <span className="stat-label">Mode</span>
        <span className="stat-value">{mode}</span>
      </div>
    </div>
  );
}

export function KnowledgePanel({ kb, agent }) {
  const cells = [];
  for (let y = SIZE; y >= 1; y--) {
    for (let x = 1; x <= SIZE; x++) {
      const c = kb.cells[key(x, y)];
      let label = "?";
      const classes = ["kb-cell"];
      if (c.pit === "yes") {
        classes.push("pit");
        label = "Pit";
      } else if (c.wumpus === "yes") {
        classes.push("wumpus");
        label = "Wump";
      } else if (c.safe) {
        classes.push("safe");
        label = c.visited ? "OK" : "Safe";
      } else if (c.pit === "maybe" || c.wumpus === "maybe") {
        classes.push("risky");
        label = "Risk";
      }
      if (c.visited) classes.push("visited");
      if (agent.x === x && agent.y === y) classes.push("agent");
      cells.push(
        <div key={key(x, y)} className={classes.join(" ")}>
          {x},{y}
          <br />
          {label}
        </div>
      );
    }
  }

  return (
    <section className="panel">
      <h2>Brain Map</h2>
      <p className="panel-note">What the agent believes — Safe means OK to walk.</p>
      <div className="kb">{cells}</div>
    </section>
  );
}

export function LogPanel({ logs }) {
  return (
    <section className="panel">
      <h2>Story Log</h2>
      <div className="log" aria-live="polite">
        {logs.map((entry) => (
          <p key={entry.id}>
            <span className="time">#{entry.id}</span>
            {entry.text}
          </p>
        ))}
      </div>
    </section>
  );
}

export function HowToPlay() {
  return (
    <section className="panel howto">
      <h2>Super simple rules</h2>
      <ol>
        <li>Click a neighbor square (or use arrows) to move your sword hero.</li>
        <li>Find the <strong>golden treasure box</strong> (look for glitter).</li>
        <li>Carry it back to <strong>(1,1)</strong> and press <strong>Climb</strong>.</li>
        <li>Breeze = pit nearby. Stench = Wumpus nearby. Stay on Safe cells.</li>
      </ol>
    </section>
  );
}

export function WelcomeModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h2>Welcome to Wumpus World</h2>
        <p>
          You are a cartoon hero with a sword. Somewhere in this 4×4 cave sits a
          <strong> golden treasure box</strong>. Reach it, carry it home, and climb out.
        </p>
        <ul>
          <li>Easy mode auto-grabs the box when you step on it.</li>
          <li>Tap highlighted neighbor cells to walk.</li>
          <li>Use “Help Me Move” if you get stuck.</li>
        </ul>
        <button type="button" className="btn primary" onClick={onClose}>
          Let’s explore
        </button>
      </div>
    </div>
  );
}
