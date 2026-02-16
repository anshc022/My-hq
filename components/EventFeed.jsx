'use client';
import { AGENTS } from '@/lib/agents';

const TYPE_STYLES = {
  error:      { bg: 'rgba(248,113,113,0.1)', color: '#f87171', border: 'rgba(248,113,113,0.2)' },
  lifecycle:  { bg: 'rgba(56,189,248,0.1)',  color: '#38bdf8', border: 'rgba(56,189,248,0.2)' },
  'tool-call':{ bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: 'rgba(167,139,250,0.2)' },
  delegation: { bg: 'rgba(251,191,36,0.1)',  color: '#fbbf24', border: 'rgba(251,191,36,0.2)' },
  chat:       { bg: 'rgba(52,211,153,0.1)',  color: '#34d399', border: 'rgba(52,211,153,0.2)' },
  task:       { bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa', border: 'rgba(96,165,250,0.2)' },
  system:     { bg: 'rgba(255,255,255,0.04)', color: '#888', border: 'rgba(255,255,255,0.06)' },
};

export default function EventFeed({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="glass-card" style={{
        padding: '20px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
        minHeight: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 16, opacity: 0.4 }}>📡</span>
        Waiting for events...
      </div>
    );
  }

  return (
    <div className="glass-card" style={{
      padding: '4px 6px',
      maxHeight: 260,
      overflowY: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
    }}>
      {events.slice(-30).reverse().map((evt, i) => {
        const cfg = AGENTS[evt.agent] || {};
        const ts = evt.created_at ? new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        const typeKey = (evt.event_type || evt.type || 'event').toLowerCase();
        const typeStyle = TYPE_STYLES[typeKey] || TYPE_STYLES.system;
        return (
          <div key={evt.id || i} style={{
            padding: '6px 8px',
            borderBottom: '1px solid rgba(255,255,255,0.02)',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            borderRadius: 6,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: 9, flexShrink: 0, minWidth: 52, fontVariantNumeric: 'tabular-nums' }}>{ts}</span>
            <span style={{
              background: typeStyle.bg,
              color: typeStyle.color,
              border: `1px solid ${typeStyle.border}`,
              fontSize: 8,
              padding: '2px 6px',
              borderRadius: 4,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              flexShrink: 0,
              minWidth: 58,
              textAlign: 'center',
            }}>
              {typeKey}
            </span>
            <span style={{ color: cfg.color || '#666', fontWeight: 600, flexShrink: 0, fontSize: 10 }}>
              {cfg.icon || ''} {cfg.label || evt.agent || ''}
            </span>
            <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10 }}>
              {evt.title || evt.detail || ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
