'use client';
import { useState, useEffect, useCallback } from 'react';

export default function MissionBoard() {
  const [health, setHealth] = useState(null);
  const [uptime, setUptime] = useState(0);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/gateway-bridge');
      const data = await res.json();
      setHealth(data);
    } catch { setHealth(null); }
  }, []);

  useEffect(() => {
    fetchHealth();
    const iv = setInterval(fetchHealth, 15000);
    return () => clearInterval(iv);
  }, [fetchHealth]);

  // Uptime counter
  useEffect(() => {
    const iv = setInterval(() => setUptime(p => p + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  const isOnline = !!health;

  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>SYSTEM HEALTH</h3>

      {/* Connection Status */}
      <div style={styles.statusRow}>
        <span style={{ color: isOnline ? '#2ecc71' : '#e74c3c', fontSize: 18 }}>
          {isOnline ? '●' : '○'}
        </span>
        <div>
          <div style={{ color: isOnline ? '#2ecc71' : '#e74c3c', fontSize: 13, fontFamily: 'monospace', fontWeight: 'bold' }}>
            {isOnline ? 'CONNECTED' : 'OFFLINE'}
          </div>
          <div style={{ color: '#555', fontSize: 10, fontFamily: 'monospace' }}>
            AWS EC2 Gateway
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={styles.metrics}>
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Gateway</span>
          <span style={styles.metricValue}>ws://13.60.27.149</span>
        </div>
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Model</span>
          <span style={{ ...styles.metricValue, color: '#9b59b6' }}>gemini-3-pro</span>
        </div>
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Session</span>
          <span style={styles.metricValue}>{formatUptime(uptime)}</span>
        </div>
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Bridge</span>
          <span style={{ ...styles.metricValue, color: isOnline ? '#2ecc71' : '#e74c3c' }}>
            {isOnline ? 'Active' : 'Down'}
          </span>
        </div>
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Discord</span>
          <span style={{ ...styles.metricValue, color: '#7289da' }}>echo⚡</span>
        </div>
        <div style={styles.metric}>
          <span style={styles.metricLabel}>Agents</span>
          <span style={styles.metricValue}>6 registered</span>
        </div>
      </div>

      {/* Live indicator */}
      <div style={styles.liveBar}>
        <span style={styles.liveDot} />
        <span style={{ color: '#555', fontSize: 10, fontFamily: 'monospace' }}>
          Real-time monitoring active
        </span>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    background: '#111',
    borderRadius: 8,
    padding: 10,
    border: '1px solid #333',
    boxSizing: 'border-box',
  },
  title: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 2,
    margin: '0 0 12px',
    fontFamily: 'monospace',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    padding: '8px 10px',
    background: '#0a0a0a',
    borderRadius: 6,
    border: '1px solid #222',
  },
  metrics: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  metric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
    borderBottom: '1px solid #1a1a1a',
  },
  metricLabel: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  metricValue: {
    color: '#ccc',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  liveBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    padding: '6px 8px',
    background: '#0a1a0a',
    borderRadius: 4,
    border: '1px solid #1a3a1a',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#2ecc71',
    animation: 'pulse 2s infinite',
    flexShrink: 0,
  },
};
