'use client';
import { useMemo } from 'react';
import { AGENTS } from '@/lib/agents';

const STATUS_COLORS = {
  idle: '#666',
  working: '#00e676',
  thinking: '#ffea00',
  talking: '#4fc3f7',
  posting: '#ff9100',
  researching: '#7c4dff',
  error: '#f50057',
  sleeping: '#555',
  monitoring: '#00e676',
};

const STATUS_LABELS = {
  idle: 'Idle',
  working: 'Working',
  thinking: 'Thinking',
  talking: 'Responding',
  posting: 'Posting',
  researching: 'Researching',
  error: 'Error',
  sleeping: 'Sleeping',
  monitoring: 'Monitoring',
};

export default function AgentsWorking({ agents, events }) {
  const agentEventCounts = useMemo(() => {
    const counts = {};
    Object.keys(AGENTS).forEach(name => { counts[name] = 0; });
    (events || []).forEach(evt => {
      if (evt.agent && counts[evt.agent] !== undefined) {
        counts[evt.agent]++;
      }
    });
    return counts;
  }, [events]);

  const totalSignals = events?.length || 0;
  const activeCount = (agents || []).filter(a => {
    const s = (a.status || '').toLowerCase();
    return s === 'working' || s === 'thinking' || s === 'talking' || s === 'posting' || s === 'researching';
  }).length;

  const scrollToCanvas = () => {
    const el = document.querySelector('canvas');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="neo-card-static animate-fade-in" style={{ border: '2px solid #2a2a2a' }}>
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 pb-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <h2 className="text-[15px] md:text-[17px] font-black text-white tracking-wider uppercase">
            Agents Working Right Now
          </h2>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* LIVE FEED badge */}
          <span
            className="neo-badge text-[9px]"
            style={{
              background: '#00e67620',
              color: '#00e676',
              borderColor: '#00e676',
            }}
          >
            <span className="inline-block w-[6px] h-[6px] bg-[#00e676] mr-1.5 animate-pulse" />
            LIVE FEED
          </span>
          {/* Signal count */}
          <span className="text-[11px] font-bold text-[var(--color-muted)] font-mono">
            <span className="text-white font-black">{totalSignals}</span> signals processed
          </span>
          {/* Enter the Stage button */}
          <button
            onClick={scrollToCanvas}
            className="text-[10px] font-black font-mono tracking-wider uppercase px-3 py-1.5 border-2 border-[var(--color-neo-blue)] text-[var(--color-neo-blue)] hover:bg-[var(--color-neo-blue)] hover:text-black transition-colors"
          >
            Enter the Stage →
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 my-3 border-t-2 border-dashed border-[var(--color-border)]" />

      {/* Agent Cards Row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 px-4 pb-4">
        {Object.entries(AGENTS).map(([name, config]) => {
          const agentData = (agents || []).find(a => a.name === name) || {};
          const status = (agentData.status || 'idle').toLowerCase();
          const statusColor = STATUS_COLORS[status] || '#666';
          const statusLabel = STATUS_LABELS[status] || 'Idle';
          const eventCount = agentEventCounts[name] || 0;
          const isBusy = status === 'working' || status === 'thinking' || status === 'talking' || status === 'posting' || status === 'researching';

          return (
            <div
              key={name}
              className="flex flex-col items-center gap-1.5 p-3 border-2 transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px]"
              style={{
                borderColor: isBusy ? statusColor : '#1a1a1a',
                background: isBusy ? statusColor + '08' : '#0d0d0d',
                boxShadow: isBusy ? `3px 3px 0px ${statusColor}40` : '3px 3px 0px #1a1a1a',
              }}
            >
              {/* Avatar circle */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  border: `3px solid ${config.color}`,
                  background: config.color + '18',
                  fontSize: 20,
                  boxShadow: isBusy ? `0 0 12px ${config.color}30` : 'none',
                }}
              >
                {config.icon}
                {/* Status indicator dot */}
                <span
                  className="absolute bottom-0 right-0"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: statusColor,
                    border: '2px solid #0a0a0a',
                    boxShadow: isBusy ? `0 0 6px ${statusColor}` : 'none',
                  }}
                />
              </div>

              {/* Agent name */}
              <span className="text-[11px] font-black text-white tracking-wider font-mono uppercase">
                {config.label}
              </span>

              {/* Status */}
              <span
                className="text-[9px] font-bold font-mono tracking-wide"
                style={{ color: statusColor }}
              >
                {statusLabel}
              </span>

              {/* Event count */}
              <span className="text-[8px] font-mono text-[var(--color-muted)]">
                {eventCount} events
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
