'use client';
import { useRef, useEffect } from 'react';
import { AGENTS } from '@/lib/agents';

const STATUS_DOT = {
  idle:        'bg-zinc-600',
  working:     'bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400/60',
  thinking:    'bg-amber-400 shadow-[0_0_10px] shadow-amber-400/50',
  talking:     'bg-sky-400 shadow-[0_0_10px] shadow-sky-400/50',
  sleeping:    'bg-zinc-700',
  error:       'bg-red-400 shadow-[0_0_10px] shadow-red-400/60',
  researching: 'bg-violet-400 shadow-[0_0_10px] shadow-violet-400/50',
  posting:     'bg-blue-400 shadow-[0_0_10px] shadow-blue-400/50',
  monitoring:  'bg-emerald-400 shadow-[0_0_10px] shadow-emerald-400/50',
};

const STATUS_BG = {
  working:     'from-emerald-500/[0.06] to-transparent',
  thinking:    'from-amber-500/[0.06] to-transparent',
  talking:     'from-sky-500/[0.06] to-transparent',
  researching: 'from-violet-500/[0.06] to-transparent',
  posting:     'from-blue-500/[0.06] to-transparent',
  error:       'from-red-500/[0.06] to-transparent',
};

export default function AgentPanel({ agents }) {
  const beepRef = useRef(null);
  const prevStatusRef = useRef({});

  useEffect(() => {
    if (!agents) return;
    agents.forEach(a => {
      const prev = prevStatusRef.current[a.name];
      if (prev && prev === 'idle' && a.status !== 'idle' && a.status !== 'sleeping') {
        try {
          if (!beepRef.current) {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            beepRef.current = ac;
          }
          const ac = beepRef.current;
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.frequency.setValueAtTime(880, ac.currentTime);
          gain.gain.setValueAtTime(0.05, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
          osc.start(ac.currentTime);
          osc.stop(ac.currentTime + 0.15);
        } catch {}
      }
      prevStatusRef.current[a.name] = a.status;
    });
  }, [agents]);

  if (!agents || agents.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="text-muted font-mono text-xs p-3">Waiting for agents...</div>
      </div>
    );
  }

  const isActive = (s) => s && s !== 'idle' && s !== 'sleeping';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {agents.map((a, idx) => {
        const cfg = AGENTS[a.name] || {};
        const status = a.status || 'idle';
        const dotClass = STATUS_DOT[status] || STATUS_DOT.idle;
        const animated = isActive(status);
        const bgGrad = STATUS_BG[status] || '';

        return (
          <div
            key={a.name}
            className="group relative glass-card rounded-xl p-3.5 overflow-hidden"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* Top accent bar */}
            <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent 10%, ${cfg.color || '#5b7bff'}80, transparent 90%)` }} />

            {/* Active status background glow */}
            {animated && bgGrad && (
              <div className={`absolute inset-0 bg-gradient-to-b ${bgGrad} pointer-events-none transition-opacity duration-700`} />
            )}

            {/* Hover glow */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${cfg.color || '#5b7bff'}10, transparent 70%)` }} />

            {/* Header */}
            <div className="relative flex items-center gap-2.5 mb-2.5">
              <div className="relative">
                <span className="text-lg w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0 group-hover:bg-white/[0.06] transition-colors">{cfg.icon || '?'}</span>
                {/* Status dot on avatar */}
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${dotClass}`} style={animated ? { animation: 'pulse-slow 1.5s ease-in-out infinite' } : {}} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-extrabold tracking-wide truncate transition-colors duration-300" style={{ color: cfg.color || '#fff' }}>{cfg.label || a.name}</div>
                <div className="text-[7px] text-white/20 tracking-[0.2em] uppercase truncate font-medium">{cfg.role || ''}</div>
              </div>
            </div>

            {/* Status pill */}
            <div className="relative flex items-center gap-1.5 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-[0.12em] uppercase border ${
                animated
                  ? 'bg-white/[0.04] border-white/[0.08] text-white/50'
                  : 'bg-white/[0.02] border-white/[0.04] text-white/25'
              }`}>
                <span className={`w-[5px] h-[5px] rounded-full ${dotClass}`} />
                {status}
              </span>
            </div>

            {/* Task */}
            {a.current_task && (
              <div className="relative mt-2.5 text-[9px] text-white/25 font-mono truncate px-2.5 py-1.5 bg-white/[0.02] rounded-lg border border-white/[0.04]" title={a.current_task}>
                <span className="text-accent/40 mr-1">→</span>
                {a.current_task}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
