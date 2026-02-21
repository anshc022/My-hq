'use client';
import { AGENTS } from '@/lib/agents';

const TYPE_BADGE = {
  error:       'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]',
  lifecycle:   'bg-[var(--color-neo-blue)]/10 text-[var(--color-neo-blue)] border-[var(--color-neo-blue)]',
  'tool-call': 'bg-[var(--color-neo-purple)]/10 text-[var(--color-neo-purple)] border-[var(--color-neo-purple)]',
  delegation:  'bg-[var(--color-neo-yellow)]/10 text-[var(--color-neo-yellow)] border-[var(--color-neo-yellow)]',
  chat:        'bg-[var(--color-neo-green)]/10 text-[var(--color-neo-green)] border-[var(--color-neo-green)]',
  task:        'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]',
  system:      'bg-white/5 text-zinc-500 border-zinc-700',
};

export default function EventFeed({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="neo-card-static p-6 flex flex-col items-center justify-center gap-2 text-[var(--color-muted)] font-mono text-[11px] min-h-[120px]">
        <span className="text-2xl">📡</span>
        <span className="text-[10px] tracking-wider font-bold">Waiting for events...</span>
      </div>
    );
  }

  return (
    <div className="neo-card-static p-1.5 max-h-[300px] overflow-y-auto font-mono text-[11px] smooth-scroll">
      {events.slice(-30).reverse().map((evt, i) => {
        const cfg = AGENTS[evt.agent] || {};
        const ts = evt.created_at ? new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        const typeKey = (evt.event_type || evt.type || 'event').toLowerCase();
        const badgeClass = TYPE_BADGE[typeKey] || TYPE_BADGE.system;

        return (
          <div key={evt.id || i} className="flex items-center gap-2.5 px-2.5 py-2 hover:bg-white/5 group border-b border-[var(--color-border)]">
            <span className="text-[var(--color-muted)] text-[9px] tabular shrink-0 w-[52px] font-bold">{ts}</span>
            <span className={`neo-badge text-[8px] shrink-0 min-w-[58px] text-center ${badgeClass}`}>
              {typeKey}
            </span>
            <span className="font-black shrink-0 text-[10px] flex items-center gap-1" style={{ color: cfg.color || '#666' }}>
              <span className="text-[11px]">{cfg.icon || ''}</span>
              {cfg.label || evt.agent || ''}
            </span>
            <span className="text-white/40 text-[10px] truncate group-hover:text-white/70">
              {evt.title || evt.detail || ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
