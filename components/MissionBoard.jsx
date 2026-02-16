'use client';
import { AGENTS } from '@/lib/agents';

export default function MissionBoard({ agents, nodeConnected }) {
  const total = agents?.length || 0;
  const active = agents?.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s === 'working' || s === 'talking' || s === 'thinking' || s === 'researching' || s === 'posting';
  }).length || 0;
  const idle = agents?.filter(a => (a.status || '').toLowerCase() === 'idle').length || 0;
  const sleeping = agents?.filter(a => (a.status || '').toLowerCase() === 'sleeping').length || 0;
  const errors = agents?.filter(a => (a.status || '').toLowerCase() === 'error').length || 0;

  const stats = [
    { label: 'TOTAL', value: total, color: '#5b7bff', icon: '🤖' },
    { label: 'ACTIVE', value: active, color: '#34d399', icon: '⚡' },
    { label: 'IDLE', value: idle, color: '#888', icon: '💤' },
    { label: 'ERRORS', value: errors, color: errors > 0 ? '#f87171' : '#333', icon: '⚠️' },
  ];

  const sysInfo = [
    { key: 'Gateway', value: '51.20.10.68:18789', icon: '🌐' },
    { key: 'Model', value: 'Claude Opus 4.6', icon: '🧠' },
    { key: 'Engine', value: 'OpenClaw v2026.2.15', icon: '⚙️' },
    { key: 'Runtime', value: 'Node.js v22.22.0', icon: '💚' },
    { key: 'Node', value: nodeConnected ? 'Connected' : 'Disconnected', icon: nodeConnected ? '✅' : '❌' },
  ];

  return (
    <div className="glass-card" style={{ padding: 16 }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        fontFamily: 'var(--font-mono)',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: 1.5 }}>SYSTEM STATUS</span>
        <span className={`status-badge ${nodeConnected ? 'online' : 'offline'}`}>
          <span style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: nodeConnected ? '#34d399' : '#f87171',
            display: 'inline-block',
            boxShadow: nodeConnected ? '0 0 6px rgba(52,211,153,0.6)' : 'none',
          }} />
          {nodeConnected ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 8px',
            textAlign: 'center',
            transition: 'border-color 0.2s',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', letterSpacing: 1.5, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* System info */}
      <div style={{
        background: 'rgba(255,255,255,0.015)',
        border: '1px solid rgba(255,255,255,0.03)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 12px',
      }}>
        <div style={{
          fontSize: 9,
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: 1.5,
          marginBottom: 8,
          fontFamily: 'var(--font-mono)',
        }}>
          SYSTEM INFO
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '5px 14px',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
        }}>
          {sysInfo.map(({ key, value, icon }) => (
            <div key={key} style={{ display: 'contents' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10 }}>{icon}</span>
                {key}
              </span>
              <span style={{
                color: key === 'Node'
                  ? (nodeConnected ? '#34d399' : '#f87171')
                  : 'var(--text-secondary)',
                fontWeight: key === 'Node' ? 600 : 400,
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
