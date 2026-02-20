# ⚡ OpenClaw + K2 — 6 AI Agents Walk Into an Office...

> *"What if your AI dev team had a mission control... but make it pixel art and slightly unhinged?"*

<p align="center">
  <img src="https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif" width="200" />
  <br/>
  <i>me watching my 6 AI agents argue about code architecture at 3am</i>
</p>

![6 Agents • 1 Dashboard](https://img.shields.io/badge/Agents-6-blue?style=for-the-badge)
![K2 Model](https://img.shields.io/badge/Model-K2--Think--V2-purple?style=for-the-badge)
![K2 API](https://img.shields.io/badge/API-build--api.k2think.ai-yellow?style=for-the-badge)
![Built in 23hrs](https://img.shields.io/badge/Built%20In-23%20Hours-green?style=for-the-badge)
![Sleep](https://img.shields.io/badge/Sleep-0%20Hours-red?style=for-the-badge)

### 🔴 [LIVE DEMO](https://hq.pranshuchourasia.in) — yes, the agents are probably working right now

---

<p align="center">
  <img src="https://github.com/anshc022/My-hq/blob/main/demo.gif?raw=true" alt="OpenClaw + K2 Demo" width="800" />
  <br/>
  <i>^ 6 AI agents doing more work in 10 seconds than me in a week</i>
</p>

---

## 🤔 The Problem

You spin up 6 AI agents. They're coding, reviewing, deploying, testing — doing actual work. Meanwhile you?

<p align="center">
  <img src="https://media.giphy.com/media/HteV6g0QTNxp6/giphy.gif" width="300" />
  <br/>
  <i>you, reading 47 terminal logs simultaneously</i>
</p>

You're staring at terminal output like it's 1998, scrolling through walls of text trying to figure out *which agent is doing what.* "Is Bolt working? Did Nexus crash? Why is Forge deploying at 3am??"

**That's not observability. That's suffering.**

## 💡 The Solution

**A real-time pixel-art command center where your AI agents are actual characters walking around an office.**

| Status | What You See | Energy |
|--------|-------------|--------|
| Thinking | 🟡 Yellow glow | *"hmm let me think..."* |
| Working | 🟢 Green aura | *"I'M COOKING"* |
| Researching | 🟣 Purple vibes | *"hold on, googling..."* |
| Idle | 😴 Just wandering | *"nothing to see here"* |

When the Tech Lead delegates work, you literally watch agents wake up, walk to their rooms, and start working. When they finish, they go back to wandering aimlessly.

**It's like The Sims, but everyone is an AI and actually productive.**

---

## 🎬 Demo

<p align="center">

[![Demo Video](https://img.shields.io/badge/▶%20Watch%20Demo-YouTube-red?style=for-the-badge&logo=youtube)](https://youtu.be/yufhnd9oqJE)

</p>

---

## 🏢 Meet the Squad

| Agent | Role | Vibe | What They Actually Do |
|-------|------|------|----------------------|
| 🧠 **Echo** | Tech Lead | *"I delegate, therefore I am"* | Reads your message, decides who works, coordinates everyone |
| 🎨 **Flare** | UI/UX | *"make it pretty or don't ship it"* | Colors, layouts, components that don't look like 2005 |
| ⚡ **Bolt** | Frontend | *"React goes brrr"* | Turns Flare's dreams into actual JSX |
| 🔧 **Nexus** | Backend | *"have you tried turning the API off and on"* | Database schemas, API routes, the stuff nobody sees |
| 🛡️ **Vigil** | QA | *"it works on your machine? cool. it doesn't work on mine"* | Breaks things professionally |
| 🔥 **Forge** | DevOps | *"deployed to prod on a Friday"* | CI/CD, containers, and questionable deployment schedules |

All 6 run on **[K2-Think-V2](https://huggingface.co/LLM360/K2-Think-V2)** via K2's dedicated inference API (`build-api.k2think.ai`). Open-source reasoning model powering every agent.

<p align="center">
  <img src="https://media.giphy.com/media/3o7btNhMBytxAM6YBa/giphy.gif" width="250" />
  <br/>
  <i>Echo delegating work to the team</i>
</p>

---

## 🗺️ The Office

```
┌─────────────────────────┬──────────────────┐
│                         │                  │
│    💻 DEV FLOOR         │   🎯 WAR ROOM    │
│    "we need to talk     │   "this is fine" │
│     about the code"     │                  │
├─────────────────────────┼──────────────────┤
│                         │                  │
│    🧪 CODE LAB          │   🔥 DEPLOY BAY  │
│    "what if we tried—"  │   "SHIP IT NOW"  │
│    "no."                │                  │
└─────────────────────────┴──────────────────┘
```

Agents physically move between rooms based on what they're working on. Idle agents wander around like lost NPCs. Busy agents rush to their rooms like they just got a Slack message from the CEO.

---

## ✨ Features (the actually impressive stuff)

### 🎮 Live Animated Canvas
1500 lines of pixel-art rendering. Each agent has their own speed, preferred rooms, and idle animations. Bolt is the fastest. Forge is the slowest. This is lore.

### 📡 Real-Time Everything
WebSocket bridge → Supabase Realtime → Dashboard. Zero polling. When an agent starts thinking, you see it in **400ms**. Faster than your manager replying to emails.

### 🤝 Delegation Tracking (the cool part)
```
You: "hey echo, check the API and test it"
Echo: *spawns Nexus and Vigil*
Dashboard: "Coordinating: nexus, vigil working..."
Nexus: *checks API* ✅
Vigil: *tests it* ✅  
Dashboard: "All tasks complete"
Echo: *goes back to wandering* 😴
```

Echo stays lit until ALL sub-agents finish. Like a responsible manager who actually waits for the work to be done. *(unlike my real managers)*

### 📊 Dashboard Panels
- **Agent Cards** — who's working, who's slacking
- **Event Feed** — every tool call, in real-time
- **Mission Control** — system status, connection health
- **Gateway Log** — literally every thought every agent has

### 🔐 Protocol v3 Auth
Ed25519 challenge-response authentication. Not just a `Bearer token` — actual cryptographic handshake. Because even AI offices need security guards.

---

## 🏗️ Architecture

```
  YOU (Discord)
      │
      │ "hey echo, do the thing"
      ▼
┌──────────────┐     WebSocket      ┌──────────────┐
│   Gateway    │◄──────────────────►│    Bridge     │
│   (EC2)      │   Protocol v3      │   (EC2)      │
│  6 K2 Agents │   Ed25519 Auth     │  Node.js     │
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
                                   └──────┬───────┘
                                          │ Realtime
                                          ▼
                                   ┌──────────────┐
                                   │  Dashboard   │
                                   │  Pixel Art   │
                                   │  "ooh pretty"│
                                   └──────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | Next.js 16.1.6, React 19, Tailwind v4 | because bleeding edge is fun |
| Backend | Next.js API Routes (Vercel) | serverless = no servers to break |
| Database | Supabase Realtime | instant updates, zero polling |
| Bridge | Node.js WebSocket (EC2) | catches every agent heartbeat |
| AI Model | [K2-Think-V2](https://huggingface.co/LLM360/K2-Think-V2) × 6 | open-source reasoning via K2 API |
| Auth | Ed25519 Protocol v3 | because security is not optional |
| Canvas | HTML5 Canvas, 1500 LOC | hand-crafted pixel art engine |
| Hosting | Vercel + AWS EC2 | the classic combo |

---

## 🚀 Getting Started

```bash
# Clone this masterpiece
git clone https://github.com/anshc022/My-hq.git
cd My-hq

# Install the things
npm install

# Set up your secrets
cp .env.example .env.local
# Fill in Supabase URL, keys, gateway details

# Watch the magic
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

## 🤖 K2-Think-V2 + EC2 Setup

OpenClaw + K2 runs on **[LLM360/K2-Think-V2](https://huggingface.co/LLM360/K2-Think-V2)** — an open-source reasoning model with its own dedicated inference API.

> **Important:** K2-Think-V2 uses its own API endpoint, NOT HuggingFace Inference.
>
> ```
> BASE_URL = https://build-api.k2think.ai/v1
> MODEL   = LLM360/K2-Think-V2
> ```

### 1. Get Your K2 API Key

Contact [LLM360](https://huggingface.co/LLM360) or visit [k2think.ai](https://build-api.k2think.ai) to get your API key.

### 2. EC2 Instance Setup

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install OpenClaw CLI
curl -fsSL https://docs.openclaw.ai/install.sh | bash

# Run onboarding
openclaw onboard --non-interactive --mode local
```

### 3. Set the K2 Model in Config

Edit `~/.openclaw/config.json` on your EC2. The key parts:

```jsonc
{
  "auth": {
    "profiles": {
      "k2-think-v2:api-key": {
        "provider": "k2-think-v2",
        "mode": "api-key"
      }
    }
  },
  "models": {
    "mode": "merge",
    "providers": {
      "k2-think-v2": {
        "baseUrl": "https://build-api.k2think.ai/v1",
        "apiKey": "YOUR_K2_API_KEY",
        "api": "openai-completions",
        "models": [
          {
            "id": "LLM360/K2-Think-V2",
            "alias": "K2"
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "k2-think-v2/LLM360/K2-Think-V2"
      },
      "models": {
        "k2-think-v2/LLM360/K2-Think-V2": { "alias": "K2" }
      }
    }
  }
}
```

### 4. Environment Variables (EC2)

```bash
# Add your K2 API key to ~/.openclaw/.env
echo 'K2_API_KEY=your_api_key_here' >> ~/.openclaw/.env
```

### 5. Start the Gateway

```bash
# Start OpenClaw Gateway (runs all 6 agents)
openclaw gateway start

# Verify agents are alive
openclaw status
```

### 6. Connect the Bridge

```bash
# Start the WebSocket bridge (connects Gateway → Vercel dashboard)
node gateway-bridge.mjs
```

The bridge connects to the Gateway via WebSocket (Protocol v3, Ed25519 auth), catches every agent event, and forwards it to your Vercel-hosted dashboard via HTTPS POST.

### Why K2-Think-V2?

| Feature | Detail |
|---------|--------|
| **Model** | [LLM360/K2-Think-V2](https://huggingface.co/LLM360/K2-Think-V2) |
| **Type** | Open-source reasoning model |
| **API** | OpenAI-compatible (`https://build-api.k2think.ai/v1`) |
| **Auth** | Single API key for all 6 agents |
| **Docs** | [OpenClaw × HuggingFace setup](https://docs.openclaw.ai/providers/huggingface) |

---

## 📁 Project Structure

```
├── app/
│   ├── page.js              # The entire dashboard (it's a lot)
│   ├── layout.js             # Metadata & stuff
│   └── api/
│       ├── gateway-bridge/   # Where events land (810 lines of chaos)
│       ├── dispatch/         # Send commands to agents
│       └── node-heartbeat/   # "are you alive?" check
├── components/
│   ├── OfficeCanvas.jsx      # 1500 lines of pixel-art madness 🎨
│   ├── AgentPanel.jsx        # Pretty agent cards
│   ├── ChatLog.jsx           # Every word every agent says
│   ├── EventFeed.jsx         # Real-time event doom-scroll
│   ├── MissionBoard.jsx      # System vitals
│   └── StatsBar.jsx          # Top bar with the blinky lights
├── lib/
│   ├── agents.js             # Agent DNA (colors, rooms, roles)
│   └── gateway.js            # Gateway connection config
└── gateway-bridge.mjs        # The bridge (lives on EC2, never sleeps)
```

---

## 🧠 How It Actually Works

1. 💬 **You send a message** in Discord → *"hey echo, do the thing"*
2. 🧠 **Echo** reads it, thinks real hard, decides what to do
3. ⚡ Echo **spawns sub-agents** → Bridge goes *"ooh, something happened!"*
4. 📡 Bridge **forwards to Vercel API** → writes to Supabase
5. ✨ Dashboard **subscribes via Realtime** → agents light up and move
6. 💪 Sub-agents **do their work**, post results to Discord
7. ✅ Sub-agents finish → Bridge catches `lifecycle.end`
8. 😴 Dashboard updates → agents go idle, start wandering again
9. 🍿 You watch all of this happen **in real-time** on a pixel-art canvas

The whole loop takes seconds. It's like watching ants building a colony, except the ants are writing TypeScript.

<p align="center">
  <img src="https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif" width="300" />
  <br/>
  <i>the agents when they finally finish a task</i>
</p>

---

## 🤯 Fun Facts

- The `OfficeCanvas.jsx` is **1547 lines**. It started at 200. We don't talk about what happened.
- Forge (DevOps) is the **slowest walker** in the office. This was a deliberate character choice.
- Bolt (Frontend) is the **fastest**. Because... ⚡
- Echo has a special room called **"Echo's Den"** in the top-right corner. He earned it.
- When ALL agents are idle, they literally wander around the office like NPCs waiting for a quest.
- The duplicate-suppression protocol is called `ANNOUNCE_SKIP`. When a sub-agent has already posted, it yells "ANNOUNCE_SKIP" to avoid saying the same thing twice. It works perfectly. Every time.
- This entire dashboard was built with AI assistance. The AI built its own surveillance system. *What could go wrong?*
- The model powering all agents is **K2-Think-V2** from LLM360 — open-source reasoning, served via K2's own API at `build-api.k2think.ai`.

---

## 📝 License

MIT — do whatever you want with it. Fork it. Clone it. Give your agents better names than ours. We dare you.

---

<p align="center">
  <img src="https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif" width="250" />
  <br/>
  <b>OpenClaw + K2</b> — because even AI agents deserve a cool office 🏢
  <br/>
  <i>now stop reading and go watch the demo</i>
</p>
