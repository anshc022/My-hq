'use client';
import { AGENTS } from '@/lib/agents';
import { useEffect, useRef } from 'react';
import './AgentPanel.css';

const statusMeta = {
  idle:        { emoji: '💤', label: 'Idle',        cls: 'idle' },
  working:     { emoji: '⚡', label: 'Working',     cls: 'active' },
  busy:        { emoji: '⚡', label: 'Busy',        cls: 'active' },
  thinking:    { emoji: '🧠', label: 'Thinking',    cls: 'active' },
  talking:     { emoji: '💬', label: 'Talking',     cls: 'active' },
  posting:     { emoji: '📤', label: 'Posting',     cls: 'active' },
  researching: { emoji: '🔎', label: 'Researching', cls: 'active' },
  error:       { emoji: '⚠️', label: 'Error',       cls: 'error' },
  sleeping:    { emoji: '😴', label: 'Sleeping',    cls: 'idle' },
};

export default function AgentPanel({ agents }) {
  const audioCtxRef = useRef(null);
  const prevStatusRef = useRef({});

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtxRef.current = new AC();
    }
  }, []);

  const playBeep = () => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  };

  useEffect(() => {
    (agents || []).forEach(a => {
      const prev = prevStatusRef.current[a.name];
      const curr = a.status;
      const isActive = ['working', 'busy', 'thinking', 'researching'].includes(curr?.toLowerCase());
      const wasActive = ['working', 'busy', 'thinking', 'researching'].includes(prev?.toLowerCase());
      if (isActive && !wasActive) playBeep();
      prevStatusRef.current[a.name] = curr;
    });
  }, [agents]);

  return (
    <div className="ap">
      <div className="ap-header">
        <span className="ap-dot-pulse" />
        <span className="ap-title">AGENTS</span>
        <span className="ap-count">{(agents || []).length}</span>
      </div>
      <div className="ap-list">
        {(agents || []).map((a, i) => {
          const cfg = AGENTS[a.name] || {};
          const st = statusMeta[a.status?.toLowerCase()] || statusMeta.idle;
          const isActive = st.cls === 'active';
          return (
            <div
              key={a.name}
              className={`ap-card ${st.cls}`}
              style={{
                '--agent-color': cfg.color || '#555',
                animationDelay: `${i * 60}ms`,
              }}
            >
              {/* Accent line */}
              <div className="ap-accent" />

              {/* Row 1: icon + name + status dot */}
              <div className="ap-row">
                <span className="ap-icon">{cfg.icon}</span>
                <span className="ap-name">{cfg.label}</span>
                <span className={`ap-status-dot ${st.cls}`} title={st.label} />
              </div>

              {/* Row 2: status text */}
              <div className="ap-status">
                <span className="ap-emoji">{st.emoji}</span>
                <span className="ap-status-text">{st.label}</span>
              </div>

              {/* Row 3: task (if any) */}
              {a.current_task && (
                <div className="ap-task">
                  {a.current_task.length > 42
                    ? a.current_task.slice(0, 40) + '…'
                    : a.current_task}
                </div>
              )}

              {/* Subtle bottom glow when active */}
              {isActive && <div className="ap-glow" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
