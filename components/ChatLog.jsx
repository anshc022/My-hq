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
      <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-muted font-mono text-[11px] min-h-[140px]">
        <span className="text-2xl opacity-30">💬</span>
        <span className="text-[10px] tracking-wider">No messages yet...</span>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="glass-card rounded-xl p-2 max-h-[350px] overflow-y-auto font-mono text-[11px] smooth-scroll">
      {messages.map((msg, i) => {
        const cfg = AGENTS[msg.agent] || {};
        const ts = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        return (
          <div key={msg.id || i} className="group flex items-start gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-all duration-200 border-l-2 border-transparent hover:border-l-2" style={{ '--tw-border-opacity': 1, borderLeftColor: 'transparent' }} onMouseEnter={e => e.currentTarget.style.borderLeftColor = cfg.color || '#5b7bff'} onMouseLeave={e => e.currentTarget.style.borderLeftColor = 'transparent'}>
            <span className="text-muted text-[9px] tabular shrink-0 w-[52px] mt-0.5 opacity-40 group-hover:opacity-70 transition-opacity">{ts}</span>
            <div className="flex items-center gap-1 shrink-0 min-w-[70px]">
              <span className="text-[11px]">{cfg.icon || ''}</span>
              <span className="font-bold text-[10px] mt-px" style={{ color: cfg.color || '#888' }}>
                {cfg.label || msg.agent || '?'}
              </span>
            </div>
            <span className="text-subtle/70 break-words leading-relaxed text-[11px] group-hover:text-subtle transition-colors">
              {(msg.content || msg.detail || '').slice(0, 300)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
