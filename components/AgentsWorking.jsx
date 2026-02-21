'use client';
import { useMemo } from 'react';
import { AGENTS } from '@/lib/agents';

// ─── Agent face SVG avatars ───
const AGENT_FACES = {
  echo: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="24" r="12" fill="#FFD5A0" />
      {/* Spiky blue hair */}
      <path d="M10 18 Q12 8 18 10 Q20 4 22 6 Q24 2 26 6 Q28 4 30 10 Q34 8 34 18" fill="#2244AA" />
      {/* Eyes */}
      <ellipse cx="18" cy="24" rx="2" ry="2.2" fill="#fff" />
      <ellipse cx="26" cy="24" rx="2" ry="2.2" fill="#fff" />
      <circle cx="18.5" cy="24.5" r="1" fill="#111" />
      <circle cx="26.5" cy="24.5" r="1" fill="#111" />
      {/* Mouth */}
      <path d="M19 29 Q22 32 25 29" stroke="#c0392b" strokeWidth="1.2" fill="none" />
      {/* Headset */}
      <path d="M9 22 Q9 14 22 13 Q35 14 35 22" stroke="#3a7bd5" strokeWidth="2.5" fill="none" />
      <rect x="7" y="20" width="4" height="6" rx="1.5" fill="#3a7bd5" />
    </svg>
  ),
  flare: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="24" r="12" fill="#FFDBB4" />
      {/* Long pink hair */}
      <path d="M10 20 Q10 8 22 7 Q34 8 34 20 L34 34 Q32 32 30 34 L30 20 Q30 12 22 11 Q14 12 14 20 L14 34 Q12 32 10 34 Z" fill="#FF6B9D" />
      {/* Eyes with lashes */}
      <ellipse cx="18" cy="24" rx="2" ry="2.5" fill="#fff" />
      <ellipse cx="26" cy="24" rx="2" ry="2.5" fill="#fff" />
      <circle cx="18" cy="24.5" r="1.1" fill="#2a1a3a" />
      <circle cx="26" cy="24.5" r="1.1" fill="#2a1a3a" />
      <line x1="16" y1="21.5" x2="14.5" y2="20" stroke="#FF6B9D" strokeWidth="0.8" />
      <line x1="28" y1="21.5" x2="29.5" y2="20" stroke="#FF6B9D" strokeWidth="0.8" />
      {/* Smile */}
      <path d="M19 29 Q22 32 25 29" stroke="#c0392b" strokeWidth="1.2" fill="none" />
      {/* Blush */}
      <circle cx="15" cy="27" r="2" fill="#FFB6C1" opacity="0.4" />
      <circle cx="29" cy="27" r="2" fill="#FFB6C1" opacity="0.4" />
    </svg>
  ),
  bolt: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="24" r="12" fill="#FFE0BD" />
      {/* Yellow mohawk */}
      <rect x="18" y="4" width="8" height="14" rx="3" fill="#F7DC6F" />
      <rect x="19" y="2" width="6" height="6" rx="2" fill="#f9e88c" />
      {/* Glasses */}
      <circle cx="17" cy="24" r="4" stroke="#FFD700" strokeWidth="1.8" fill="none" />
      <circle cx="27" cy="24" r="4" stroke="#FFD700" strokeWidth="1.8" fill="none" />
      <line x1="21" y1="24" x2="23" y2="24" stroke="#FFD700" strokeWidth="1.5" />
      <line x1="13" y1="23" x2="11" y2="21" stroke="#FFD700" strokeWidth="1.2" />
      <line x1="31" y1="23" x2="33" y2="21" stroke="#FFD700" strokeWidth="1.2" />
      {/* Eyes behind glasses */}
      <circle cx="17" cy="24.5" r="1" fill="#111" />
      <circle cx="27" cy="24.5" r="1" fill="#111" />
      {/* Grin */}
      <path d="M18 30 Q22 33 26 30" stroke="#c0392b" strokeWidth="1.2" fill="none" />
    </svg>
  ),
  nexus: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="24" r="12" fill="#C68642" />
      {/* Dark cap */}
      <path d="M10 20 Q10 10 22 9 Q34 10 34 20 L32 20 Q32 14 22 13 Q12 14 12 20 Z" fill="#2c3e50" />
      <rect x="8" y="18" width="16" height="3" rx="1" fill="#2c3e50" />
      {/* Eyes */}
      <ellipse cx="18" cy="25" rx="2" ry="2" fill="#fff" />
      <ellipse cx="26" cy="25" rx="2" ry="2" fill="#fff" />
      <circle cx="18.5" cy="25.3" r="1" fill="#111" />
      <circle cx="26.5" cy="25.3" r="1" fill="#111" />
      {/* Mouth */}
      <path d="M20 30 Q22 32 24 30" stroke="#8a4a2a" strokeWidth="1.2" fill="none" />
      {/* Headset */}
      <path d="M9 23 Q9 16 22 15 Q35 16 35 23" stroke="#27ae60" strokeWidth="2" fill="none" />
      <rect x="7" y="21" width="3.5" height="5" rx="1.5" fill="#27ae60" />
    </svg>
  ),
  vigil: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="24" r="12" fill="#D4A06A" />
      {/* Short red hair */}
      <path d="M10 20 Q10 10 22 8 Q34 10 34 20 L32 18 Q30 12 22 11 Q14 12 12 18 Z" fill="#E74C3C" />
      {/* Stern eyes */}
      <rect x="15" y="23" width="5" height="3" rx="1.5" fill="#fff" />
      <rect x="24" y="23" width="5" height="3" rx="1.5" fill="#fff" />
      <circle cx="17.5" cy="24.5" r="1.2" fill="#111" />
      <circle cx="26.5" cy="24.5" r="1.2" fill="#111" />
      {/* Eyebrows — serious */}
      <line x1="14" y1="21" x2="20" y2="22" stroke="#a03020" strokeWidth="1.5" />
      <line x1="30" y1="21" x2="24" y2="22" stroke="#a03020" strokeWidth="1.5" />
      {/* Mouth */}
      <line x1="19" y1="30" x2="25" y2="30" stroke="#8a4a2a" strokeWidth="1.2" />
      {/* Scar */}
      <line x1="30" y1="20" x2="32" y2="26" stroke="#c0392b" strokeWidth="0.8" opacity="0.5" />
    </svg>
  ),
  forge: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="24" r="12" fill="#FFD5A0" />
      {/* Bald head with shine */}
      <path d="M12 22 Q12 10 22 9 Q32 10 32 22" fill="#FFD5A0" />
      <ellipse cx="22" cy="12" rx="3" ry="1.5" fill="#ffe8c0" opacity="0.6" />
      {/* Eyes */}
      <ellipse cx="18" cy="25" rx="2" ry="2" fill="#fff" />
      <ellipse cx="26" cy="25" rx="2" ry="2" fill="#fff" />
      <circle cx="18.3" cy="25.3" r="1.1" fill="#111" />
      <circle cx="26.3" cy="25.3" r="1.1" fill="#111" />
      {/* Thick eyebrows */}
      <rect x="15" y="21.5" width="6" height="1.5" rx="0.5" fill="#8a5a20" />
      <rect x="23" y="21.5" width="6" height="1.5" rx="0.5" fill="#8a5a20" />
      {/* Beard stubble */}
      <path d="M16 30 Q22 35 28 30" fill="#d4a868" opacity="0.3" />
      {/* Mouth */}
      <path d="M19 31 Q22 33 25 31" stroke="#c0392b" strokeWidth="1.2" fill="none" />
    </svg>
  ),
};

