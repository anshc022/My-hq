// ─── Agent face SVG avatars ───
// Shared across AgentsWorking and OfficeCanvas mission bar

export const AGENT_FACES = {
  echo: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="24" r="12" fill="#FFD5A0" />
      <path d="M10 18 Q12 8 18 10 Q20 4 22 6 Q24 2 26 6 Q28 4 30 10 Q34 8 34 18" fill="#2244AA" />
      <ellipse cx="18" cy="24" rx="2" ry="2.2" fill="#fff" />
      <ellipse cx="26" cy="24" rx="2" ry="2.2" fill="#fff" />
      <circle cx="18.5" cy="24.5" r="1" fill="#111" />
      <circle cx="26.5" cy="24.5" r="1" fill="#111" />
      <path d="M19 29 Q22 32 25 29" stroke="#c0392b" strokeWidth="1.2" fill="none" />
      <path d="M9 22 Q9 14 22 13 Q35 14 35 22" stroke="#3a7bd5" strokeWidth="2.5" fill="none" />
      <rect x="7" y="20" width="4" height="6" rx="1.5" fill="#3a7bd5" />
    </svg>
  ),
  flare: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="24" r="12" fill="#FFDBB4" />
      <path d="M10 20 Q10 8 22 7 Q34 8 34 20 L34 34 Q32 32 30 34 L30 20 Q30 12 22 11 Q14 12 14 20 L14 34 Q12 32 10 34 Z" fill="#FF6B9D" />
      <ellipse cx="18" cy="24" rx="2" ry="2.5" fill="#fff" />
      <ellipse cx="26" cy="24" rx="2" ry="2.5" fill="#fff" />
      <circle cx="18" cy="24.5" r="1.1" fill="#2a1a3a" />
      <circle cx="26" cy="24.5" r="1.1" fill="#2a1a3a" />
      <line x1="16" y1="21.5" x2="14.5" y2="20" stroke="#FF6B9D" strokeWidth="0.8" />
      <line x1="28" y1="21.5" x2="29.5" y2="20" stroke="#FF6B9D" strokeWidth="0.8" />
      <path d="M19 29 Q22 32 25 29" stroke="#c0392b" strokeWidth="1.2" fill="none" />
      <circle cx="15" cy="27" r="2" fill="#FFB6C1" opacity="0.4" />
      <circle cx="29" cy="27" r="2" fill="#FFB6C1" opacity="0.4" />
    </svg>
  ),
  bolt: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="24" r="12" fill="#FFE0BD" />
      <rect x="18" y="4" width="8" height="14" rx="3" fill="#F7DC6F" />
      <rect x="19" y="2" width="6" height="6" rx="2" fill="#f9e88c" />
      <circle cx="17" cy="24" r="4" stroke="#FFD700" strokeWidth="1.8" fill="none" />
      <circle cx="27" cy="24" r="4" stroke="#FFD700" strokeWidth="1.8" fill="none" />
      <line x1="21" y1="24" x2="23" y2="24" stroke="#FFD700" strokeWidth="1.5" />
      <line x1="13" y1="23" x2="11" y2="21" stroke="#FFD700" strokeWidth="1.2" />
      <line x1="31" y1="23" x2="33" y2="21" stroke="#FFD700" strokeWidth="1.2" />
      <circle cx="17" cy="24.5" r="1" fill="#111" />
      <circle cx="27" cy="24.5" r="1" fill="#111" />
      <path d="M18 30 Q22 33 26 30" stroke="#c0392b" strokeWidth="1.2" fill="none" />
    </svg>
  ),
  nexus: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="24" r="12" fill="#C68642" />
      <path d="M10 20 Q10 10 22 9 Q34 10 34 20 L32 20 Q32 14 22 13 Q12 14 12 20 Z" fill="#2c3e50" />
      <rect x="8" y="18" width="16" height="3" rx="1" fill="#2c3e50" />
      <ellipse cx="18" cy="25" rx="2" ry="2" fill="#fff" />
      <ellipse cx="26" cy="25" rx="2" ry="2" fill="#fff" />
      <circle cx="18.5" cy="25.3" r="1" fill="#111" />
      <circle cx="26.5" cy="25.3" r="1" fill="#111" />
      <path d="M20 30 Q22 32 24 30" stroke="#8a4a2a" strokeWidth="1.2" fill="none" />
      <path d="M9 23 Q9 16 22 15 Q35 16 35 23" stroke="#27ae60" strokeWidth="2" fill="none" />
      <rect x="7" y="21" width="3.5" height="5" rx="1.5" fill="#27ae60" />
    </svg>
  ),
  vigil: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="24" r="12" fill="#D4A06A" />
      <path d="M10 20 Q10 10 22 8 Q34 10 34 20 L32 18 Q30 12 22 11 Q14 12 12 18 Z" fill="#E74C3C" />
      <rect x="15" y="23" width="5" height="3" rx="1.5" fill="#fff" />
      <rect x="24" y="23" width="5" height="3" rx="1.5" fill="#fff" />
      <circle cx="17.5" cy="24.5" r="1.2" fill="#111" />
      <circle cx="26.5" cy="24.5" r="1.2" fill="#111" />
      <line x1="14" y1="21" x2="20" y2="22" stroke="#a03020" strokeWidth="1.5" />
      <line x1="30" y1="21" x2="24" y2="22" stroke="#a03020" strokeWidth="1.5" />
      <line x1="19" y1="30" x2="25" y2="30" stroke="#8a4a2a" strokeWidth="1.2" />
      <line x1="30" y1="20" x2="32" y2="26" stroke="#c0392b" strokeWidth="0.8" opacity="0.5" />
    </svg>
  ),
  forge: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="24" r="12" fill="#FFD5A0" />
      <path d="M12 22 Q12 10 22 9 Q32 10 32 22" fill="#FFD5A0" />
      <ellipse cx="22" cy="12" rx="3" ry="1.5" fill="#ffe8c0" opacity="0.6" />
      <ellipse cx="18" cy="25" rx="2" ry="2" fill="#fff" />
      <ellipse cx="26" cy="25" rx="2" ry="2" fill="#fff" />
      <circle cx="18.3" cy="25.3" r="1.1" fill="#111" />
      <circle cx="26.3" cy="25.3" r="1.1" fill="#111" />
      <rect x="15" y="21.5" width="6" height="1.5" rx="0.5" fill="#8a5a20" />
      <rect x="23" y="21.5" width="6" height="1.5" rx="0.5" fill="#8a5a20" />
      <path d="M16 30 Q22 35 28 30" fill="#d4a868" opacity="0.3" />
      <path d="M19 31 Q22 33 25 31" stroke="#c0392b" strokeWidth="1.2" fill="none" />
    </svg>
  ),
};
