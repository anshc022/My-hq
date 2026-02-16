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

  const stats = [
    { label: 'TOTAL', value: total, cls: 'text-accent' },
    { label: 'ACTIVE', value: active, cls: 'text-success' },
    { label: 'IDLE', value: idle, cls: 'text-zinc-500' },
    { label: 'ERRORS', value: errors, cls: errors > 0 ? 'text-danger' : 'text-zinc-700' },
  ];

  const sysInfo = [
    { key: 'Gateway', value: '51.20.10.68:18789', icon: '🌐' },
    { key: 'Model', value: 'Claude Opus 4.6', icon: '🧠' },
    { key: 'Engine', value: 'Agent Engine v2.0', icon: '⚙️' },
    { key: 'Runtime', value: 'Node.js v22.22.0', icon: '💚' },
    { key: 'Node', value: nodeConnected ? 'Connected' : 'Disconnected', icon: nodeConnected ? '✅' : '❌' },
  ];

  return (
    <div className="bg-card border border-white/[0.05] rounded-xl p-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <span className="text-[11px] font-semibold text-subtle tracking-[0.12em]">SYSTEM STATUS</span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-wider border ${
          nodeConnected
            ? 'bg-success/10 text-success border-success/20'
            : 'bg-danger/10 text-danger border-danger/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${nodeConnected ? 'bg-success shadow-[0_0_6px] shadow-success/60' : 'bg-danger'}`} />
          {nodeConnected ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white/[0.02] border border-white/[0.04] rounded-lg py-2.5 px-2 text-center">
            <div className={`text-xl font-extrabold leading-none ${s.cls}`}>{s.value}</div>
            <div className="text-[8px] text-muted tracking-[0.12em] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* System Info */}
      <div className="bg-white/[0.015] border border-white/[0.03] rounded-lg px-3 py-2.5">
        <div className="text-[9px] font-semibold text-muted tracking-[0.12em] mb-2">SYSTEM INFO</div>
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[10px]">
          {sysInfo.map(({ key, value, icon }) => (
            <div key={key} className="contents">
              <span className="text-muted flex items-center gap-1.5">
                <span className="text-[10px]">{icon}</span>
                {key}
              </span>
              <span className={
                key === 'Node'
                  ? (nodeConnected ? 'text-success font-semibold' : 'text-danger font-semibold')
                  : 'text-subtle'
              }>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
