'use client';
import { useEffect, useState } from 'react';

export default function StatsBar({ agents, nodeConnected }) {
  const total = agents?.length || 0;
  const active = agents?.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s !== 'idle' && s !== 'sleeping';
  }).length || 0;

  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString([], { month: 'short', day: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="sticky top-0 z-50 font-mono">
      {/* Gradient border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="flex items-center justify-between px-5 py-2.5 bg-bg/80 backdrop-blur-2xl">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-accent via-blue-600 to-purple-700 flex items-center justify-center text-sm shadow-lg shadow-accent/25">
            <span className="relative z-10">⚡</span>
            <div className="absolute inset-0 rounded-xl bg-accent/20 blur-md" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[14px] font-extrabold tracking-[0.15em] gradient-text">OPS</span>
            <span className="text-[9px] text-muted tracking-widest font-medium">HQ</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
            <span className="text-[8px] text-purple-400 font-bold tracking-wider">OpenClaw</span>
            <span className="text-white/[0.15] text-[6px]">+</span>
            <span className="text-[8px] text-cyan-400 font-bold tracking-wider">K2</span>
          </div>
        </div>

        {/* Right side indicators */}
        <div className="flex items-center gap-3.5">
          {/* Live pulse */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/[0.06] border border-success/10">
            <span className="relative w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-40" />
              <span className="relative block w-2 h-2 rounded-full bg-success shadow-[0_0_10px] shadow-success/60" />
            </span>
            <span className="text-success text-[9px] font-bold tracking-[0.15em]">LIVE</span>
          </div>

          <div className="w-px h-4 bg-white/[0.06]" />

          {/* Agent count */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-baseline gap-0.5">
              <span className={`font-extrabold text-sm tabular ${active > 0 ? 'text-success' : 'text-muted'}`}>{active}</span>
              <span className="text-white/10 text-[10px] font-light">/</span>
              <span className="text-subtle text-xs tabular">{total}</span>
            </div>
            <span className="text-muted text-[8px] tracking-[0.2em] font-medium">AGENTS</span>
          </div>

          <div className="w-px h-4 bg-white/[0.06]" />

          {/* Node status */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider border transition-all duration-300 ${
            nodeConnected
              ? 'bg-success/[0.08] text-success border-success/20 shadow-[0_0_12px] shadow-success/10'
              : 'bg-danger/[0.08] text-danger border-danger/20 shadow-[0_0_12px] shadow-danger/10'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${nodeConnected ? 'bg-success shadow-[0_0_6px] shadow-success/60' : 'bg-danger'}`} />
            NODE
          </div>

          <div className="w-px h-4 bg-white/[0.06]" />

          {/* Clock */}
          <div className="flex flex-col items-end">
            <span className="text-subtle text-[11px] tabular tracking-wider font-medium">{time}</span>
            <span className="text-muted text-[8px] tracking-widest">{date}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
