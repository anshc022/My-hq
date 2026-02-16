'use client';
import { AGENTS } from '@/lib/agents';

export default function EventFeed({ events }) {
  if (!events || events.length === 0) {
    return (
      <div style={{
        background: 'rgba(10,10,20,0.7)',
        border: '1px solid #1a1a2e',
        borderRadius: 8,
        padding: '14px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: '#444',
        fontStyle: 'italic',
        minHeight: 80,
      }}>
        No events yet...
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(10,10,20,0.7)',
      border: '1px solid #1a1a2e',
      borderRadius: 8,
      padding: '6px 8px',
      maxHeight: 220,
      overflowY: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
    }}>
      {events.slice(-30).reverse().map((evt, i) => {
        const cfg = AGENTS[evt.agent] || {};
        const ts = evt.created_at ? new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        const typeColor = evt.type === 'error' ? '#e74c3c' :
                          evt.type === 'lifecycle' ? '#3498db' :
                          evt.type === 'tool-call' ? '#9b59b6' :
                          evt.type === 'delegation' ? '#f1c40f' :
                          evt.type === 'chat' ? '#2ecc71' : '#555';
        return (
          <div key={evt.id || i} style={{
            padding: '4px 4px',
            borderBottom: '1px solid rgba(255,255,255,0.02)',
            display: 'flex',
            gap: 6,
            alignItems: 'center',
          }}>
            <span style={{ color: '#444', fontSize: 9, flexShrink: 0, minWidth: 52 }}>{ts}</span>
            <span style={{
              background: typeColor + '22',
              color: typeColor,
              fontSize: 9,
              padding: '1px 5px',
              borderRadius: 3,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              flexShrink: 0,
              minWidth: 55,
              textAlign: 'center',
            }}>
              {evt.type || 'event'}
            </span>
            <span style={{ color: cfg.color || '#666', fontWeight: 600, flexShrink: 0 }}>
              {cfg.icon || ''} {cfg.label || evt.agent || ''}
            </span>
            <span style={{ color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {evt.title || evt.detail || ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
