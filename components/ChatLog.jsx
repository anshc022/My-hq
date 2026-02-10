'use client';
import { AGENTS } from '@/lib/agents';

export default function ChatLog({ messages }) {
  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>GATEWAY LOG</h3>
      <div style={styles.list}>
        {(messages || []).length === 0 && (
          <div style={styles.empty}>No gateway messages yet...</div>
        )}
        {(messages || []).slice(-20).reverse().map(m => {
          const isUser = m.from_agent === 'user';
          const agentKey = isUser ? m.to_agent : m.from_agent;
          const agentInfo = AGENTS[agentKey] || {};
          const direction = isUser ? '▸' : '◂';
          const label = isUser ? 'User' : (agentInfo.label || agentKey);
          const color = isUser ? '#60a5fa' : (agentInfo.color || '#888');

          return (
            <div key={m.id} style={styles.row}>
              <span style={{ ...styles.dir, color: isUser ? '#60a5fa' : '#22c55e' }}>{direction}</span>
              <span style={{ color, fontWeight: 600, fontSize: 11, minWidth: 40 }}>{label}</span>
              <span style={styles.msg}>{(m.message || '').slice(0, 150)}</span>
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
    maxHeight: 200,
    overflowY: 'auto',
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
    gap: 5,
    padding: '4px 0',
    borderBottom: '1px solid #1a1a1a',
    fontSize: 12,
    fontFamily: 'monospace',
    flexWrap: 'wrap',
  },
  dir: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  msg: {
    color: '#aaa',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
};
