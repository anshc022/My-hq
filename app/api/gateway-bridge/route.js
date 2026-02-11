import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Agent ID mapping (gateway agentId → display name) ───
const AGENT_MAP = {
  main: 'echo', echo: 'echo',
  scout: 'pixel', quill: 'dash',
  sage: 'stack', sentinel: 'probe',
  xalt: 'ship', pulse: 'pulse',
};

// ─── Each agent has their own work room (so they spread out on the canvas) ───
const AGENT_WORK_ROOM = {
  echo:  'meeting',   // Tech Lead → standup room
  pixel: 'research',  // Pixel UI/UX → code lab
  dash:  'research',  // Dash Frontend → code lab
  stack: 'board',     // Stack Backend → sprint board
  probe: 'board',     // Probe QA → sprint board
  ship:  'research',  // Ship DevOps → code lab
  pulse: 'board',     // Pulse Node Health → sprint board
};

const AGENT_TALK_ROOM = {
  echo:  'meeting',   // leads standup
  pixel: 'meeting',   // shows designs
  dash:  'meeting',   // discusses with team
  stack: 'meeting',   // API discussion
  probe: 'board',     // reports bugs on board
  ship:  'board',     // deployment status
};

function getWorkRoom(agent) { return AGENT_WORK_ROOM[agent] || 'research'; }
function getTalkRoom(agent) { return AGENT_TALK_ROOM[agent] || 'social'; }

// Extract agent from gateway event payload
function extractAgent(payload) {
  if (payload?.agentId && AGENT_MAP[payload.agentId]) return AGENT_MAP[payload.agentId];
  if (payload?.sessionKey) {
    const parts = payload.sessionKey.split(':');
    if (parts[0] === 'agent' && AGENT_MAP[parts[1]]) return AGENT_MAP[parts[1]];
  }
  if (payload?.data?.agentId && AGENT_MAP[payload.data.agentId]) return AGENT_MAP[payload.data.agentId];
  return null;
}

// ─── Delegation detection — when Echo delegates, mark sub-agents as working ───
// These patterns detect when Echo mentions a sub-agent doing work
const DELEGATION_PATTERNS = {
  pixel: [/pixel/i],
  dash:  [/dash/i],
  stack: [/stack/i],
  probe: [/probe/i],
  ship:  [/ship/i],
};

// Track which sub-agents are working from a delegation
const activeDelegations = new Map(); // agentName → { startedAt, task }

async function detectDelegation(text) {
  if (!text) return;
  
  // More flexible detection: look for agent names + action words
  // e.g., "Dash is coding", "Ship will push", "Pixel is working", "assigned Probe"
  const actionWords = /is|will|can|should|assigned|sending|asking|delegat|task|work|coding|push|check|review|handle|implement|fix/i;
  if (!actionWords.test(text)) return;

  for (const [agentId, patterns] of Object.entries(DELEGATION_PATTERNS)) {
    const agentName = AGENT_MAP[agentId] || agentId;
    if (patterns.some(p => p.test(text))) {
      // Extract task: everything after the agent name, up to 80 chars
      const agentNamePattern = patterns[0].source;
      const taskMatch = text.match(new RegExp(`${agentNamePattern}[^.]*`, 'i'));
      const task = taskMatch ? taskMatch[0].slice(0, 80) : 'Working on delegated task';

      activeDelegations.set(agentName, { startedAt: Date.now(), task });

      await supabase.from('ops_agents').update({
        status: 'working',
        current_task: task,
        current_room: getWorkRoom(agentName),
        last_active_at: new Date().toISOString(),
      }).eq('name', agentName);

      await supabase.from('ops_events').insert({
        agent: agentName,
        event_type: 'task',
        title: `Working: ${task.slice(0, 60)}`,
      });
    }
  }
}

// When a subagent run finishes, mark delegated agents as done
async function finishDelegations() {
  for (const [agentName, info] of activeDelegations.entries()) {
    await supabase.from('ops_agents').update({
      status: 'idle',
      current_task: null,
      current_room: 'desk',
      last_active_at: new Date().toISOString(),
    }).eq('name', agentName);

    await supabase.from('ops_events').insert({
      agent: agentName,
      event_type: 'complete',
      title: 'Completed delegated task',
    });
  }
  activeDelegations.clear();
}

