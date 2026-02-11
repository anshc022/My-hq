// Node heartbeat — backed by Supabase ops_nodes table
// Works correctly on Vercel serverless (no in-memory state)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OFFLINE_THRESHOLD = 35; // seconds

export async function GET() {
  // Fetch both node status AND pulse agent status in parallel
  const [nodesRes, pulseRes] = await Promise.all([
    supabase.from('ops_nodes').select('*'),
    supabase.from('ops_agents').select('*').eq('name', 'pulse').single(),
  ]);

  const rows = nodesRes.data || [];
  const now = new Date();
  const list = rows.map(n => {
    const lastSeen = new Date(n.last_seen);
    const ageSec = (now - lastSeen) / 1000;
    const status = ageSec < OFFLINE_THRESHOLD ? 'online' : 'offline';
    return {
      name: n.name,
      hostname: n.hostname || n.name,
      status,
      lastSeen: n.last_seen,
      uptimeMs: now - new Date(n.connected_at),
    };
  });

  const anyOnline = list.some(n => n.status === 'online');

  // If no nodes online, mark pulse agent as idle
  if (!anyOnline && (pulseRes.data?.status === 'working' || pulseRes.data?.status === 'monitoring')) {
    await supabase.from('ops_agents').update({
      status: 'idle',
      current_task: null,
      last_active_at: new Date().toISOString(),
    }).eq('name', 'pulse');
  }

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

    // Upsert: insert or update last_seen
    const { error } = await supabase.from('ops_nodes').upsert(
      { name, hostname, last_seen: new Date().toISOString() },
      { onConflict: 'name' }
    );

    if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

    // Update pulse agent — mark as monitoring (not working!) with the node's hostname
    await supabase.from('ops_agents').update({
      status: 'monitoring',
      current_task: `Node: ${hostname} online`,
      last_active_at: new Date().toISOString(),
    }).eq('name', 'pulse');

    return Response.json({ ok: true, status: 'registered', name });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 400 });
  }
}
