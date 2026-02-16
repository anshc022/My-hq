'use client';
import { useRef, useEffect } from 'react';
import { AGENTS } from '@/lib/agents';

const STATUS_DOT = {
  idle:        'bg-zinc-600',
  working:     'bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/50',
  thinking:    'bg-amber-400 shadow-[0_0_8px] shadow-amber-400/40',
  talking:     'bg-sky-400 shadow-[0_0_8px] shadow-sky-400/40',
  sleeping:    'bg-zinc-700',
  error:       'bg-red-400 shadow-[0_0_8px] shadow-red-400/50',
  researching: 'bg-violet-400 shadow-[0_0_8px] shadow-violet-400/40',
  posting:     'bg-blue-400 shadow-[0_0_8px] shadow-blue-400/40',
  monitoring:  'bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/40',
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
      {agents.map(a => {
        const cfg = AGENTS[a.name] || {};
        const status = a.status || 'idle';
        const dotClass = STATUS_DOT[status] || STATUS_DOT.idle;
        const animated = isActive(status);

        return (
          <div
            key={a.name}
            className="group relative bg-card border border-white/[0.05] rounded-xl p-3.5 overflow-hidden transition-all duration-200 hover:border-white/[0.1] hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5"
          >
            {/* Top accent */}
            <div className="absolute top-0 inset-x-0 h-[2px] opacity-50" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color || '#5b7bff'}, transparent)` }} />

            {/* Glow overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle at 50% 0%, ${cfg.color || '#5b7bff'}08, transparent 70%)` }} />

            {/* Header */}
            <div className="relative flex items-center gap-2 mb-2">
              <span className="text-lg w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.03] shrink-0">{cfg.icon || '?'}</span>
              <div className="min-w-0">
                <div className="text-[12px] font-bold tracking-wide truncate" style={{ color: cfg.color || '#fff' }}>{cfg.label || a.name}</div>
                <div className="text-[8px] text-white/25 tracking-widest uppercase truncate">{cfg.role || ''}</div>
              </div>
            </div>

            {/* Status */}
            <div className="relative flex items-center gap-1.5 mt-1.5">
              <span className={`w-[6px] h-[6px] rounded-full shrink-0 ${dotClass}`} style={animated ? { animation: 'pulse-slow 1.5s ease-in-out infinite' } : {}} />
              <span className="text-[9px] text-white/40 font-medium tracking-[0.12em] uppercase">{status}</span>
            </div>

            {/* Task */}
            {a.current_task && (
              <div className="relative mt-2 text-[9px] text-white/20 font-mono truncate px-2 py-1 bg-white/[0.02] rounded border border-white/[0.03]" title={a.current_task}>
                {a.current_task}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
