# Wumpus World

## About

Wumpus World is a beginner-friendly React game inspired by the classic Wumpus World AI problem. Explore a 4x4 cave, use breeze and stench clues to reason about hazards, find the golden treasure, and return to the entrance safely.

## Features

- Easy and Classic difficulty modes
- Manual keyboard and button controls
- Click safe neighboring cells to move
- Knowledge map showing the agent's current beliefs
- AI assistance and automatic play mode
- Treasure, pit, Wumpus, arrow, score, and mission tracking

## Run Locally

Requirements: Node.js 18 or newer.

```powershell
npm install
npm.cmd run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## Production Build

```powershell
npm.cmd run build
```

The generated game is in `dist/`. Because asset paths are relative, `dist/index.html` can also be opened directly.

## Controls

- Arrow keys or `WASD`: move and turn
- `G`: grab treasure
- `Space`: shoot the arrow
- `C`: climb out at the entrance
- **Help Me Move**: take one AI-guided action
- **Watch AI Play**: let the agent play automatically

## Project Structure

- `src/game/engine.js`: world generation, game rules, percepts, and AI behavior
- `src/components/`: game grid, controls, panels, and sprites
- `src/App.jsx`: application state and game orchestration
- `src/App.css`: visual styling and responsive layout
