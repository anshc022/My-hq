'use client';
import { AGENTS } from '@/lib/agents';

export default function ChatLog({ messages }) {
  if (!messages || messages.length === 0) {
    return (
      <div style={{
        background: 'rgba(10,10,20,0.8)',
        border: '1px solid #1a1a2e',
        borderRadius: 8,
        padding: '14px 16px',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: '#444',
        fontStyle: 'italic',
        minHeight: 100,
      }}>
        No messages yet...
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(10,10,20,0.8)',
      border: '1px solid #1a1a2e',
      borderRadius: 8,
      padding: '8px 10px',
      maxHeight: 280,
      overflowY: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
    }}>
      {messages.map((msg, i) => {
        const cfg = AGENTS[msg.agent] || {};
        const ts = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        return (
          <div key={msg.id || i} style={{
            padding: '5px 6px',
            borderBottom: '1px solid rgba(255,255,255,0.03)',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}>
            <span style={{ color: '#555', fontSize: 10, flexShrink: 0, minWidth: 56 }}>{ts}</span>
            <span style={{ color: cfg.color || '#888', fontWeight: 600, flexShrink: 0, minWidth: 50 }}>
              {cfg.icon || ''} {cfg.label || msg.agent || '?'}
            </span>
            <span style={{ color: '#bbb', wordBreak: 'break-word' }}>
              {(msg.content || msg.detail || '').slice(0, 300)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
