'use client';
import { AGENTS } from '@/lib/agents';

export default function MissionBoard({ agents, nodeConnected }) {
  const total = agents?.length || 0;
  const active = agents?.filter(a => {
    const s = (a.status || '').toLowerCase();
    return s === 'working' || s === 'talking' || s === 'thinking' || s === 'researching' || s === 'posting';
  }).length || 0;
  const idle = agents?.filter(a => (a.status || '').toLowerCase() === 'idle').length || 0;
  const errors = agents?.filter(a => (a.status || '').toLowerCase() === 'error').length || 0;
  const uptime = nodeConnected ? '99.7%' : '—';

  const stats = [
    { label: 'TOTAL', value: total, color: 'var(--color-accent)' },
    { label: 'ACTIVE', value: active, color: 'var(--color-neo-green)' },
    { label: 'IDLE', value: idle, color: '#71717a' },
    { label: 'ERRORS', value: errors, color: errors > 0 ? 'var(--color-danger)' : '#27272a' },
  ];

  const sysInfo = [
    { key: 'Gateway', value: 'EC2 51.20.7.127', icon: '🌐', color: 'var(--color-neo-blue)' },
    { key: 'Model', value: 'Claude Opus 4.6', icon: '🧠', color: 'var(--color-neo-purple)' },
    { key: 'Engine', value: 'OpenClaw v2026.2', icon: '⚙️', color: 'var(--color-neo-orange)' },
    { key: 'Runtime', value: 'Node.js v22.22.0', icon: '💚', color: 'var(--color-neo-green)' },
    { key: 'Uptime', value: uptime, icon: '📈', color: 'var(--color-neo-blue)' },
  ];

  return (
    <div className="neo-card-static p-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-5 bg-[var(--color-accent)]" />
          <span className="text-[11px] font-black text-white tracking-[0.15em]">MISSION CONTROL</span>
        </div>
        <div className={`neo-badge text-[9px] ${
          nodeConnected
            ? 'bg-[var(--color-neo-green)]/10 text-[var(--color-neo-green)] border-[var(--color-neo-green)]'
            : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]'
        }`}>
          <span className={`w-2 h-2 ${nodeConnected ? 'bg-[var(--color-neo-green)]' : 'bg-[var(--color-danger)]'}`} style={nodeConnected ? { animation: 'blink 1s step-end infinite' } : {}} />
          {nodeConnected ? 'SYSTEMS ONLINE' : 'SYSTEMS OFFLINE'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] py-3 px-2 text-center hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="text-2xl font-black leading-none tabular" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[7px] text-[var(--color-muted)] tracking-[0.15em] mt-1.5 font-black">{s.label}</div>
          </div>
        ))}
      </div>

      {/* System Info Panel */}
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] px-3.5 py-3">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-2 h-3 bg-[var(--color-neo-purple)]" />
          <span className="text-[8px] font-black text-[var(--color-muted)] tracking-[0.18em]">SYSTEM INFO</span>
        </div>
        <div className="space-y-2">
          {sysInfo.map(({ key, value, icon, color }) => (
            <div key={key} className="flex items-center gap-2.5 text-[10px]">
              <span className="w-5 text-center text-[11px]">{icon}</span>
              <span className="text-[var(--color-muted)] font-bold w-16">{key}</span>
              <span className="flex-1 h-px bg-white/10 border-t border-dashed border-white/10" />
              <span className="font-black" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Node Connection Status */}
      <div className={`mt-3 flex items-center gap-2 px-3 py-2.5 border-2 text-[9px] font-black tracking-wider ${
        nodeConnected
          ? 'bg-[var(--color-neo-green)]/5 border-[var(--color-neo-green)] text-[var(--color-neo-green)]'
          : 'bg-[var(--color-danger)]/5 border-[var(--color-danger)] text-[var(--color-danger)]'
      }`}>
        <span className="text-[10px]">{nodeConnected ? '🔗' : '🔌'}</span>
        <span>EC2 NODE</span>
        <span className="flex-1 h-px bg-current opacity-20" />
        <span>{nodeConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
      </div>
    </div>
  );
}
