'use client';
import { useRef, useEffect } from 'react';
import { AGENTS } from '@/lib/agents';
import './AgentPanel.css';

export default function AgentPanel({ agents }) {
  const beepRef = useRef(null);
  const prevStatusRef = useRef({});

  useEffect(() => {
    if (!agents) return;
    agents.forEach(a => {
      const prev = prevStatusRef.current[a.name];
      if (prev && prev === 'idle' && a.status !== 'idle' && a.status !== 'sleeping') {
        try {
          if (!beepRef.current) {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            beepRef.current = ac;
          }
          const ac = beepRef.current;
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.frequency.setValueAtTime(880, ac.currentTime);
          gain.gain.setValueAtTime(0.05, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
          osc.start(ac.currentTime);
          osc.stop(ac.currentTime + 0.15);
        } catch {}
      }
      prevStatusRef.current[a.name] = a.status;
    });
  }, [agents]);

  if (!agents || agents.length === 0) {
    return (
      <div className="agent-panel">
        <div style={{ color: '#555', fontFamily: 'var(--font-mono)', fontSize: 12, padding: 12 }}>
          Waiting for agents...
        </div>
      </div>
    );
  }

  return (
    <div className="agent-panel">
      {agents.map(a => {
        const cfg = AGENTS[a.name] || {};
        return (
          <div
            key={a.name}
            className="agent-card"
            style={{ '--agent-color': cfg.color || '#4a6aff' }}
          >
            <div className="agent-card-header">
              <span className="agent-icon">{cfg.icon || '?'}</span>
              <span className="agent-name">{cfg.label || a.name}</span>
              <span className="agent-role">{cfg.role || ''}</span>
            </div>
            <div className="agent-status">
              <span className={`agent-status-dot ${a.status || 'idle'}`} />
              <span className="agent-status-label">{a.status || 'idle'}</span>
            </div>
            {a.current_task && (
              <div className="agent-task" title={a.current_task}>
                {a.current_task}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
