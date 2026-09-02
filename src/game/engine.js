export const SIZE = 4;

export const DIRS = [
  { name: "East", dx: 1, dy: 0, arrow: "→" },
  { name: "North", dx: 0, dy: 1, arrow: "↑" },
  { name: "West", dx: -1, dy: 0, arrow: "←" },
  { name: "South", dx: 0, dy: -1, arrow: "↓" },
];

export function key(x, y) {
  return `${x},${y}`;
}

export function inBounds(x, y) {
  return x >= 1 && x <= SIZE && y >= 1 && y <= SIZE;
}

export function neighbors(x, y) {
  return [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ].filter(([nx, ny]) => inBounds(nx, ny));
}

function randInt(n) {
  return Math.floor(Math.random() * n);
}

function randomEmptyCell(exclude) {
  const cells = [];
  for (let x = 1; x <= SIZE; x++) {
    for (let y = 1; y <= SIZE; y++) {
      if (!exclude.has(key(x, y))) cells.push([x, y]);
    }
  }
  return cells[randInt(cells.length)];
}

/** Easy mode: at most 1 pit, safer start neighborhood */
export function createWorld(difficulty = "easy") {
  const pits = new Set();
  const exclude = new Set([key(1, 1), key(2, 1), key(1, 2)]);

  const pitChance = difficulty === "easy" ? 0.08 : 0.2;
  const maxPits = difficulty === "easy" ? 1 : 3;
  let pitCount = 0;

  for (let x = 1; x <= SIZE; x++) {
    for (let y = 1; y <= SIZE; y++) {
      if (exclude.has(key(x, y))) continue;
      if (pitCount >= maxPits) continue;
      if (Math.random() < pitChance) {
        pits.add(key(x, y));
        exclude.add(key(x, y));
        pitCount += 1;
      }
    }
  }

  // Guarantee at least some challenge on easy: if zero pits, place one far away
  if (difficulty === "easy" && pitCount === 0) {
    const far = randomEmptyCell(exclude);
    if (far) {
      pits.add(key(far[0], far[1]));
      exclude.add(key(far[0], far[1]));
    }
  }

  const [wx, wy] = randomEmptyCell(exclude);
  exclude.add(key(wx, wy));
  const [gx, gy] = randomEmptyCell(exclude);

  return {
    pits,
    wumpus: { x: wx, y: wy, alive: true },
    treasure: { x: gx, y: gy, taken: false },
    difficulty,
  };
}

export function createAgent() {
  return {
    x: 1,
    y: 1,
    dir: 0,
    alive: true,
    hasTreasure: false,
    hasArrow: true,
    score: 0,
    steps: 0,
    bumped: false,
    screamed: false,
  };
}

export function createKB() {
  const cells = {};
  for (let x = 1; x <= SIZE; x++) {
    for (let y = 1; y <= SIZE; y++) {
      cells[key(x, y)] = {
        x,
        y,
        visited: false,
        breeze: false,
        stench: false,
        glitter: false,
        pit: "unknown",
        wumpus: "unknown",
        safe: x === 1 && y === 1,
      };
    }
  }
  // Easy start: mark entrance neighbors safer for beginners after first look
  for (const k of [key(1, 1)]) {
    cells[k].pit = "no";
    cells[k].wumpus = "no";
    cells[k].safe = true;
    cells[k].visited = true;
  }
  return { cells, wumpusAlive: true, wumpusFound: null };
}

export function getPercepts(agent, world) {
  const { x, y } = agent;
  let stench = false;
  let breeze = false;
  let glitter = false;

  if (world.wumpus.alive) {
    for (const [nx, ny] of neighbors(x, y)) {
      if (nx === world.wumpus.x && ny === world.wumpus.y) stench = true;
    }
    if (x === world.wumpus.x && y === world.wumpus.y) stench = true;
  }

  for (const [nx, ny] of neighbors(x, y)) {
    if (world.pits.has(key(nx, ny))) breeze = true;
  }

  if (!world.treasure.taken && x === world.treasure.x && y === world.treasure.y) {
    glitter = true;
  }

  return {
    stench,
    breeze,
    glitter,
    bump: agent.bumped,
    scream: agent.screamed,
  };
}

