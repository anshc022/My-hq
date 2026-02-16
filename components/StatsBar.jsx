'use client';

export default function StatsBar({ agents, nodeConnected }) {
  const total = agents?.length || 0;
  const active = agents?.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s !== 'idle' && s !== 'sleeping';
  }).length || 0;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      background: 'rgba(10,10,20,0.9)',
      borderBottom: '1px solid #1a1a2e',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 900, color: '#4a6aff', letterSpacing: 2 }}>OPENCLAW</span>
        <span style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>HQ v2</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#2ecc71',
            boxShadow: '0 0 6px #2ecc71',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ color: '#2ecc71', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>LIVE</span>
        </span>
        <span style={{ color: '#666' }}>|</span>
        <span style={{ color: '#aaa' }}>{active}/{total} active</span>
        <span style={{ color: '#666' }}>|</span>
        <span style={{
          color: nodeConnected ? '#2ecc71' : '#e74c3c',
          fontSize: 10,
        }}>
          NODE {nodeConnected ? '●' : '○'}
        </span>
      </div>
    </div>
  );
}
