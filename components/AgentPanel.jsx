'use client';
import { AGENTS } from '@/lib/agents';
import './AgentPanel.css';

const statusEmoji = {
  idle: '💤', working: '🟢', thinking: '🤔', talking: '💬',
  posting: '📤', researching: '🔎', error: '⚠️', sleeping: '😴',
};

export default function AgentPanel({ agents }) {
  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>AGENTS</h3>
      <div className="agent-list">
        {(agents || []).map(a => {
          const config = AGENTS[a.name] || {};
          const isWorking = ['working', 'busy'].includes(a.status?.toLowerCase());
          return (
            <div key={a.name} className={`agent-card ${isWorking ? 'working-glow' : ''}`}>
              <div className="agent-card-header">
                <span style={{ ...styles.dot, backgroundColor: config.color }}></span>
                <span style={styles.icon}>{config.icon}</span>
                <span style={styles.name}>{config.label}</span>
                <span className="agent-role" style={{ color: config.color }}>{config.role}</span>
              </div>
              <div className="agent-card-status">
                <span style={styles.status}>
                  {statusEmoji[a.status] || '⚪'} <span className="status-text">{a.status}</span>
                </span>
              </div>
              {a.current_task && (
                <div className="agent-card-task">"{a.current_task.slice(0, 40)}"</div>
              )}
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
  status: {
    color: '#aaa',
    fontSize: 10,
    fontFamily: 'monospace',
  },
};
