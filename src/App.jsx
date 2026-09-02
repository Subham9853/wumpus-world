import { useCallback, useEffect, useRef, useState } from "react";
import CaveGrid from "./components/CaveGrid";
import Controls from "./components/Controls";
import {
  MissionTracker,
  TipBanner,
  PerceptBar,
  ScoreBoard,
  KnowledgePanel,
  LogPanel,
  HowToPlay,
  WelcomeModal,
} from "./components/Panels";
import {
  applyAction,
  chooseAgentAction,
  createInitialState,
  actionTowardCell,
  getBeginnerTip,
  key,
} from "./game/engine";
import "./App.css";

let logCounter = 0;

function useGame(difficulty) {
  const [state, setState] = useState(() => createInitialState(difficulty));
  const [logs, setLogs] = useState(() =>
    createInitialState(difficulty).messages.map((text) => ({
      id: ++logCounter,
      text,
    }))
  );
  const [mode, setMode] = useState("Manual");
  const [auto, setAuto] = useState(false);
  const autoRef = useRef(false);

  const pushLogs = useCallback((messages) => {
    if (!messages?.length) return;
    setLogs((prev) => {
      const next = [
        ...messages.map((text) => ({ id: ++logCounter, text })),
        ...prev,
      ];
      return next.slice(0, 50);
    });
  }, []);

  const reset = useCallback(
    (diff = difficulty) => {
      setAuto(false);
      autoRef.current = false;
      const next = createInitialState(diff);
      setState(next);
      setMode("Manual");
      setLogs(next.messages.map((text) => ({ id: ++logCounter, text })));
    },
    [difficulty]
  );

  const runAction = useCallback(
    (action, nextMode = "Manual") => {
      setState((prev) => {
        if (prev.gameOver && action !== undefined) {
          return prev;
        }
        const next = applyAction(action, prev);
        pushLogs(next.messages);
        return { ...next, messages: [] };
      });
      setMode(nextMode);
    },
    [pushLogs]
  );

  const agentStep = useCallback(() => {
    setState((prev) => {
      if (prev.gameOver) return prev;
      const action = chooseAgentAction(prev);
      if (!action) return prev;
      const next = applyAction(action, prev);
      pushLogs(next.messages);
      return { ...next, messages: [] };
    });
    setMode(autoRef.current ? "Auto" : "Coach");
  }, [pushLogs]);

  useEffect(() => {
    if (!auto) return undefined;
    autoRef.current = true;
    const id = setInterval(() => {
      setState((prev) => {
        if (prev.gameOver) {
          setAuto(false);
          autoRef.current = false;
          return prev;
        }
        const action = chooseAgentAction(prev);
        if (!action) {
          setAuto(false);
          autoRef.current = false;
          return prev;
        }
        const next = applyAction(action, prev);
        pushLogs(next.messages);
        if (next.gameOver) {
          setAuto(false);
          autoRef.current = false;
        }
        return { ...next, messages: [] };
      });
      setMode("Auto");
    }, 600);
    return () => clearInterval(id);
  }, [auto, pushLogs]);

  return {
    state,
    setState,
    logs,
    mode,
    auto,
    setAuto,
    reset,
    runAction,
    agentStep,
  };
}

export default function App() {
  const [difficulty, setDifficulty] = useState("easy");
  const [showWelcome, setShowWelcome] = useState(true);
  const {
    state,
    setState,
    logs,
    mode,
    auto,
    setAuto,
    reset,
    runAction,
    agentStep,
  } = useGame(difficulty);

  const onCellClick = (x, y) => {
    if (state.gameOver || !state.agent.alive) return;
    setAuto(false);

    const belief = state.kb.cells[key(x, y)];
    setState((prev) => ({ ...prev, selectedCell: { x, y } }));

    const action = actionTowardCell(state.agent, x, y);
    if (!action) {
      pushSelectHint(belief);
      return;
    }
    runAction(action, "Click");
  };

  const pushSelectHint = (belief) => {
    setState((prev) => ({
      ...prev,
      status: belief.safe
        ? "Tip: tap a square next to your hero to walk there."
        : "That cell looks risky. Prefer Safe (green) neighbors.",
    }));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (state.gameOver) return;
      const map = {
        ArrowUp: "forward",
        w: "forward",
        W: "forward",
        ArrowLeft: "left",
        a: "left",
        A: "left",
        ArrowRight: "right",
        d: "right",
        D: "right",
        g: "grab",
        G: "grab",
        " ": "shoot",
        c: "climb",
        C: "climb",
      };
      if (map[e.key]) {
        e.preventDefault();
        setAuto(false);
        runAction(map[e.key], "Keyboard");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runAction, state.gameOver]);

  const tip = getBeginnerTip(state);

  return (
    <div className="app">
      <WelcomeModal open={showWelcome} onClose={() => setShowWelcome(false)} />

      <header className="header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="currentColor"
                d="M13.5 2l1.5 4 4 .5-3 3 .9 4.5-3.9-2.2L9.1 14l.9-4.5-3-3 4-.5L13.5 2zM4 18l4-1 7-7 1 1-7 7-1 4-4-4z"
              />
            </svg>
          </span>
          <h1>Wumpus World</h1>
        </div>
        <p className="tagline">
          Find the golden treasure box with your sword hero — a beginner-friendly AI cave adventure.
        </p>
      </header>

      <MissionTracker state={state} />

      <main className="layout">
        <section className="stage">
          <div className="stage-top">
            <ScoreBoard agent={state.agent} mode={mode} />
            <div className="legend">
              <span>
                <i className="swatch gold" />
                Treasure
              </span>
              <span>
                <i className="swatch safe" />
                Safe
              </span>
              <span>
                <i className="swatch danger" />
                Risky
              </span>
              <span>
                <i className="swatch pit" />
                Pit
              </span>
              <span>
                <i className="swatch wumpus" />
                Wumpus
              </span>
            </div>
          </div>

          <TipBanner tip={tip} status={state.status} />

          <div className="cave-frame">
            <CaveGrid
              world={state.world}
              agent={state.agent}
              kb={state.kb}
              reveal={state.reveal}
              selectedCell={state.selectedCell}
              onCellClick={onCellClick}
            />
          </div>

          <PerceptBar agent={state.agent} world={state.world} />

          <Controls
            disabled={state.gameOver}
            auto={auto}
            reveal={state.reveal}
            difficulty={difficulty}
            onAction={(a) => {
              setAuto(false);
              runAction(a, "Manual");
            }}
            onAgentStep={() => {
              setAuto(false);
              agentStep();
            }}
            onToggleAuto={() => setAuto((v) => !v)}
            onReveal={() =>
              setState((prev) => ({ ...prev, reveal: !prev.reveal }))
            }
            onReset={() => reset(difficulty)}
            onDifficulty={(d) => {
              setDifficulty(d);
              reset(d);
            }}
          />
        </section>

        <aside className="sidebar">
          <KnowledgePanel kb={state.kb} agent={state.agent} />
          <LogPanel logs={logs} />
          <HowToPlay />
        </aside>
      </main>
    </div>
  );
}
