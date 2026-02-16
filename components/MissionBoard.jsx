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
    { label: 'AGENTS', value: total, color: '#4a6aff' },
    { label: 'ACTIVE', value: active, color: '#2ecc71' },
    { label: 'IDLE', value: idle, color: '#888' },
    { label: 'SLEEPING', value: sleeping, color: '#666' },
    { label: 'ERRORS', value: errors, color: errors > 0 ? '#e74c3c' : '#333' },
  ];

  return (
    <div style={{
      background: 'rgba(10,10,20,0.8)',
      border: '1px solid #1a1a2e',
      borderRadius: 8,
      padding: 14,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        fontFamily: 'var(--font-mono)',
      }}>
        <span style={{ fontSize: 14 }}>📊</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#ccc', letterSpacing: 1 }}>SYSTEM STATUS</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 9,
          padding: '2px 8px',
          borderRadius: 4,
          background: nodeConnected ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
          color: nodeConnected ? '#2ecc71' : '#e74c3c',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          {nodeConnected ? '● ONLINE' : '○ OFFLINE'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            flex: 1,
            minWidth: 65,
            background: 'rgba(20,20,40,0.5)',
            border: `1px solid ${s.color}22`,
            borderRadius: 6,
            padding: '8px 10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)' }}>{s.value}</div>
            <div style={{ fontSize: 8, color: '#666', letterSpacing: 1, fontFamily: 'var(--font-mono)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
        fontFamily: 'var(--font-mono)',
      }}>
        <span style={{ fontSize: 12 }}>🤖</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#888', letterSpacing: 1 }}>SYSTEM INFO</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '3px 12px',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
      }}>
        {[
          ['Gateway', '51.20.10.68:18789'],
          ['Model', 'claude-opus-4.6'],
          ['Engine', 'OpenClaw v2026.2.15'],
          ['Runtime', 'Node.js v22.22.0'],
          ['Node', nodeConnected ? 'Connected' : 'Disconnected'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'contents' }}>
            <span style={{ color: '#555' }}>{k}</span>
            <span style={{ color: '#999' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