// ─── Track active runs (per agent, per request) ───
const activeRuns = new Map(); // runId → { agent, text, startedAt, toolCalls, chatLogged, recovered }

// ─── Stuck run watchdog — REAL: just marks agent as timed out, no fake conversations ───
const STUCK_TIMEOUT_MS = 120_000; // 2 minutes
let watchdogInterval = null;

function startWatchdog() {
  if (watchdogInterval) return;
  watchdogInterval = setInterval(async () => {
    const now = Date.now();
    for (const [runId, run] of activeRuns.entries()) {
      if (run.recovered) continue;
      const age = now - run.startedAt;
      if (age > STUCK_TIMEOUT_MS) {
        run.recovered = true;
        console.log(`[Watchdog] Run ${runId} timed out after ${Math.round(age / 1000)}s`);

        // Return the stuck agent to idle — no fake recovery drama
        await supabase.from('ops_agents').update({
          status: 'idle',
          current_task: null,
          current_room: 'desk',
          last_active_at: new Date().toISOString(),
        }).eq('name', run.agent);

        await supabase.from('ops_events').insert({
          agent: run.agent,
          event_type: 'alert',
          title: `Run timed out after ${Math.round(age / 1000)}s`,
        });

        setTimeout(() => activeRuns.delete(runId), 5000);
      }
    }
  }, 15_000);
}
startWatchdog();

// ─── Room command detection ───
// Detects messages like "Echo come to coffee room", "everyone go to standup", etc.
const ROOM_ALIASES = {
  'desk': ['desk', 'desks', 'dev floor', 'devfloor', 'work'],
  'meeting': ['meeting', 'standup', 'stand up', 'stand-up', 'huddle', 'social', 'chat', 'chat room', 'lounge'],
  'research': ['research', 'lab', 'code lab', 'codelab'],
  'board': ['board', 'sprint', 'sprint board', 'sprintboard', 'kanban', 'break', 'coffee'],
};

const AGENT_NAME_MAP = {
  echo: 'echo', pixel: 'pixel', dash: 'dash', stack: 'stack',
  probe: 'probe', ship: 'ship',
  // also accept old internal IDs
  scout: 'pixel', quill: 'dash', sage: 'stack', sentinel: 'probe', xalt: 'ship',
};

const ALL_KEYWORDS = ['everyone', 'all', 'team', 'all agents', 'everybody', 'guys', 'y\'all', 'yall'];

async function detectRoomCommand(text) {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // Check if it looks like a room command
  const movePatterns = /(?:come|go|move|head|get|walk|report)\s+(?:to|over\s+to|into|in)?\s*/i;
  const goToPattern = /(?:go\s+to|come\s+to|move\s+to|head\s+to|report\s+to|get\s+to|walk\s+to)\s+/i;

  if (!movePatterns.test(lower) && !goToPattern.test(lower)) return null;

  // Find target room
  let targetRoom = null;
  for (const [roomId, aliases] of Object.entries(ROOM_ALIASES)) {
    for (const alias of aliases) {
      if (lower.includes(alias)) {
        targetRoom = roomId;
        break;
      }
    }
    if (targetRoom) break;
  }
  if (!targetRoom) return null;

  // Find target agents
  let targetAgents = [];

  // Check for "everyone/all" first
  if (ALL_KEYWORDS.some(k => lower.includes(k))) {
    targetAgents = ['echo', 'pixel', 'dash', 'stack', 'probe', 'ship'];
  } else {
    // Check for specific agent names
    for (const [name, id] of Object.entries(AGENT_NAME_MAP)) {
      if (lower.includes(name)) {
        if (!targetAgents.includes(id)) targetAgents.push(id);
      }
    }
  }

  if (targetAgents.length === 0) return null;

  // Execute the move
  for (const agentId of targetAgents) {
    await supabase
      .from('ops_agents')
      .update({ current_room: targetRoom })
      .eq('name', agentId);
  }

  return { agents: targetAgents, room: targetRoom };
}

// ─── Team dispatch detection (logging only — actual dispatch happens on EC2) ───
const ALL_AGENTS = ['pixel', 'dash', 'stack', 'probe', 'ship'];

const TEAM_TRIGGERS = [
  'roll call', 'rollcall', 'team report', 'status report', 'team check',
  'everyone report', 'all agents', 'team standup', 'standup', 'check in',
  'who\'s here', 'whos here', 'who is here', 'sound off', 'report in',
];

