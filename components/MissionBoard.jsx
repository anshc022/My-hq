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
    { label: 'TOTAL', value: total, cls: 'text-accent', ring: 'ring-accent/20' },
    { label: 'ACTIVE', value: active, cls: 'text-success', ring: 'ring-success/20' },
    { label: 'IDLE', value: idle, cls: 'text-zinc-500', ring: 'ring-zinc-500/10' },
    { label: 'ERRORS', value: errors, cls: errors > 0 ? 'text-danger' : 'text-zinc-700', ring: errors > 0 ? 'ring-danger/20' : 'ring-zinc-800/10' },
  ];

  const sysInfo = [
    { key: 'Gateway', value: 'EC2 51.20.7.127', icon: '🌐', accent: 'text-blue-400' },
    { key: 'Model', value: 'Claude Opus 4.6', icon: '🧠', accent: 'text-purple-400' },
    { key: 'Engine', value: 'OpenClaw v2026.2', icon: '⚙️', accent: 'text-amber-400' },
    { key: 'Runtime', value: 'Node.js v22.22.0', icon: '💚', accent: 'text-emerald-400' },
    { key: 'Uptime', value: uptime, icon: '📈', accent: 'text-cyan-400' },
  ];

  return (
    <div className="glass-card rounded-xl p-4 font-mono relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-accent shadow-[0_0_8px] shadow-accent/40" />
          <span className="text-[11px] font-bold text-subtle tracking-[0.15em]">MISSION CONTROL</span>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-bold tracking-wider border transition-all duration-500 ${
          nodeConnected
            ? 'bg-success/[0.08] text-success border-success/20 shadow-[0_0_20px] shadow-success/10'
            : 'bg-danger/[0.08] text-danger border-danger/20 shadow-[0_0_20px] shadow-danger/10'
        }`}>
          <span className="relative w-2 h-2">
            {nodeConnected && <span className="absolute inset-0 rounded-full bg-success animate-ping opacity-30" />}
            <span className={`relative block w-2 h-2 rounded-full ${nodeConnected ? 'bg-success shadow-[0_0_6px] shadow-success/60' : 'bg-danger'}`} />
          </span>
          {nodeConnected ? 'SYSTEMS ONLINE' : 'SYSTEMS OFFLINE'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="relative grid grid-cols-4 gap-2.5 mb-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`relative bg-white/[0.02] border border-white/[0.04] rounded-xl py-3 px-2 text-center ring-1 ${s.ring} transition-all duration-300 hover:bg-white/[0.04] hover:scale-[1.02]`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`text-2xl font-black leading-none tabular ${s.cls}`}>{s.value}</div>
            <div className="text-[7px] text-muted tracking-[0.15em] mt-1.5 font-semibold">{s.label}</div>
            {/* Bottom accent line */}
            {s.label === 'ACTIVE' && active > 0 && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] rounded-full bg-success/40 shadow-[0_0_6px] shadow-success/30" />
            )}
          </div>
        ))}
      </div>

      {/* System Info Panel */}
      <div className="relative bg-white/[0.02] border border-white/[0.04] rounded-xl px-3.5 py-3">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-0.5 h-3 rounded-full bg-purple-500/50" />
          <span className="text-[8px] font-bold text-muted tracking-[0.18em]">SYSTEM INFO</span>
        </div>
        <div className="space-y-2">
          {sysInfo.map(({ key, value, icon, accent }) => (
            <div key={key} className="flex items-center gap-2.5 text-[10px] group">
              <span className="w-5 text-center text-[11px] opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>
              <span className="text-muted font-medium w-16">{key}</span>
              <span className="flex-1 h-px bg-white/[0.03]" />
              <span className={`font-semibold ${accent} opacity-80`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Node Connection Status */}
      <div className={`relative mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border text-[9px] font-medium tracking-wider transition-all duration-500 ${
        nodeConnected
          ? 'bg-success/[0.04] border-success/10 text-success/70'
          : 'bg-danger/[0.04] border-danger/10 text-danger/70'
      }`}>
        <span className="text-[10px]">{nodeConnected ? '🔗' : '🔌'}</span>
        <span>EC2 NODE</span>
        <span className="flex-1 h-px bg-current opacity-10" />
        <span className="font-bold">{nodeConnected ? 'CONNECTED' : 'DISCONNECTED'}</span>
      </div>
    </div>
  );
}