const STATUS_COLORS = {
  idle: '#666',
  working: '#00e676',
  thinking: '#ffea00',
  talking: '#4fc3f7',
  posting: '#ff9100',
  researching: '#7c4dff',
  error: '#f50057',
  sleeping: '#555',
  monitoring: '#00e676',
};

const STATUS_LABELS = {
  idle: 'Idle',
  working: 'Working',
  thinking: 'Thinking',
  talking: 'Responding',
  posting: 'Posting',
  researching: 'Researching',
  error: 'Error',
  sleeping: 'Sleeping',
  monitoring: 'Monitoring',
};

export default function AgentsWorking({ agents, events }) {
  const agentEventCounts = useMemo(() => {
    const counts = {};
    Object.keys(AGENTS).forEach(name => { counts[name] = 0; });
    (events || []).forEach(evt => {
      if (evt.agent && counts[evt.agent] !== undefined) {
        counts[evt.agent]++;
      }
    });
    return counts;
  }, [events]);

  const totalSignals = events?.length || 0;
  const activeCount = (agents || []).filter(a => {
    const s = (a.status || '').toLowerCase();
    return s === 'working' || s === 'thinking' || s === 'talking' || s === 'posting' || s === 'researching';
  }).length;

  const scrollToCanvas = () => {
    const el = document.querySelector('canvas');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="neo-card-static animate-fade-in" style={{ border: '2px solid #2a2a2a' }}>
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 pb-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <h2 className="text-[15px] md:text-[17px] font-black text-white tracking-wider uppercase">
            Agents Working Right Now
          </h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* LIVE FEED badge */}
          <span
            className="neo-badge text-[9px]"
            style={{
              background: '#00e67620',
              color: '#00e676',
              borderColor: '#00e676',
            }}
          >
            <span className="inline-block w-[6px] h-[6px] bg-[#00e676] mr-1.5 animate-pulse" />
            LIVE FEED
          </span>
          {/* Signal count */}
          <span className="text-[11px] font-bold text-[var(--color-muted)] font-mono">
            <span className="text-white font-black">{totalSignals}</span> signals processed
          </span>
          {/* Enter the Stage button */}
          <button
            onClick={scrollToCanvas}
            className="text-[10px] font-black font-mono tracking-wider uppercase px-3 py-1.5 border-2 border-[var(--color-neo-blue)] text-[var(--color-neo-blue)] hover:bg-[var(--color-neo-blue)] hover:text-black transition-colors"
          >
            Enter the Stage →
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 my-3 border-t-2 border-dashed border-[var(--color-border)]" />

      {/* Agent Cards Row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 px-4 pb-4">
        {Object.entries(AGENTS).map(([name, config]) => {
          const agentData = (agents || []).find(a => a.name === name) || {};
          const status = (agentData.status || 'idle').toLowerCase();
          const statusColor = STATUS_COLORS[status] || '#666';
          const statusLabel = STATUS_LABELS[status] || 'Idle';
          const eventCount = agentEventCounts[name] || 0;
          const isBusy = status === 'working' || status === 'thinking' || status === 'talking' || status === 'posting' || status === 'researching';

          return (
            <div
              key={name}
              className="flex flex-col items-center gap-1.5 p-3 border-2 transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]"
              style={{
                borderColor: isBusy ? statusColor : '#1a1a1a',
                background: isBusy ? statusColor + '08' : '#0d0d0d',
                boxShadow: isBusy ? `3px 3px 0px ${statusColor}40` : '3px 3px 0px #1a1a1a',
              }}
            >
              {/* Avatar face */}
              <div
                className="relative flex items-center justify-center overflow-hidden"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: `3px solid ${config.color}`,
                  background: config.color + '12',
                  boxShadow: isBusy ? `0 0 14px ${config.color}35` : 'none',
                }}
              >
                {AGENT_FACES[name] ? AGENT_FACES[name]({ size: 44 }) : <span style={{ fontSize: 20 }}>{config.icon}</span>}
                {/* Status indicator dot */}
                <span
                  className="absolute bottom-0 right-0"
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: '50%',
                    background: statusColor,
                    border: '2px solid #0a0a0a',
                    boxShadow: isBusy ? `0 0 6px ${statusColor}` : 'none',
                  }}
                />
              </div>

              {/* Agent name */}
              <span className="text-[11px] font-black text-white tracking-wider font-mono uppercase">
                {config.label}
              </span>

              {/* Status */}
              <span
                className="text-[9px] font-bold font-mono tracking-wide"
                style={{ color: statusColor }}
              >
                {statusLabel}
              </span>

              {/* Event count */}
              <span className="text-[8px] font-mono text-[var(--color-muted)]">
                {eventCount} events
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
