import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Agent→Discord account mapping
const AGENT_ACCOUNTS = {
  echo:     { accountId: 'default',  agentId: 'main' },
  scout:    { accountId: 'pixel',    agentId: 'scout' },
  quill:    { accountId: 'dash',     agentId: 'quill' },
  sage:     { accountId: 'stack',    agentId: 'sage' },
  sentinel: { accountId: 'probe',    agentId: 'sentinel' },
  xalt:     { accountId: 'ship',     agentId: 'xalt' },
};

const WAR_ROOM = '1469627420893122652';
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_HTTP_URL || 'http://13.60.27.149:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';

// Send a task to a specific agent, delivered through their own Discord bot
async function dispatchAgent(agentName, message) {
  const config = AGENT_ACCOUNTS[agentName];
  if (!config) throw new Error(`Unknown agent: ${agentName}`);

  // Use Gateway HTTP API to run an agent turn
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
    // Fallback: try SSH-based dispatch
    console.log(`[Dispatch] Gateway API failed (${res.status}), agent ${agentName} may not have HTTP agent endpoint`);
    return { status: 'gateway-api-unavailable', agent: agentName };
  }

  return await res.json();
}

// POST - Dispatch messages to agents
export async function POST(request) {
  try {
    const body = await request.json();
    const { agents, message } = body;

    if (!agents || !message) {
      return Response.json({ ok: false, error: 'Need agents[] and message' }, { status: 400 });
    }

    // Dispatch to each agent in parallel
    const results = await Promise.allSettled(
      agents.map(a => dispatchAgent(a, message))
    );

    // Log event
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
        value: r.value,
        reason: r.reason?.message,
      })),
    });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
