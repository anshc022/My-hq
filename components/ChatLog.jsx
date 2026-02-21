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
      <div className="neo-card-static p-6 flex flex-col items-center justify-center gap-2 text-[var(--color-muted)] font-mono text-[11px] min-h-[140px]">
        <span className="text-2xl">💬</span>
        <span className="text-[10px] tracking-wider font-bold">No messages yet...</span>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="neo-card-static p-2 max-h-[350px] overflow-y-auto font-mono text-[11px] smooth-scroll">
      {messages.map((msg, i) => {
        const cfg = AGENTS[msg.agent] || {};
        const ts = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        return (
          <div key={msg.id || i} className="group flex items-start gap-2.5 px-3 py-2.5 hover:bg-white/5 border-b border-[var(--color-border)] border-l-[3px] border-l-transparent hover:border-l-[3px]" style={{ borderLeftColor: 'transparent' }} onMouseEnter={e => e.currentTarget.style.borderLeftColor = cfg.color || 'var(--color-accent)'} onMouseLeave={e => e.currentTarget.style.borderLeftColor = 'transparent'}>
            <span className="text-[var(--color-muted)] text-[9px] tabular shrink-0 w-[52px] mt-0.5 font-bold">{ts}</span>
            <div className="flex items-center gap-1 shrink-0 min-w-[70px]">
              <span className="text-[11px]">{cfg.icon || ''}</span>
              <span className="font-black text-[10px] mt-px" style={{ color: cfg.color || '#888' }}>
                {cfg.label || msg.agent || '?'}
              </span>
            </div>
            <span className="text-white/40 break-words leading-relaxed text-[11px] group-hover:text-white/70">
              {(msg.content || msg.detail || '').slice(0, 300)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
