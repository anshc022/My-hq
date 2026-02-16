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
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      background: 'rgba(6,6,16,0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      gap: 16,
      flexWrap: 'wrap',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #5b7bff, #3b5bdf)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          boxShadow: '0 2px 12px rgba(91,123,255,0.3)',
        }}>
          ⚡
        </div>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>OPENCLAW</span>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1, marginLeft: 6 }}>HQ</span>
        </div>
      </div>

      {/* Status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Live */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span className="live-dot" style={{ background: '#34d399', boxShadow: '0 0 8px rgba(52,211,153,0.5)' }} />
          <span style={{ color: '#34d399', fontSize: 9, fontWeight: 600, letterSpacing: 1.5 }}>LIVE</span>
        </div>

        <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: 14, fontWeight: 300 }}>|</span>

        {/* Agents */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: active > 0 ? '#34d399' : 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>{active}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>/</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{total}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 9, letterSpacing: 1, marginLeft: 2 }}>AGENTS</span>
        </div>

        <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: 14, fontWeight: 300 }}>|</span>

        {/* Node */}
        <div className={`status-badge ${nodeConnected ? 'online' : 'offline'}`}>
          <span style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: nodeConnected ? '#34d399' : '#f87171',
            display: 'inline-block',
            boxShadow: nodeConnected ? '0 0 6px rgba(52,211,153,0.6)' : 'none',
          }} />
          NODE
        </div>

        <span style={{ color: 'rgba(255,255,255,0.08)', fontSize: 14, fontWeight: 300 }}>|</span>

        {/* Clock */}
        <span style={{ color: 'var(--text-muted)', fontSize: 10, fontVariantNumeric: 'tabular-nums', letterSpacing: 1 }}>{time}</span>
      </div>
    </header>
  );
}
