'use client';
import { useEffect, useRef, useCallback } from 'react';
import { AGENTS, ROOMS, DESK_POSITIONS, ROOM_POSITIONS, STATUS_VISUALS, UNIFIED_BOX } from '@/lib/agents';

// ─── Smooth position interpolation store ───
const agentAnimPos = {};
const LERP_SPEED = 0.022;  // responsive walk speed for status changes

// ─── Wander system for idle agents ───
const wanderTargets = {};   // { agentName: { x, y } } in 0-1 range
const wanderCooldown = {};  // { agentName: frameCount } - when to pick next target
const WANDER_LERP = 0.004;  // slow wandering stroll
const WANDER_ARRIVE_DIST = 0.02; // close enough = pick new target

// Per-agent speed variation so they don't all move identically
const AGENT_SPEED_MULT = {
  echo: 1.0, pixel: 0.85, dash: 1.1, stack: 0.75,
  probe: 0.9, ship: 1.05, pulse: 0.95,
};

// ─── Movement detection for walk animation ───
const agentPrevPos = {};  // { name: { x, y } }
const agentIsWalking = {}; // { name: boolean }
const WALK_THRESHOLD = 0.4; // min pixel movement per frame to count as walking

// Echo's Den — small private room inside cabin (top-right corner)
const ECHO_DEN = { x: 0.80, y: 0.06, w: 0.16, h: 0.20, cx: 0.88, cy: 0.16 };

// All rooms as rectangles agents can wander into (percentage coordinates)
const WANDER_ZONES = [
  { x: 0.04, y: 0.06, w: 0.53, h: 0.40 }, // 0: workspace (top-left)
  { x: 0.61, y: 0.06, w: 0.18, h: 0.40 }, // 1: cabin (top-right, left part — avoid Echo's den)
  { x: 0.61, y: 0.27, w: 0.35, h: 0.19 }, // 1b: cabin bottom strip (below den)
  { x: 0.04, y: 0.53, w: 0.53, h: 0.40 }, // 2: lab (bottom-left)
  { x: 0.61, y: 0.53, w: 0.35, h: 0.40 }, // 3: pulsebay (bottom-right)
];

// Each agent prefers certain rooms (70% chance preferred, 30% any room)
// Note: indices shifted — 0:workspace, 1:cabin-left, 2:cabin-bottom, 3:lab, 4:pulsebay
const AGENT_PREFERRED_ZONES = {
  echo:  [0, 1],    // workspace, cabin
  pixel: [1, 4],    // cabin, pulsebay
  dash:  [0, 3],    // workspace, lab
  stack: [3, 0],    // lab, workspace
  probe: [3, 4],    // lab, pulsebay
  ship:  [0, 3],    // workspace, lab
  pulse: [4, 2],    // pulsebay, cabin
};

function pickWanderTarget(name) {
  // 70% chance to pick a preferred room, 30% any room
  let zone;
  const prefs = AGENT_PREFERRED_ZONES[name];
  if (prefs && Math.random() < 0.7) {
    zone = WANDER_ZONES[prefs[Math.floor(Math.random() * prefs.length)]];
  } else {
    zone = WANDER_ZONES[Math.floor(Math.random() * WANDER_ZONES.length)];
  }
  const pad = 0.04;
  wanderTargets[name] = {
    x: zone.x + pad + Math.random() * (zone.w - pad * 2),
    y: zone.y + pad + Math.random() * (zone.h - pad * 2),
  };
  // Long random cooldown — agents pause and hang around like humans
  wanderCooldown[name] = 300 + Math.floor(Math.random() * 500);
  // Pick a new idle activity when picking a new wander target
  pickIdleActivity(name);
}

// ─── Idle activities for wandering agents ───
const IDLE_ACTIVITIES = [
  { emoji: '📱', label: 'browsing memes' },
  { emoji: '☕', label: 'coffee break' },
  { emoji: '😴', label: 'power nap' },
  { emoji: '🎵', label: 'humming' },
  { emoji: '🎮', label: 'gaming' },
  { emoji: '📖', label: 'reading' },
  { emoji: '🍕', label: 'snacking' },
  { emoji: '🎧', label: 'vibing' },
  { emoji: '💬', label: 'chatting' },
  { emoji: '🧘', label: 'meditating' },
  { emoji: '✏️', label: 'doodling' },
  { emoji: '🤳', label: 'selfie time' },
  { emoji: '🏓', label: 'ping pong' },
  { emoji: '😎', label: 'chilling' },
  { emoji: '🎤', label: 'singing' },
  { emoji: '🐱', label: 'cat videos' },
  { emoji: '💤', label: 'resting' },
  { emoji: '🫖', label: 'tea time' },
  { emoji: '🖥️', label: 'scrolling' },
  { emoji: '🎲', label: 'playing dice' },
];

const agentIdleActivity = {}; // { name: { emoji, label } }

function pickIdleActivity(name) {
  const act = IDLE_ACTIVITIES[Math.floor(Math.random() * IDLE_ACTIVITIES.length)];
  agentIdleActivity[name] = act;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function isAgentBusy(agentData) {
  if (!agentData) return false;
  const s = (agentData.status || '').toLowerCase();
  return s === 'working' || s === 'thinking' || s === 'talking' ||
         s === 'posting' || s === 'researching';
}

function getTargetPos(name, agentData, cw, ch) {
  // Pulse wanders when just monitoring, but goes to work room when doing real tasks
  const status = (agentData?.status || '').toLowerCase();
  const isPulseMonitoring = name === 'pulse' && status === 'monitoring';
  const isBusy = isAgentBusy(agentData) && !isPulseMonitoring;

  // Echo goes to private den when busy (replying to user)
  if (name === 'echo' && isBusy) {
    delete wanderCooldown[name];
    delete agentIdleActivity[name];
    return { x: ECHO_DEN.cx * cw, y: ECHO_DEN.cy * ch };
  }

  // Other agents freeze in place when busy (connection lines show comms)
  if (isBusy) {
    delete wanderCooldown[name];
    delete agentIdleActivity[name];
    const cur = agentAnimPos[name];
    if (cur) return { x: cur.x, y: cur.y };
    const dp = DESK_POSITIONS[name];
    return dp ? { x: dp.x * cw, y: dp.y * ch } : { x: cw * 0.5, y: ch * 0.5 };
  }

  // Idle → wander freely
  if (!wanderTargets[name]) {
    pickWanderTarget(name);
  }

  // Check if arrived at current wander target
  const wt = wanderTargets[name];
  const cur = agentAnimPos[name];
  if (cur) {
    const dx = (cur.x / cw) - wt.x;
    const dy = (cur.y / ch) - wt.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < WANDER_ARRIVE_DIST) {
      // Decrement cooldown
      if (!wanderCooldown[name]) wanderCooldown[name] = 0;
      wanderCooldown[name]--;
      if (wanderCooldown[name] <= 0) {
        pickWanderTarget(name);
      }
    }
  }

  const target = wanderTargets[name];
  return { x: target.x * cw, y: target.y * ch };
}

function getSmoothedPos(name, agentData, cw, ch) {
  const target = getTargetPos(name, agentData, cw, ch);
  const mult = AGENT_SPEED_MULT[name] || 1.0;
  const baseSpeed = isAgentBusy(agentData) ? LERP_SPEED : WANDER_LERP;
  const speed = baseSpeed * mult;
  if (!agentAnimPos[name]) {
    agentAnimPos[name] = { x: target.x, y: target.y };
    agentPrevPos[name] = { x: target.x, y: target.y };
    return target;
  }
  const cur = agentAnimPos[name];
  // Track previous position for walk detection
  const prev = agentPrevPos[name] || { x: cur.x, y: cur.y };
  cur.x = lerp(cur.x, target.x, speed);
  cur.y = lerp(cur.y, target.y, speed);
  // Detect if actually moving
  const dx = cur.x - prev.x;
  const dy = cur.y - prev.y;
  agentIsWalking[name] = Math.sqrt(dx * dx + dy * dy) > WALK_THRESHOLD;
  agentPrevPos[name] = { x: cur.x, y: cur.y };
  return { x: cur.x, y: cur.y };
}

