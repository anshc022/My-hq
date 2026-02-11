// In-memory node heartbeat store
// Nodes POST to register, GET to check status
// No DB needed — ephemeral, resets on deploy (nodes re-register via heartbeat)

let nodes = {};
// { name: { status, hostname, lastSeen: Date.now(), ip } }

const OFFLINE_THRESHOLD = 35000; // 35s without heartbeat = offline

export async function GET() {
  const now = Date.now();
  const list = Object.entries(nodes).map(([name, n]) => ({
    name,
    hostname: n.hostname || name,
    status: (now - n.lastSeen) < OFFLINE_THRESHOLD ? 'online' : 'offline',
    lastSeen: new Date(n.lastSeen).toISOString(),
    uptimeMs: now - (n.connectedAt || n.lastSeen),
  }));

  const anyOnline = list.some(n => n.status === 'online');

  return Response.json({
    nodes: list,
    anyOnline,
    count: list.length,
    onlineCount: list.filter(n => n.status === 'online').length,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = body.name || 'unknown';
    const hostname = body.hostname || name;

    if (!nodes[name]) {
      nodes[name] = { hostname, lastSeen: Date.now(), connectedAt: Date.now() };
    } else {
      nodes[name].lastSeen = Date.now();
      nodes[name].hostname = hostname;
    }

    // Clean up stale nodes older than 5 minutes
    const cutoff = Date.now() - 300000;
    for (const [k, v] of Object.entries(nodes)) {
      if (v.lastSeen < cutoff) delete nodes[k];
    }

    return Response.json({ ok: true, status: 'registered', name });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 400 });
  }
}
