'use client';
import { useEffect, useState } from 'react';

export default function StatsBar({ agents, nodeConnected }) {
  const total = agents?.length || 0;
  const active = agents?.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s !== 'idle' && s !== 'sleeping';
  }).length || 0;

  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-50 font-mono bg-bg border-b-[3px] border-[var(--color-border)]">
      <div className="flex items-center justify-between px-5 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[var(--color-accent)] border-2 border-white flex items-center justify-center text-base font-black neo-shadow-sm">
            ⚡
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[16px] font-black tracking-[0.2em] text-white">OPS</span>
            <span className="text-[10px] text-[var(--color-neo-yellow)] font-extrabold tracking-widest">HQ</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 ml-2 px-3 py-1 bg-[var(--color-surface)] border-2 border-[var(--color-border)] neo-shadow-sm">
            <span className="text-[9px] text-[var(--color-neo-purple)] font-black tracking-wider">OPENCLAW</span>
            <span className="text-white/30 text-[8px] font-black">+</span>
            <span className="text-[9px] text-[var(--color-neo-blue)] font-black tracking-wider">K2</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Live */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-neo-green)] border-2 border-white neo-shadow-sm">
            <span className="w-2 h-2 bg-black" style={{ animation: 'blink 1s step-end infinite' }} />
            <span className="text-black text-[9px] font-black tracking-[0.2em]">LIVE</span>
          </div>

          {/* Agent count */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-surface)] border-2 border-[var(--color-border)]">
            <span className={`font-black text-base tabular ${active > 0 ? 'text-[var(--color-neo-green)]' : 'text-[var(--color-muted)]'}`}>{active}</span>
            <span className="text-white/30 text-sm font-light">/</span>
            <span className="text-white/70 text-sm tabular font-bold">{total}</span>
            <span className="text-[var(--color-muted)] text-[8px] tracking-[0.2em] font-black">AGENTS</span>
          </div>

          {/* Node status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 border-2 neo-shadow-sm ${
            nodeConnected
              ? 'bg-[var(--color-neo-green)]/10 border-[var(--color-neo-green)] text-[var(--color-neo-green)]'
              : 'bg-[var(--color-danger)]/10 border-[var(--color-danger)] text-[var(--color-danger)]'
          }`}>
            <span className={`w-2 h-2 ${nodeConnected ? 'bg-[var(--color-neo-green)]' : 'bg-[var(--color-danger)]'}`} />
            <span className="text-[9px] font-black tracking-[0.15em]">NODE</span>
          </div>

          {/* Clock */}
          <div className="px-3 py-1.5 bg-[var(--color-surface)] border-2 border-[var(--color-border)]">
            <span className="text-[var(--color-neo-blue)] text-[11px] tabular tracking-wider font-bold">{time}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
