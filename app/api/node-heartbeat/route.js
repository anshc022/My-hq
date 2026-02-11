// Node heartbeat — backed by Supabase ops_nodes table
// Works correctly on Vercel serverless (no in-memory state)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OFFLINE_THRESHOLD = 35; // seconds

export async function GET() {
  const { data: rows, error } = await supabase.from('ops_nodes').select('*');
  if (error) return Response.json({ nodes: [], anyOnline: false, count: 0, onlineCount: 0 });

  const now = new Date();
  const list = (rows || []).map(n => {
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

    return Response.json({ ok: true, status: 'registered', name });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 400 });
  }
}
