# ⚡ Ops HQ — Because Herding 6 AI Agents Shouldn't Require a PhD

> *"What if your AI dev team had a mission control... but make it pixel art?"*

![6 Agents • 1 Dashboard](https://img.shields.io/badge/Agents-6-blue?style=for-the-badge)
![Claude Opus 4.6](https://img.shields.io/badge/Model-Opus%204.6-purple?style=for-the-badge)
![Built in a Week](https://img.shields.io/badge/Built%20In-1%20Week-green?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/Clawathon-2026-orange?style=for-the-badge)

**Live Demo:** [hq.pranshuchourasia.in](https://hq.pranshuchourasia.in)

---

## 🤔 The Problem

You spin up 6 Claude Opus 4.6 agents. They're coding, reviewing, deploying, testing — doing real work. But you? You're staring at terminal logs like it's 1998, scrolling through walls of text trying to figure out *which agent is doing what.*

That's not observability. That's suffering.

## 💡 The Solution

**A real-time pixel-art command center where your AI agents are actual characters walking around an office.**

- Thinking? They glow yellow. 🟡
- Working? Green aura. 🟢
- Researching? Purple vibes. 🟣
- Idle? Just vibing, wandering around. 😴

When the Tech Lead delegates work, you literally watch agents wake up, walk to their rooms, and start working. When they finish, they go back to wandering. It's weirdly satisfying.

---

## 🎬 Demo

[![Demo Video](https://img.shields.io/badge/▶%20Watch%20Demo-YouTube-red?style=for-the-badge)](https://youtu.be/yufhnd9oqJE)

---

## 🏢 Meet the Team

| Agent | Role | Emoji | Specialty |
|-------|------|-------|-----------|
| **Echo** | Tech Lead | 🧠 | Delegates work, coordinates the squad |
| **Flare** | UI/UX Designer | 🎨 | Makes things pretty |
| **Bolt** | Frontend Dev | ⚡ | React wizard |
| **Nexus** | Backend Dev | 🔧 | API & database guru |
| **Vigil** | QA Engineer | 🛡️ | Finds bugs before users do |
| **Forge** | DevOps | 🔥 | Deploys things, breaks things, fixes things |

All 6 run on **Claude Opus 4.6**. Yes, the same model that built this dashboard is also the brain inside every agent. It's Opus all the way down. 🐢

---

## 🗺️ The Office

```
┌─────────────────────────┬──────────────────┐
│                         │                  │
│    💻 DEV FLOOR         │   🎯 WAR ROOM    │
│    where code happens   │   serious talk   │
│                         │                  │
├─────────────────────────┼──────────────────┤
│                         │                  │
│    🧪 CODE LAB          │   🔥 DEPLOY BAY  │
│    experiments go here  │   ship it!       │
│                         │                  │
└─────────────────────────┴──────────────────┘
```

Agents physically move between rooms based on what they're working on. It's like watching The Office, but everyone is an AI and nobody wastes time at the water cooler. *(okay they kinda do when idle)*

---

## ✨ Features

### 🎮 Live Animated Canvas
Pixel-art characters with smooth movement, colored glow auras, idle wandering, and room-based positioning. Each agent has personality — different speeds, preferred rooms, idle animations.

### 📡 Real-Time Everything
WebSocket bridge captures every lifecycle event. Supabase Realtime pushes updates instantly. Zero polling. When an agent starts thinking, you see it within 400ms.

### 🤝 Delegation Tracking
When Echo (the lead) spawns sub-agents:
- Dashboard shows **"Coordinating: bolt, nexus working..."**
- Echo stays lit until ALL sub-agents finish
- Each completion updates the progress text
- Full cycle: delegate → track → complete → idle

### 📊 Dashboard Panels
- **Agent Cards** — status, current task, room assignment
- **Event Feed** — every lifecycle event in real-time
- **Mission Control** — system info, connection status
- **Gateway Log** — full message history

### 🔐 Protocol v3 Auth
Ed25519 challenge-response authentication between the bridge and gateway. Not just a `Bearer token` — actual cryptographic handshake.

---

## 🏗️ Architecture

```
┌──────────────┐     WebSocket      ┌──────────────┐
│   Gateway    │◄──────────────────►│    Bridge     │
│   (EC2)      │   Protocol v3      │   (EC2)      │
│  6 Opus 4.6  │   Ed25519 Auth     │  Node.js     │
│   Agents     │                    │              │
└──────────────┘                    └──────┬───────┘
                                          │ HTTPS POST
                                          ▼
                                   ┌──────────────┐
                                   │   Next.js    │
                                   │   (Vercel)   │
                                   │  API Routes  │
                                   └──────┬───────┘
                                          │ Supabase
                                          ▼
                                   ┌──────────────┐
                                   │   Supabase   │
                                   │  Realtime DB │
                                   │  ops_agents  │
                                   │  ops_events  │
                                   │  ops_messages│
                                   └──────┬───────┘
                                          │ Realtime
                                          ▼
                                   ┌──────────────┐
                                   │  Dashboard   │
                                   │  React 19    │
                                   │  Pixel Art   │
                                   │  Canvas      │
                                   └──────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16.1.6, React 19, Tailwind CSS v4 |
| Backend | Next.js API Routes (Vercel) |
| Database | Supabase (Postgres + Realtime) |
| Bridge | Node.js WebSocket client (EC2) |
| AI Model | Claude Opus 4.6 × 6 agents |
| Auth | Ed25519 challenge-response (Protocol v3) |
| Canvas | HTML5 Canvas with custom pixel-art renderer |
| Hosting | Vercel (dashboard) + AWS EC2 (bridge + agents) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase project with `ops_agents`, `ops_events`, `ops_messages` tables
- Gateway running on a server

### Setup

```bash
# Clone
git clone https://github.com/anshc022/My-hq.git
cd My-hq

# Install
npm install

# Environment
cp .env.example .env.local
# Fill in your Supabase URL, keys, and gateway details

# Run
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GATEWAY_URL=ws://your-server:18789
GATEWAY_TOKEN=your_gateway_token
```

---

## 📁 Project Structure

```
├── app/
│   ├── page.js              # Main dashboard page
│   ├── layout.js             # App layout + metadata
│   └── api/
│       ├── gateway-bridge/   # Receives bridge events
│       ├── dispatch/         # Send commands to agents
│       └── node-heartbeat/   # EC2 health check
├── components/
│   ├── OfficeCanvas.jsx      # 1500-line pixel-art canvas 🎨
│   ├── AgentPanel.jsx        # Agent status cards
│   ├── ChatLog.jsx           # Gateway message log
│   ├── EventFeed.jsx         # Real-time event stream
│   ├── MissionBoard.jsx      # System info panel
│   └── StatsBar.jsx          # Top bar with status
├── lib/
│   ├── agents.js             # Agent definitions & room positions
│   └── gateway.js            # Gateway connection config
└── gateway-bridge.mjs        # WebSocket bridge (runs on EC2)
```

---

## 🧠 How It Actually Works

1. **You send a message** in Discord → Gateway picks it up
2. **Echo (Tech Lead)** reads it, decides what to do
3. Echo **spawns sub-agents** → Bridge catches the `sessions_spawn` event
4. Bridge **forwards to Vercel API** → writes to Supabase
5. Dashboard **subscribes via Realtime** → agents light up and move
6. Sub-agents **do their work**, post results to Discord
7. Sub-agents finish → Bridge catches `lifecycle.end`
8. Dashboard updates → agents go idle, start wandering again
9. You watch all of this happen **in real-time** on a pixel-art canvas

The whole loop takes seconds. It's like watching ants, but the ants are writing code.

---

## 🏆 Built For

**"Built with Opus 4.6: a Claude Code Hackathon"** by Anthropic

Team **TRISHULx** — [@pranshuchourasia](https://github.com/anshc022)

---

## 📝 License

MIT — do whatever you want with it. Make your own AI office. Give your agents funnier names. We don't judge.

---

<p align="center">
  <b>OPS HQ</b> — because even AI agents deserve a cool office 🏢
</p>
