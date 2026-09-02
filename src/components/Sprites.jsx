export function AgentSprite({ dir }) {
  return (
    <div className={`agent dir-${dir}`} title="Sword hero">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <g>
          <rect x="44" y="10" width="4" height="28" rx="1" fill="#c5d0d8" stroke="#6a7884" strokeWidth="1" />
          <polygon points="46,6 42,12 50,12" fill="#e8eef2" stroke="#6a7884" strokeWidth="1" />
          <rect x="40" y="34" width="12" height="4" rx="1" fill="#8b5a2b" />
          <rect x="44.5" y="38" width="3" height="8" rx="1" fill="#6b4420" />
        </g>
        <ellipse cx="24" cy="54" rx="7" ry="4" fill="#3d2a1c" />
        <ellipse cx="36" cy="54" rx="7" ry="4" fill="#3d2a1c" />
        <rect x="19" y="40" width="10" height="14" rx="3" fill="#2a5f8a" />
        <rect x="31" y="40" width="10" height="14" rx="3" fill="#2a5f8a" />
        <rect x="16" y="24" width="28" height="20" rx="8" fill="#3d8b6e" />
        <rect x="20" y="28" width="20" height="8" rx="3" fill="#f0d48a" />
        <rect x="8" y="26" width="10" height="8" rx="4" fill="#f0c9a0" />
        <rect x="42" y="24" width="10" height="14" rx="4" fill="#f0c9a0" />
        <circle cx="30" cy="16" r="11" fill="#f0c9a0" />
        <circle cx="26" cy="15" r="1.6" fill="#1a2a28" />
        <circle cx="34" cy="15" r="1.6" fill="#1a2a28" />
        <path d="M26 20 Q30 23 34 20" fill="none" stroke="#c45c2a" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 12 Q30 2 40 12 Q30 8 20 12" fill="#1e4634" />
        <path d="M18 28 Q10 38 16 46" fill="none" stroke="#c45c2a" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      </svg>
    </div>
  );
}

export function TreasureBox({ pulse = false }) {
  return (
    <div className={`treasure-box ${pulse ? "pulse" : ""}`} title="Golden treasure box">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="10" y="28" width="44" height="26" rx="4" fill="#e6b422" stroke="#8a6a12" strokeWidth="2" />
        <rect x="10" y="28" width="44" height="10" rx="3" fill="#f3d35a" stroke="#8a6a12" strokeWidth="1.5" />
        <rect x="28" y="34" width="8" height="12" rx="2" fill="#fff1a8" stroke="#8a6a12" strokeWidth="1" />
        <circle cx="32" cy="40" r="2.5" fill="#c45c2a" />
        <rect x="16" y="18" width="32" height="12" rx="3" fill="#f0c84a" stroke="#8a6a12" strokeWidth="1.5" />
        <path d="M32 8 L34 16 H30 Z" fill="#fff6c8" />
        <path d="M22 14 L24 18 H20 Z" fill="#fff6c8" opacity="0.8" />
        <path d="M42 14 L44 18 H40 Z" fill="#fff6c8" opacity="0.8" />
      </svg>
    </div>
  );
}

export function WumpusSprite({ faint = false }) {
  return (
    <div className="wumpus-sprite" style={{ opacity: faint ? 0.35 : 1 }} title="Wumpus">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <ellipse cx="32" cy="38" rx="18" ry="16" fill="#8b3a2f" />
        <circle cx="32" cy="22" r="12" fill="#a34438" />
        <circle cx="27" cy="20" r="2.2" fill="#f0e6a0" />
        <circle cx="37" cy="20" r="2.2" fill="#f0e6a0" />
        <circle cx="27" cy="20" r="1" fill="#1a1010" />
        <circle cx="37" cy="20" r="1" fill="#1a1010" />
        <path d="M26 27 Q32 31 38 27" fill="none" stroke="#3a1814" strokeWidth="2" />
        <path d="M18 14 L22 20 L14 20 Z" fill="#5a2018" />
        <path d="M46 14 L50 20 L42 20 Z" fill="#5a2018" />
      </svg>
    </div>
  );
}

export function PitSprite() {
  return (
    <div className="pit-sprite" title="Pit">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <ellipse cx="32" cy="34" rx="20" ry="14" fill="#1a1410" stroke="#5a4a3a" strokeWidth="2" />
        <ellipse cx="32" cy="34" rx="12" ry="8" fill="#0a0806" />
      </svg>
    </div>
  );
}