const AGENT_DISPATCH_MAP = {
  pixel: 'pixel', dash: 'dash', stack: 'stack', probe: 'probe', ship: 'ship',
};

// Detect team/single dispatch commands (EC2 bridge handles the actual dispatch)
function detectTeamDispatch(text) {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  if (TEAM_TRIGGERS.some(t => lower.includes(t))) {
    return { type: 'team', agents: ALL_AGENTS };
  }

  for (const [name, agentId] of Object.entries(AGENT_DISPATCH_MAP)) {
    const patterns = [`@${name}`, `hey ${name}`, `yo ${name}`, `${name},`];
    if (patterns.some(p => lower.includes(p))) {
      return { type: 'single', agents: [agentId] };
    }
  }

  return null;
}

// ─── Process REAL OpenClaw gateway events ───
// Only the agent that ACTUALLY receives the gateway event gets updated.
// No fake collaborators, no simulated inter-agent messages.
// OpenClaw routes ONE message to ONE agent — that's the reality.
async function processGatewayMessage(msg) {
  try {
    // Handle bridge-level events (not from gateway)
    if (msg.type === 'node:connected' || msg.type === 'node:disconnected') {
      const isConnected = msg.type === 'node:connected';
      await Promise.all([
        supabase.from('ops_events').insert({
          agent: 'pulse',
          event_type: 'system',
          title: isConnected ? 'Bridge connected to gateway' : `Bridge disconnected (${msg.message || ''})`,
        }),
        supabase.from('ops_agents').update({
          status: isConnected ? 'working' : 'idle',
          current_task: isConnected ? 'Gateway bridge online' : null,
          last_active_at: new Date().toISOString(),
        }).eq('name', 'pulse'),
      ]);
      return { type: msg.type };
    }

    if (msg.type !== 'event') return null;

    const eventName = msg.event;
    const payload = msg.payload || {};
    const agent = extractAgent(payload) || 'echo';
    const runId = payload.runId;

    // ── lifecycle:start — ONE agent starts processing a request ──
    if (eventName === 'agent' && payload.stream === 'lifecycle' && payload.data?.phase === 'start') {
      const isSubagent = payload.sessionKey?.includes('subagent');

      if (runId) {
        activeRuns.set(runId, {
          agent, text: '', startedAt: Date.now(),
          toolCalls: [], chatLogged: false, recovered: false,
          isSubagent,
        });
      }

      await supabase.from('ops_agents').update({
        status: 'working',
        current_task: isSubagent ? 'Working on delegated sub-task...' : 'Processing request...',
        current_room: getWorkRoom(agent),
        last_active_at: new Date().toISOString(),
      }).eq('name', agent);

      await supabase.from('ops_events').insert({
        agent,
        event_type: 'task',
        title: isSubagent ? 'Sub-agent started working' : 'Started processing request',
      });

      return { type: 'lifecycle_start', agent, isSubagent };
    }

    // ── lifecycle:end — ONE agent finishes processing ──
    if (eventName === 'agent' && payload.stream === 'lifecycle' && payload.data?.phase === 'end') {
      const run = runId ? activeRuns.get(runId) : null;
      const isSubagent = run?.isSubagent || payload.sessionKey?.includes('subagent');

      // Save the final real response as a message
      if (run?.text) {
        await supabase.from('ops_messages').insert({
          from_agent: agent,
          to_agent: 'user',
          message: run.text.slice(0, 1500),
        });
      }

      // Return ONLY this agent to idle
      await supabase.from('ops_agents').update({
        status: 'idle',
        current_task: null,
        current_room: 'desk',
        last_active_at: new Date().toISOString(),
      }).eq('name', agent);

      await supabase.from('ops_events').insert({
        agent,
        event_type: 'complete',
        title: `Completed${run?.toolCalls.length ? ` (${run.toolCalls.length} tools used)` : ''}`,
      });

      // If this is a subagent ending, mark delegated agents as completed too
      if (isSubagent) {
        await finishDelegations();
      }

      if (runId) setTimeout(() => activeRuns.delete(runId), 5000);
      return { type: 'lifecycle_end', agent, isSubagent };
    }

    // ── assistant — Streaming response (accumulate text, update ONLY this agent) ──
    if (eventName === 'agent' && payload.stream === 'assistant') {
      const text = payload.data?.text || '';
      if (!text) return null;

      // Accumulate text for this run
      if (runId) {
        const run = activeRuns.get(runId);
        if (run) run.text = text; // gateway sends full accumulated text
      }

      // Update ONLY the agent that's actually responding
      const preview = text.length > 80 ? text.slice(0, 80) + '...' : text;
      await supabase.from('ops_agents').update({
        status: 'talking',
        current_task: `Responding: "${preview}"`,
        current_room: getTalkRoom(agent),
        last_active_at: new Date().toISOString(),
      }).eq('name', agent);

      // Detect delegation in Echo's response
      if (agent === 'echo') {
        await detectDelegation(text);
      }

      return { type: 'assistant_stream', agent };
    }

    // ── tool-call — ONLY this agent is using a tool ──
    if (eventName === 'agent' && payload.stream === 'tool-call') {
      const toolName = payload.data?.name || payload.data?.tool || 'unknown';

      if (runId) {
        const run = activeRuns.get(runId);
        if (run) run.toolCalls.push(toolName);
      }

      await supabase.from('ops_agents').update({
        status: 'working',
        current_task: `Using: ${toolName}`,
        current_room: getWorkRoom(agent),
        last_active_at: new Date().toISOString(),
      }).eq('name', agent);

      await supabase.from('ops_events').insert({
        agent,
        event_type: 'task',
        title: `Tool: ${toolName}`,
      });

      return { type: 'tool_call', agent, tool: toolName };
    }

    // ── tool-result — Tool returned a result ──
    if (eventName === 'agent' && payload.stream === 'tool-result') {
      await supabase.from('ops_events').insert({
        agent,
        event_type: 'complete',
        title: 'Tool result received',
      });
      return { type: 'tool_result', agent };
    }

    // ── chat — User message received (store REAL user message) ──
    if (eventName === 'chat') {
      const run = runId ? activeRuns.get(runId) : null;
      if (run?.chatLogged) return null;
      if (run) run.chatLogged = true;

      const text = payload.data?.text || payload.text || payload.content || '';

      // Check for room movement commands
      const roomCmd = await detectRoomCommand(text);
      if (roomCmd) {
        await supabase.from('ops_events').insert({
          agent: 'system',
          event_type: 'move',
          title: `${roomCmd.agents.join(', ')} → ${roomCmd.room}`,
        });
      }

      // Check for team dispatch commands (log it — EC2 bridge handles actual dispatch)
      const dispatch = detectTeamDispatch(text);
      if (dispatch) {
        await supabase.from('ops_events').insert({
          agent: 'system',
          event_type: 'dispatch',
          title: `Dispatching ${dispatch.type}: ${dispatch.agents.join(', ')}`,
        });
      }

      // Store the user's REAL message
      if (text) {
        await supabase.from('ops_messages').insert({
          from_agent: 'user',
          to_agent: agent,
          message: text.slice(0, 1500),
        });
      }

      await supabase.from('ops_events').insert({
        agent,
        event_type: 'chat',
        title: `Message: ${(text || '...').slice(0, 80)}`,
      });

      return { type: 'chat', agent };
    }

    return null;
  } catch (err) {
    console.error('[Bridge] Error:', err.message);
    return null;
  }
}

// GET — Bridge status
export async function GET() {
  return Response.json({
    status: 'ready',
    gateway: process.env.OPENCLAW_GATEWAY_URL || 'ws://localhost:18789',
    agents: [...new Set(Object.values(AGENT_MAP))],
    activeRuns: activeRuns.size,
    timestamp: new Date().toISOString(),
  });
}

// POST — Receive gateway events
export async function POST(request) {
  try {
    const body = await request.json();

    if (body.type && !body.events) {
      const result = await processGatewayMessage(body);
      return Response.json({ ok: true, processed: result ? 1 : 0, result });
    }

    if (Array.isArray(body.events)) {
      const results = [];
      for (const evt of body.events) {
        const r = await processGatewayMessage(evt);
        if (r) results.push(r);
      }
      return Response.json({ ok: true, processed: results.length, results });
    }

    return Response.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  } catch (err) {
    console.error('[Bridge API] Error:', err.message);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
