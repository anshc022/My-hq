'use client';
import { AGENTS } from '@/lib/agents';

const statusEmoji = {
  idle: '💤', working: '🟢', thinking: '🤔', talking: '💬',
  posting: '📤', researching: '🔎', error: '⚠️', sleeping: '😴',
};

export default function AgentPanel({ agents }) {
  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>AGENTS</h3>
      {(agents || []).map(a => {
        const config = AGENTS[a.name] || {};
        return (
          <div key={a.name} style={styles.row}>
            <div style={styles.rowTop}>
              <span style={{ ...styles.dot, backgroundColor: config.color }}></span>
              <span style={styles.icon}>{config.icon}</span>
              <span style={styles.name}>{config.label}</span>
              <span style={{ ...styles.role, color: config.color }}>{config.role}</span>
            </div>
            <div style={styles.rowBottom}>
              <span style={styles.status}>
                {statusEmoji[a.status] || '⚪'} {a.status}
              </span>
            </div>
            {a.current_task && (
              <div style={styles.task}>"{a.current_task.slice(0, 40)}"</div>
            )}
          </div>
        );
      })}
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
    overflow: 'hidden',
  },
  title: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 2,
    margin: '0 0 8px',
    fontFamily: 'monospace',
  },
  row: {
    padding: '5px 0',
    borderBottom: '1px solid #222',
  },
  rowTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  rowBottom: {
    paddingLeft: 16,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
  },
  icon: {
    fontSize: 12,
  },
  name: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  role: {
    fontSize: 9,
    fontFamily: 'monospace',
    opacity: 0.7,
    background: 'rgba(255,255,255,0.05)',
    padding: '0px 4px',
    borderRadius: 3,
    border: '1px solid rgba(255,255,255,0.08)',
    marginLeft: 'auto',
  },
  status: {
    color: '#aaa',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  task: {
    color: '#666',
    fontSize: 9,
    fontFamily: 'monospace',
    fontStyle: 'italic',
    paddingLeft: 16,
    marginTop: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};
