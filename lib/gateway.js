// OpenClaw Gateway connection config
// EC2 gateway: 13.60.27.149:18789

export const GATEWAY_CONFIG = {
  url: process.env.OPENCLAW_GATEWAY_URL || 'ws://13.60.27.149:18789',
  token: process.env.OPENCLAW_GATEWAY_TOKEN || '7dd2661047fa7bfe75d082c887b9691ac7d1f7911ee8aace',
  nodeName: 'HQ-Dashboard',
};

// Map OpenClaw agent events to our dashboard schema
export function mapAgentStatus(clawStatus) {
  const statusMap = {
    'active': 'working',
    'busy': 'working',
    'processing': 'thinking',
    'waiting': 'idle',
    'idle': 'idle',
    'error': 'error',
    'offline': 'sleeping',
    'chatting': 'talking',
    'responding': 'talking',
    'researching': 'researching',
    'writing': 'working',
    'posting': 'working',
    'analyzing': 'thinking',
  };
  return statusMap[clawStatus] || 'idle';
}

// Map room/context to our room zones
export function mapRoom(context) {
  if (!context) return 'desk';
  const ctx = context.toLowerCase();
  if (ctx.includes('research') || ctx.includes('browse') || ctx.includes('search')) return 'research';
  if (ctx.includes('meet') || ctx.includes('brief') || ctx.includes('discuss')) return 'meeting';
  if (ctx.includes('social') || ctx.includes('tweet') || ctx.includes('post') || ctx.includes('discord')) return 'social';
  if (ctx.includes('break') || ctx.includes('rest') || ctx.includes('idle')) return 'break';
  if (ctx.includes('board') || ctx.includes('mission') || ctx.includes('plan')) return 'board';
  return 'desk';
}
