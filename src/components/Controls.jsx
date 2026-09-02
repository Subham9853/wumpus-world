export default function Controls({
  onAction,
  onAgentStep,
  onToggleAuto,
  onReveal,
  onReset,
  onDifficulty,
  auto,
  reveal,
  difficulty,
  disabled,
}) {
  return (
    <div className="controls">
      <div className="pad" aria-label="Move controls">
        <button type="button" className="pad-btn" disabled={disabled} onClick={() => onAction("forward")} title="Move forward">
          ▲
        </button>
        <button type="button" className="pad-btn" disabled={disabled} onClick={() => onAction("left")} title="Turn left">
          ◀
        </button>
        <button type="button" className="pad-btn primary-pad" disabled={disabled} onClick={() => onAction("grab")} title="Grab treasure">
          Grab
        </button>
        <button type="button" className="pad-btn" disabled={disabled} onClick={() => onAction("right")} title="Turn right">
          ▶
        </button>
        <button type="button" className="pad-btn" disabled={disabled} onClick={() => onAction("shoot")} title="Shoot arrow">
          Shoot
        </button>
        <button type="button" className="pad-btn win-pad" disabled={disabled} onClick={() => onAction("climb")} title="Climb out">
          Climb
        </button>
      </div>

      <div className="actions">
        <button type="button" className="btn primary" disabled={disabled} onClick={onAgentStep}>
          Help Me Move
        </button>
        <button type="button" className={`btn ${auto ? "active" : ""}`} disabled={disabled && !auto} onClick={onToggleAuto}>
          {auto ? "Stop Auto" : "Watch AI Play"}
        </button>
        <button type="button" className={`btn ${reveal ? "active" : ""}`} onClick={onReveal}>
          {reveal ? "Hide Map" : "Peek Map"}
        </button>
        <button type="button" className="btn danger" onClick={onReset}>
          New Cave
        </button>
      </div>

      <div className="difficulty">
        <span>Difficulty</span>
        <button
          type="button"
          className={`chip-btn ${difficulty === "easy" ? "on" : ""}`}
          onClick={() => onDifficulty("easy")}
        >
          Easy
        </button>
        <button
          type="button"
          className={`chip-btn ${difficulty === "classic" ? "on" : ""}`}
          onClick={() => onDifficulty("classic")}
        >
          Classic
        </button>
      </div>
    </div>
  );
}