export function updateKB(kb, agent, percepts, messages = []) {
  const next = structuredClone(kb);
  const cell = next.cells[key(agent.x, agent.y)];
  cell.visited = true;
  cell.safe = true;
  cell.pit = "no";
  cell.wumpus = "no";
  cell.breeze = percepts.breeze;
  cell.stench = percepts.stench;
  cell.glitter = percepts.glitter;

  if (percepts.scream) {
    next.wumpusAlive = false;
    for (const c of Object.values(next.cells)) {
      if (c.wumpus !== "yes") c.wumpus = "no";
    }
    next.wumpusFound = null;
    messages.push("You heard a scream — the Wumpus is gone!");
  }

  if (!percepts.breeze) {
    for (const [nx, ny] of neighbors(agent.x, agent.y)) {
      const n = next.cells[key(nx, ny)];
      if (n.pit === "unknown") n.pit = "no";
    }
  }

  if (!percepts.stench && next.wumpusAlive) {
    for (const [nx, ny] of neighbors(agent.x, agent.y)) {
      const n = next.cells[key(nx, ny)];
      if (n.wumpus === "unknown") n.wumpus = "no";
    }
  }

  if (percepts.breeze) {
    const candidates = neighbors(agent.x, agent.y)
      .map(([nx, ny]) => next.cells[key(nx, ny)])
      .filter((c) => c.pit !== "no");
    if (candidates.length === 1) {
      candidates[0].pit = "yes";
      candidates[0].safe = false;
      messages.push(`Pit found next door at (${candidates[0].x},${candidates[0].y}).`);
    } else {
      for (const c of candidates) {
        if (c.pit === "unknown") c.pit = "maybe";
      }
    }
  }

  if (percepts.stench && next.wumpusAlive) {
    const candidates = neighbors(agent.x, agent.y)
      .map(([nx, ny]) => next.cells[key(nx, ny)])
      .filter((c) => c.wumpus !== "no");
    if (candidates.length === 1) {
      candidates[0].wumpus = "yes";
      candidates[0].safe = false;
      next.wumpusFound = { x: candidates[0].x, y: candidates[0].y };
      messages.push(`Wumpus located at (${candidates[0].x},${candidates[0].y}).`);
    } else {
      for (const c of candidates) {
        if (c.wumpus === "unknown") c.wumpus = "maybe";
      }
    }
  }

  if (next.wumpusAlive && !next.wumpusFound) {
    const possible = Object.values(next.cells).filter(
      (c) => c.wumpus === "maybe" || c.wumpus === "unknown"
    );
    const stenchCells = Object.values(next.cells).filter((c) => c.stench && c.visited);
    if (stenchCells.length > 0) {
      const refined = possible.filter(
        (c) =>
          !c.visited &&
          c.wumpus !== "no" &&
          stenchCells.every((s) =>
            neighbors(s.x, s.y).some(([nx, ny]) => nx === c.x && ny === c.y)
          )
      );
      if (refined.length === 1) {
        refined[0].wumpus = "yes";
        refined[0].safe = false;
        next.wumpusFound = { x: refined[0].x, y: refined[0].y };
        for (const c of Object.values(next.cells)) {
          if (c !== refined[0] && c.wumpus !== "yes") c.wumpus = "no";
        }
        messages.push(
          `Wumpus pinpointed at (${refined[0].x},${refined[0].y}).`
        );
      }
    }
  }

  for (const c of Object.values(next.cells)) {
    if (c.pit === "no" && (c.wumpus === "no" || !next.wumpusAlive)) {
      c.safe = true;
    } else if (c.pit === "yes" || c.wumpus === "yes") {
      c.safe = false;
    } else if (c.pit === "maybe" || c.wumpus === "maybe") {
      c.safe = false;
    }
  }
  next.cells[key(1, 1)].safe = true;

  return { kb: next, messages };
}

