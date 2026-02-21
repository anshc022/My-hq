// ─── Agent face SVG avatars ───
// Bold cartoon style — visible at all sizes

export const AGENT_FACES = {
  // ─── Echo — Tech Lead: blue spiky hair, headset, leader vibe ───
  echo: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#0f1a3d" />
      {/* Shoulders */}
      <ellipse cx="32" cy="64" rx="26" ry="14" fill="#2955a8" />
      <ellipse cx="32" cy="64" rx="22" ry="12" fill="#3a6fd8" />
      {/* Neck */}
      <rect x="26" y="44" width="12" height="7" rx="4" fill="#f5c58a" />
      {/* Head */}
      <ellipse cx="32" cy="34" rx="15" ry="17" fill="#f5c58a" />
      {/* Spiky blue hair */}
      <path d="M14 28 C14 14 22 6 32 6 C42 6 50 14 50 28 C48 20 40 12 32 12 C24 12 16 20 14 28 Z" fill="#2955a8" />
      <polygon points="18,16 14,4 23,14" fill="#2955a8" />
      <polygon points="24,10 22,0 28,10" fill="#2955a8" />
      <polygon points="30,8 30,-2 34,8" fill="#3a6fd8" />
      <polygon points="36,8 38,0 40,10" fill="#2955a8" />
      <polygon points="42,10 46,2 44,14" fill="#2955a8" />
      <polygon points="46,16 50,6 48,18" fill="#3a6fd8" />
      {/* Eyes */}
      <ellipse cx="25" cy="32" rx="4.5" ry="5" fill="#fff" />
      <ellipse cx="39" cy="32" rx="4.5" ry="5" fill="#fff" />
      <circle cx="26.5" cy="33" r="3" fill="#1a3a7a" />
      <circle cx="40.5" cy="33" r="3" fill="#1a3a7a" />
      <circle cx="27.5" cy="31.5" r="1.2" fill="#fff" />
      <circle cx="41.5" cy="31.5" r="1.2" fill="#fff" />
      {/* Bold eyebrows */}
      <path d="M20 26 Q25 23 30 26" stroke="#152a5a" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M34 26 Q39 23 44 26" stroke="#152a5a" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Confident smirk */}
      <path d="M26 41 Q32 46 38 41" stroke="#a03020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Headset */}
      <path d="M10 30 Q10 14 32 12 Q54 14 54 30" stroke="#4fc3f7" strokeWidth="4" fill="none" />
      <rect x="6" y="26" width="7" height="10" rx="3.5" fill="#4fc3f7" />
      <rect x="51" y="26" width="7" height="10" rx="3.5" fill="#4fc3f7" />
      <rect x="5" y="36" width="8" height="4" rx="2" fill="#2a8ac4" />
    </svg>
  ),

  // ─── Flare — UI/UX: pink hair, big eyes, artistic ───
  flare: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#2e0e22" />
      {/* Shoulders */}
      <ellipse cx="32" cy="64" rx="24" ry="13" fill="#c44070" />
      <ellipse cx="32" cy="64" rx="20" ry="11" fill="#ff6b9d" />
      {/* Neck */}
      <rect x="26" y="44" width="12" height="7" rx="4" fill="#ffd4a8" />
      {/* Long flowing hair behind */}
      <ellipse cx="14" cy="42" rx="6" ry="18" fill="#ff6b9d" />
      <ellipse cx="50" cy="42" rx="6" ry="18" fill="#ff6b9d" />
      {/* Head */}
      <ellipse cx="32" cy="34" rx="15" ry="17" fill="#ffd4a8" />
      {/* Hair top + sides */}
      <path d="M14 28 C14 12 22 5 32 5 C42 5 50 12 50 28 C48 18 40 10 32 10 C24 10 16 18 14 28 Z" fill="#ff6b9d" />
      <path d="M14 28 C12 26 10 30 12 36 L18 30 Z" fill="#ff6b9d" />
      <path d="M50 28 C52 26 54 30 52 36 L46 30 Z" fill="#ff6b9d" />
      {/* Bangs */}
      <path d="M18 22 Q24 16 32 18 Q28 14 22 18 Z" fill="#ff8ab5" />
      <path d="M46 22 Q40 16 32 18 Q36 14 42 18 Z" fill="#ff8ab5" />
      {/* Eyes — big anime style */}
      <ellipse cx="24" cy="32" rx="5" ry="6" fill="#fff" />
      <ellipse cx="40" cy="32" rx="5" ry="6" fill="#fff" />
      <circle cx="25.5" cy="33" r="3.5" fill="#7a2060" />
      <circle cx="41.5" cy="33" r="3.5" fill="#7a2060" />
      <circle cx="26.5" cy="31" r="1.5" fill="#fff" />
      <circle cx="42.5" cy="31" r="1.5" fill="#fff" />
      <circle cx="24.5" cy="34" r="0.8" fill="#fff" opacity="0.7" />
      <circle cx="40.5" cy="34" r="0.8" fill="#fff" opacity="0.7" />
      {/* Eyelashes — thick */}
      <path d="M19 27 L17 24" stroke="#ff6b9d" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 26 L20 23" stroke="#ff6b9d" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M45 27 L47 24" stroke="#ff6b9d" strokeWidth="2" strokeLinecap="round" />
      <path d="M43 26 L44 23" stroke="#ff6b9d" strokeWidth="1.5" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="18" cy="38" rx="4" ry="2.5" fill="#FFB6C1" opacity="0.45" />
      <ellipse cx="46" cy="38" rx="4" ry="2.5" fill="#FFB6C1" opacity="0.45" />
      {/* Cute smile */}
      <path d="M27 42 Q32 47 37 42" stroke="#d03050" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Eyebrows */}
      <path d="M20 25 Q24 22 29 25" stroke="#c04070" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M35 25 Q40 22 44 25" stroke="#c04070" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),

  // ─── Bolt — Frontend: yellow mohawk, cool glasses, big grin ───
  bolt: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#2a2008" />
      {/* Shoulders */}
      <ellipse cx="32" cy="64" rx="24" ry="13" fill="#b89820" />
      <ellipse cx="32" cy="64" rx="20" ry="11" fill="#f0d050" />
      {/* Neck */}
      <rect x="26" y="44" width="12" height="7" rx="4" fill="#ffe0b0" />
      {/* Head */}
      <ellipse cx="32" cy="35" rx="15" ry="16" fill="#ffe0b0" />
      {/* Mohawk */}
      <path d="M24 22 C24 4 28 -2 32 -2 C36 -2 40 4 40 22 Z" fill="#f0d050" />
      <path d="M27 18 C27 6 30 0 32 0 C34 0 37 6 37 18 Z" fill="#f9e88c" opacity="0.6" />
      {/* Hair sides */}
      <path d="M16 30 C16 20 24 14 32 14 C40 14 48 20 48 30 C46 22 38 18 32 18 C26 18 18 22 16 30 Z" fill="#f0d050" />
      {/* Glasses — bold thick */}
      <rect x="16" y="28" width="14" height="12" rx="5" stroke="#ffd700" strokeWidth="3" fill="rgba(255,215,0,0.1)" />
      <rect x="34" y="28" width="14" height="12" rx="5" stroke="#ffd700" strokeWidth="3" fill="rgba(255,215,0,0.1)" />
      <line x1="30" y1="34" x2="34" y2="34" stroke="#ffd700" strokeWidth="3" />
      <line x1="16" y1="33" x2="10" y2="30" stroke="#ffd700" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="48" y1="33" x2="54" y2="30" stroke="#ffd700" strokeWidth="2.5" strokeLinecap="round" />
      {/* Eyes behind glasses */}
      <circle cx="23" cy="34" r="3" fill="#222" />
      <circle cx="41" cy="34" r="3" fill="#222" />
      <circle cx="24" cy="32.5" r="1.2" fill="#fff" />
      <circle cx="42" cy="32.5" r="1.2" fill="#fff" />
      {/* Wide toothy grin */}
      <path d="M23 44 Q32 52 41 44" stroke="#a03020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M26 44 Q32 49 38 44" fill="#fff" />
    </svg>
  ),

  // ─── Nexus — Backend: dark skin, cap, green headset ───
  nexus: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#061a0e" />
      {/* Shoulders */}
      <ellipse cx="32" cy="64" rx="24" ry="13" fill="#1a7a40" />
      <ellipse cx="32" cy="64" rx="20" ry="11" fill="#2ecc71" />
      {/* Neck */}
      <rect x="26" y="44" width="12" height="7" rx="4" fill="#c68642" />
      {/* Head */}
      <ellipse cx="32" cy="35" rx="15" ry="16" fill="#c68642" />
      {/* Short dark hair under cap */}
      <path d="M18 30 C18 22 24 18 32 18 C40 18 46 22 46 30 C44 24 38 20 32 20 C26 20 20 24 18 30 Z" fill="#1a1a1a" />
      {/* Cap */}
      <path d="M12 26 C12 14 22 6 32 6 C42 6 52 14 52 26 C50 16 40 10 32 10 C24 10 14 16 12 26 Z" fill="#2c3e50" />
      <path d="M16 24 C16 16 24 10 32 10 C40 10 48 16 48 24" fill="#34495e" opacity="0.5" />
      {/* Cap brim — thick & visible */}
      <path d="M6 26 L30 26 L28 32 L6 30 Z" fill="#2c3e50" />
      <path d="M6 26 L30 26 L29 29 L6 28 Z" fill="#3d5a80" opacity="0.5" />
      {/* Eyes */}
      <ellipse cx="25" cy="34" rx="4.5" ry="4.5" fill="#fff" />
      <ellipse cx="39" cy="34" rx="4.5" ry="4.5" fill="#fff" />
      <circle cx="26" cy="35" r="3" fill="#1a3020" />
      <circle cx="40" cy="35" r="3" fill="#1a3020" />
      <circle cx="27" cy="33.5" r="1.2" fill="#fff" />
      <circle cx="41" cy="33.5" r="1.2" fill="#fff" />
      {/* Bold eyebrows */}
      <path d="M20 29 Q25 26 30 29" stroke="#3a2510" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M34 29 Q39 26 44 29" stroke="#3a2510" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Calm smile */}
      <path d="M27 42 Q32 46 37 42" stroke="#7a4a20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Headset — thick */}
      <rect x="50" y="28" width="6" height="10" rx="3" fill="#27ae60" />
      <path d="M52 26 Q54 24 56 28" stroke="#27ae60" strokeWidth="3" fill="none" />
      <rect x="50" y="38" width="5" height="3" rx="1" fill="#1e8a4a" />
    </svg>
  ),

  // ─── Vigil — QA: red buzz cut, stern, scar, tough ───
  vigil: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#1e0808" />
      {/* Shoulders — armored */}
      <ellipse cx="32" cy="64" rx="28" ry="16" fill="#6a1818" />
      <ellipse cx="32" cy="64" rx="24" ry="14" fill="#c0392b" />
      <path d="M12 58 L18 52 L20 58" fill="#e74c3c" opacity="0.5" />
      <path d="M52 58 L46 52 L44 58" fill="#e74c3c" opacity="0.5" />
      {/* Neck — thick */}
      <rect x="24" y="44" width="16" height="7" rx="5" fill="#d4a06a" />
      {/* Head — square jaw */}
      <path d="M16 36 C16 18 22 10 32 10 C42 10 48 18 48 36 C48 46 42 50 32 50 C22 50 16 46 16 36 Z" fill="#d4a06a" />
      {/* Short red buzz cut */}
      <path d="M16 28 C16 16 22 8 32 8 C42 8 48 16 48 28 C46 18 38 12 32 12 C26 12 18 18 16 28 Z" fill="#e74c3c" />
      <path d="M20 22 C20 16 26 10 32 10 C38 10 44 16 44 22" fill="#c0392b" opacity="0.5" />
      {/* Eyes — intense */}
      <ellipse cx="25" cy="32" rx="4.5" ry="3.5" fill="#fff" />
      <ellipse cx="39" cy="32" rx="4.5" ry="3.5" fill="#fff" />
      <circle cx="26" cy="32.5" r="2.5" fill="#3a1515" />
      <circle cx="40" cy="32.5" r="2.5" fill="#3a1515" />
      <circle cx="27" cy="31.5" r="1" fill="#fff" />
      <circle cx="41" cy="31.5" r="1" fill="#fff" />
      {/* Angry eyebrows — very bold */}
      <path d="M20 27 L30 30" stroke="#7a2515" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M44 27 L34 30" stroke="#7a2515" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Stern mouth */}
      <line x1="26" y1="42" x2="38" y2="42" stroke="#8a4a2a" strokeWidth="3" strokeLinecap="round" />
      {/* Scar — thick & visible */}
      <path d="M42 24 L45 32 L44 38" stroke="#ff4040" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* Nose */}
      <path d="M30 36 L32 39 L34 36" stroke="#b8855a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),

  // ─── Forge — DevOps: bald, strong, goatee, builder ───
  forge: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#1e1108" />
      {/* Shoulders — broad */}
      <ellipse cx="32" cy="64" rx="28" ry="16" fill="#a85010" />
      <ellipse cx="32" cy="64" rx="24" ry="14" fill="#e67e22" />
      {/* Neck — thick */}
      <rect x="23" y="44" width="18" height="7" rx="5" fill="#f5c58a" />
      {/* Head — round & bald */}
      <ellipse cx="32" cy="32" rx="17" ry="19" fill="#f5c58a" />
      {/* Bald top with shine */}
      <path d="M15 28 C15 12 22 4 32 4 C42 4 49 12 49 28" fill="#f5c58a" />
      <ellipse cx="28" cy="12" rx="7" ry="3" fill="#ffe8c0" opacity="0.5" />
      <ellipse cx="36" cy="10" rx="4" ry="2" fill="#fff" opacity="0.2" />
      {/* Eyes */}
      <ellipse cx="25" cy="30" rx="4.5" ry="4.5" fill="#fff" />
      <ellipse cx="39" cy="30" rx="4.5" ry="4.5" fill="#fff" />
      <circle cx="26" cy="31" r="3" fill="#4a2a10" />
      <circle cx="40" cy="31" r="3" fill="#4a2a10" />
      <circle cx="27" cy="29.5" r="1.2" fill="#fff" />
      <circle cx="41" cy="29.5" r="1.2" fill="#fff" />
      {/* Thick eyebrows */}
      <path d="M20 24 Q25 21 30 24" stroke="#7a4a15" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M34 24 Q39 21 44 24" stroke="#7a4a15" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* Nose — big and bold */}
      <path d="M29 34 Q32 40 35 34" stroke="#d4a060" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Goatee — filled shape */}
      <path d="M26 42 Q32 52 38 42 Q36 46 32 48 Q28 46 26 42 Z" fill="#7a5a20" opacity="0.6" />
      {/* Confident smile */}
      <path d="M26 40 Q32 45 38 40" stroke="#a03020" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  ),
};
