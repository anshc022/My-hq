// ─── Agent face SVG avatars ───
// Polished character avatars shared across components

export const AGENT_FACES = {
  // ─── Echo — Tech Lead: blue spiky hair, headset, confident smirk ───
  echo: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <clipPath id="echo-clip"><circle cx="32" cy="32" r="32" /></clipPath>
        <linearGradient id="echo-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2a5e" /><stop offset="100%" stopColor="#0d1530" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#echo-bg)" />
      <g clipPath="url(#echo-clip)">
        {/* Shoulders */}
        <ellipse cx="32" cy="62" rx="22" ry="12" fill="#3a6fd8" />
        <ellipse cx="32" cy="62" rx="18" ry="10" fill="#4A90D9" />
        {/* Neck */}
        <rect x="27" y="44" width="10" height="6" rx="3" fill="#FFD5A0" />
        {/* Head */}
        <ellipse cx="32" cy="34" rx="14" ry="16" fill="#FFD5A0" />
        {/* Hair — spiky blue */}
        <path d="M16 28 C16 16 22 10 32 10 C42 10 48 16 48 28 L46 26 C46 18 40 13 32 13 C24 13 18 18 18 26 Z" fill="#2244AA" />
        <path d="M20 18 L17 10 L22 16 L24 8 L26 16 L30 6 L32 15 L34 6 L38 16 L40 8 L42 16 L47 10 L44 18" fill="#2244AA" />
        <path d="M24 12 L26 5 L28 13" fill="#3355CC" opacity="0.7" />
        <path d="M36 12 L38 5 L40 13" fill="#3355CC" opacity="0.7" />
        {/* Eyes */}
        <ellipse cx="26" cy="33" rx="3.5" ry="3.8" fill="#fff" />
        <ellipse cx="38" cy="33" rx="3.5" ry="3.8" fill="#fff" />
        <circle cx="27" cy="33.5" r="2" fill="#1a3a7a" />
        <circle cx="39" cy="33.5" r="2" fill="#1a3a7a" />
        <circle cx="27.5" cy="32.5" r="0.7" fill="#fff" />
        <circle cx="39.5" cy="32.5" r="0.7" fill="#fff" />
        {/* Eyebrows */}
        <path d="M22 29 Q26 27 30 29" stroke="#1a2a5e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M34 29 Q38 27 42 29" stroke="#1a2a5e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Smirk */}
        <path d="M27 40 Q32 44 37 40" stroke="#c0392b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M37 40 Q38 39 39 40" stroke="#c0392b" strokeWidth="1" fill="none" />
        {/* Headset */}
        <path d="M12 30 Q12 18 32 16 Q52 18 52 30" stroke="#4fc3f7" strokeWidth="3" fill="none" />
        <rect x="9" y="27" width="5" height="8" rx="2.5" fill="#4fc3f7" />
        <rect x="50" y="27" width="5" height="8" rx="2.5" fill="#4fc3f7" />
        <rect x="8" y="35" width="6" height="3" rx="1" fill="#3a7bd5" />
      </g>
    </svg>
  ),

  // ─── Flare — UI/UX: pink flowing hair, creative look, bright eyes ───
  flare: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <clipPath id="flare-clip"><circle cx="32" cy="32" r="32" /></clipPath>
        <linearGradient id="flare-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a1a3a" /><stop offset="100%" stopColor="#2a0d20" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#flare-bg)" />
      <g clipPath="url(#flare-clip)">
        {/* Shoulders */}
        <ellipse cx="32" cy="62" rx="22" ry="12" fill="#d4477a" />
        <ellipse cx="32" cy="62" rx="18" ry="10" fill="#FF6B9D" />
        {/* Neck */}
        <rect x="27" y="44" width="10" height="6" rx="3" fill="#FFDBB4" />
        {/* Long flowing hair behind */}
        <path d="M14 26 C14 26 12 42 14 52 C16 58 18 56 18 50 L18 28 Z" fill="#FF6B9D" />
        <path d="M50 26 C50 26 52 42 50 52 C48 58 46 56 46 50 L46 28 Z" fill="#FF6B9D" />
        <path d="M16 30 C14 40 15 54 18 56" stroke="#ff8ab5" strokeWidth="1" fill="none" opacity="0.5" />
        <path d="M48 30 C50 40 49 54 46 56" stroke="#ff8ab5" strokeWidth="1" fill="none" opacity="0.5" />
        {/* Head */}
        <ellipse cx="32" cy="34" rx="14" ry="16" fill="#FFDBB4" />
        {/* Hair top */}
        <path d="M16 28 C16 14 24 9 32 9 C40 9 48 14 48 28 C48 22 42 14 32 14 C22 14 16 22 16 28 Z" fill="#FF6B9D" />
        <path d="M18 22 C18 14 24 11 32 11 C40 11 46 14 46 22" fill="#ff8ab5" opacity="0.4" />
        {/* Side hair */}
        <path d="M16 28 L14 26 L16 32 L14 38 L18 34 Z" fill="#FF6B9D" />
        <path d="M48 28 L50 26 L48 32 L50 38 L46 34 Z" fill="#FF6B9D" />
        {/* Eyes — large expressive */}
        <ellipse cx="25" cy="33" rx="4" ry="4.5" fill="#fff" />
        <ellipse cx="39" cy="33" rx="4" ry="4.5" fill="#fff" />
        <circle cx="26" cy="33.5" r="2.5" fill="#8a2a6a" />
        <circle cx="40" cy="33.5" r="2.5" fill="#8a2a6a" />
        <circle cx="26.8" cy="32.3" r="1" fill="#fff" />
        <circle cx="40.8" cy="32.3" r="1" fill="#fff" />
        <circle cx="25" cy="34.5" r="0.5" fill="#fff" opacity="0.6" />
        <circle cx="39" cy="34.5" r="0.5" fill="#fff" opacity="0.6" />
        {/* Eyelashes */}
        <path d="M21 30 L19 28" stroke="#FF6B9D" strokeWidth="1" strokeLinecap="round" />
        <path d="M22 29 L21 27" stroke="#FF6B9D" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M43 30 L45 28" stroke="#FF6B9D" strokeWidth="1" strokeLinecap="round" />
        <path d="M42 29 L43 27" stroke="#FF6B9D" strokeWidth="0.8" strokeLinecap="round" />
        {/* Blush */}
        <ellipse cx="20" cy="38" rx="3" ry="2" fill="#FFB6C1" opacity="0.35" />
        <ellipse cx="44" cy="38" rx="3" ry="2" fill="#FFB6C1" opacity="0.35" />
        {/* Smile */}
        <path d="M27 41 Q32 45 37 41" stroke="#e0455a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Eyebrows */}
        <path d="M22 28 Q25 26 29 28" stroke="#d45a80" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M35 28 Q39 26 42 28" stroke="#d45a80" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  ),

  // ─── Bolt — Frontend: yellow mohawk, cool glasses, grin ───
  bolt: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <clipPath id="bolt-clip"><circle cx="32" cy="32" r="32" /></clipPath>
        <linearGradient id="bolt-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a3a0a" /><stop offset="100%" stopColor="#2a1e05" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#bolt-bg)" />
      <g clipPath="url(#bolt-clip)">
        {/* Shoulders */}
        <ellipse cx="32" cy="62" rx="22" ry="12" fill="#c4a820" />
        <ellipse cx="32" cy="62" rx="18" ry="10" fill="#F7DC6F" />
        {/* Neck */}
        <rect x="27" y="44" width="10" height="6" rx="3" fill="#FFE0BD" />
        {/* Head */}
        <ellipse cx="32" cy="35" rx="14" ry="15" fill="#FFE0BD" />
        {/* Mohawk */}
        <path d="M26 20 C26 6 28 2 32 2 C36 2 38 6 38 20 C38 14 36 8 32 8 C28 8 26 14 26 20 Z" fill="#F7DC6F" />
        <path d="M28 16 C28 8 30 5 32 5 C34 5 36 8 36 16" fill="#f9e88c" opacity="0.6" />
        {/* Hair sides */}
        <path d="M18 28 C18 20 24 16 32 16 C40 16 46 20 46 28 C44 24 38 20 32 20 C26 20 20 24 18 28 Z" fill="#F7DC6F" />
        {/* Glasses */}
        <rect x="18" y="30" width="12" height="10" rx="4" stroke="#FFD700" strokeWidth="2" fill="rgba(255,215,0,0.08)" />
        <rect x="34" y="30" width="12" height="10" rx="4" stroke="#FFD700" strokeWidth="2" fill="rgba(255,215,0,0.08)" />
        <line x1="30" y1="35" x2="34" y2="35" stroke="#FFD700" strokeWidth="2" />
        <line x1="18" y1="34" x2="14" y2="32" stroke="#FFD700" strokeWidth="1.5" />
        <line x1="46" y1="34" x2="50" y2="32" stroke="#FFD700" strokeWidth="1.5" />
        {/* Eyes behind glasses */}
        <circle cx="24" cy="35" r="2" fill="#111" />
        <circle cx="40" cy="35" r="2" fill="#111" />
        <circle cx="24.8" cy="34" r="0.7" fill="#fff" />
        <circle cx="40.8" cy="34" r="0.7" fill="#fff" />
        {/* Big grin */}
        <path d="M25 43 Q32 48 39 43" stroke="#c0392b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M27 43 Q32 46 37 43" fill="#fff" opacity="0.9" />
      </g>
    </svg>
  ),

  // ─── Nexus — Backend: dark skin, cap, green headset, focused look ───
  nexus: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <clipPath id="nexus-clip"><circle cx="32" cy="32" r="32" /></clipPath>
        <linearGradient id="nexus-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a2e1a" /><stop offset="100%" stopColor="#051a0e" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#nexus-bg)" />
      <g clipPath="url(#nexus-clip)">
        {/* Shoulders */}
        <ellipse cx="32" cy="62" rx="22" ry="12" fill="#1a8a4a" />
        <ellipse cx="32" cy="62" rx="18" ry="10" fill="#2ECC71" />
        {/* Neck */}
        <rect x="27" y="44" width="10" height="6" rx="3" fill="#C68642" />
        {/* Head */}
        <ellipse cx="32" cy="35" rx="14" ry="15" fill="#C68642" />
        {/* Short dark hair under cap */}
        <path d="M18 30 C18 22 24 18 32 18 C40 18 46 22 46 30 C44 26 38 22 32 22 C26 22 20 26 18 30 Z" fill="#1a1a1a" />
        {/* Cap */}
        <path d="M14 26 C14 16 22 10 32 10 C42 10 50 16 50 26 L48 26 C48 18 40 13 32 13 C24 13 16 18 16 26 Z" fill="#2c3e50" />
        <path d="M16 25 C16 19 24 14 32 14 C40 14 48 19 48 25" fill="#34495e" opacity="0.5" />
        {/* Cap brim */}
        <path d="M10 26 L28 26 L26 30 L10 28 Z" fill="#2c3e50" />
        <path d="M10 26 L28 26 L27 28 L10 27 Z" fill="#3d566e" opacity="0.4" />
        {/* Eyes */}
        <ellipse cx="26" cy="34" rx="3.5" ry="3.5" fill="#fff" />
        <ellipse cx="38" cy="34" rx="3.5" ry="3.5" fill="#fff" />
        <circle cx="27" cy="34.5" r="2" fill="#1a3020" />
        <circle cx="39" cy="34.5" r="2" fill="#1a3020" />
        <circle cx="27.5" cy="33.5" r="0.7" fill="#fff" />
        <circle cx="39.5" cy="33.5" r="0.7" fill="#fff" />
        {/* Eyebrows — focused */}
        <path d="M22 30 Q26 28 30 30" stroke="#3a2a10" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M34 30 Q38 28 42 30" stroke="#3a2a10" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Calm smile */}
        <path d="M28 41 Q32 44 36 41" stroke="#8a5a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Headset */}
        <path d="M50 30 L52 30 L52 38 L50 38 Z" rx="1" fill="#27ae60" />
        <path d="M50 28 Q52 28 52 30" stroke="#27ae60" strokeWidth="2.5" fill="none" />
      </g>
    </svg>
  ),

  // ─── Vigil — QA: red buzz cut, stern face, scar, shield vibe ───
  vigil: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <clipPath id="vigil-clip"><circle cx="32" cy="32" r="32" /></clipPath>
        <linearGradient id="vigil-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a1010" /><stop offset="100%" stopColor="#1e0808" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#vigil-bg)" />
      <g clipPath="url(#vigil-clip)">
        {/* Shoulders — armored look */}
        <ellipse cx="32" cy="62" rx="24" ry="13" fill="#8a2020" />
        <ellipse cx="32" cy="62" rx="20" ry="11" fill="#c0392b" />
        <path d="M16 56 L20 52 L22 56" fill="#e74c3c" opacity="0.4" />
        <path d="M48 56 L44 52 L42 56" fill="#e74c3c" opacity="0.4" />
        {/* Neck — thick */}
        <rect x="26" y="44" width="12" height="6" rx="3" fill="#D4A06A" />
        {/* Head — slightly square jaw */}
        <path d="M18 36 C18 20 24 14 32 14 C40 14 46 20 46 36 C46 44 42 48 32 48 C22 48 18 44 18 36 Z" fill="#D4A06A" />
        {/* Short red buzz cut */}
        <path d="M18 28 C18 18 24 12 32 12 C40 12 46 18 46 28 C44 22 38 16 32 16 C26 16 20 22 18 28 Z" fill="#E74C3C" />
        <path d="M20 24 C20 18 26 14 32 14 C38 14 44 18 44 24" fill="#c0392b" opacity="0.4" />
        {/* Eyes — intense narrow */}
        <ellipse cx="26" cy="33" rx="3.5" ry="3" fill="#fff" />
        <ellipse cx="38" cy="33" rx="3.5" ry="3" fill="#fff" />
        <circle cx="26.5" cy="33.5" r="2" fill="#4a2020" />
        <circle cx="38.5" cy="33.5" r="2" fill="#4a2020" />
        <circle cx="27" cy="32.5" r="0.6" fill="#fff" />
        <circle cx="39" cy="32.5" r="0.6" fill="#fff" />
        {/* Angry eyebrows */}
        <path d="M22 29 L30 31" stroke="#8a3020" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M42 29 L34 31" stroke="#8a3020" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Stern mouth */}
        <line x1="28" y1="41" x2="36" y2="41" stroke="#8a4a2a" strokeWidth="1.8" strokeLinecap="round" />
        {/* Scar */}
        <path d="M42 26 L44 32 L43 36" stroke="#e74c3c" strokeWidth="1.2" fill="none" opacity="0.6" strokeLinecap="round" />
        {/* Nose */}
        <path d="M31 36 L32 38 L33 36" stroke="#b8855a" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  ),

  // ─── Forge — DevOps: bald, strong build, goatee, wrench vibe ───
  forge: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <clipPath id="forge-clip"><circle cx="32" cy="32" r="32" /></clipPath>
        <linearGradient id="forge-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2210" /><stop offset="100%" stopColor="#1e1108" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#forge-bg)" />
      <g clipPath="url(#forge-clip)">
        {/* Shoulders — broad */}
        <ellipse cx="32" cy="62" rx="24" ry="14" fill="#b85a10" />
        <ellipse cx="32" cy="62" rx="20" ry="12" fill="#E67E22" />
        {/* Neck — thick */}
        <rect x="25" y="44" width="14" height="6" rx="4" fill="#FFD5A0" />
        {/* Head — round & bald */}
        <ellipse cx="32" cy="33" rx="15" ry="17" fill="#FFD5A0" />
        {/* Bald top with shine */}
        <path d="M17 30 C17 16 24 10 32 10 C40 10 47 16 47 30" fill="#FFD5A0" />
        <ellipse cx="30" cy="16" rx="5" ry="2.5" fill="#ffe8c0" opacity="0.5" />
        <ellipse cx="36" cy="14" rx="3" ry="1.5" fill="#fff" opacity="0.15" />
        {/* Eyes */}
        <ellipse cx="26" cy="32" rx="3.5" ry="3.5" fill="#fff" />
        <ellipse cx="38" cy="32" rx="3.5" ry="3.5" fill="#fff" />
        <circle cx="26.5" cy="32.5" r="2" fill="#4a2a10" />
        <circle cx="38.5" cy="32.5" r="2" fill="#4a2a10" />
        <circle cx="27" cy="31.5" r="0.7" fill="#fff" />
        <circle cx="39" cy="31.5" r="0.7" fill="#fff" />
        {/* Thick eyebrows */}
        <path d="M22 28 Q26 26 30 28" stroke="#8a5a20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M34 28 Q38 26 42 28" stroke="#8a5a20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Nose */}
        <path d="M30 35 Q32 38 34 35" stroke="#d4a060" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* Goatee */}
        <path d="M28 42 Q32 48 36 42" fill="#8a6a30" opacity="0.5" />
        <path d="M29 41 Q32 44 35 41" fill="#9a7a40" opacity="0.3" />
        {/* Confident smile */}
        <path d="M27 40 Q32 44 37 40" stroke="#c0392b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Wrench on shoulder */}
        <rect x="48" y="50" width="3" height="14" rx="1" fill="#999" transform="rotate(-30 48 50)" />
        <circle cx="47" cy="48" r="3" stroke="#999" strokeWidth="2" fill="none" transform="rotate(-30 48 50)" />
      </g>
    </svg>
  ),
};