function checkHazard(agent, world, messages) {
  const nextAgent = { ...agent };
  let gameOver = false;
  let status = null;

  if (world.pits.has(key(nextAgent.x, nextAgent.y))) {
    nextAgent.alive = false;
    nextAgent.score -= 1000;
    gameOver = true;
    messages.push(`Oh no — fell into a pit at (${nextAgent.x},${nextAgent.y}).`);
    status = "You fell into a pit. Tap New Cave to try again.";
  } else if (
    world.wumpus.alive &&
    nextAgent.x === world.wumpus.x &&
    nextAgent.y === world.wumpus.y
  ) {
    nextAgent.alive = false;
    nextAgent.score -= 1000;
    gameOver = true;
    messages.push(`The Wumpus caught you at (${nextAgent.x},${nextAgent.y}).`);
    status = "The Wumpus got you. Tap New Cave to try again.";
  }

  return { agent: nextAgent, gameOver, status };
}

export function applyAction(action, state) {
  if (state.gameOver) return { ...state, messages: [] };

  const messages = [];
  let agent = {
    ...state.agent,
    bumped: false,
    screamed: false,
    steps: state.agent.steps + 1,
    score: state.agent.score - 1,
  };
  let world = {
    ...state.world,
    pits: new Set(state.world.pits),
    wumpus: { ...state.world.wumpus },
    treasure: { ...state.world.treasure },
  };
  let gameOver = false;
  let won = false;
  let status = state.status;

  switch (action) {
    case "left":
      agent.dir = (agent.dir + 1) % 4;
      messages.push(`Turned left. Facing ${DIRS[agent.dir].name}.`);
      break;
    case "right":
      agent.dir = (agent.dir + 3) % 4;
      messages.push(`Turned right. Facing ${DIRS[agent.dir].name}.`);
      break;
    case "forward": {
      const d = DIRS[agent.dir];
      const nx = agent.x + d.dx;
      const ny = agent.y + d.dy;
      if (!inBounds(nx, ny)) {
        agent.bumped = true;
        messages.push("Bump! That’s a wall.");
      } else {
        agent.x = nx;
        agent.y = ny;
        messages.push(`Moved to (${nx},${ny}).`);
        const hazard = checkHazard(agent, world, messages);
        agent = hazard.agent;
        gameOver = hazard.gameOver;
        if (hazard.status) status = hazard.status;
      }
      break;
    }
    case "grab":
      if (
        !world.treasure.taken &&
        agent.x === world.treasure.x &&
        agent.y === world.treasure.y
      ) {
        world.treasure.taken = true;
        agent.hasTreasure = true;
        messages.push("You picked up the golden treasure box!");
        status = "Treasure secured! Walk back to (1,1) and climb out.";
      } else {
        messages.push("No treasure here to grab.");
      }
      break;
    case "shoot": {
      if (!agent.hasArrow) {
        messages.push("You already used your arrow.");
        break;
      }
      agent.hasArrow = false;
      agent.score -= 10;
      const d = DIRS[agent.dir];
      let hx = agent.x;
      let hy = agent.y;
      let hit = false;
      while (true) {
        hx += d.dx;
        hy += d.dy;
        if (!inBounds(hx, hy)) break;
        if (world.wumpus.alive && hx === world.wumpus.x && hy === world.wumpus.y) {
          world.wumpus.alive = false;
          agent.screamed = true;
          hit = true;
          break;
        }
      }
      messages.push(hit ? "Hit! The Wumpus screams." : "Arrow missed.");
      break;
    }
    case "climb":
      if (agent.x === 1 && agent.y === 1) {
        if (agent.hasTreasure) {
          agent.score += 1000;
          gameOver = true;
          won = true;
          messages.push("Climbed out with the treasure. You win!");
          status = "Victory! You escaped with the golden treasure.";
        } else {
          gameOver = true;
          messages.push("Climbed out without the treasure.");
          status = "You left without the treasure. Try again!";
        }
      } else {
        messages.push("Climb only works at the entrance (1,1).");
      }
      break;
    default:
      break;
  }

  // Auto-grab on easy when stepping onto treasure
  if (
    agent.alive &&
    !gameOver &&
    world.difficulty === "easy" &&
    !world.treasure.taken &&
    agent.x === world.treasure.x &&
    agent.y === world.treasure.y
  ) {
    world.treasure.taken = true;
    agent.hasTreasure = true;
    messages.push("Sparkles! You automatically grabbed the golden treasure box.");
    status = "Treasure secured! Walk back to (1,1) and climb out.";
  }

  let kb = state.kb;
  if (agent.alive) {
    const percepts = getPercepts(agent, world);
    const updated = updateKB(kb, agent, percepts, messages);
    kb = updated.kb;
  }

  return {
    ...state,
    agent,
    world,
    kb,
    gameOver,
    won,
    status,
    messages,
  };
}

