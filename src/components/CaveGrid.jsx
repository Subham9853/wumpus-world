import { SIZE, key, neighbors } from "../game/engine";
import { AgentSprite, TreasureBox, WumpusSprite, PitSprite } from "./Sprites";

export default function CaveGrid({
  world,
  agent,
  kb,
  reveal,
  onCellClick,
  selectedCell,
}) {
  const cells = [];

  for (let y = SIZE; y >= 1; y--) {
    for (let x = 1; x <= SIZE; x++) {
      const belief = kb.cells[key(x, y)];
      const isAgent = agent.x === x && agent.y === y;
      const isAdj = neighbors(agent.x, agent.y).some(([nx, ny]) => nx === x && ny === y);
      const selected = selectedCell?.x === x && selectedCell?.y === y;

      const classNames = ["cell"];
      if (belief.visited) classNames.push("visited");
      if (belief.safe && !belief.visited) classNames.push("safe-known");
      if (!belief.safe && (belief.pit === "maybe" || belief.wumpus === "maybe")) {
        classNames.push("risky");
      }
      if (belief.pit === "yes" || belief.wumpus === "yes") classNames.push("deadly");
      if (isAgent) classNames.push("agent-here");
      if (isAdj && agent.alive) classNames.push("clickable");
      if (selected) classNames.push("selected");

      const showSecrets = reveal || !agent.alive;
      const showTreasure =
        !world.treasure.taken &&
        world.treasure.x === x &&
        world.treasure.y === y &&
        (reveal || belief.visited || belief.glitter);

      cells.push(
        <button
          type="button"
          key={key(x, y)}
          className={classNames.join(" ")}
          onClick={() => onCellClick(x, y)}
          aria-label={`Cell ${x},${y}`}
        >
          <span className="cell-coord">
            {x},{y}
          </span>
          <div className="cell-content">
            {(showSecrets || (!agent.alive && world.pits.has(key(x, y)))) &&
              world.pits.has(key(x, y)) && <PitSprite />}
            {(showSecrets || !world.wumpus.alive) &&
              world.wumpus.x === x &&
              world.wumpus.y === y && (
                <WumpusSprite faint={!world.wumpus.alive} />
              )}
            {showTreasure && <TreasureBox pulse={belief.visited || reveal} />}
            {isAgent && <AgentSprite dir={agent.dir} />}
          </div>
          {belief.visited && (
            <div className="percept-markers">
              {belief.breeze && <span className="marker breeze" title="Breeze" />}
              {belief.stench && <span className="marker stench" title="Stench" />}
              {belief.glitter && !world.treasure.taken && (
                <span className="marker glitter" title="Glitter" />
              )}
            </div>
          )}
          {isAdj && agent.alive && !belief.visited && belief.safe && (
            <span className="move-hint">Tap</span>
          )}
        </button>
      );
    }
  }

  return (
    <div className="grid" role="grid" aria-label="Wumpus cave">
      {cells}
    </div>
  );
}
