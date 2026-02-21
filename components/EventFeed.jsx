'use client';
import { AGENTS } from '@/lib/agents';

const TYPE_BADGE = {
  error:       'bg-red-400/10 text-red-400 border-red-400/20 shadow-red-400/5',
  lifecycle:   'bg-sky-400/10 text-sky-400 border-sky-400/20 shadow-sky-400/5',
  'tool-call': 'bg-violet-400/10 text-violet-400 border-violet-400/20 shadow-violet-400/5',
  delegation:  'bg-amber-400/10 text-amber-400 border-amber-400/20 shadow-amber-400/5',
  chat:        'bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-emerald-400/5',
  task:        'bg-blue-400/10 text-blue-400 border-blue-400/20 shadow-blue-400/5',
  system:      'bg-white/[0.03] text-zinc-500 border-white/[0.05] shadow-none',
};

export default function EventFeed({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-muted font-mono text-[11px] min-h-[120px]">
        <span className="text-2xl opacity-30">📡</span>
        <span className="text-[10px] tracking-wider">Waiting for events...</span>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-1.5 max-h-[300px] overflow-y-auto font-mono text-[11px] smooth-scroll">
      {events.slice(-30).reverse().map((evt, i) => {
        const cfg = AGENTS[evt.agent] || {};
        const ts = evt.created_at ? new Date(evt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
        const typeKey = (evt.event_type || evt.type || 'event').toLowerCase();
        const badgeClass = TYPE_BADGE[typeKey] || TYPE_BADGE.system;

        return (
          <div key={evt.id || i} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition-all duration-200 group">
            <span className="text-muted text-[9px] tabular shrink-0 w-[52px] opacity-50 group-hover:opacity-80 transition-opacity">{ts}</span>
            <span className={`text-[8px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md border shrink-0 min-w-[58px] text-center shadow-sm ${badgeClass}`}>
              {typeKey}
            </span>
            <span className="font-bold shrink-0 text-[10px] flex items-center gap-1" style={{ color: cfg.color || '#666' }}>
              <span className="text-[11px]">{cfg.icon || ''}</span>
              {cfg.label || evt.agent || ''}
            </span>
            <span className="text-subtle/60 text-[10px] truncate group-hover:text-subtle transition-colors">
              {evt.title || evt.detail || ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
