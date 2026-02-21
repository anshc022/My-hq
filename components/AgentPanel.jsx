'use client';
import { useRef, useEffect } from 'react';
import { AGENTS } from '@/lib/agents';

const STATUS_COLOR = {
  idle:        'bg-zinc-600',
  working:     'bg-[var(--color-neo-green)]',
  thinking:    'bg-[var(--color-neo-yellow)]',
  talking:     'bg-[var(--color-neo-blue)]',
  sleeping:    'bg-zinc-700',
  error:       'bg-[var(--color-danger)]',
  researching: 'bg-[var(--color-neo-purple)]',
  posting:     'bg-[var(--color-neo-blue)]',
  monitoring:  'bg-[var(--color-neo-green)]',
};

const STATUS_BORDER = {
  working:     'border-[var(--color-neo-green)]',
  thinking:    'border-[var(--color-neo-yellow)]',
  talking:     'border-[var(--color-neo-blue)]',
  researching: 'border-[var(--color-neo-purple)]',
  posting:     'border-[var(--color-neo-blue)]',
  error:       'border-[var(--color-danger)]',
  monitoring:  'border-[var(--color-neo-green)]',
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
        <div className="text-[var(--color-muted)] font-mono text-xs p-3 border-2 border-dashed border-[var(--color-border)]">Waiting for agents...</div>
      </div>
    );
  }

  const isActive = (s) => s && s !== 'idle' && s !== 'sleeping';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {agents.map((a, idx) => {
        const cfg = AGENTS[a.name] || {};
        const status = a.status || 'idle';
        const dotClass = STATUS_COLOR[status] || STATUS_COLOR.idle;
        const animated = isActive(status);
        const borderColor = animated ? (STATUS_BORDER[status] || 'border-[var(--color-border)]') : 'border-[var(--color-border)]';

        return (
          <div
            key={a.name}
            className={`group relative neo-card p-3.5 ${borderColor}`}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* Top accent bar — solid, no gradient */}
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: cfg.color || 'var(--color-accent)' }} />

            {/* Header */}
            <div className="relative flex items-center gap-2.5 mb-2.5">
              <div className="relative">
                <span className="text-lg w-9 h-9 flex items-center justify-center bg-[var(--color-surface)] border-2 border-[var(--color-border)] shrink-0">{cfg.icon || '?'}</span>
                {/* Status dot */}
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-[var(--color-bg)] ${dotClass}`} style={animated ? { animation: 'blink 1s step-end infinite' } : {}} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-black tracking-wide truncate" style={{ color: cfg.color || '#fff' }}>{cfg.label || a.name}</div>
                <div className="text-[7px] text-white/30 tracking-[0.2em] uppercase truncate font-bold">{cfg.role || ''}</div>
              </div>
            </div>

            {/* Status badge */}
            <div className="relative flex items-center gap-1.5 mt-1">
              <span className={`neo-badge text-[8px] ${
                animated
                  ? 'text-white border-white/30 bg-white/5'
                  : 'text-white/30 border-white/10 bg-transparent'
              }`}>
                <span className={`w-[5px] h-[5px] ${dotClass}`} />
                {status}
              </span>
            </div>

            {/* Task */}
            {a.current_task && (
              <div className="relative mt-2.5 text-[9px] text-white/40 font-mono truncate px-2 py-1.5 bg-[var(--color-surface)] border-2 border-[var(--color-border)]" title={a.current_task}>
                <span className="text-[var(--color-accent)] mr-1 font-black">→</span>
                {a.current_task}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
