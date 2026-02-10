'use client';
import { AGENTS } from '@/lib/agents';

export default function EventFeed({ events }) {
  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>EVENTS</h3>
      <div style={styles.list}>
        {(events || []).length === 0 && (
          <div style={styles.empty}>Waiting for events...</div>
        )}
        {(events || []).slice(-30).reverse().map(e => {
          const config = AGENTS[e.agent] || {};
          const time = new Date(e.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: false,
          });
          return (
            <div key={e.id} style={styles.row}>
              <span style={styles.time}>{time}</span>
              <span style={{ color: config.color || '#888' }}>{config.icon || '?'}</span>
              <span style={styles.agent}>{config.label || e.agent}</span>
              <span style={styles.text}>{e.title || e.detail}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  panel: {
    background: '#111',
    borderRadius: 8,
    padding: 12,
    border: '1px solid #333',
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 2,
    margin: '0 0 10px',
    fontFamily: 'monospace',
  },
  list: {
    maxHeight: 350,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  empty: {
    color: '#555',
    fontSize: 12,
    fontFamily: 'monospace',
    fontStyle: 'italic',
    padding: 10,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 0',
    borderBottom: '1px solid #1a1a1a',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  time: {
    color: '#555',
    fontSize: 10,
    minWidth: 42,
    flexShrink: 0,
  },
  agent: {
    color: '#ccc',
    fontWeight: 'bold',
    minWidth: 60,
    flexShrink: 0,
  },
  text: {
    color: '#aaa',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};
