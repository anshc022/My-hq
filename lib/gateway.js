// Gateway connection config — V2

export const GATEWAY_CONFIG = {
  url: process.env.GATEWAY_URL || '',
  token: process.env.GATEWAY_TOKEN || '',
  nodeName: 'HQ-Dashboard-V2',
};

// Map agent events to dashboard schema

export function mapAgentStatus(clawStatus) {
  const statusMap = {
    active: 'working',
    busy: 'working',
    processing: 'thinking',
    waiting: 'idle',
    idle: 'idle',
    error: 'error',
    offline: 'sleeping',
    chatting: 'talking',
    responding: 'talking',
    researching: 'researching',
    writing: 'working',
    posting: 'working',
    analyzing: 'thinking',
    monitoring: 'monitoring',
  };
  return statusMap[clawStatus] || 'idle';
}

// Map room/context to room zones
export function mapRoom(context) {
  if (!context) return 'desk';
  const ctx = context.toLowerCase();
  if (ctx.includes('research') || ctx.includes('browse') || ctx.includes('code')) return 'lab';
  if (ctx.includes('meet') || ctx.includes('brief') || ctx.includes('discuss') || ctx.includes('war')) return 'warroom';
  if (ctx.includes('deploy') || ctx.includes('infra') || ctx.includes('server') || ctx.includes('ci')) return 'forge';
  if (ctx.includes('break') || ctx.includes('rest') || ctx.includes('idle')) return 'desk';
  if (ctx.includes('design') || ctx.includes('ui') || ctx.includes('frontend')) return 'workspace';
  return 'desk';
}
