# 🏢 OPS HQ — AI Agent Command Center

### *"6 AI agents. 1 live office. Zero humans required."*

> **Live Demo:** [hq.pranshuchourasia.in](https://hq.pranshuchourasia.in)  
> **GitHub:** [github.com/anshc022/My-hq](https://github.com/anshc022/My-hq)  
> **Built for:** Clawathon Hackathon  
> **Model:** Claude Opus 4.6 via GitHub Copilot (100k context)  
> **Infrastructure:** AWS EC2 `t3.large` (2 vCPU, 8GB RAM, 48GB SSD)

---

## 📌 TL;DR

OPS HQ is a **real-time visual command center** that turns 6 autonomous AI agents into a functioning software team — with a live pixel-art office, real-time event streaming, and zero human intervention after the initial prompt.

All 6 agents run **Claude Opus 4.6** (100k context) via GitHub Copilot on an **AWS EC2 t3.large** instance, orchestrated by **OpenClaw v2026.2**.

You talk to Echo (the Tech Lead) on Discord. Echo delegates to 5 specialized agents. You watch it all happen live on a pixel-art dashboard — agents move between rooms, connection lines pulse, events stream in real-time.

---

## 🧩 The Problem

AI agents are invisible. You prompt them, wait, get a wall of text back. You don't see:
- **Who** is doing the work
- **What** they're doing right now
- **How** they're coordinating
- **When** they finish

Multi-agent systems exist, but they're all **CLI output in a terminal**. No visibility. No observability. No fun.

---

## 💡 The Solution

A full-stack **real-time monitoring dashboard** that makes AI agent collaboration **visible, trackable, and alive**.

| What You Get | How It Works |
|---|---|
| 🎮 Live pixel-art office canvas | HTML5 Canvas, 1500+ lines, agents physically move between 4 rooms |
| 📡 Real-time event streaming | WebSocket → Supabase Realtime → Dashboard (sub-second latency) |
| 🤝 Delegation tracking | See Echo spawn sub-agents, track their progress, watch them complete |
| 📊 Multi-panel dashboard | Agent cards, event feed, mission control, chat log — all live |
| 🔐 Cryptographic auth | Ed25519 challenge-response, Protocol v3 — not just API keys |

---

## 🏗️ Architecture — Full Stack Walkthrough

```
  Discord (User)
       │
       │  "hey echo, build the API"
       ▼
┌─────────────────┐     WebSocket (Protocol v3)     ┌──────────────────┐
│   OpenClaw      │◄──────────────────────────────►│   Gateway Bridge  │
│   Gateway       │     Ed25519 Auth                │   (Node.js)       │
│   (AWS EC2      │     45s Heartbeats              │   (AWS EC2        │
│    t3.large)    │     20s Pings                   │    t3.large)      │
│   6 Agents on   │                                 │                   │
│   Claude Opus   │                                 │                   │
└─────────────────┘                                 └────────┬──────────┘
                                                             │ HTTPS POST
                                                             ▼
                                                    ┌──────────────────┐
                                                    │   Next.js API    │
                                                    │   (Vercel)       │
                                                    │   3 API Routes   │
                                                    └────────┬─────────┘
                                                             │ Insert/Update
                                                             ▼
                                                    ┌──────────────────┐
                                                    │   Supabase       │
                                                    │   (Realtime DB)  │
                                                    │   4 Tables       │
                                                    └────────┬─────────┘
                                                             │ Realtime Subscribe
                                                             ▼
                                                    ┌──────────────────┐
                                                    │   Dashboard UI   │
                                                    │   Next.js 16 +   │
                                                    │   React 19       │
                                                    │   Pixel Art 🎨   │
                                                    └──────────────────┘
```

---

## 1️⃣ AWS EC2 — The Brain

**Instance Type:** `t3.large` | **IP:** `51.20.7.127` | **Port:** `18789`  
**OS:** Ubuntu Linux 6.17.0-1007-aws (x64) | **Runtime:** Node.js v22.22.0  
**Specs:** 2 vCPU (Intel Xeon Platinum 8175M @ 2.50GHz) · 8 GB RAM · 48 GB SSD

### What runs on EC2:
| Component | Details |
|---|---|
| **OpenClaw Gateway** | v2026.2.15 — manages all 6 agents, handles tool calls, lifecycle events |
| **Gateway Bridge** | `gateway-bridge.mjs` (373 lines) — WebSocket client that catches every agent event |
| **AI Model** | **Claude Opus 4.6** (100k context) via GitHub Copilot — powers all 6 agents |
| **Auth Provider** | `github-copilot:github` — token-based authentication |
| **Discord Bots** | 6 bot accounts — one per agent, each in their own channels |
| **Gateway Service** | systemd installed · enabled · auto-starts on boot |

### Gateway Bridge Protocol:
- **Protocol v3** WebSocket connection
- **Ed25519** challenge-response authentication (not just tokens)
- **45-second heartbeats** — agents declare "I'm alive" regularly
- **20-second pings** — bridge-level keepalive
- **Auto-reconnect** with exponential backoff (5s → 10s → 20s → max 60s)
- **Stale session cleanup** — auto-removes agents silent for >60s
- **Stuck watchdog** — detects and cleans agents stuck in "working" for >5 min

### Event Pipeline (EC2 → Dashboard):
```
Agent does something on EC2
       │
       ▼
Gateway emits WebSocket event
       │
       ▼
Bridge catches it (lifecycle, tool-call, streaming, chat, heartbeat, delegation, spawn)
       │
       ▼
Bridge POSTs to Vercel API: /api/gateway-bridge
       │
       ▼
API Route processes and writes to Supabase
```

---

## 2️⃣ Supabase — The Real-Time Database

**Instance:** `djtwpjnybrwqeyybpkua.supabase.co`

### 4 Core Tables:

| Table | Purpose | Key Fields |
|---|---|---|
| `ops_agents` | Agent state tracking | `name`, `status` (idle/working/error), `current_task`, `last_event`, `spawned_by` |
| `ops_events` | Full event log | `agent`, `type` (tool_call/lifecycle/chat/etc), `content`, `metadata`, `timestamp` |
| `ops_messages` | Agent chat messages | `agent`, `message`, `channel`, `timestamp` |
| `ops_nodes` | Node heartbeat tracking | `node_id`, `status`, `last_heartbeat`, `version`, `agents_active` |

### Real-Time Subscriptions (4 channels):
```javascript
// Dashboard subscribes to ALL 4 tables simultaneously
supabase.channel('ops_agents').on('postgres_changes', ...)   // Agent state changes
supabase.channel('ops_events').on('postgres_changes', ...)   // New events
supabase.channel('ops_messages').on('postgres_changes', ...) // New messages
supabase.channel('ops_nodes').on('postgres_changes', ...)    // Node heartbeats
```

**Latency:** Event happens on EC2 → visible on dashboard in **~400ms**. Zero polling.

### Data Flow Example:
```
Echo starts working
  → Bridge POSTs { agent: "echo", status: "working", task: "Build API" }
  → API writes to ops_agents (UPDATE) + ops_events (INSERT)
  → Supabase Realtime fires postgres_changes
  → Dashboard React state updates
  → Canvas: Echo lights up, moves to War Room
  → Agent card: status changes to "Working"
  → Event feed: "echo: lifecycle.start" appears
```

---

## 3️⃣ Next.js API Routes — The Middleware

### 3 API Endpoints on Vercel:

| Route | Method | Lines | Purpose |
|---|---|---|---|
| `/api/gateway-bridge` | POST | **810** | Receives all events from EC2 bridge, processes and writes to Supabase |
| `/api/gateway-bridge` | GET | — | Returns bridge connection status |
| `/api/dispatch` | POST | — | Sends commands to agents via Discord |
| `/api/node-heartbeat` | GET/POST | — | Node status management |

### Gateway Bridge API — The Heavy Lifter (810 lines):

Processes 8 event types:
1. **`lifecycle.start`** — Agent begins working → set status "working"
2. **`lifecycle.end`** — Agent finishes → set status "idle"
3. **`tool_call`** — Agent uses a tool → log event with tool name + args
4. **`streaming`** — Agent is thinking → update current task text
5. **`chat`** — Agent sends a message → insert into ops_messages
6. **`heartbeat`** — Agent is alive → update timestamps
7. **`delegation`** — Echo delegates to sub-agents → track parent-child relationship
8. **`spawn`** — New agent session created → initialize agent state

Additional logic:
- **Duplicate suppression** — prevents duplicate events within time windows
- **Stale cleanup** — removes agents with no activity for >60s
- **Stuck watchdog** — resets agents stuck in "working" for >5min
- **Event batching** — groups rapid events for efficient DB writes

---

## 4️⃣ Dashboard UI — The Visual Layer

**Live at:** [hq.pranshuchourasia.in](https://hq.pranshuchourasia.in)  
**Stack:** Next.js 16.1.6 + React 19 + Tailwind CSS v4

### Layout (Full Viewport):
```
┌─────────────────────────────────────────────────┐
│  📊 StatsBar (agents online, events, uptime)    │
├─────────────────────────────────────────────────┤
│  🟢 Agents Working Right Now (hero cards)       │
│  [Echo ●] [Flare ●] [Bolt ●] [Nexus ●] ...    │
├──────────────────────────────┬──────────────────┤
│                              │                  │
│  🎮 Office Canvas            │ 🎯 Mission       │
│  (pixel-art, 1551 LOC)      │    Control       │
│  agents move in real-time    │ (system health)  │
│                              │                  │
├──────────────────────────────┼──────────────────┤
│  📋 Event Feed               │ 💬 Chat Log     │
│  (real-time doom-scroll)     │ (agent messages) │
└──────────────────────────────┴──────────────────┘
```

### Key UI Components:

| Component | File | Lines | What It Does |
|---|---|---|---|
| **OfficeCanvas** | `OfficeCanvas.jsx` | 1551 | Full pixel-art office with 4 rooms, agent movement, connection lines, traveling dots |
| **AgentsWorking** | `AgentsWorking.jsx` | ~200 | Hero section with bold SVG avatar cards, live status, event counts |
| **AgentFaces** | `AgentFaces.jsx` | ~300 | Custom hand-crafted SVG cartoon faces for each agent |
| **StatsBar** | `StatsBar.jsx` | ~150 | Top stats: agents online, total events, uptime, connection status |
| **EventFeed** | `EventFeed.jsx` | ~200 | Real-time scrolling feed of all agent events |
| **ChatLog** | `ChatLog.jsx` | ~150 | Agent messages, color-coded by agent |
| **MissionBoard** | `MissionBoard.jsx` | ~200 | System health, gateway status, node connection |

### The Office Canvas — 1551 Lines of Pixel Art:

**4 Rooms:**
| Room | Purpose | Which agents go here |
|---|---|---|
| 💻 Dev Floor | General coding | Bolt, Flare |
| 🎯 War Room | Planning & coordination | Echo (always here when busy) |
| 🧪 Code Lab | Backend work, testing | Nexus, Vigil |
| 🔥 Deploy Bay | Deployment & DevOps | Forge |

**Agent Movement:**
- **LERP interpolation** for smooth movement (speed 0.008 when busy, 0.002 when idle)
- Agents move to their designated rooms when given tasks
- Idle agents **wander randomly** like NPCs
- Each agent has different **speed multipliers** (Bolt is fastest ⚡, Forge is slowest 🔥)

**Connection Lines:**
- **Purple glow lines** (6px glow + 2.5px main) connect active agents
- **Traveling dots** (4px with shadow glow) pulse along connection lines
- **Orange line** connects Forge exclusively to the Node indicator
- Lines appear/disappear based on real-time agent activity

---

## 5️⃣ The 6 Agents

| Agent | Color | Role | Personality |
|---|---|---|---|
| 🧠 **Echo** | Blue `#4A90D9` | Tech Lead | Delegates, coordinates, stays active until ALL sub-agents finish |
| 🎨 **Flare** | Pink `#FF6B9D` | UI/UX Designer | Colors, layouts, visual decisions |
| ⚡ **Bolt** | Yellow `#F7DC6F` | Frontend Dev | React, components, fastest agent |
| 🔧 **Nexus** | Green `#2ECC71` | Backend Dev | APIs, database, infrastructure |
| 🛡️ **Vigil** | Red `#E74C3C` | QA Engineer | Testing, validation, breaks things |
| 🔥 **Forge** | Orange `#E67E22` | DevOps | Deployment, CI/CD, slowest walker |

### Agent Delegation Flow:
```
User: "hey echo, build a login page"
  │
  ▼
Echo (Tech Lead) analyzes the request
  │
  ├──► Spawns Flare: "design the login UI"
  ├──► Spawns Bolt: "implement the React component"  
  ├──► Spawns Nexus: "create the auth API endpoint"
  │
  │  (Dashboard shows: Echo coordinating, 3 agents working)
  │  (Canvas: agents rush to their rooms, connection lines appear)
  │
  ├──◄ Flare completes ✅
  ├──◄ Bolt completes ✅
  ├──◄ Nexus completes ✅
  │
  ▼
Echo compiles results, posts to Discord
Dashboard: All agents return to idle, start wandering
```

---

## 6️⃣ Security & Reliability

| Feature | Implementation |
|---|---|
| **Auth** | Ed25519 challenge-response (Protocol v3) — cryptographic, not just tokens |
| **Heartbeats** | 45s agent heartbeats + 20s bridge pings — double-layer keepalive |
| **Auto-Recovery** | Exponential backoff reconnection (5s → 60s max) |
| **Stale Cleanup** | Agents silent >60s auto-removed from dashboard |
| **Stuck Detection** | Agents in "working" >5min auto-reset to idle |
| **Duplicate Guard** | Event deduplication within time windows |

---

## 🛠️ Tech Stack Summary

| Layer | Technology | Version/Detail |
|---|---|---|
| **AI Model** | Claude Opus 4.6 | 100k context via GitHub Copilot |
| **Agent Framework** | OpenClaw | v2026.2.15, multi-agent orchestration |
| **Frontend** | Next.js + React | 16.1.6 + React 19 |
| **Styling** | Tailwind CSS | v4, neo-brutalism theme |
| **Canvas** | HTML5 Canvas | 1551 LOC, custom pixel-art engine |
| **Database** | Supabase | Realtime PostgreSQL, 4 tables |
| **Backend** | Vercel Serverless | 3 API routes, 810+ lines |
| **Bridge** | Node.js WebSocket | 373 lines, runs on EC2 |
| **Compute** | AWS EC2 `t3.large` | 2 vCPU, 8GB RAM, Ubuntu, `51.20.7.127:18789` |
| **Communication** | Discord | 6 bot accounts, multi-channel |
| **Auth** | Ed25519 | Protocol v3, challenge-response |
| **Hosting** | Vercel | `hq.pranshuchourasia.in` |

---

## 📈 Key Numbers

| Metric | Value |
|---|---|
| Total agents | **6** |
| Canvas code | **1,551 lines** |
| Gateway API | **810 lines** |
| Bridge code | **373 lines** |
| Supabase tables | **4** |
| API routes | **3** |
| Realtime channels | **4** |
| Event latency | **~400ms** |
| Heartbeat interval | **45s** |
| Event types handled | **8** |
| Discord bots | **6** |
| Office rooms | **4** |

---

## 🎬 Demo Flow (for judges)

1. **Open dashboard** → [hq.pranshuchourasia.in](https://hq.pranshuchourasia.in) — see idle agents wandering in the pixel-art office
2. **Send a message to Echo on Discord** → "hey echo, check the API health and test endpoints"
3. **Watch the dashboard light up:**
   - Echo's card turns "Working" with a green pulse
   - Echo moves to the War Room on the canvas
   - Connection lines appear as Echo delegates to Nexus and Vigil
   - Traveling dots pulse along the lines
   - Event feed streams: `lifecycle.start`, `tool_call`, `streaming`...
   - Sub-agents move to their rooms (Code Lab for Nexus, QA room for Vigil)
4. **Watch completion:**
   - Sub-agents finish → `lifecycle.end` events stream in
   - Connection lines fade
   - Agents return to idle, start wandering again
   - Echo posts the compiled result to Discord
5. **Show Mission Control** → node status, connection health, system uptime
6. **Show Chat Log** → see the actual agent conversation

**Total loop time:** ~30-90 seconds depending on task complexity.

---

## 🏆 What Makes This Different

1. **Visibility** — You can *see* AI agents working. Not just text output — actual visual representation with movement, connections, and status.
2. **Real-time** — Sub-second updates via WebSocket → Supabase Realtime. No polling, no refresh.
3. **Multi-Agent Coordination** — True delegation with parent-child tracking. Echo is a real tech lead.
4. **Production Architecture** — Ed25519 auth, heartbeats, auto-recovery, stuck detection. Not a demo — it's production-ready.
5. **Serious Compute** — Claude Opus 4.6 (100k context) × 6 agents on AWS EC2 `t3.large`, with systemd auto-start and up to 8 concurrent sub-agents.
6. **Pure Vibes** — 1551-line pixel-art canvas with wandering NPC agents. Because observability should be fun.

---

## 👤 Built By

**Pranshu Chourasia** — [github.com/anshc022](https://github.com/anshc022)

Built in ~23 hours with excessive amounts of coffee, zero sleep, and an unhealthy attachment to pixel art.

---

> *"We didn't just build agents. We gave them an office, a pixel-art life, and a dashboard to spy on them. They're welcome."*
