'use client';
import { useRef, useEffect } from 'react';
import { AGENTS } from '@/lib/agents';

export default function ChatLog({ messages }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="glass-card" style={{
        padding: '20px',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
        minHeight: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 16, opacity: 0.4 }}>💬</span>
        No messages yet...
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="glass-card" style={{
      padding: '6px 8px',
      maxHeight: 300,
      overflowY: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
    }}>
      {messages.map((msg, i) => {
        const cfg = AGENTS[msg.agent] || {};
        const ts = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        return (
          <div key={msg.id || i} style={{
            padding: '7px 8px',
            borderBottom: '1px solid rgba(255,255,255,0.02)',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            borderRadius: 6,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: 9, flexShrink: 0, minWidth: 52, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{ts}</span>
            <span style={{
              color: cfg.color || '#888',
              fontWeight: 700,
              flexShrink: 0,
              minWidth: 56,
              fontSize: 10,
              marginTop: 1,
            }}>
              {cfg.icon || ''} {cfg.label || msg.agent || '?'}
            </span>
            <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-word', lineHeight: 1.5, fontSize: 11 }}>
              {(msg.content || msg.detail || '').slice(0, 300)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
