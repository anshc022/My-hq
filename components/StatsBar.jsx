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
    const tick = () =>
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-5 py-2.5 bg-bg/90 backdrop-blur-xl border-b border-white/[0.04] font-mono text-[11px]">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-blue-700 flex items-center justify-center text-sm shadow-lg shadow-accent/20">
          ⚡
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-bold text-white tracking-[0.15em]">OPENCLAW</span>
          <span className="text-[9px] text-muted tracking-widest">HQ</span>
        </div>
      </div>

      {/* Right side indicators */}
      <div className="flex items-center gap-4">
        {/* Live pulse */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px] shadow-success/50" style={{ animation: 'pulse-slow 2s ease-in-out infinite' }} />
          <span className="text-success text-[9px] font-semibold tracking-[0.15em]">LIVE</span>
        </div>

        <span className="text-white/[0.06] text-lg font-light">|</span>

        {/* Agent count */}
        <div className="flex items-center gap-1">
          <span className={`font-semibold text-xs ${active > 0 ? 'text-success' : 'text-muted'}`}>{active}</span>
          <span className="text-muted text-[10px]">/</span>
          <span className="text-subtle text-xs">{total}</span>
          <span className="text-muted text-[9px] tracking-widest ml-0.5">AGENTS</span>
        </div>

        <span className="text-white/[0.06] text-lg font-light">|</span>

        {/* Node status */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-wider border ${
          nodeConnected
            ? 'bg-success/10 text-success border-success/20'
            : 'bg-danger/10 text-danger border-danger/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${nodeConnected ? 'bg-success shadow-[0_0_6px] shadow-success/60' : 'bg-danger'}`} />
          NODE
        </div>

        <span className="text-white/[0.06] text-lg font-light">|</span>

        {/* Clock */}
        <span className="text-muted text-[10px] tabular tracking-wider">{time}</span>
      </div>
    </header>
  );
}