function pathTo(from, to, kb) {
  const start = key(from.x, from.y);
  const goal = key(to.x, to.y);
  const queue = [[from.x, from.y]];
  const prev = { [start]: null };

  while (queue.length) {
    const [x, y] = queue.shift();
    if (key(x, y) === goal) break;
    for (const [nx, ny] of neighbors(x, y)) {
      const k = key(nx, ny);
      const cell = kb.cells[k];
      if (prev[k] !== undefined) continue;
      if (!cell.safe && k !== goal) continue;
      prev[k] = [x, y];
      queue.push([nx, ny]);
    }
  }

  if (prev[goal] === undefined && start !== goal) return null;

  const path = [];
  let cur = goal;
  while (cur !== start) {
    const [cx, cy] = cur.split(",").map(Number);
    path.unshift({ x: cx, y: cy });
    const p = prev[cur];
    if (!p) break;
    cur = key(p[0], p[1]);
  }
  return path;
}

function turnToward(agent, targetDir) {
  const diff = (targetDir - agent.dir + 4) % 4;
  if (diff === 0) return null;
  if (diff === 1) return "left";
  if (diff === 3) return "right";
  return "left";
}

function dirToFace(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 1) return 0;
  if (dy === 1) return 1;
  if (dx === -1) return 2;
  if (dy === -1) return 3;
  return from.dir ?? 0;
}

function nextTowardCell(agent, cell) {
  const need = dirToFace(agent, cell);
  const turn = turnToward(agent, need);
  if (turn) return turn;
  return "forward";
}

export function chooseAgentAction(state) {
  const { agent, kb } = state;
  if (state.gameOver || !agent.alive) return null;

  const here = kb.cells[key(agent.x, agent.y)];
  if (here.glitter && !agent.hasTreasure) return "grab";

  if (agent.hasTreasure) {
    if (agent.x === 1 && agent.y === 1) return "climb";
    const path = pathTo(agent, { x: 1, y: 1 }, kb);
    if (path && path.length) return nextTowardCell(agent, path[0]);
  }

  if (agent.hasArrow && kb.wumpusFound && kb.wumpusAlive) {
    const w = kb.wumpusFound;
    const sameRow = w.y === agent.y;
    const sameCol = w.x === agent.x;
    if (sameRow || sameCol) {
      let targetDir = agent.dir;
      if (sameRow) targetDir = w.x > agent.x ? 0 : 2;
      if (sameCol) targetDir = w.y > agent.y ? 1 : 3;
      const turn = turnToward(agent, targetDir);
      if (turn) return turn;
      return "shoot";
    }
  }

  const targets = Object.values(kb.cells)
    .filter((c) => c.safe && !c.visited)
    .map((c) => ({
      cell: c,
      dist: Math.abs(c.x - agent.x) + Math.abs(c.y - agent.y),
    }))
    .sort((a, b) => a.dist - b.dist);

  for (const t of targets) {
    const path = pathTo(agent, t.cell, kb);
    if (path && path.length) return nextTowardCell(agent, path[0]);
  }

  const risky = Object.values(kb.cells)
    .filter(
      (c) =>
        !c.visited &&
        c.pit !== "yes" &&
        c.wumpus !== "yes" &&
        (c.pit === "maybe" || c.wumpus === "maybe" || c.pit === "unknown")
    )
    .sort((a, b) => {
      const risk = (c) =>
        (c.pit === "maybe" ? 2 : 0) +
        (c.wumpus === "maybe" ? 3 : 0) +
        (c.pit === "unknown" && c.wumpus === "unknown" ? 1 : 0);
      return (
        risk(a) - risk(b) ||
        Math.abs(a.x - agent.x) +
          Math.abs(a.y - agent.y) -
          (Math.abs(b.x - agent.x) + Math.abs(b.y - agent.y))
      );
    });

  for (const c of risky) {
    const adj = neighbors(agent.x, agent.y).some(
      ([nx, ny]) => nx === c.x && ny === c.y
    );
    if (adj) return nextTowardCell(agent, c);
    const softKb = {
      cells: Object.fromEntries(
        Object.entries(kb.cells).map(([k, v]) => [
          k,
          { ...v, safe: v.safe || (v.x === c.x && v.y === c.y) },
        ])
      ),
    };
    const path = pathTo(agent, { x: c.x, y: c.y }, softKb);
    if (path && path.length) return nextTowardCell(agent, path[0]);
  }

  if (agent.x === 1 && agent.y === 1) return "climb";
  const home = pathTo(agent, { x: 1, y: 1 }, kb);
  if (home && home.length) return nextTowardCell(agent, home[0]);
  return "left";
}

