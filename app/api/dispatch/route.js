import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Agent→Discord account mapping (V2: names = IDs)
const AGENT_ACCOUNTS = {
  echo:  { accountId: 'default', agentId: 'main' },
  flare: { accountId: 'flare',  agentId: 'flare' },
  bolt:  { accountId: 'bolt',   agentId: 'bolt' },
  nexus: { accountId: 'nexus',  agentId: 'nexus' },
  vigil: { accountId: 'vigil',  agentId: 'vigil' },
  forge: { accountId: 'forge',  agentId: 'forge' },
};

const WAR_ROOM = '1472061788857045075';
const GATEWAY_URL = process.env.GATEWAY_HTTP_URL || 'http://51.20.10.68:18789';
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '';

async function dispatchAgent(agentName, message) {
  const config = AGENT_ACCOUNTS[agentName];
  if (!config) throw new Error(`Unknown agent: ${agentName}`);

  const res = await fetch(`${GATEWAY_URL}/api/agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GATEWAY_TOKEN}`,
    },
    body: JSON.stringify({
      agentId: config.agentId,
      message: message,
      deliver: true,
      channel: 'discord',
      replyAccount: config.accountId,
      replyTo: WAR_ROOM,
      timeout: 120,
    }),
  });

  if (!res.ok) {
    return { status: 'gateway-api-unavailable', agent: agentName };
  }

  return await res.json();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { agents, message } = body;

    if (!agents || !message) {
      return Response.json({ ok: false, error: 'Need agents[] and message' }, { status: 400 });
    }

    const results = await Promise.allSettled(
      agents.map(a => dispatchAgent(a, message))
    );

    await supabase.from('ops_events').insert({
      agent: 'system',
      event_type: 'dispatch',
      title: `Dispatched to ${agents.join(', ')}: ${message.slice(0, 60)}`,
    });

    return Response.json({
      ok: true,
      dispatched: agents,
      results: results.map((r, i) => ({
        agent: agents[i],
        status: r.status,
        value: r.status === 'fulfilled' ? r.value : { error: r.reason?.message },
      })),
    });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