// ─── Per-agent pixel art definitions ───
// Each agent has unique: skinColor, hairColor, hairStyle, outfit, accessory
const PIXEL_LOOKS = {
  echo: {
    skin: '#FFD5A0', hair: '#2244AA', hairStyle: 'spiky',
    shirt: '#4A90D9', pants: '#2a4a7a', accessory: 'headset',
  },
  pixel: {
    skin: '#C68642', hair: '#1a1a1a', hairStyle: 'cap',
    shirt: '#27AE60', pants: '#1a5a30', accessory: 'pen',
  },
  dash: {
    skin: '#FFDBB4', hair: '#8E44AD', hairStyle: 'long',
    shirt: '#8E44AD', pants: '#5a2a6a', accessory: 'glasses',
  },
  stack: {
    skin: '#FFE0BD', hair: '#CCCCCC', hairStyle: 'bald',
    shirt: '#F1C40F', pants: '#8a7a20', accessory: 'headset',
  },
  probe: {
    skin: '#D4A06A', hair: '#E74C3C', hairStyle: 'mohawk',
    shirt: '#E74C3C', pants: '#801a1a', accessory: 'glasses',
  },
  ship: {
    skin: '#FFD5A0', hair: '#E67E22', hairStyle: 'short',
    shirt: '#E67E22', pants: '#7a4a10', accessory: 'phone',
  },
  pulse: {
    skin: '#B8E6C8', hair: '#00CC66', hairStyle: 'short',
    shirt: '#00FF88', pants: '#0a5a2a', accessory: 'headset',
  },
};

// Pixel helper: draw a filled rect (1 pixel unit = P px on canvas)
let P = 3; // pixel scale — updated dynamically based on canvas width
function px(ctx, bx, by, col, pw, ph) {
  ctx.fillStyle = col;
  ctx.fillRect(bx, by, (pw || 1) * P, (ph || 1) * P);
}

function drawPixelAgent(ctx, x, y, name, frame, status) {
  const look = PIXEL_LOOKS[name];
  if (!look) return;
  // offset so x,y is center-bottom of sprite
  const ox = x - 7 * P; // sprite ~14px wide
  const oy = y - 20 * P; // sprite ~20px tall

  // ── Legs with walking animation ──
  const walking = agentIsWalking[name];
  if (walking) {
    // Alternating stride: legs swap forward/back
    const stride = Math.sin(frame * 0.18) * 2.5 * P;
    // Left leg
    px(ctx, ox + 4 * P, oy + 17 * P, look.pants, 2, 2);
    ctx.fillStyle = look.pants;
    ctx.fillRect(ox + 4 * P, oy + 19 * P + stride, 2 * P, 1 * P);
    // Right leg
    px(ctx, ox + 8 * P, oy + 17 * P, look.pants, 2, 2);
    ctx.fillStyle = look.pants;
    ctx.fillRect(ox + 8 * P, oy + 19 * P - stride, 2 * P, 1 * P);
    // Feet
    ctx.fillStyle = '#333';
    ctx.fillRect(ox + 3 * P, oy + 20 * P + stride, 3 * P, 1 * P);
    ctx.fillRect(ox + 8 * P, oy + 20 * P - stride, 3 * P, 1 * P);
  } else {
    // Standing still
    px(ctx, ox + 4 * P, oy + 17 * P, look.pants, 2, 3);
    px(ctx, ox + 8 * P, oy + 17 * P, look.pants, 2, 3);
    // Feet
    px(ctx, ox + 3 * P, oy + 20 * P, '#333', 3, 1);
    px(ctx, ox + 8 * P, oy + 20 * P, '#333', 3, 1);
  }

  // ── Body / Shirt (6px wide, 6px tall) ──
  px(ctx, ox + 3 * P, oy + 11 * P, look.shirt, 8, 6);
  // Shirt highlight
  px(ctx, ox + 4 * P, oy + 12 * P, lighten(look.shirt, 25), 2, 2);

  // ── Arms ──
  px(ctx, ox + 1 * P, oy + 12 * P, look.shirt, 2, 4);
  px(ctx, ox + 11 * P, oy + 12 * P, look.shirt, 2, 4);
  // Hands
  px(ctx, ox + 1 * P, oy + 16 * P, look.skin, 2, 1);
  px(ctx, ox + 11 * P, oy + 16 * P, look.skin, 2, 1);

  // ── Head (8px wide, 8px tall) ──
  px(ctx, ox + 3 * P, oy + 3 * P, look.skin, 8, 8);

  // ── Eyes ──
  const blink = Math.floor(frame * 0.03) % 60 === 0;
  const eyeH = (blink || status === 'sleeping') ? 1 : 2;
  px(ctx, ox + 5 * P, oy + 6 * P, '#fff', 2, eyeH);
  px(ctx, ox + 8 * P, oy + 6 * P, '#fff', 2, eyeH);
  if (!blink && status !== 'sleeping') {
    px(ctx, ox + 5 * P, oy + 7 * P, '#111', 1, 1);
    px(ctx, ox + 9 * P, oy + 7 * P, '#111', 1, 1);
  }

  // ── Mouth ──
  if (status === 'talking') {
    const mouthOpen = Math.floor(frame * 0.1) % 2;
    px(ctx, ox + 6 * P, oy + 9 * P, mouthOpen ? '#c0392b' : '#e74c3c', 2, mouthOpen ? 2 : 1);
  } else {
    px(ctx, ox + 6 * P, oy + 9 * P, '#c0392b', 2, 1);
  }

  // ── Hair (unique per agent) ──
  drawHair(ctx, ox, oy, look);

  // ── Accessory (unique per agent) ──
  drawAccessory(ctx, ox, oy, name, look, frame);
}

function drawHair(ctx, ox, oy, look) {
  switch (look.hairStyle) {
    case 'spiky': // Echo — blue spiky hair
      px(ctx, ox + 3 * P, oy + 1 * P, look.hair, 8, 3);
      px(ctx, ox + 4 * P, oy + 0 * P, look.hair, 2, 1);
      px(ctx, ox + 7 * P, oy + 0 * P, look.hair, 2, 1);
      px(ctx, ox + 5 * P, oy - 1 * P, look.hair, 1, 1);
      px(ctx, ox + 9 * P, oy - 1 * P, look.hair, 1, 1);
      break;
    case 'cap': // Scout — dark cap with brim
      px(ctx, ox + 2 * P, oy + 2 * P, '#2c3e50', 10, 2);
      px(ctx, ox + 1 * P, oy + 4 * P, '#2c3e50', 4, 1); // brim
      px(ctx, ox + 3 * P, oy + 1 * P, '#34495e', 8, 1);
      break;
    case 'long': // Quill — long purple hair
      px(ctx, ox + 3 * P, oy + 1 * P, look.hair, 8, 3);
      px(ctx, ox + 2 * P, oy + 3 * P, look.hair, 2, 7); // left side
      px(ctx, ox + 10 * P, oy + 3 * P, look.hair, 2, 7); // right side
      px(ctx, ox + 3 * P, oy + 0 * P, look.hair, 8, 1);
      break;
    case 'bald': // Sage — bald with a shine
      px(ctx, ox + 3 * P, oy + 2 * P, look.skin, 8, 2);
      px(ctx, ox + 5 * P, oy + 2 * P, lighten(look.skin, 40), 2, 1); // shine
      break;
    case 'mohawk': // Sentinel — red mohawk
      px(ctx, ox + 5 * P, oy + 0 * P, look.hair, 4, 4);
      px(ctx, ox + 6 * P, oy - 1 * P, look.hair, 2, 1);
      px(ctx, ox + 6 * P, oy - 2 * P, lighten(look.hair, 30), 2, 1);
      break;
    case 'short': // Xalt — short orange messy
      px(ctx, ox + 3 * P, oy + 1 * P, look.hair, 8, 3);
      px(ctx, ox + 2 * P, oy + 2 * P, look.hair, 1, 2);
      px(ctx, ox + 11 * P, oy + 2 * P, look.hair, 1, 2);
      break;
  }
}

