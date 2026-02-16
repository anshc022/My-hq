import WebSocket from 'ws';

// ─── Config ───
const GATEWAY_URL = process.env.GATEWAY_URL || 'ws://51.20.10.68:18789';
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '4a3f2d7df09d90a9e54f09b44f7ddb832e037ae4f31a627e';
const BRIDGE_API = process.env.BRIDGE_API || 'http://localhost:3000/api/gateway-bridge';
const HEARTBEAT_API = process.env.HEARTBEAT_API || 'http://localhost:3000/api/node-heartbeat';

const RECONNECT_DELAY_BASE = 3000;
const RECONNECT_DELAY_MAX = 30000;
const HEARTBEAT_INTERVAL = 45000;
const PING_INTERVAL = 20000;

let ws = null;
let reconnectAttempts = 0;
let heartbeatTimer = null;
let pingTimer = null;
let alive = false;

// ─── Agent dispatch mapping (gateway account → our agent name) ───
const AGENT_MAP = {
  main: 'echo',
  echo: 'echo',
  flare: 'flare',
  bolt: 'bolt',
  nexus: 'nexus',
  vigil: 'vigil',
  forge: 'forge',
};

function log(msg) {
  const ts = new Date().toISOString().slice(11, 19);
  console.log(`[${ts}] ${msg}`);
}

// ─── Message forwarding ───
async function forwardToAPI(payload) {
  try {
    const res = await fetch(BRIDGE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      log(`⚠️  Bridge API ${res.status}: ${txt.slice(0, 120)}`);
    }
  } catch (err) {
    log(`❌ Bridge API error: ${err.message}`);
  }
}

async function sendHeartbeat(online = true) {
  try {
    await fetch(HEARTBEAT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node: 'ec2-main', online }),
    });
  } catch (err) {
    log(`⚠️  Heartbeat error: ${err.message}`);
  }
}

// ─── Message parsing ───
function parseMessage(raw) {
  try {
    const data = JSON.parse(raw);
    return data;
  } catch {
    return null;
  }
}

function resolveAgent(data) {
  if (!data) return null;

  // Check common fields for agent identity
  const account = data.account || data.agent || data.session_account || '';
  const accountLower = account.toLowerCase();

  // Direct map
  if (AGENT_MAP[accountLower]) return AGENT_MAP[accountLower];

  // Check event type fields
  if (data.type === 'sessions_spawn' || data.type === 'sessions_send') {
    const target = (data.target_account || data.to || '').toLowerCase();
    if (AGENT_MAP[target]) return AGENT_MAP[target];
  }

  // Fallback: check if any known agent name appears in the data
  const str = JSON.stringify(data).toLowerCase();
  for (const [key, val] of Object.entries(AGENT_MAP)) {
    if (key !== 'main' && str.includes(`"${key}"`)) return val;
  }

  return null;
}

// ─── WebSocket connection ───
function connect() {
  log(`🔌 Connecting to ${GATEWAY_URL}...`);

  ws = new WebSocket(GATEWAY_URL, {
    headers: { Authorization: `Bearer ${GATEWAY_TOKEN}` },
  });

  ws.on('open', () => {
    log('✅ Connected to gateway');
    reconnectAttempts = 0;
    alive = true;

    sendHeartbeat(true);
    heartbeatTimer = setInterval(() => sendHeartbeat(true), HEARTBEAT_INTERVAL);

    pingTimer = setInterval(() => {
      if (!alive) {
        log('💀 No pong — reconnecting...');
        ws.terminate();
        return;
      }
      alive = false;
      try { ws.ping(); } catch {}
    }, PING_INTERVAL);

    // Subscribe to all events
    try {
      ws.send(JSON.stringify({ type: 'subscribe', events: ['*'] }));
    } catch {}
  });

  ws.on('pong', () => { alive = true; });

  ws.on('message', (raw) => {
    const str = raw.toString();
    const data = parseMessage(str);
    if (!data) return;

    // Skip pings/system messages
    if (data.type === 'ping' || data.type === 'pong' || data.type === 'welcome') return;

    const agent = resolveAgent(data);

    // Log interesting events
    const evtType = data.type || data.event || '?';
    if (agent) {
      log(`📨 [${agent}] ${evtType}: ${(data.content || data.text || data.detail || '').slice(0, 80)}`);
    }

    // Forward everything to the bridge API
    forwardToAPI({
      ...data,
      _agent: agent,
      _raw_type: evtType,
      _ts: Date.now(),
    });
  });

  ws.on('close', (code, reason) => {
    log(`🔌 Disconnected (${code}): ${reason || 'no reason'}`);
    cleanup();
    scheduleReconnect();
  });

  ws.on('error', (err) => {
    log(`❌ WS error: ${err.message}`);
    cleanup();
    scheduleReconnect();
  });
}

function cleanup() {
  if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
  if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
  sendHeartbeat(false);
}

function scheduleReconnect() {
  reconnectAttempts++;
  const delay = Math.min(RECONNECT_DELAY_BASE * Math.pow(1.5, reconnectAttempts - 1), RECONNECT_DELAY_MAX);
  log(`⏳ Reconnecting in ${(delay / 1000).toFixed(1)}s (attempt ${reconnectAttempts})`);
  setTimeout(connect, delay);
}

// ─── Graceful shutdown ───
process.on('SIGINT', () => {
  log('👋 Shutting down...');
  cleanup();
  if (ws) ws.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('👋 SIGTERM — shutting down...');
  cleanup();
  if (ws) ws.close();
  process.exit(0);
});

// ─── Start ───
log('🚀 OpenClaw Gateway Bridge v2');
log(`   Gateway: ${GATEWAY_URL}`);
log(`   Bridge API: ${BRIDGE_API}`);
connect();
