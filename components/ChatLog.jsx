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
      <div className="bg-card border border-white/[0.05] rounded-xl p-5 flex items-center justify-center gap-2 text-muted font-mono text-[11px] min-h-[120px]">
        <span className="text-base opacity-40">💬</span>
        No messages yet...
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="bg-card border border-white/[0.05] rounded-xl p-1.5 max-h-[320px] overflow-y-auto font-mono text-[11px]">
      {messages.map((msg, i) => {
        const cfg = AGENTS[msg.agent] || {};
        const ts = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        return (
          <div key={msg.id || i} className="flex items-start gap-2.5 px-2 py-2 rounded-md hover:bg-white/[0.02] transition-colors">
            <span className="text-muted text-[9px] tabular shrink-0 w-[52px] mt-0.5">{ts}</span>
            <span className="font-bold shrink-0 min-w-[56px] text-[10px] mt-px" style={{ color: cfg.color || '#888' }}>
              {cfg.icon || ''} {cfg.label || msg.agent || '?'}
            </span>
            <span className="text-subtle break-words leading-relaxed text-[11px]">
              {(msg.content || msg.detail || '').slice(0, 300)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
