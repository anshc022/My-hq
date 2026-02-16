'use client';
import { AGENTS } from '@/lib/agents';

const TYPE_BADGE = {
  error:       'bg-red-400/10 text-red-400 border-red-400/20',
  lifecycle:   'bg-sky-400/10 text-sky-400 border-sky-400/20',
  'tool-call': 'bg-violet-400/10 text-violet-400 border-violet-400/20',
  delegation:  'bg-amber-400/10 text-amber-400 border-amber-400/20',
  chat:        'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  task:        'bg-blue-400/10 text-blue-400 border-blue-400/20',
  system:      'bg-white/[0.03] text-zinc-500 border-white/[0.05]',
};

export default function EventFeed({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-card border border-white/[0.05] rounded-xl p-5 flex items-center justify-center gap-2 text-muted font-mono text-[11px] min-h-[100px]">
        <span className="text-base opacity-40">📡</span>
        Waiting for events...
      </div>
    );
  }

  return (
    <div className="bg-card border border-white/[0.05] rounded-xl p-1.5 max-h-[280px] overflow-y-auto font-mono text-[11px]">
      {events.slice(-30).reverse().map((evt, i) => {
        const cfg = AGENTS[evt.agent] || {};
        const ts = evt.created_at ? new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        const typeKey = (evt.event_type || evt.type || 'event').toLowerCase();
        const badgeClass = TYPE_BADGE[typeKey] || TYPE_BADGE.system;

        return (
          <div key={evt.id || i} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.02] transition-colors">
            <span className="text-muted text-[9px] tabular shrink-0 w-[52px]">{ts}</span>
            <span className={`text-[8px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border shrink-0 min-w-[56px] text-center ${badgeClass}`}>
              {typeKey}
            </span>
            <span className="font-semibold shrink-0 text-[10px]" style={{ color: cfg.color || '#666' }}>
              {cfg.icon || ''} {cfg.label || evt.agent || ''}
            </span>
            <span className="text-subtle text-[10px] truncate">
              {evt.title || evt.detail || ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