function drawAccessory(ctx, ox, oy, name, look, frame) {
  switch (look.accessory) {
    case 'headset': // Echo — blue headset
      px(ctx, ox + 1 * P, oy + 5 * P, '#3a7bd5', 2, 3);
      px(ctx, ox + 2 * P, oy + 2 * P, '#3a7bd5', 1, 3);
      px(ctx, ox + 11 * P, oy + 2 * P, '#3a7bd5', 1, 3);
      break;
    case 'binoculars': // Scout — binoculars around neck
      px(ctx, ox + 5 * P, oy + 11 * P, '#555', 1, 1);
      px(ctx, ox + 8 * P, oy + 11 * P, '#555', 1, 1);
      px(ctx, ox + 5 * P, oy + 10 * P, '#777', 1, 1);
      px(ctx, ox + 8 * P, oy + 10 * P, '#777', 1, 1);
      break;
    case 'pen': // Quill — pen in hand
      ctx.save();
      ctx.translate(ox + 12 * P, oy + 14 * P);
      ctx.rotate(0.3);
      px(ctx, 0, 0, '#ddd', 1, 4);
      px(ctx, 0, 4 * P, '#f1c40f', 1, 1);
      ctx.restore();
      break;
    case 'glasses': // Sage — round glasses
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ox + 6 * P, oy + 7 * P, P * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ox + 9 * P, oy + 7 * P, P * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ox + 7.5 * P, oy + 7 * P);
      ctx.lineTo(ox + 7.5 * P + P, oy + 7 * P);
      ctx.stroke();
      break;
    case 'shield': // Sentinel — tiny shield on arm
      px(ctx, ox + 0 * P, oy + 13 * P, '#c0392b', 2, 2);
      px(ctx, ox + 0 * P, oy + 15 * P, '#e74c3c', 1, 1);
      px(ctx, ox + 1 * P, oy + 12 * P, '#f1c40f', 1, 1); // emblem
      break;
    case 'phone': // Xalt — phone in hand
      px(ctx, ox + 12 * P, oy + 14 * P, '#333', 2, 3);
      px(ctx, ox + 12 * P, oy + 14 * P, '#4af', 1, 2); // screen glow
      const phonePulse = Math.sin(frame * 0.1) > 0.5;
      if (phonePulse) {
        px(ctx, ox + 13 * P, oy + 13 * P, '#4af', 1, 1); // notification
      }
      break;
  }
}