/** Click an adjacent cell: turn/move toward it */
export function actionTowardCell(agent, tx, ty) {
  if (!inBounds(tx, ty)) return null;
  const dx = tx - agent.x;
  const dy = ty - agent.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1) return null;
  const need = dirToFace(agent, { x: tx, y: ty });
  const turn = turnToward(agent, need);
  if (turn) return turn;
  return "forward";
}

export function getBeginnerTip(state) {
  const { agent, kb, world, gameOver, won } = state;
  if (gameOver && won) return "Great job! Start a New Cave whenever you want.";
  if (gameOver) return "Don’t worry — tap New Cave and try a safer path.";
  if (!agent.alive) return "The cave is dangerous. Use breeze and stench warnings.";

  if (agent.hasTreasure) {
    if (agent.x === 1 && agent.y === 1) {
      return "You’re home with the treasure — tap Climb to win!";
    }
    return "You have the treasure! Follow safe cells back to the entrance (1,1).";
  }

  const here = kb.cells[key(agent.x, agent.y)];
  if (here.glitter) return "The golden box is here! Tap Grab (or it auto-grabs on Easy).";
  if (here.breeze) return "Feel a breeze? A pit is in a neighboring cell — avoid risky squares.";
  if (here.stench) return "Smell a stench? The Wumpus is nearby. Stay on Safe cells.";

  const safeUnvisited = Object.values(kb.cells).filter((c) => c.safe && !c.visited);
  if (safeUnvisited.length) {
    return "Tip: click a green Safe neighbor, or use the arrows. Hunt for glitter!";
  }

  if (!world.treasure.taken) {
    return "Explore carefully. When you see glitter, you’ve found the golden treasure box.";
  }
  return "Keep moving onto Safe cells. The knowledge map updates as you explore.";
}

export function missionStep(state) {
  if (state.won) return 4;
  if (state.agent.hasTreasure && state.agent.x === 1 && state.agent.y === 1) return 3;
  if (state.agent.hasTreasure) return 2;
  return 1;
}

export function createInitialState(difficulty = "easy") {
  const world = createWorld(difficulty);
  const agent = createAgent();
  let kb = createKB();
  const percepts = getPercepts(agent, world);
  const updated = updateKB(kb, agent, percepts, []);
  kb = updated.kb;

  return {
    world,
    agent,
    kb,
    reveal: false,
    gameOver: false,
    won: false,
    status: "Find the golden treasure box, then climb out at (1,1).",
    messages: ["Welcome! Your sword-hero starts at (1,1). The treasure is hidden somewhere in the cave."],
    difficulty,
    selectedCell: null,
  };
}
