'use client';
import { AGENTS } from '@/lib/agents';
import { useEffect, useRef, useState, useMemo } from 'react';
import './AgentPanel.css';

const statusEmoji = {
  idle: '💤', working: '🟢', thinking: '🤔', talking: '💬',
  posting: '📤', researching: '🔎', error: '⚠️', sleeping: '😴',
};

// Simple pseudo-random generator for stable sparklines
const pseudoRandom = (seed) => {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const Sparkline = ({ active, color, name }) => {
  const points = useMemo(() => {
    // Generate a fixed path based on agent name (stable signature)
    const count = 20;
    const data = [];
    
    // Simple string hash for seeding
    let seed = 0;
    for (let i = 0; i < (name || 'default').length; i++) {
      seed = name.charCodeAt(i) + ((seed << 5) - seed);
    }
    
    const rand = pseudoRandom(Math.abs(seed)); 
    let prev = 0.5;
    for(let i=0; i<count; i++) {
      const val = Math.max(0.1, Math.min(0.9, prev + (rand() - 0.5) * 0.8)); // Increased variance slightly
      data.push(val);
      prev = val;
    }
    return data;
  }, [name]);

  const width = 100;
  const height = 20;
  const step = width / (points.length - 1);
  const pathData = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${i * step} ${height - (p * height)}`
  ).join(' ');

  return (
    <div style={{ 
      position: 'absolute', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      height: 24, 
      opacity: active ? 0.3 : 0.1,
      pointerEvents: 'none',
      maskImage: 'linear-gradient(to top, black, transparent)'
    }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
        <path d={pathData} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

export default function AgentPanel({ agents }) {
  const audioCtxRef = useRef(null);
  const prevStatusRef = useRef({});

  useEffect(() => {
    // Initialize Audio Context on first interaction/mount
    if (typeof window !== 'undefined' && !audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtxRef.current = new AudioContext();
    }
  }, []);

  const playBeep = (freq = 880, type = 'sine') => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  useEffect(() => {
    (agents || []).forEach(a => {
      const prev = prevStatusRef.current[a.name];
      const curr = a.status;
      const isWorking = ['working', 'busy', 'thinking', 'researching'].includes(curr?.toLowerCase());
      const wasWorking = ['working', 'busy', 'thinking', 'researching'].includes(prev?.toLowerCase());

      // Trigger sound on transition INTO working state
      if (isWorking && !wasWorking) {
        playBeep(1200, 'square'); // Higher pitch digital bleep
      }
      
      prevStatusRef.current[a.name] = curr;
    });
  }, [agents]);

  return (
    <div className="agent-panel">
      <h3 className="agent-panel-title">AGENTS</h3>
      <div className="agent-list">
        {(agents || []).map(a => {
          const config = AGENTS[a.name] || {};
          const isWorking = ['working', 'busy', 'thinking', 'researching'].includes(a.status?.toLowerCase());
          return (
            <div key={a.name} className={`agent-card ${isWorking ? 'working-glow' : ''}`}
                 style={{ borderLeftColor: config.color || '#555' }}>
              <Sparkline active={isWorking} color={config.color || '#4ade80'} name={a.name} />
              <div className="agent-card-header" style={{ position: 'relative', zIndex: 2 }}>
                <span className="agent-dot" style={{ backgroundColor: config.color, color: config.color }}></span>
                <span className="agent-icon">{config.icon}</span>
                <span className="agent-name">{config.label}</span>
                <span className="agent-role" style={{ color: config.color }}>{config.role}</span>
              </div>
              <div className="agent-card-status" style={{ position: 'relative', zIndex: 2 }}>
                <span className="agent-status-badge">
                  {statusEmoji[a.status] || '⚪'} <span>{a.status}</span>
                </span>
              </div>
              {a.current_task && (
                <div className="agent-card-task" style={{ position: 'relative', zIndex: 2 }}>
                  &quot;{a.current_task.slice(0, 50)}&quot;
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