// ─── Pixel avatar (no circle) ───
function drawAgent(ctx, x, y, name, agentData, frame) {
  const config = AGENTS[name];
  if (!config) return;
  const status = agentData?.status || 'idle';
  const vis = STATUS_VISUALS[status] || STATUS_VISUALS.idle;
  const SPRITE_H = 20 * P; // total sprite height in canvas px
  const S = P / 3; // scale factor relative to desktop (1.0 on desktop, 0.67 on mobile)

  // Smooth gentle bob
  const bob = status === 'sleeping' ? 0 : Math.sin(frame * 0.03) * 1.5 * S;
  const ay = y + bob;

  // ── Glow behind sprite ──
  const pulse = 0.6 + Math.sin(frame * 0.06) * 0.4;
  ctx.save();
  ctx.shadowColor = vis.glow;
  ctx.shadowBlur = (status === 'idle' || status === 'sleeping' ? 4 : 14 * pulse) * S;
  ctx.globalAlpha = status === 'idle' ? 0.25 : 0.6;
  ctx.fillStyle = vis.glow;
  ctx.beginPath();
  ctx.ellipse(x, ay + 2, 12 * S, SPRITE_H / 2 + 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Draw pixel character directly ──
  drawPixelAgent(ctx, x, ay + SPRITE_H / 2 - 2, name, frame, status);

  // ── Shadow under feet ──
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x, ay + SPRITE_H / 2 + 2, 10 * S, 2.5 * S, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Status dot (bottom-right of sprite) ──
  const dotR = 3 * S;
  ctx.beginPath();
  ctx.arc(x + 10 * S, ay + SPRITE_H / 2 - 3 * S, dotR, 0, Math.PI * 2);
  ctx.fillStyle = vis.glow;
  ctx.fill();
  ctx.strokeStyle = '#0d0d1a';
  ctx.lineWidth = 1 * S;
  ctx.stroke();

  // ── Name tag (colored pill below) ──
  const label = config.label;
  const nameFs = Math.max(7, Math.round(10 * S));
  ctx.font = `bold ${nameFs}px monospace`;
  const lw = ctx.measureText(label).width;
  const pillW = lw + 8 * S;
  const pillH = Math.round(13 * S);
  const pillX = x - pillW / 2;
  const pillY = ay + SPRITE_H / 2 + 4 * S;

  ctx.fillStyle = config.color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 3 * S);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, pillY + pillH / 2);

  // ── "Replying to you" indicator for Echo when active ──
  if (name === 'echo' && isAgentBusy(agentData)) {
    const rFs = Math.max(5, Math.round(7 * S));
    ctx.font = `${rFs}px monospace`;
    const rLabel = '↩ replying to you';
    const rw2 = ctx.measureText(rLabel).width;
    const rPillW = rw2 + 6 * S;
    const rPillH = Math.round(10 * S);
    const rPillX = x - rPillW / 2;
    const rPillY = pillY + pillH + 2 * S;
    // Pill bg
    ctx.fillStyle = 'rgba(74, 144, 217, 0.25)';
    ctx.globalAlpha = 0.85 + Math.sin(frame * 0.06) * 0.15;
    ctx.beginPath();
    ctx.roundRect(rPillX, rPillY, rPillW, rPillH, 2 * S);
    ctx.fill();
    // Text
    ctx.fillStyle = '#7cb8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rLabel, x, rPillY + rPillH / 2);
    ctx.globalAlpha = 1;
  }

  // ── Speech bubble ──
  if (agentData?.current_task && status !== 'idle' && status !== 'sleeping') {
    drawBubble(ctx, x, ay - SPRITE_H / 2 - 8 * S, agentData.current_task, config.color, S);
  }

  // ── Status effects ──
  if (status === 'sleeping') {
    for (let i = 0; i < 3; i++) {
      const zz = ((frame * 0.015 + i * 0.33) % 1);
      ctx.globalAlpha = 1 - zz;
      ctx.font = `${Math.round((7 + zz * 6) * S)}px monospace`;
      ctx.fillStyle = '#8888bb';
      ctx.textAlign = 'center';
      ctx.fillText('z', x + 10 * S + zz * 10 * S + i * 3 * S, ay - 8 * S - zz * 18 * S);
    }
    ctx.globalAlpha = 1;
  }

  if (status === 'thinking') {
    // Enhanced thinking bubbles for native spawn
    for (let i = 0; i < 3; i++) {
      const p = (frame * 0.08 + i * 0.7) % 3;
      ctx.globalAlpha = p < 1 ? p : p < 2 ? 1 : 3 - p;
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(x + 16 * S + i * 6 * S, ay - 5 * S, 2.5 * S, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // "Spawned by Echo" indicator for non-echo agents
    if (name !== 'echo') {
      const sFs = Math.max(5, Math.round(6 * S));
      ctx.font = `${sFs}px monospace`;
      const sLabel = '⚡ delegated';
      const sw2 = ctx.measureText(sLabel).width;
      const sPillW = sw2 + 6 * S;
      const sPillH = Math.round(9 * S);
      const sPillX = x - sPillW / 2;
      const sPillY = ay + 38 * S;
      ctx.fillStyle = 'rgba(241, 196, 15, 0.2)';
      ctx.globalAlpha = 0.7 + Math.sin(frame * 0.08) * 0.2;
      ctx.beginPath();
      ctx.roundRect(sPillX, sPillY, sPillW, sPillH, 2 * S);
      ctx.fill();
      ctx.fillStyle = '#f1c40f';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sLabel, x, sPillY + sPillH / 2);
      ctx.globalAlpha = 1;
    }
  }

  if (status === 'working') {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const angle = (frame * 0.03 + i * Math.PI / 2) % (Math.PI * 2);
      const pr = 22 * S + Math.sin(frame * 0.05 + i) * 2 * S;
      const ppx = x + Math.cos(angle) * pr;
      const ppy = ay + Math.sin(angle) * pr;
      ctx.fillStyle = config.color;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(ppx, ppy, 1.5 * S, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (status === 'error') {
    ctx.save();
    const flash = Math.sin(frame * 0.15) > 0;
    if (flash) {
      ctx.beginPath();
      ctx.arc(x, ay, 18 * S, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(231, 76, 60, 0.2)';
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Idle activity bubble (when wandering) ──
  if (!isAgentBusy(agentData) && status !== 'sleeping') {
    const act = agentIdleActivity[name];
    if (act) {
      const bubbleY = ay - SPRITE_H / 2 - 10 * S;
      const bubbleX = x;

      // Floating bounce
      const floatOff = Math.sin(frame * 0.04 + x * 0.1) * 2 * S;

      // Small rounded bubble background
      const emojiSize = Math.round(11 * S);
      ctx.save();

      // Tiny label below emoji
      const lblFs = Math.max(5, Math.round(7 * S));
      ctx.font = `${lblFs}px monospace`;
      const labelW = ctx.measureText(act.label).width;
      const bgW = Math.max(labelW + 8 * S, emojiSize + 10 * S);
      const bgH = Math.round(22 * S);
      const bgX = bubbleX - bgW / 2;
      const bgY = bubbleY - bgH + floatOff;

      // Bubble bg
      ctx.fillStyle = 'rgba(20, 20, 40, 0.75)';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.roundRect(bgX, bgY, bgW, bgH, 5 * S);
      ctx.fill();

      // Bubble border
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Tiny triangle pointer
      ctx.fillStyle = 'rgba(20, 20, 40, 0.75)';
      ctx.beginPath();
      ctx.moveTo(bubbleX - 2 * S, bgY + bgH);
      ctx.lineTo(bubbleX + 2 * S, bgY + bgH);
      ctx.lineTo(bubbleX, bgY + bgH + 3 * S);
      ctx.fill();

      // Emoji with gentle pulse
      const emojiPulse = 1 + Math.sin(frame * 0.06) * 0.08;
      ctx.font = `${Math.round(emojiSize * emojiPulse)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(act.emoji, bubbleX, bgY + 8 * S + floatOff * 0.2);

      // Label text
      ctx.font = `${lblFs}px monospace`;
      ctx.fillStyle = 'rgba(200, 200, 220, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(act.label, bubbleX, bgY + 17 * S + floatOff * 0.2);

      ctx.restore();
    }
  }
}

// ─── Bubble ───
function drawBubble(ctx, x, y, text, borderColor, S) {
  S = S || 1;
  const maxLen = Math.round(28 * S);
  const t = text.length > maxLen ? text.slice(0, maxLen - 2) + '..' : text;
  const fs = Math.max(6, Math.round(10 * S));
  ctx.font = `${fs}px monospace`;
  const tw = ctx.measureText(t).width;
  const pad = 8 * S;
  const bw = tw + pad * 2;
  const bh = Math.round(16 * S);
  const bx = x - bw / 2;
  const by = y - bh;

  ctx.fillStyle = 'rgba(25, 25, 45, 0.92)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 4 * S);
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1 * S;
  ctx.stroke();

  // Pointer
  ctx.beginPath();
  ctx.moveTo(x - 4 * S, by + bh);
  ctx.lineTo(x, by + bh + 5 * S);
  ctx.lineTo(x + 4 * S, by + bh);
  ctx.fillStyle = 'rgba(25, 25, 45, 0.92)';
  ctx.fill();

  ctx.fillStyle = '#e0e0e0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(t, x, by + bh / 2);
}

// ─── Animated dashed connection lines between active agents ───
function drawConnections(ctx, agents, cw, ch, frame) {
  if (!agents || agents.length < 2) return;
  // Include "thinking" for native sessions_spawn delegations
  const active = agents.filter(a =>
    a.status === 'talking' || a.status === 'working' || a.status === 'researching' || a.status === 'thinking'
  );
  if (active.length < 2) return;

  ctx.save();
  ctx.strokeStyle = '#00bcd4';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 5]);
  ctx.lineDashOffset = -frame * 0.8; // animated dash flow
  ctx.globalAlpha = 0.55;

  // Connect all active agents to the first one (hub, usually echo)
  const hub = active[0];
  const hubPos = getSmoothedPos(hub.name, hub, cw, ch);

  for (let i = 1; i < active.length; i++) {
    const other = active[i];
    const op = getSmoothedPos(other.name, other, cw, ch);

    ctx.beginPath();
    ctx.moveTo(hubPos.x, hubPos.y);
    // Smooth curve bowing downward
    const cpx = (hubPos.x + op.x) / 2;
    const cpy = Math.max(hubPos.y, op.y) + 50;
    ctx.quadraticCurveTo(cpx, cpy, op.x, op.y);
    ctx.stroke();

    // Small moving dot along the curve
    const t = (frame * 0.008) % 1;
    const dotX = (1 - t) * (1 - t) * hubPos.x + 2 * (1 - t) * t * cpx + t * t * op.x;
    const dotY = (1 - t) * (1 - t) * hubPos.y + 2 * (1 - t) * t * cpy + t * t * op.y;
    ctx.fillStyle = '#00e5ff';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.55;
  }

  // Also cross-connect active agents to each other (not just hub)
  if (active.length >= 3) {
    ctx.globalAlpha = 0.25;
    for (let i = 1; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = getSmoothedPos(active[i].name, active[i], cw, ch);
        const b = getSmoothedPos(active[j].name, active[j], cw, ch);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        const mx = (a.x + b.x) / 2;
        const my = Math.max(a.y, b.y) + 35;
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

// ─── Room zones (polished with themed interiors) ───
function drawRooms(ctx, cw, ch, frame) {
  // ── Draw ONE unified box for the entire space ──
  const bx = UNIFIED_BOX.x * cw + 2, by = UNIFIED_BOX.y * ch + 2;
  const bw = UNIFIED_BOX.w * cw - 4, bh = UNIFIED_BOX.h * ch - 4;
  const divX = UNIFIED_BOX.dividerX * cw;
  const divY = UNIFIED_BOX.dividerY * ch;

  // Unified background gradient
  const bgGrad = ctx.createLinearGradient(bx, by, bx + bw * 0.3, by + bh);
  bgGrad.addColorStop(0, 'rgba(12,14,35,0.55)');
  bgGrad.addColorStop(0.35, 'rgba(8,8,16,0.5)');
  bgGrad.addColorStop(0.65, 'rgba(10,16,12,0.45)');
  bgGrad.addColorStop(1, 'rgba(8,18,12,0.5)');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 10);
  ctx.fill();

  // Isometric floor grid
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 10);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.015)';
  ctx.lineWidth = 0.5;
  const gridSize = 24;
  for (let gx = 0; gx < bw + bh; gx += gridSize) {
    ctx.beginPath();
    ctx.moveTo(bx + gx, by);
    ctx.lineTo(bx + gx - bh * 0.5, by + bh);
    ctx.stroke();
  }
  for (let gy = 0; gy < bh; gy += gridSize) {
    ctx.beginPath();
    ctx.moveTo(bx, by + gy);
    ctx.lineTo(bx + bw, by + gy);
    ctx.stroke();
  }
  ctx.restore();

  // Quadrant ambient glows
  const glowR = Math.min(bw, bh) * 0.32;
  // Top-left: workspace blue
  const g1 = ctx.createRadialGradient(bx + bw * 0.25, by + bh * 0.25, 0, bx + bw * 0.25, by + bh * 0.25, glowR);
  g1.addColorStop(0, 'rgba(74,106,255,0.05)'); g1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g1; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 10); ctx.fill();
  // Top-right: cabin warm
  const g2 = ctx.createRadialGradient(bx + bw * 0.78, by + bh * 0.25, 0, bx + bw * 0.78, by + bh * 0.25, glowR);
  g2.addColorStop(0, 'rgba(212,145,90,0.05)'); g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 10); ctx.fill();
  // Bottom-left: lab green
  const g3 = ctx.createRadialGradient(bx + bw * 0.25, by + bh * 0.75, 0, bx + bw * 0.25, by + bh * 0.75, glowR);
  g3.addColorStop(0, 'rgba(46,204,113,0.04)'); g3.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g3; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 10); ctx.fill();
  // Bottom-right: pulse green
  const g4 = ctx.createRadialGradient(bx + bw * 0.78, by + bh * 0.75, 0, bx + bw * 0.78, by + bh * 0.75, glowR);
  g4.addColorStop(0, 'rgba(0,255,136,0.04)'); g4.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g4; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 10); ctx.fill();

  // ── Single outer border with glow ──
  const glowPulse = 0.35 + Math.sin(frame * 0.018) * 0.15;
  ctx.save();
  ctx.shadowColor = '#4a6aff';
  ctx.shadowBlur = 8;
  ctx.globalAlpha = glowPulse * 0.4;
  ctx.strokeStyle = '#4a6aff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx - 1, by - 1, bw + 2, bh + 2, 11);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = glowPulse;
  ctx.strokeStyle = '#3344aa';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 10);
  ctx.stroke();
  ctx.restore();

  // ── Corner brackets on the unified box ──
  ctx.strokeStyle = '#4a6aff';
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 2;
  const cLen = 14;
  ctx.beginPath(); ctx.moveTo(bx + cLen, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + cLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + bw - cLen, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + cLen, by + bh); ctx.lineTo(bx, by + bh); ctx.lineTo(bx, by + bh - cLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + bw - cLen, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cLen); ctx.stroke();
  ctx.globalAlpha = 1;

  // ── Vertical dividing line (left | right) ──
  const vGlow = ctx.createLinearGradient(divX - 6, by, divX + 6, by);
  vGlow.addColorStop(0, 'rgba(255,255,255,0)'); vGlow.addColorStop(0.5, 'rgba(200,210,255,0.08)'); vGlow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = vGlow;
  ctx.fillRect(divX - 6, by + 6, 12, bh - 12);
  const vLine = ctx.createLinearGradient(divX, by, divX, by + bh);
  vLine.addColorStop(0, 'rgba(255,255,255,0)'); vLine.addColorStop(0.06, 'rgba(255,255,255,0.25)'); vLine.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  vLine.addColorStop(0.94, 'rgba(255,255,255,0.25)'); vLine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = vLine;
  ctx.fillRect(divX - 0.5, by + 6, 1.5, bh - 12);

  // ── Horizontal dividing line (top | bottom) ──
  const hGlow = ctx.createLinearGradient(bx, divY - 6, bx, divY + 6);
  hGlow.addColorStop(0, 'rgba(255,255,255,0)'); hGlow.addColorStop(0.5, 'rgba(200,210,255,0.08)'); hGlow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hGlow;
  ctx.fillRect(bx + 6, divY - 6, bw - 12, 12);
  const hLine = ctx.createLinearGradient(bx, divY, bx + bw, divY);
  hLine.addColorStop(0, 'rgba(255,255,255,0)'); hLine.addColorStop(0.06, 'rgba(255,255,255,0.25)'); hLine.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  hLine.addColorStop(0.94, 'rgba(255,255,255,0.25)'); hLine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hLine;
  ctx.fillRect(bx + 6, divY - 0.5, bw - 12, 1.5);

  // ── Echo's Den — small private room inside cabin ──
  const denX = ECHO_DEN.x * cw, denY = ECHO_DEN.y * ch;
  const denW = ECHO_DEN.w * cw, denH = ECHO_DEN.h * ch;

  // Den background
  ctx.fillStyle = 'rgba(74, 144, 217, 0.06)';
  ctx.beginPath();
  ctx.roundRect(denX, denY, denW, denH, 4);
  ctx.fill();

  // Den border
  const denGlow = 0.3 + Math.sin(frame * 0.025) * 0.12;
  ctx.strokeStyle = '#4A90D9';
  ctx.globalAlpha = denGlow;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(denX, denY, denW, denH, 4);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Den label
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('⚙️', denX + 4, denY + 3);
  ctx.font = 'bold 6px monospace';
  ctx.fillStyle = '#4A90D9';
  ctx.globalAlpha = 0.55;
  ctx.fillText("ECHO'S DEN", denX + 16, denY + 5);
  ctx.globalAlpha = 1;

  // Small monitor/desk inside den
  const mdx = ECHO_DEN.cx * cw + 8, mdy = ECHO_DEN.cy * ch - 8;
  ctx.fillStyle = '#111128';
  ctx.beginPath();
  ctx.roundRect(mdx - 6, mdy - 8, 12, 10, 2);
  ctx.fill();
  // Screen glow
  ctx.fillStyle = 'rgba(74, 144, 217, 0.3)';
  ctx.fillRect(mdx - 4, mdy - 6, 8, 6);
  // Stand
  ctx.fillStyle = '#2a2a48';
  ctx.fillRect(mdx - 1, mdy + 2, 2, 3);

  // ── Room labels (one per quadrant) ──
  const labels = [
    { icon: '💻', text: 'WORKSPACE', color: '#4a6aff', lx: bx + 8,     ly: by + 10 },
    { icon: '🏠', text: 'CABIN',     color: '#d4915a', lx: divX + 8,   ly: by + 10 },
    { icon: '🧪', text: 'CODE LAB',  color: '#2ecc71', lx: bx + 8,     ly: divY + 8 },
    { icon: '💚', text: 'PULSE BAY', color: '#00FF88', lx: divX + 8,   ly: divY + 8 },
  ];
  labels.forEach(l => {
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(l.icon, l.lx, l.ly);
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = l.color;
    ctx.globalAlpha = 0.6;
    ctx.fillText(l.text, l.lx + 16, l.ly + 2);
    ctx.globalAlpha = 1;
  });

  // ── Scanning line ──
  const scanLine = by + ((frame * 0.3) % bh);
  ctx.fillStyle = 'rgba(74,106,255,0.02)';
  ctx.fillRect(bx + 4, scanLine, bw - 8, 1);

  // ── Bottom status bar ──
  const barW = bw - 20, barX = bx + 10, barY = by + bh - 6;
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.beginPath(); ctx.roundRect(barX, barY, barW, 2, 1); ctx.fill();
  const fillW = barW * (0.3 + Math.sin(frame * 0.01) * 0.2);
  ctx.fillStyle = 'rgba(74,106,255,0.2)';
  ctx.beginPath(); ctx.roundRect(barX, barY, fillW, 2, 1); ctx.fill();

  // ── Room-specific interior decorations ──
  Object.entries(ROOMS).forEach(([key, room]) => {
    const rx = room.x * cw + 4, ry2 = room.y * ch + 22;
    const rw = room.w * cw - 8, rh2 = room.h * ch - 30;
    drawRoomInterior(ctx, key, rx, ry2, rw, rh2, cw, ch, frame);
  });
}

// ── Per-room interior decorations ──
function drawRoomInterior(ctx, roomKey, rx, ry, rw, rh, cw, ch, frame) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();

  if (roomKey === 'workspace') {
    // Ceiling strip lights
    for (let i = 0; i < 3; i++) {
      const lx = rx + rw * (0.18 + i * 0.30);
      const ly = ry + 4;
      ctx.fillStyle = `rgba(74, 106, 255, ${0.06 + Math.sin(frame * 0.015 + i) * 0.03})`;
      ctx.beginPath();
      ctx.roundRect(lx - 30, ly, 60, 3, 1);
      ctx.fill();
      ctx.fillStyle = 'rgba(180,200,255,0.12)';
      ctx.beginPath();
      ctx.arc(lx, ly + 1.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Whiteboard on left wall
    const wbx = rx + 8, wby = ry + rh * 0.35;
    ctx.fillStyle = 'rgba(240,240,235,0.06)';
    ctx.beginPath();
    ctx.roundRect(wbx, wby, 6, rh * 0.35, 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(74,106,255,0.15)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Sticky notes on whiteboard
    const stickyCs = ['#4a6aff', '#2ecc71', '#f1c40f', '#e74c3c'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = stickyCs[i];
      ctx.globalAlpha = 0.12;
      ctx.fillRect(wbx + 1, wby + 4 + i * (rh * 0.08), 4, rh * 0.06);
    }
    ctx.globalAlpha = 1;

    // Bottom status ticker
    const tickY = ry + rh - 6;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.roundRect(rx + 8, tickY, rw - 16, 5, 2);
    ctx.fill();
    const tickerText = '● 7 AGENTS ONLINE  ● BUILD PASSING  ● NO INCIDENTS';
    ctx.font = '5px monospace';
    ctx.fillStyle = '#4a6aff';
    ctx.globalAlpha = 0.4;
    ctx.textAlign = 'left';
    const tickOff = (frame * 0.3) % (rw * 2);
    ctx.fillText(tickerText, rx + rw - tickOff, tickY + 3.5);
    ctx.globalAlpha = 1;
  }

  if (roomKey === 'cabin') {
    // Warm cabin ambiance - fireplace glow
    const fx = rx + rw * 0.5, fy = ry + rh * 0.75;

    // Fireplace structure
    ctx.fillStyle = 'rgba(60,30,15,0.4)';
    ctx.beginPath(); ctx.roundRect(fx - 18, fy - 6, 36, 16, 3); ctx.fill();
    ctx.fillStyle = 'rgba(40,20,10,0.5)';
    ctx.beginPath(); ctx.roundRect(fx - 14, fy - 2, 28, 10, 2); ctx.fill();

    // Animated fire
    for (let i = 0; i < 5; i++) {
      const flicker = Math.sin(frame * 0.12 + i * 1.7) * 3;
      const fh = 5 + Math.sin(frame * 0.08 + i * 2.3) * 2.5;
      const fireColors = ['#ff6b35', '#ff9500', '#ffcc00', '#ff4500', '#ff8c00'];
      ctx.fillStyle = fireColors[i];
      ctx.globalAlpha = 0.25 + Math.sin(frame * 0.1 + i) * 0.1;
      ctx.beginPath();
      ctx.ellipse(fx - 7 + i * 3.5 + flicker * 0.3, fy - fh * 0.5, 2.5, fh * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Warm glow
    const fireGlow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 50);
    fireGlow.addColorStop(0, `rgba(255,150,50,${0.04 + Math.sin(frame * 0.03) * 0.02})`);
    fireGlow.addColorStop(1, 'rgba(255,100,30,0)');
    ctx.fillStyle = fireGlow;
    ctx.fillRect(rx, ry, rw, rh);

    // Couch
    const ccx = rx + rw * 0.5, ccy = ry + rh * 0.45;
    ctx.fillStyle = 'rgba(80,45,25,0.35)';
    ctx.beginPath(); ctx.roundRect(ccx - 24, ccy, 48, 14, 4); ctx.fill();
    ctx.fillStyle = 'rgba(90,55,30,0.3)';
    ctx.beginPath(); ctx.roundRect(ccx - 24, ccy - 8, 48, 10, 4); ctx.fill();

    // Window with moonlight
    const wx = rx + 10, wy = ry + 10;
    ctx.fillStyle = 'rgba(15,20,40,0.4)';
    ctx.beginPath(); ctx.roundRect(wx, wy, 18, 24, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(100,70,40,0.3)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(wx + 9, wy); ctx.lineTo(wx + 9, wy + 24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx, wy + 12); ctx.lineTo(wx + 18, wy + 12); ctx.stroke();
    ctx.fillStyle = 'rgba(200,220,255,0.12)';
    ctx.beginPath(); ctx.arc(wx + 5, wy + 6, 0.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(wx + 13, wy + 9, 0.6, 0, Math.PI * 2); ctx.fill();

    // Bookshelf on right wall
    const bsx = rx + rw - 16, bsy = ry + 10;
    ctx.fillStyle = 'rgba(50,30,15,0.4)';
    ctx.beginPath(); ctx.roundRect(bsx, bsy, 10, rh * 0.45, 2); ctx.fill();
    const bookColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];
    for (let si = 0; si < 3; si++) {
      ctx.fillStyle = 'rgba(70,40,20,0.3)';
      ctx.fillRect(bsx + 1, bsy + 5 + si * (rh * 0.13), 8, 1);
      for (let bi = 0; bi < 2; bi++) {
        ctx.fillStyle = bookColors[(si * 2 + bi) % bookColors.length];
        ctx.globalAlpha = 0.2;
        ctx.fillRect(bsx + 2 + bi * 4, bsy + 1 + si * (rh * 0.13), 3, rh * 0.11);
      }
    }
    ctx.globalAlpha = 1;
  }

  if (roomKey === 'lab') {
    // Code Lab — terminals, test racks, data streams
    // Terminal screens on left
    for (let i = 0; i < 2; i++) {
      const tx = rx + 10, ty = ry + 10 + i * (rh * 0.38);
      ctx.fillStyle = 'rgba(5,15,10,0.5)';
      ctx.beginPath(); ctx.roundRect(tx, ty, 24, rh * 0.28, 3); ctx.fill();
      // Terminal text lines
      for (let ln = 0; ln < 5; ln++) {
        const lw = 8 + Math.random() * 12;
        ctx.fillStyle = '#2ecc71';
        ctx.globalAlpha = 0.15 + Math.sin(frame * 0.02 + ln + i * 3) * 0.05;
        ctx.fillRect(tx + 3, ty + 4 + ln * (rh * 0.05), lw, 2);
      }
      ctx.globalAlpha = 1;
      // Blinking cursor
      if (Math.floor(frame * 0.03) % 2 === i) {
        ctx.fillStyle = '#2ecc71';
        ctx.globalAlpha = 0.4;
        ctx.fillRect(tx + 3, ty + 4 + 5 * (rh * 0.05), 4, 2);
        ctx.globalAlpha = 1;
      }
    }

    // Test rack / server rack on right
    const srx = rx + rw - 20, sry = ry + 8;
    ctx.fillStyle = 'rgba(20,30,25,0.4)';
    ctx.beginPath(); ctx.roundRect(srx, sry, 14, rh * 0.7, 2); ctx.fill();
    for (let si = 0; si < 6; si++) {
      const ledOn = Math.sin(frame * 0.05 + si * 1.2) > 0;
      ctx.fillStyle = ledOn ? '#2ecc71' : '#333';
      ctx.globalAlpha = ledOn ? 0.5 : 0.15;
      ctx.beginPath(); ctx.arc(srx + 5, sry + 8 + si * (rh * 0.10), 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.globalAlpha = 1;
      ctx.fillRect(srx + 9, sry + 6 + si * (rh * 0.10), 3, 4);
    }
    ctx.globalAlpha = 1;

    // Floating data particles
    for (let p = 0; p < 4; p++) {
      const px = rx + rw * 0.3 + Math.sin(frame * 0.015 + p * 2) * rw * 0.15;
      const py = ry + rh * 0.3 + Math.cos(frame * 0.012 + p * 1.7) * rh * 0.2;
      ctx.fillStyle = '#2ecc71';
      ctx.globalAlpha = 0.12 + Math.sin(frame * 0.03 + p) * 0.06;
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (roomKey === 'pulsebay') {
    // Pulse Bay — heartbeat monitor, node dashboard, status ring
    // Central heartbeat monitor
    const mox = rx + rw * 0.5, moy = ry + rh * 0.35;
    ctx.fillStyle = 'rgba(5,18,10,0.5)';
    ctx.beginPath(); ctx.roundRect(mox - 28, moy - 14, 56, 28, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(0,255,136,0.2)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.roundRect(mox - 28, moy - 14, 56, 28, 4); ctx.stroke();

    // Heartbeat line
    ctx.strokeStyle = '#00FF88';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let hx = 0; hx < 50; hx++) {
      const t = (hx / 50 + frame * 0.008) % 1;
      let hy = 0;
      if (t > 0.35 && t < 0.40) hy = -8;
      else if (t > 0.40 && t < 0.45) hy = 10;
      else if (t > 0.45 && t < 0.50) hy = -4;
      const px = mox - 24 + hx;
      const py = moy + hy;
      if (hx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Status ring around monitor
    const ringPulse = 0.15 + Math.sin(frame * 0.025) * 0.08;
    const ringGlow = ctx.createRadialGradient(mox, moy, 20, mox, moy, 40);
    ringGlow.addColorStop(0, 'rgba(0,255,136,0)');
    ringGlow.addColorStop(0.7, `rgba(0,255,136,${ringPulse})`);
    ringGlow.addColorStop(1, 'rgba(0,255,136,0)');
    ctx.fillStyle = ringGlow;
    ctx.fillRect(mox - 40, moy - 40, 80, 80);

    // Node status text
    ctx.font = 'bold 6px monospace';
    ctx.fillStyle = '#00FF88';
    ctx.globalAlpha = 0.4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('NODE STATUS', mox, moy + 18);
    ctx.globalAlpha = 1;

    // Ambient green particles
    for (let gp = 0; gp < 3; gp++) {
      const gpx = rx + rw * (0.2 + gp * 0.3) + Math.sin(frame * 0.01 + gp) * 8;
      const gpy = ry + rh * 0.75 + Math.cos(frame * 0.013 + gp * 2) * 6;
      ctx.fillStyle = '#00FF88';
      ctx.globalAlpha = 0.08 + Math.sin(frame * 0.02 + gp) * 0.04;
      ctx.beginPath(); ctx.arc(gpx, gpy, 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ─── Furniture (desks in workspace + cabin decorations) ───
function drawFurniture(ctx, cw, ch, frame, P) {
  const S = (P || 3) / 3;
  // ── Individual desks with monitors (skip pulse — it uses the node laptop) ──
  Object.entries(DESK_POSITIONS).forEach(([name, dp]) => {
    if (name === 'pulse') return;
    const dx = dp.x * cw, dy = dp.y * ch;
    const config = AGENTS[name];
    if (!config) return;

    // Desk surface
    const dw = 24 * S, dh = 6 * S;
    const deskGrad = ctx.createLinearGradient(dx - dw, dy + dh, dx + dw, dy + dh);
    deskGrad.addColorStop(0, '#2a2a48');
    deskGrad.addColorStop(0.5, '#323252');
    deskGrad.addColorStop(1, '#2a2a48');
    ctx.fillStyle = deskGrad;
    ctx.beginPath();
    ctx.roundRect(dx - dw, dy + dh, dw * 2, 12 * S, 3 * S);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(dx - dw + 2 * S, dy + dh, dw * 2 - 4 * S, 1);

    // Desk legs
    ctx.fillStyle = '#1e1e38';
    ctx.fillRect(dx - 20 * S, dy + 18 * S, 3 * S, 6 * S);
    ctx.fillRect(dx + 17 * S, dy + 18 * S, 3 * S, 6 * S);

    // Monitor frame
    const mw = 16 * S, mh = 24 * S;
    ctx.fillStyle = '#111128';
    ctx.beginPath();
    ctx.roundRect(dx - mw, dy - mh, mw * 2, mh, 4 * S);
    ctx.fill();

    // Screen content
    const sx = dx - 13 * S, sy = dy - 21 * S, sw = 26 * S, sh = 17 * S;
    const screenGrad = ctx.createLinearGradient(sx, sy, sx, sy + sh);
    screenGrad.addColorStop(0, darken(config.color, 80));
    screenGrad.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = screenGrad;
    ctx.fillRect(sx, sy, sw, sh);

    // Screen text lines
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = config.color;
    for (let li = 0; li < 4; li++) {
      const lw = (8 + (((name.charCodeAt(0) * 7 + li * 13) % 12))) * S;
      ctx.fillRect(dx - 10 * S, dy - 19 * S + li * 4 * S, lw, 1.5 * S);
    }
    ctx.globalAlpha = 1;

    // Scan line
    const scanY = sy + ((frame * 0.5 + Object.keys(AGENTS).indexOf(name) * 30) % (sh));
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(sx, scanY, sw, 2 * S);

    // Monitor glow
    ctx.strokeStyle = config.color;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 1 * S;
    ctx.beginPath();
    ctx.roundRect(dx - mw, dy - mh, mw * 2, mh, 4 * S);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Monitor stand
    ctx.fillStyle = '#2a2a48';
    ctx.fillRect(dx - 2 * S, dy, 4 * S, 6 * S);
    ctx.fillRect(dx - 5 * S, dy + 4 * S, 10 * S, 2 * S);

    // Power LED
    ctx.fillStyle = config.color;
    ctx.globalAlpha = 0.6 + Math.sin(frame * 0.04) * 0.3;
    ctx.beginPath();
    ctx.arc(dx + 13 * S, dy - 3 * S, 1.5 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Chair
    ctx.fillStyle = '#1a1a30';
    ctx.beginPath();
    ctx.ellipse(dx, dy + 28 * S, 10 * S, 6 * S, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222240';
    ctx.beginPath();
    ctx.roundRect(dx - 8 * S, dy + 18 * S, 16 * S, 8 * S, 3 * S);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(dx - 6 * S, dy + 19 * S, 12 * S, 2 * S);

    // Agent name label under desk
    const deskLblFs = Math.max(5, Math.round(7 * S));
    ctx.font = `bold ${deskLblFs}px monospace`;
    ctx.fillStyle = config.color;
    ctx.globalAlpha = 0.25;
    ctx.textAlign = 'center';
    ctx.fillText(config.label, dx, dy + 40 * S);
    ctx.globalAlpha = 1;
  });

  // ── Plants at room boundary ──
  drawPlant(ctx, 0.60 * cw, 0.15 * ch);
  drawPlant(ctx, 0.60 * cw, 0.88 * ch);
}

function drawPlant(ctx, x, y) {
  // Pot
  ctx.fillStyle = '#6b4226';
  ctx.beginPath();
  ctx.roundRect(x - 5, y, 10, 9, 2);
  ctx.fill();
  // Soil
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x - 4, y, 8, 3);
  // Leaves
  ctx.fillStyle = '#27ae60';
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(x, y - 4, 6, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 2, y - 7, 5, 3, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - 3, y - 6, 4, 3, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── Floor accent — divider is already drawn in drawRooms, this is a no-op ───
function drawFloorAccents(ctx, cw, ch, frame) {
  // Divider line is rendered inside drawRooms as part of the unified box.
}

// ─── Ambient floating particles ───
const PARTICLES = [];
for (let i = 0; i < 20; i++) {
  PARTICLES.push({
    x: Math.random(), y: Math.random(),
    speed: 0.0002 + Math.random() * 0.0004,
    size: 0.5 + Math.random() * 1.5,
    alpha: 0.05 + Math.random() * 0.1,
    drift: (Math.random() - 0.5) * 0.0003,
  });
}

function drawParticles(ctx, cw, ch, frame) {
  PARTICLES.forEach(p => {
    p.y -= p.speed;
    p.x += p.drift + Math.sin(frame * 0.01 + p.x * 10) * 0.0001;
    if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
    if (p.x < 0) p.x = 1;
    if (p.x > 1) p.x = 0;

    ctx.fillStyle = '#00bcd4';
    ctx.globalAlpha = p.alpha * (0.5 + Math.sin(frame * 0.03 + p.x * 20) * 0.5);
    ctx.beginPath();
    ctx.arc(p.x * cw, p.y * ch, p.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// ─── HQ title watermark ───
function drawWatermark(ctx, cw, ch) {
  ctx.save();
  // Large centered watermark
  ctx.font = 'bold 56px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.008)';
  ctx.fillText('OPENCLAW HQ', cw / 2, ch / 2);
  // Subtitle
  ctx.font = '14px monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.015)';
  ctx.fillText('MULTI-AGENT OPERATIONS CENTER', cw / 2, ch / 2 + 28);
  ctx.restore();
}

// ─── Node Connection Indicator — pixel art laptop in bottom-right ───
function drawNodeIndicator(ctx, cw, ch, frame, connected) {
  const nx = cw * 0.78;
  const ny = ch * 0.88;

  // ── Connection line from node to PULSE agent (follows pulse wherever it is) ──
  if (connected) {
    const pulsePos = agentAnimPos['pulse'];
    if (pulsePos) {
      ctx.save();
      ctx.setLineDash([3, 5]);
      ctx.lineDashOffset = -frame * 0.4;
      ctx.lineWidth = 1.5;

      const ax = pulsePos.x;
      const ay = pulsePos.y;
      const agentColor = '#00FF88';

      // Curved line from laptop to Pulse desk
      const cpx = (nx + ax) / 2 + 20;
      const cpy = (ny + ay) / 2 - 30;
      const lineGrad = ctx.createLinearGradient(nx, ny, ax, ay);
      lineGrad.addColorStop(0, 'rgba(0,255,136,0.5)');
      lineGrad.addColorStop(1, agentColor + '88');
      ctx.strokeStyle = lineGrad;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(nx, ny - 10);
      ctx.quadraticCurveTo(cpx, cpy, ax + 14, ay + 8);
      ctx.stroke();

      // Data packet along the curve
      const t = ((frame * 0.008) % 1);
      const dotX = (1 - t) * (1 - t) * nx + 2 * (1 - t) * t * cpx + t * t * (ax + 14);
      const dotY = (1 - t) * (1 - t) * (ny - 10) + 2 * (1 - t) * t * cpy + t * t * (ay + 8);
      ctx.fillStyle = agentColor;
      ctx.globalAlpha = 0.8 * (1 - Math.abs(t - 0.5) * 2);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
      ctx.fill();

      // Second packet offset
      const t2 = ((frame * 0.008 + 0.5) % 1);
      const dotX2 = (1 - t2) * (1 - t2) * nx + 2 * (1 - t2) * t2 * cpx + t2 * t2 * (ax + 14);
      const dotY2 = (1 - t2) * (1 - t2) * (ny - 10) + 2 * (1 - t2) * t2 * cpy + t2 * t2 * (ay + 8);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.6 * (1 - Math.abs(t2 - 0.5) * 2);
      ctx.beginPath();
      ctx.arc(dotX2, dotY2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  // ── Glow behind laptop ──
  const glowColor = connected ? 'rgba(0,255,136,0.15)' : 'rgba(255,80,80,0.1)';
  const glowPulse = 0.8 + Math.sin(frame * 0.05) * 0.2;
  ctx.save();
  ctx.shadowColor = connected ? '#00ff88' : '#ff5050';
  ctx.shadowBlur = connected ? 14 * glowPulse : 6;
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  ctx.ellipse(nx, ny, 30, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Laptop base (closed bottom) ──
  ctx.fillStyle = '#2a2a3e';
  ctx.beginPath();
  ctx.roundRect(nx - 22, ny - 2, 44, 6, 2);
  ctx.fill();
  // Base edge highlight
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(nx - 20, ny - 2, 40, 1);

  // ── Laptop screen (angled back) ──
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.roundRect(nx - 18, ny - 26, 36, 24, 3);
  ctx.fill();

  // Screen content
  if (connected) {
    // Active screen with code lines
    const screenGrad = ctx.createLinearGradient(nx - 15, ny - 23, nx - 15, ny - 5);
    screenGrad.addColorStop(0, '#0a1a0a');
    screenGrad.addColorStop(1, '#0a0f0a');
    ctx.fillStyle = screenGrad;
    ctx.fillRect(nx - 15, ny - 23, 30, 18);

    // Terminal-style green text
    ctx.fillStyle = '#00ff88';
    ctx.globalAlpha = 0.6;
    for (let li = 0; li < 4; li++) {
      const lw = 8 + ((li * 7 + 3) % 10);
      ctx.fillRect(nx - 12, ny - 21 + li * 4, lw, 1.5);
    }
    // Blinking cursor
    if (Math.sin(frame * 0.1) > 0) {
      ctx.fillRect(nx - 12 + 14, ny - 21 + 12, 3, 2);
    }
    ctx.globalAlpha = 1;

    // Scan line effect
    const scanY = ny - 23 + ((frame * 0.4) % 18);
    ctx.fillStyle = 'rgba(0,255,136,0.03)';
    ctx.fillRect(nx - 15, scanY, 30, 2);
  } else {
    // Offline — dark screen
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(nx - 15, ny - 23, 30, 18);
    // X mark
    ctx.strokeStyle = '#ff5050';
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(nx - 5, ny - 18);
    ctx.lineTo(nx + 5, ny - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(nx + 5, ny - 18);
    ctx.lineTo(nx - 5, ny - 10);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Screen border glow
  ctx.strokeStyle = connected ? '#00ff88' : '#ff5050';
  ctx.globalAlpha = connected ? 0.3 : 0.15;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(nx - 18, ny - 26, 36, 24, 3);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // ── Power LED ──
  ctx.fillStyle = connected ? '#00ff88' : '#ff5050';
  ctx.globalAlpha = 0.6 + Math.sin(frame * 0.06) * 0.3;
  ctx.beginPath();
  ctx.arc(nx, ny + 1, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // ── Label pill below ──
  const label = connected ? 'NODE' : 'OFFLINE';
  ctx.font = 'bold 8px monospace';
  const lw = ctx.measureText(label).width;
  const pillW = lw + 10;
  const pillH = 13;
  const pillX = nx - pillW / 2;
  const pillY = ny + 8;

  ctx.fillStyle = connected ? '#00ff88' : '#ff5050';
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 3);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, nx, pillY + pillH / 2);

  // ── Hostname tag ──
  if (connected) {
    ctx.font = '7px monospace';
    ctx.fillStyle = 'rgba(0,255,136,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('Windows PC', nx, pillY + pillH + 9);
  }

  // ── WiFi signal icon (top-right of laptop) ──
  if (connected) {
    const wf = nx + 24;
    const wy = ny - 20;
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.3 + i * 0.15;
      ctx.beginPath();
      ctx.arc(wf, wy + 6, 3 + i * 3, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
    }
    // Dot at base
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(wf, wy + 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ─── Helper: lighten a hex color ───
function lighten(hex, amt) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.min(255, r + amt);
  g = Math.min(255, g + amt);
  b = Math.min(255, b + amt);
  return `rgb(${r},${g},${b})`;
}

function darken(hex, amt) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, r - amt);
  g = Math.max(0, g - amt);
  b = Math.max(0, b - amt);
  return `rgb(${r},${g},${b})`;
}

// ─── Main component ───
export default function OfficeCanvas({ agents, nodeConnected }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const animRef = useRef(null);
  const agentsRef = useRef(agents);
  const nodeConnectedRef = useRef(nodeConnected);

  // Keep refs in sync without recreating draw
  agentsRef.current = agents;
  nodeConnectedRef.current = nodeConnected;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    // Scale pixel art based on canvas size: 3x desktop, 1.2x phone
    P = cw >= 700 ? 3 : 1.2;
    frameRef.current++;
    const frame = frameRef.current;
    const currentAgents = agentsRef.current;
    const currentNodeConnected = nodeConnectedRef.current;

    // Background with radial vignette
    const bgGrad = ctx.createRadialGradient(cw / 2, ch / 2, 80, cw / 2, ch / 2, cw * 0.75);
    bgGrad.addColorStop(0, '#0e1025');
    bgGrad.addColorStop(0.7, '#090a18');
    bgGrad.addColorStop(1, '#050510');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cw, ch);

    // Subtle cross-hatch grid
    ctx.strokeStyle = 'rgba(255,255,255,0.018)';
    ctx.lineWidth = 0.5;
    for (let gx = 0; gx < cw; gx += 30) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, ch);
      ctx.stroke();
    }
    for (let gy = 0; gy < ch; gy += 30) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(cw, gy);
      ctx.stroke();
    }
    // Dot intersections
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    for (let gx = 0; gx < cw; gx += 30) {
      for (let gy = 0; gy < ch; gy += 30) {
        ctx.beginPath();
        ctx.arc(gx, gy, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawWatermark(ctx, cw, ch);
    drawFloorAccents(ctx, cw, ch, frame);
    drawRooms(ctx, cw, ch, frame);
    drawFurniture(ctx, cw, ch, frame, P);
    drawParticles(ctx, cw, ch, frame);

    // Connection lines (before agents so lines go behind)
    drawConnections(ctx, currentAgents, cw, ch, frame);

    // Agent avatars — compute positions, then separate overlaps, then draw
    if (currentAgents) {
      // First pass: compute smoothed positions
      const agentPositions = currentAgents.map(agentData => ({
        agentData,
        pos: getSmoothedPos(agentData.name, agentData, cw, ch),
      }));

      // Second pass: push apart overlapping agents (minimum distance)
      const MIN_DIST = 28; // minimum pixel distance between agents
      for (let i = 0; i < agentPositions.length; i++) {
        for (let j = i + 1; j < agentPositions.length; j++) {
          const a = agentPositions[i].pos;
          const b = agentPositions[j].pos;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MIN_DIST && dist > 0) {
            const overlap = (MIN_DIST - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
            // Also update the cached anim positions so it persists
            const nameA = agentPositions[i].agentData.name;
            const nameB = agentPositions[j].agentData.name;
            if (agentAnimPos[nameA]) { agentAnimPos[nameA].x = a.x; agentAnimPos[nameA].y = a.y; }
            if (agentAnimPos[nameB]) { agentAnimPos[nameB].x = b.x; agentAnimPos[nameB].y = b.y; }
          }
        }
      }

      // Third pass: draw
      agentPositions.forEach(({ agentData, pos }) => {
        drawAgent(ctx, pos.x, pos.y, agentData.name, agentData, frame);
      });
    }

    // Node connection indicator (drawn on top of everything)
    drawNodeIndicator(ctx, cw, ch, frame, currentNodeConnected);

    animRef.current = requestAnimationFrame(draw);
  }, []); // stable — reads from refs

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : 900;
      // Taller aspect ratio for more room: 0.62 on desktop, 0.75 on mobile
      const ratio = w >= 700 ? 0.62 : 0.75;
      const h = Math.round(w * ratio);
      canvas.width = Math.max(w, 280);
      canvas.height = Math.max(h, 150);
    };
    resize();

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: 'auto',
        borderRadius: 8,
        border: '1px solid #1a1a2e',
        display: 'block',
      }}
    />
  );
}