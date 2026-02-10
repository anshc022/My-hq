'use client';

export default function StatsBar({ agents, events }) {
  const active = (agents || []).filter(a => a.status !== 'idle' && a.status !== 'sleeping').length;
  const total = (agents || []).length;
  const evtCount = (events || []).length;

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        <span style={styles.logo}>OPENCLAW HQ</span>
        <span style={styles.live}>LIVE</span>
      </div>
      <div style={styles.right}>
        <span style={styles.stat}>Agents: {active}/{total}</span>
        <span style={styles.stat}>Events: {evtCount}</span>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '10px 16px',
    background: '#111',
    borderBottom: '1px solid #222',
    gap: 8,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    color: '#2ecc71',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  live: {
    color: '#2ecc71',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    padding: '2px 8px',
    borderRadius: 4,
    border: '1px solid #2ecc71',
    animation: 'pulse 2s infinite',
  },
  right: {
    display: 'flex',
    gap: 16,
  },
  stat: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'monospace',
  },
};