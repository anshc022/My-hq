'use client';
import { useEffect, useRef, useCallback } from 'react';
import { AGENTS, ROOMS, DESK_POSITIONS, ROOM_POSITIONS, STATUS_VISUALS, UNIFIED_BOX } from '@/lib/agents';
import { AGENT_FACES } from '@/components/AgentFaces';

// ─── Smooth position interpolation ───
const agentAnimPos = {};
const LERP_SPEED = 0.008;

// ─── Wander system ───
const wanderTargets = {};
const wanderCooldown = {};
const WANDER_LERP = 0.002;
const WANDER_ARRIVE_DIST = 0.02;

const AGENT_SPEED_MULT = {
  echo: 1.0, flare: 0.9, bolt: 1.05,
  nexus: 0.95, vigil: 0.95, forge: 0.85,
};

// ─── Movement detection ───
const agentPrevPos = {};
const agentIsWalking = {};
const WALK_THRESHOLD = 0.3;

// Echo's Den
const ECHO_DEN = { x: 0.80, y: 0.06, w: 0.16, h: 0.20, cx: 0.88, cy: 0.16 };

// Wander zones
const WANDER_ZONES = [
  { x: 0.04, y: 0.06, w: 0.53, h: 0.40 },
  { x: 0.61, y: 0.06, w: 0.18, h: 0.40 },
  { x: 0.61, y: 0.27, w: 0.35, h: 0.19 },
  { x: 0.04, y: 0.53, w: 0.53, h: 0.40 },
  { x: 0.61, y: 0.53, w: 0.35, h: 0.40 },
];

const AGENT_PREFERRED_ZONES = {
  echo:  [0, 1],
  flare: [0, 4],
  bolt:  [0, 3],
  nexus: [3, 0],
  vigil: [3, 4],
  forge: [4, 2],
};

function pickWanderTarget(name) {
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
  wanderCooldown[name] = 300 + Math.floor(Math.random() * 500);
  pickIdleActivity(name);
}

// ─── Idle activities ───
const IDLE_ACTIVITIES = [
  { emoji: '📱', label: 'browsing memes' },
  { emoji: '☕', label: 'coffee break' },
  { emoji: '😴', label: 'power nap' },
  { emoji: '🎵', label: 'humming' },
  { emoji: '🎮', label: 'gaming' },
  { emoji: '📖', label: 'reading docs' },
  { emoji: '🍕', label: 'snacking' },
  { emoji: '🎧', label: 'vibing' },
  { emoji: '💬', label: 'chatting' },
  { emoji: '🧘', label: 'meditating' },
  { emoji: '✏️', label: 'doodling' },
  { emoji: '😎', label: 'chilling' },
  { emoji: '🐱', label: 'cat videos' },
  { emoji: '💤', label: 'resting' },
  { emoji: '🫖', label: 'tea time' },
  { emoji: '🖥️', label: 'scrolling' },
  { emoji: '🎲', label: 'playing dice' },
  { emoji: '🏓', label: 'ping pong' },
  { emoji: '🤖', label: 'debugging life' },
  { emoji: '🧩', label: 'puzzles' },
];

const agentIdleActivity = {};

function pickIdleActivity(name) {
  agentIdleActivity[name] = IDLE_ACTIVITIES[Math.floor(Math.random() * IDLE_ACTIVITIES.length)];
}

function lerp(a, b, t) { return a + (b - a) * t; }

function isAgentBusy(agentData) {
  if (!agentData) return false;
  const s = (agentData.status || '').toLowerCase();
  return s === 'working' || s === 'thinking' || s === 'talking' ||
         s === 'posting' || s === 'researching';
}

function getTargetPos(name, agentData, cw, ch) {
  const status = (agentData?.status || '').toLowerCase();
  const isBusy = isAgentBusy(agentData);
  const room = (agentData?.current_room || 'desk').toLowerCase();

  if (name === 'echo' && isBusy) {
    delete wanderCooldown[name];
    delete agentIdleActivity[name];
    // Echo goes to warroom or specified room when busy
    const rp = ROOM_POSITIONS[room];
    if (rp) return { x: rp.x * cw, y: rp.y * ch };
    return { x: ECHO_DEN.cx * cw, y: ECHO_DEN.cy * ch };
  }

  if (isBusy) {
    delete wanderCooldown[name];
    delete agentIdleActivity[name];
    // Move agent to their assigned room
    const rp = ROOM_POSITIONS[room];
    if (rp) return { x: rp.x * cw, y: rp.y * ch };
    // If room is 'desk' or 'workspace' or 'forge', use desk positions
    const dp = DESK_POSITIONS[name];
    return dp ? { x: dp.x * cw, y: dp.y * ch } : { x: cw * 0.5, y: ch * 0.5 };
  }

  if (!wanderTargets[name]) pickWanderTarget(name);

  const wt = wanderTargets[name];
  const cur = agentAnimPos[name];
  if (cur) {
    const dx = (cur.x / cw) - wt.x;
    const dy = (cur.y / ch) - wt.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < WANDER_ARRIVE_DIST) {
      if (!wanderCooldown[name]) wanderCooldown[name] = 0;
      wanderCooldown[name]--;
      if (wanderCooldown[name] <= 0) pickWanderTarget(name);
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
  const prev = agentPrevPos[name] || { x: cur.x, y: cur.y };
  cur.x = lerp(cur.x, target.x, speed);
  cur.y = lerp(cur.y, target.y, speed);
  const dx = cur.x - prev.x;
  const dy = cur.y - prev.y;
  agentIsWalking[name] = Math.sqrt(dx * dx + dy * dy) > WALK_THRESHOLD;
  agentPrevPos[name] = { x: cur.x, y: cur.y };
  return { x: cur.x, y: cur.y };
}

// ─── Per-agent pixel art — V2 team ───
const PIXEL_LOOKS = {
  echo: {
    skin: '#FFD5A0', hair: '#2244AA', hairStyle: 'spiky',
    shirt: '#4A90D9', pants: '#2a4a7a', accessory: 'headset',
  },
  flare: {
    skin: '#FFDBB4', hair: '#FF6B9D', hairStyle: 'long',
    shirt: '#FF6B9D', pants: '#8a3a5a', accessory: 'pen',
  },
  bolt: {
    skin: '#FFE0BD', hair: '#F7DC6F', hairStyle: 'mohawk',
    shirt: '#F7DC6F', pants: '#8a7a20', accessory: 'glasses',
  },
  nexus: {
    skin: '#C68642', hair: '#1a1a1a', hairStyle: 'cap',
    shirt: '#2ECC71', pants: '#1a5a30', accessory: 'headset',
  },
  vigil: {
    skin: '#D4A06A', hair: '#E74C3C', hairStyle: 'short',
    shirt: '#E74C3C', pants: '#801a1a', accessory: 'shield',
  },
  forge: {
    skin: '#FFD5A0', hair: '#E67E22', hairStyle: 'bald',
    shirt: '#E67E22', pants: '#7a4a10', accessory: 'wrench',
  },
};

let P = 3;
function px(ctx, bx, by, col, pw, ph) {
  ctx.fillStyle = col;
  ctx.fillRect(bx, by, (pw || 1) * P, (ph || 1) * P);
}

function drawPixelAgent(ctx, x, y, name, frame, status) {
  const look = PIXEL_LOOKS[name];
  if (!look) return;
  const ox = x - 7 * P;
  const oy = y - 20 * P;

  // Legs
  const walking = agentIsWalking[name];
  if (walking) {
    const stride = Math.sin(frame * 0.18) * 2.5 * P;
    px(ctx, ox + 4 * P, oy + 17 * P, look.pants, 2, 2);
    ctx.fillStyle = look.pants;
    ctx.fillRect(ox + 4 * P, oy + 19 * P + stride, 2 * P, 1 * P);
    px(ctx, ox + 8 * P, oy + 17 * P, look.pants, 2, 2);
    ctx.fillStyle = look.pants;
    ctx.fillRect(ox + 8 * P, oy + 19 * P - stride, 2 * P, 1 * P);
    ctx.fillStyle = '#333';
    ctx.fillRect(ox + 3 * P, oy + 20 * P + stride, 3 * P, 1 * P);
    ctx.fillRect(ox + 8 * P, oy + 20 * P - stride, 3 * P, 1 * P);
  } else {
    px(ctx, ox + 4 * P, oy + 17 * P, look.pants, 2, 3);
    px(ctx, ox + 8 * P, oy + 17 * P, look.pants, 2, 3);
    px(ctx, ox + 3 * P, oy + 20 * P, '#333', 3, 1);
    px(ctx, ox + 8 * P, oy + 20 * P, '#333', 3, 1);
  }

  // Body
  px(ctx, ox + 3 * P, oy + 11 * P, look.shirt, 8, 6);
  px(ctx, ox + 4 * P, oy + 12 * P, lighten(look.shirt, 25), 2, 2);

  // Arms
  px(ctx, ox + 1 * P, oy + 12 * P, look.shirt, 2, 4);
  px(ctx, ox + 11 * P, oy + 12 * P, look.shirt, 2, 4);
  px(ctx, ox + 1 * P, oy + 16 * P, look.skin, 2, 1);
  px(ctx, ox + 11 * P, oy + 16 * P, look.skin, 2, 1);

  // Head
  px(ctx, ox + 3 * P, oy + 3 * P, look.skin, 8, 8);

  // Eyes
  const blink = Math.floor(frame * 0.03) % 60 === 0;
  const eyeH = (blink || status === 'sleeping') ? 1 : 2;
  px(ctx, ox + 5 * P, oy + 6 * P, '#fff', 2, eyeH);
  px(ctx, ox + 8 * P, oy + 6 * P, '#fff', 2, eyeH);
  if (!blink && status !== 'sleeping') {
    px(ctx, ox + 5 * P, oy + 7 * P, '#111', 1, 1);
    px(ctx, ox + 9 * P, oy + 7 * P, '#111', 1, 1);
  }

  // Mouth
  if (status === 'talking') {
    const mouthOpen = Math.floor(frame * 0.1) % 2;
    px(ctx, ox + 6 * P, oy + 9 * P, mouthOpen ? '#c0392b' : '#e74c3c', 2, mouthOpen ? 2 : 1);
  } else {
    px(ctx, ox + 6 * P, oy + 9 * P, '#c0392b', 2, 1);
  }

  drawHair(ctx, ox, oy, look);
  drawAccessory(ctx, ox, oy, name, look, frame);
}

function drawHair(ctx, ox, oy, look) {
  switch (look.hairStyle) {
    case 'spiky': // Echo
      px(ctx, ox + 3 * P, oy + 1 * P, look.hair, 8, 3);
      px(ctx, ox + 4 * P, oy + 0 * P, look.hair, 2, 1);
      px(ctx, ox + 7 * P, oy + 0 * P, look.hair, 2, 1);
      px(ctx, ox + 5 * P, oy - 1 * P, look.hair, 1, 1);
      px(ctx, ox + 9 * P, oy - 1 * P, look.hair, 1, 1);
      break;
    case 'long': // Flare — long pink flow
      px(ctx, ox + 3 * P, oy + 1 * P, look.hair, 8, 3);
      px(ctx, ox + 2 * P, oy + 3 * P, look.hair, 2, 7);
      px(ctx, ox + 10 * P, oy + 3 * P, look.hair, 2, 7);
      px(ctx, ox + 3 * P, oy + 0 * P, look.hair, 8, 1);
      break;
    case 'mohawk': // Bolt — yellow mohawk
      px(ctx, ox + 5 * P, oy + 0 * P, look.hair, 4, 4);
      px(ctx, ox + 6 * P, oy - 1 * P, look.hair, 2, 1);
      px(ctx, ox + 6 * P, oy - 2 * P, lighten(look.hair, 30), 2, 1);
      break;
    case 'cap': // Nexus — dark cap
      px(ctx, ox + 2 * P, oy + 2 * P, '#2c3e50', 10, 2);
      px(ctx, ox + 1 * P, oy + 4 * P, '#2c3e50', 4, 1);
      px(ctx, ox + 3 * P, oy + 1 * P, '#34495e', 8, 1);
      break;
    case 'short': // Vigil — short red
      px(ctx, ox + 3 * P, oy + 1 * P, look.hair, 8, 3);
      px(ctx, ox + 2 * P, oy + 2 * P, look.hair, 1, 2);
      px(ctx, ox + 11 * P, oy + 2 * P, look.hair, 1, 2);
      break;
    case 'bald': // Forge — bald with shine
      px(ctx, ox + 3 * P, oy + 2 * P, look.skin, 8, 2);
      px(ctx, ox + 5 * P, oy + 2 * P, lighten(look.skin, 40), 2, 1);
      break;
  }
}

function drawAccessory(ctx, ox, oy, name, look, frame) {
  switch (look.accessory) {
    case 'headset': // Echo + Nexus
      px(ctx, ox + 1 * P, oy + 5 * P, name === 'echo' ? '#3a7bd5' : '#27ae60', 2, 3);
      px(ctx, ox + 2 * P, oy + 2 * P, name === 'echo' ? '#3a7bd5' : '#27ae60', 1, 3);
      px(ctx, ox + 11 * P, oy + 2 * P, name === 'echo' ? '#3a7bd5' : '#27ae60', 1, 3);
      break;
    case 'pen': // Flare — design pen
      ctx.save();
      ctx.translate(ox + 12 * P, oy + 14 * P);
      ctx.rotate(0.3);
      px(ctx, 0, 0, '#ddd', 1, 4);
      px(ctx, 0, 4 * P, '#FF6B9D', 1, 1);
      ctx.restore();
      break;
    case 'glasses': // Bolt — coding glasses
      ctx.strokeStyle = '#FFD700';
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
    case 'shield': // Vigil — shield on arm
      px(ctx, ox + 0 * P, oy + 13 * P, '#c0392b', 2, 2);
      px(ctx, ox + 0 * P, oy + 15 * P, '#e74c3c', 1, 1);
      px(ctx, ox + 1 * P, oy + 12 * P, '#f1c40f', 1, 1);
      break;
    case 'wrench': // Forge — wrench in hand
      ctx.save();
      ctx.translate(ox + 12 * P, oy + 13 * P);
      ctx.rotate(-0.4);
      px(ctx, 0, 0, '#888', 1, 5);
      px(ctx, -P, 0, '#aaa', 3, 1);
      ctx.restore();
      break;
  }
}

// ─── Draw agent with sprite + effects ───
function drawAgent(ctx, x, y, name, agentData, frame) {
  const config = AGENTS[name];
  if (!config) return;
  const status = agentData?.status || 'idle';
  const vis = STATUS_VISUALS[status] || STATUS_VISUALS.idle;
  const SPRITE_H = 20 * P;
  const S = P / 3;

  const bob = status === 'sleeping' ? 0 : Math.sin(frame * 0.03) * 1.5 * S;
  const ay = y + bob;

  // Glow — minimal flat indicator instead of blur
  const pulse = 0.6 + Math.sin(frame * 0.06) * 0.4;
  ctx.save();
  ctx.globalAlpha = status === 'idle' ? 0.08 : 0.15;
  ctx.fillStyle = vis.glow;
  ctx.fillRect(x - 14 * S, ay - 2, 28 * S, SPRITE_H + 4);
  ctx.restore();

  drawPixelAgent(ctx, x, ay + SPRITE_H / 2 - 2, name, frame, status);

  // Shadow — simple flat
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#000';
  ctx.fillRect(x - 10 * S, ay + SPRITE_H / 2 + 1, 20 * S, 3 * S);
  ctx.restore();

  // Status dot — square
  const dotR = 3 * S;
  ctx.fillStyle = vis.glow;
  ctx.fillRect(x + 8 * S, ay + SPRITE_H / 2 - 5 * S, dotR * 2, dotR * 2);
  ctx.strokeStyle = '#0a0a0a';
  ctx.lineWidth = 1 * S;
  ctx.strokeRect(x + 8 * S, ay + SPRITE_H / 2 - 5 * S, dotR * 2, dotR * 2);

  // Name pill — square neo-brutal
  const label = config.label;
  const nameFs = Math.max(7, Math.round(10 * S));
  ctx.font = `900 ${nameFs}px monospace`;
  const lw = ctx.measureText(label).width;
  const pillW = lw + 10 * S;
  const pillH = Math.round(14 * S);
  const pillX = x - pillW / 2;
  const pillY = ay + SPRITE_H / 2 + 4 * S;

  // Hard offset shadow
  ctx.fillStyle = config.color;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(pillX + 2, pillY + 2, pillW, pillH);
  ctx.globalAlpha = 1;

  // Pill bg
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(pillX, pillY, pillW, pillH);
  ctx.strokeStyle = config.color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pillX, pillY, pillW, pillH);

  ctx.fillStyle = config.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, pillY + pillH / 2);

  // "Replying to you" for Echo
  if (name === 'echo' && isAgentBusy(agentData)) {
    const rFs = Math.max(5, Math.round(7 * S));
    ctx.font = `${rFs}px monospace`;
    const rLabel = '-> replying to you';
    const rw2 = ctx.measureText(rLabel).width;
    const rPillW = rw2 + 6 * S;
    const rPillH = Math.round(10 * S);
    const rPillX = x - rPillW / 2;
    const rPillY = pillY + pillH + 2 * S;
    ctx.fillStyle = 'rgba(74, 144, 217, 0.15)';
    ctx.globalAlpha = 0.9;
    ctx.fillRect(rPillX, rPillY, rPillW, rPillH);
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 1;
    ctx.strokeRect(rPillX, rPillY, rPillW, rPillH);
    ctx.fillStyle = '#7cb8f0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(rLabel, x, rPillY + rPillH / 2);
    ctx.globalAlpha = 1;
  }

  // Speech bubble
  if (agentData?.current_task && status !== 'idle' && status !== 'sleeping') {
    drawBubble(ctx, x, ay - SPRITE_H / 2 - 8 * S, agentData.current_task, config.color, S);

    if (status === 'talking') {
      const dotY = ay - SPRITE_H / 2 - 4 * S;
      for (let d = 0; d < 3; d++) {
        const bounce = Math.sin(frame * 0.12 + d * 1.2) * 2 * S;
        ctx.globalAlpha = 0.5 + Math.sin(frame * 0.1 + d * 0.8) * 0.4;
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(x - 8 * S + d * 6 * S, dotY + bounce, 1.8 * S, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  // Pulsing status dot
  if (isAgentBusy(agentData)) {
    const dotR2 = 3 * S;
    const dotX = pillX + pillW + 3 * S;
    const dotY2 = pillY + pillH / 2;
    const pulse2 = 0.6 + Math.sin(frame * 0.1) * 0.4;

    ctx.globalAlpha = pulse2 * 0.3;
    const dotColor = status === 'talking' ? '#2ecc71' : status === 'working' ? '#f39c12' : status === 'researching' ? '#9b59b6' : '#3498db';
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(dotX, dotY2, dotR2 * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = pulse2;
    ctx.beginPath();
    ctx.arc(dotX, dotY2, dotR2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const actionLabel = status === 'talking' ? 'responding' :
                        status === 'working' ? 'working' :
                        status === 'thinking' ? 'thinking' :
                        status === 'researching' ? 'researching' :
                        status === 'posting' ? 'posting' : 'active';
    const aFs = Math.max(5, Math.round(6 * S));
    ctx.font = `${aFs}px monospace`;
    const aLabelW = ctx.measureText(actionLabel).width;
    const aPillW = aLabelW + 6 * S;
    const aPillH = Math.round(9 * S);
    const aPillX = x - aPillW / 2;
    const aPillY = pillY + pillH + (name === 'echo' && isAgentBusy(agentData) ? 14 * S : 2 * S);
    ctx.fillStyle = dotColor + '25';
    ctx.globalAlpha = 0.9;
    ctx.fillRect(aPillX, aPillY, aPillW, aPillH);
    ctx.strokeStyle = dotColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(aPillX, aPillY, aPillW, aPillH);
    ctx.fillStyle = dotColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(actionLabel, x, aPillY + aPillH / 2);
    ctx.globalAlpha = 1;
  }

  // Status effects
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
    for (let i = 0; i < 3; i++) {
      const p = (frame * 0.08 + i * 0.7) % 3;
      ctx.globalAlpha = p < 1 ? p : p < 2 ? 1 : 3 - p;
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(x + 16 * S + i * 6 * S, ay - 5 * S, 2.5 * S, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (name !== 'echo') {
      const sFs = Math.max(5, Math.round(6 * S));
      ctx.font = `${sFs}px monospace`;
      const sLabel = 'delegated';
      const sw2 = ctx.measureText(sLabel).width;
      const sPillW = sw2 + 6 * S;
      const sPillH = Math.round(9 * S);
      const sPillX = x - sPillW / 2;
      const sPillY = ay + 38 * S;
      ctx.fillStyle = 'rgba(241, 196, 15, 0.15)';
      ctx.globalAlpha = 0.85;
      ctx.fillRect(sPillX, sPillY, sPillW, sPillH);
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 1;
      ctx.strokeRect(sPillX, sPillY, sPillW, sPillH);
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

  // Idle activity bubble
  if (!isAgentBusy(agentData) && status !== 'sleeping') {
    const act = agentIdleActivity[name];
    if (act) {
      const bubbleY = ay - SPRITE_H / 2 - 10 * S;
      const bubbleX = x;
      const floatOff = Math.sin(frame * 0.04 + x * 0.1) * 2 * S;
      const emojiSize = Math.round(11 * S);
      ctx.save();
      const lblFs = Math.max(5, Math.round(7 * S));
      ctx.font = `${lblFs}px monospace`;
      const labelW = ctx.measureText(act.label).width;
      const bgW = Math.max(labelW + 8 * S, emojiSize + 10 * S);
      const bgH = Math.round(22 * S);
      const bgX = bubbleX - bgW / 2;
      const bgY = bubbleY - bgH + floatOff;

      ctx.fillStyle = '#0a0a0a';
      ctx.globalAlpha = 0.9;
      ctx.fillRect(bgX, bgY, bgW, bgH);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bgX, bgY, bgW, bgH);
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#0a0a0a';
      ctx.beginPath();
      ctx.moveTo(bubbleX - 2 * S, bgY + bgH);
      ctx.lineTo(bubbleX + 2 * S, bgY + bgH);
      ctx.lineTo(bubbleX, bgY + bgH + 3 * S);
      ctx.fill();

      const emojiPulse = 1 + Math.sin(frame * 0.06) * 0.08;
      ctx.font = `${Math.round(emojiSize * emojiPulse)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(act.emoji, bubbleX, bgY + 8 * S + floatOff * 0.2);

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
  let t = (text || '').replace(/^Responding:\s*"?/i, '').replace(/"$/, '');

  const maxCharsPerLine = 35;
  const words = t.split(' ');
  const lines = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    }
  }
  if (currentLine) lines.push(currentLine.trim());
  if (lines.length > 3) {
    lines.length = 3;
    lines[2] = lines[2].slice(0, maxCharsPerLine - 3) + '...';
  }
  if (lines.length === 0) return;

  const fs = Math.max(6, Math.round(9 * S));
  ctx.font = `bold ${fs}px monospace`;

  let maxW = 0;
  for (const line of lines) {
    const w = ctx.measureText(line).width;
    if (w > maxW) maxW = w;
  }

  const pad = 8 * S;
  const lineH = Math.round(13 * S);
  const bw = maxW + pad * 2;
  const bh = lineH * lines.length + pad;
  const bx = x - bw / 2;
  const by = y - bh;

  // Hard offset shadow
  ctx.fillStyle = borderColor;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(bx + 3, by + 3, bw, bh);
  ctx.globalAlpha = 1;

  // Bubble bg — flat, square
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2 * S;
  ctx.strokeRect(bx, by, bw, bh);

  // Pointer — triangle
  ctx.beginPath();
  ctx.moveTo(x - 4 * S, by + bh);
  ctx.lineTo(x, by + bh + 5 * S);
  ctx.lineTo(x + 4 * S, by + bh);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 2 * S;
  ctx.stroke();
  // Cover the top edge of triangle
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(x - 4 * S, by + bh - 1, 8 * S, 2);

  ctx.fillStyle = '#e8e8f0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, by + pad / 2 + lineH * i + lineH / 2);
  }
}

// ─── Connection lines ───
function drawConnections(ctx, agents, cw, ch, frame) {
  if (!agents || agents.length < 2) return;
  const active = agents.filter(a =>
    (a.status === 'talking' || a.status === 'working' || a.status === 'researching' || a.status === 'thinking')
    && a.name !== 'forge'
  );
  if (active.length < 2) return;

  ctx.save();

  const hub = active[0];
  const hubPos = getSmoothedPos(hub.name, hub, cw, ch);

  // Draw glow layer first (thick, low alpha)
  for (let i = 1; i < active.length; i++) {
    const other = active[i];
    const op = getSmoothedPos(other.name, other, cw, ch);
    ctx.strokeStyle = 'rgba(124, 77, 255, 0.15)';
    ctx.lineWidth = 6;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(hubPos.x, hubPos.y);
    ctx.lineTo(op.x, op.y);
    ctx.stroke();
  }

  // Main connection lines — bright & thick
  ctx.strokeStyle = 'rgba(160, 130, 255, 0.8)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.lineDashOffset = -frame * 0.8;

  for (let i = 1; i < active.length; i++) {
    const other = active[i];
    const op = getSmoothedPos(other.name, other, cw, ch);

    ctx.beginPath();
    ctx.moveTo(hubPos.x, hubPos.y);
    ctx.lineTo(op.x, op.y);
    ctx.stroke();

    // Traveling dot — bigger and brighter
    const t = (frame * 0.002) % 1;
    const dotX = hubPos.x + (op.x - hubPos.x) * t;
    const dotY = hubPos.y + (op.y - hubPos.y) * t;
    ctx.setLineDash([]);
    ctx.fillStyle = '#b388ff';
    ctx.shadowColor = '#7c4dff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.setLineDash([6, 4]);
    ctx.lineDashOffset = -frame * 0.8;
  }

  // Secondary connections between other active agents
  if (active.length >= 3) {
    ctx.strokeStyle = 'rgba(140, 110, 220, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = 1; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = getSmoothedPos(active[i].name, active[i], cw, ch);
        const b = getSmoothedPos(active[j].name, active[j], cw, ch);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

// ─── Room drawing ───
function drawRooms(ctx, cw, ch, frame) {
  const bx = UNIFIED_BOX.x * cw + 2, by = UNIFIED_BOX.y * ch + 2;
  const bw = UNIFIED_BOX.w * cw - 4, bh = UNIFIED_BOX.h * ch - 4;
  const divX = UNIFIED_BOX.dividerX * cw;
  const divY = UNIFIED_BOX.dividerY * ch;

  // Background — dark with subtle purple tint
  ctx.fillStyle = '#0c0c14';
  ctx.fillRect(bx, by, bw, bh);

  // Floor grid — visible cross-hatch pattern (like reference)
  ctx.strokeStyle = 'rgba(100, 80, 160, 0.06)';
  ctx.lineWidth = 0.5;
  for (let gx = bx; gx < bx + bw; gx += 28) {
    ctx.beginPath();
    ctx.moveTo(gx, by);
    ctx.lineTo(gx, by + bh);
    ctx.stroke();
  }
  for (let gy = by; gy < by + bh; gy += 28) {
    ctx.beginPath();
    ctx.moveTo(bx, gy);
    ctx.lineTo(bx + bw, gy);
    ctx.stroke();
  }
  // Subtle dot overlay on grid intersections
  ctx.fillStyle = 'rgba(140, 120, 200, 0.08)';
  for (let gx = bx; gx < bx + bw; gx += 28) {
    for (let gy = by; gy < by + bh; gy += 28) {
      ctx.fillRect(gx - 0.5, gy - 0.5, 1.5, 1.5);
    }
  }

  // Room background fills — subtle color tinting per room
  const roomBgColors = {
    workspace: 'rgba(74, 106, 255, 0.03)',
    warroom:   'rgba(255, 145, 0, 0.03)',
    lab:       'rgba(0, 230, 118, 0.03)',
    forge:     'rgba(230, 126, 34, 0.03)',
  };
  // Top-left
  ctx.fillStyle = roomBgColors.workspace;
  ctx.fillRect(bx, by, divX - bx, divY - by);
  // Top-right
  ctx.fillStyle = roomBgColors.warroom;
  ctx.fillRect(divX, by, bx + bw - divX, divY - by);
  // Bottom-left
  ctx.fillStyle = roomBgColors.lab;
  ctx.fillRect(bx, divY, divX - bx, by + bh - divY);
  // Bottom-right
  ctx.fillStyle = roomBgColors.forge;
  ctx.fillRect(divX, divY, bx + bw - divX, by + bh - divY);

  // Outer border — clean solid
  ctx.strokeStyle = 'rgba(140, 120, 200, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);

  // Vertical divider — solid clean line
  ctx.strokeStyle = 'rgba(140, 120, 200, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(divX, by + 1);
  ctx.lineTo(divX, by + bh - 1);
  ctx.stroke();

  // Horizontal divider — solid clean line
  ctx.beginPath();
  ctx.moveTo(bx + 1, divY);
  ctx.lineTo(bx + bw - 1, divY);
  ctx.stroke();

  // Corner accents — small bright corners
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  const cLen = 12;
  ctx.beginPath(); ctx.moveTo(bx + cLen, by); ctx.lineTo(bx, by); ctx.lineTo(bx, by + cLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + bw - cLen, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + cLen, by + bh); ctx.lineTo(bx, by + bh); ctx.lineTo(bx, by + bh - cLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + bw - cLen, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cLen); ctx.stroke();
  ctx.globalAlpha = 1;

  // Echo's Den — clean box
  const denX = ECHO_DEN.x * cw, denY2 = ECHO_DEN.y * ch;
  const denW = ECHO_DEN.w * cw, denH = ECHO_DEN.h * ch;
  ctx.fillStyle = 'rgba(74, 144, 217, 0.05)';
  ctx.fillRect(denX, denY2, denW, denH);
  ctx.strokeStyle = 'rgba(74, 144, 217, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(denX, denY2, denW, denH);
  ctx.font = '9px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('🧠', denX + 4, denY2 + 3);
  ctx.font = 'bold 7px monospace';
  ctx.fillStyle = '#4A90D9';
  ctx.globalAlpha = 0.7;
  ctx.fillText("ECHO'S DEN", denX + 16, denY2 + 5);
  ctx.globalAlpha = 1;

  // Monitor in den
  const mdx = ECHO_DEN.cx * cw + 8, mdy = ECHO_DEN.cy * ch - 8;
  ctx.fillStyle = '#0d0d18';
  ctx.fillRect(mdx - 6, mdy - 8, 12, 10);
  ctx.strokeStyle = 'rgba(74, 144, 217, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(mdx - 6, mdy - 8, 12, 10);
  ctx.fillStyle = 'rgba(74, 144, 217, 0.2)';
  ctx.fillRect(mdx - 4, mdy - 6, 8, 6);
  ctx.fillStyle = '#1a1a28';
  ctx.fillRect(mdx - 1, mdy + 2, 2, 3);

  // Room labels — clean badge style
  const labels = [
    { icon: '💻', text: 'DEV FLOOR',   color: '#4fc3f7', lx: bx + 8,   ly: by + 8 },
    { icon: '🎯', text: 'WAR ROOM',    color: '#ff9100', lx: divX + 8, ly: by + 8 },
    { icon: '🧪', text: 'CODE LAB',    color: '#00e676', lx: bx + 8,   ly: divY + 6 },
    { icon: '🔥', text: 'DEPLOY BAY',  color: '#ff9100', lx: divX + 8, ly: divY + 6 },
  ];
  labels.forEach(l => {
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(l.icon, l.lx, l.ly);
    // Clean label
    ctx.font = 'bold 8px monospace';
    const tw = ctx.measureText(l.text).width;
    // Background pill
    ctx.fillStyle = l.color;
    ctx.globalAlpha = 0.08;
    ctx.fillRect(l.lx + 14, l.ly - 1, tw + 8, 14);
    ctx.globalAlpha = 1;
    ctx.fillStyle = l.color;
    ctx.globalAlpha = 0.8;
    ctx.fillText(l.text, l.lx + 18, l.ly + 2);
    ctx.globalAlpha = 1;
  });

  // Room interiors
  Object.entries(ROOMS).forEach(([key, room]) => {
    const rx = room.x * cw + 4, ry = room.y * ch + 22;
    const rw = room.w * cw - 8, rh = room.h * ch - 30;
    drawRoomInterior(ctx, key, rx, ry, rw, rh, cw, ch, frame);
  });
}

function drawRoomInterior(ctx, roomKey, rx, ry, rw, rh, cw, ch, frame) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(rx, ry, rw, rh);
  ctx.clip();

  if (roomKey === 'workspace') {
    // Ambient ceiling lights — subtle glows
    for (let i = 0; i < 3; i++) {
      const lx = rx + rw * (0.18 + i * 0.30);
      const ly = ry + 2;
      ctx.fillStyle = `rgba(74, 106, 255, ${0.04 + Math.sin(frame * 0.015 + i) * 0.02})`;
      ctx.fillRect(lx - 24, ly, 48, 2);
    }

    // Whiteboard on wall
    const wbx = rx + 6, wby = ry + rh * 0.30;
    ctx.fillStyle = 'rgba(200, 200, 220, 0.04)';
    ctx.fillRect(wbx, wby, 6, rh * 0.35);
    ctx.strokeStyle = 'rgba(140, 120, 200, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(wbx, wby, 6, rh * 0.35);
    // Sticky notes
    const stickyCs = ['#4a6aff', '#FF6B9D', '#F7DC6F', '#2ECC71'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = stickyCs[i];
      ctx.globalAlpha = 0.1;
      ctx.fillRect(wbx + 1, wby + 3 + i * (rh * 0.08), 4, rh * 0.06);
    }
    ctx.globalAlpha = 1;
  }

  if (roomKey === 'warroom') {
    // Strategy table — clean
    const ccx = rx + rw * 0.5, ccy = ry + rh * 0.4;
    ctx.fillStyle = 'rgba(60, 40, 25, 0.25)';
    ctx.fillRect(ccx - 24, ccy, 48, 12);
    ctx.strokeStyle = 'rgba(200, 150, 80, 0.1)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(ccx - 24, ccy, 48, 12);

    // Fireplace — subtle warm glow
    const fx = rx + rw * 0.5, fy = ry + rh * 0.78;
    ctx.fillStyle = 'rgba(50, 25, 12, 0.3)';
    ctx.fillRect(fx - 16, fy - 4, 32, 12);
    for (let i = 0; i < 4; i++) {
      const fh = 4 + Math.sin(frame * 0.08 + i * 2.3) * 2;
      const fireColors = ['#ff6b35', '#ff9500', '#ffcc00', '#ff4500'];
      ctx.fillStyle = fireColors[i];
      ctx.globalAlpha = 0.15 + Math.sin(frame * 0.1 + i) * 0.05;
      ctx.beginPath();
      ctx.ellipse(fx - 5 + i * 3.5, fy - fh * 0.4, 2, fh * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Warm ambient glow
    const fireGlow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 40);
    fireGlow.addColorStop(0, `rgba(255,130,40,${0.03 + Math.sin(frame * 0.03) * 0.01})`);
    fireGlow.addColorStop(1, 'rgba(255,100,30,0)');
    ctx.fillStyle = fireGlow;
    ctx.fillRect(rx, ry, rw, rh);
  }

  if (roomKey === 'lab') {
    // Terminal screens — green themed
    for (let i = 0; i < 2; i++) {
      const tx = rx + 8, ty = ry + 8 + i * (rh * 0.38);
      ctx.fillStyle = 'rgba(5, 12, 8, 0.4)';
      ctx.fillRect(tx, ty, 20, rh * 0.26);
      ctx.strokeStyle = 'rgba(46, 204, 113, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(tx, ty, 20, rh * 0.26);
      for (let ln = 0; ln < 4; ln++) {
        const lw = 6 + Math.random() * 10;
        ctx.fillStyle = '#2ecc71';
        ctx.globalAlpha = 0.12 + Math.sin(frame * 0.02 + ln + i * 3) * 0.04;
        ctx.fillRect(tx + 2, ty + 3 + ln * (rh * 0.055), lw, 1.5);
      }
      ctx.globalAlpha = 1;
      // Cursor blink
      if (Math.floor(frame * 0.03) % 2 === i) {
        ctx.fillStyle = '#2ecc71';
        ctx.globalAlpha = 0.35;
        ctx.fillRect(tx + 2, ty + 3 + 4 * (rh * 0.055), 3, 1.5);
        ctx.globalAlpha = 1;
      }
    }

    // Server rack
    const srx = rx + rw - 16, sry = ry + 6;
    ctx.fillStyle = 'rgba(15, 25, 20, 0.3)';
    ctx.fillRect(srx, sry, 12, rh * 0.65);
    ctx.strokeStyle = 'rgba(46, 204, 113, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(srx, sry, 12, rh * 0.65);
    for (let si = 0; si < 5; si++) {
      const ledOn = Math.sin(frame * 0.05 + si * 1.2) > 0;
      ctx.fillStyle = ledOn ? '#2ecc71' : '#222';
      ctx.globalAlpha = ledOn ? 0.4 : 0.1;
      ctx.beginPath(); ctx.arc(srx + 4, sry + 6 + si * (rh * 0.11), 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (roomKey === 'forge') {
    // Deploy bay with pipeline monitor
    const mox = rx + rw * 0.5, moy = ry + rh * 0.35;
    ctx.fillStyle = 'rgba(12, 8, 4, 0.4)';
    ctx.fillRect(mox - 26, moy - 12, 52, 24);
    ctx.strokeStyle = 'rgba(230, 126, 34, 0.12)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(mox - 26, moy - 12, 52, 24);

    // Pipeline stages
    const stages = ['BUILD', 'TEST', 'DEPLOY'];
    for (let si = 0; si < 3; si++) {
      const sx = mox - 18 + si * 16;
      const active = ((frame * 0.02) % 3) > si;
      ctx.fillStyle = active ? '#E67E22' : '#222';
      ctx.globalAlpha = active ? 0.4 : 0.1;
      ctx.beginPath();
      ctx.arc(sx, moy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      if (si < 2) {
        ctx.strokeStyle = active ? '#E67E22' : '#222';
        ctx.globalAlpha = active ? 0.25 : 0.08;
        ctx.beginPath();
        ctx.moveTo(sx + 3, moy);
        ctx.lineTo(sx + 13, moy);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // Deploy bay label
    ctx.font = 'bold 6px monospace';
    ctx.fillStyle = '#E67E22';
    ctx.globalAlpha = 0.3;
    ctx.textAlign = 'center';
    ctx.fillText('CI/CD PIPELINE', mox, moy + 16);
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// ─── Furniture ───
function drawFurniture(ctx, cw, ch, frame) {
  const S = P / 3;
  Object.entries(DESK_POSITIONS).forEach(([name, dp]) => {
    if (name === 'forge') return;
    const dx = dp.x * cw, dy = dp.y * ch;
    const config = AGENTS[name];
    if (!config) return;

    // Desk — clean flat with subtle color
    const dw = 24 * S, dh = 6 * S;
    ctx.fillStyle = '#141420';
    ctx.fillRect(dx - dw, dy + dh, dw * 2, 12 * S);
    ctx.strokeStyle = 'rgba(140, 120, 200, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(dx - dw, dy + dh, dw * 2, 12 * S);

    // Desk legs — subtle
    ctx.fillStyle = '#0f0f18';
    ctx.fillRect(dx - 20 * S, dy + 18 * S, 3 * S, 6 * S);
    ctx.fillRect(dx + 17 * S, dy + 18 * S, 3 * S, 6 * S);

    // Monitor — cleaner with rounded feel
    const mw = 16 * S, mh = 24 * S;
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(dx - mw, dy - mh, mw * 2, mh);
    ctx.strokeStyle = config.color;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(dx - mw, dy - mh, mw * 2, mh);
    ctx.globalAlpha = 1;

    // Screen content area
    const sx = dx - 13 * S, sy = dy - 21 * S, sw = 26 * S, sh = 17 * S;
    ctx.fillStyle = '#06060e';
    ctx.fillRect(sx, sy, sw, sh);

    // Code lines on screen — colored per agent
    const codeColors = [config.color, '#4fc3f7', '#00e676', '#ff9100', '#7c4dff'];
    for (let li = 0; li < 5; li++) {
      const lw = (6 + (((name.charCodeAt(0) * 7 + li * 13) % 14))) * S;
      const indent = (li === 2 || li === 4) ? 4 * S : 0;
      ctx.fillStyle = codeColors[li % codeColors.length];
      ctx.globalAlpha = 0.3 + Math.sin(frame * 0.02 + li * 0.8) * 0.1;
      ctx.fillRect(sx + 3 * S + indent, sy + 2 * S + li * 3 * S, lw, 1.5 * S);
    }
    ctx.globalAlpha = 1;

    // Cursor blink
    if (Math.sin(frame * 0.08) > 0) {
      ctx.fillStyle = config.color;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(sx + 3 * S + 16 * S, sy + 2 * S + 15 * S, 3 * S, 1.5 * S);
      ctx.globalAlpha = 1;
    }

    // Stand — cleaner
    ctx.fillStyle = '#141420';
    ctx.fillRect(dx - 2 * S, dy, 4 * S, 6 * S);
    ctx.fillRect(dx - 5 * S, dy + 4 * S, 10 * S, 2 * S);

    // Power LED
    ctx.fillStyle = config.color;
    ctx.globalAlpha = 0.5 + Math.sin(frame * 0.04) * 0.2;
    ctx.beginPath();
    ctx.arc(dx + 12 * S, dy - 2 * S, 1.5 * S, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Chair — cleaner
    ctx.fillStyle = '#0f0f18';
    ctx.fillRect(dx - 8 * S, dy + 22 * S, 16 * S, 8 * S);
    ctx.strokeStyle = 'rgba(140, 120, 200, 0.1)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(dx - 8 * S, dy + 22 * S, 16 * S, 8 * S);

    // Name under desk
    const deskLblFs = Math.max(5, Math.round(7 * S));
    ctx.font = `bold ${deskLblFs}px monospace`;
    ctx.fillStyle = config.color;
    ctx.globalAlpha = 0.3;
    ctx.textAlign = 'center';
    ctx.fillText(config.label, dx, dy + 38 * S);
    ctx.globalAlpha = 1;
  });

  // Plants — cleaner
  drawPlant(ctx, 0.60 * cw, 0.15 * ch);
  drawPlant(ctx, 0.60 * cw, 0.88 * ch);
}

function drawPlant(ctx, x, y) {
  // Pot — subtle
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x - 5, y, 10, 8);
  ctx.strokeStyle = 'rgba(140, 120, 200, 0.1)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x - 5, y, 10, 8);
  // Leaves — organic circles
  ctx.fillStyle = '#00e676';
  ctx.globalAlpha = 0.35;
  ctx.beginPath(); ctx.arc(x - 3, y - 4, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 3, y - 6, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - 2, 3, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

// ─── Particles ───
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
    ctx.fillStyle = 'rgba(140, 120, 200, 0.12)';
    ctx.globalAlpha = p.alpha * 0.4;
    ctx.beginPath();
    ctx.arc(p.x * cw, p.y * ch, p.size * 0.8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawWatermark(ctx, cw, ch) {
  ctx.save();
  ctx.font = '900 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(140, 120, 200, 0.02)';
  ctx.fillText('OPS HQ', cw / 2, ch / 2);
  ctx.font = '700 12px monospace';
  ctx.fillStyle = 'rgba(140, 120, 200, 0.025)';
  ctx.fillText('V2 — 6 AGENT DEV TEAM', cw / 2, ch / 2 + 24);
  ctx.restore();
}

// ─── Node indicator ───
function drawNodeIndicator(ctx, cw, ch, frame, connected) {
  const nx = cw * 0.78;
  const ny = ch * 0.88;

  if (connected) {
    const forgePos = agentAnimPos['forge'];
    if (forgePos) {
      ctx.save();
      const ax = forgePos.x;
      const ay2 = forgePos.y;
      const cpx = (nx + ax) / 2 + 20;
      const cpy = (ny + ay2) / 2 - 30;

      // Glow layer
      ctx.setLineDash([]);
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(230,126,34,0.12)';
      ctx.beginPath();
      ctx.moveTo(nx, ny - 10);
      ctx.quadraticCurveTo(cpx, cpy, ax + 14, ay2 + 8);
      ctx.stroke();

      // Main line — bright and thick
      ctx.setLineDash([5, 4]);
      ctx.lineDashOffset = -frame * 0.6;
      ctx.lineWidth = 2.5;
      const lineGrad = ctx.createLinearGradient(nx, ny, ax, ay2);
      lineGrad.addColorStop(0, 'rgba(230,166,80,0.9)');
      lineGrad.addColorStop(1, 'rgba(230,126,34,0.7)');
      ctx.strokeStyle = lineGrad;
      ctx.beginPath();
      ctx.moveTo(nx, ny - 10);
      ctx.quadraticCurveTo(cpx, cpy, ax + 14, ay2 + 8);
      ctx.stroke();

      // Traveling dot — bigger & glowing
      const t = ((frame * 0.002) % 1);
      const dotX = (1 - t) * (1 - t) * nx + 2 * (1 - t) * t * cpx + t * t * (ax + 14);
      const dotY = (1 - t) * (1 - t) * (ny - 10) + 2 * (1 - t) * t * cpy + t * t * (ay2 + 8);
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffaa40';
      ctx.shadowColor = '#E67E22';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // Laptop — clean style
  ctx.fillStyle = connected ? 'rgba(230,126,34,0.06)' : 'rgba(255,80,80,0.04)';
  ctx.fillRect(nx - 28, ny - 16, 56, 32);

  // Laptop base
  ctx.fillStyle = '#141420';
  ctx.fillRect(nx - 22, ny - 2, 44, 6);
  ctx.strokeStyle = connected ? '#E67E22' : '#ff5050';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(nx - 22, ny - 2, 44, 6);

  // Screen
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(nx - 18, ny - 26, 36, 24);
  ctx.strokeStyle = connected ? '#E67E22' : '#ff5050';
  ctx.lineWidth = 2;
  ctx.strokeRect(nx - 18, ny - 26, 36, 24);

  if (connected) {
    ctx.fillStyle = '#0a0f0a';
    ctx.fillRect(nx - 15, ny - 23, 30, 18);

    ctx.fillStyle = '#E67E22';
    ctx.globalAlpha = 0.7;
    for (let li = 0; li < 4; li++) {
      const lw = 8 + ((li * 7 + 3) % 10);
      ctx.fillRect(nx - 12, ny - 21 + li * 4, lw, 2);
    }
    if (Math.sin(frame * 0.1) > 0) {
      ctx.fillRect(nx - 12 + 14, ny - 21 + 12, 3, 2);
    }
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(nx - 15, ny - 23, 30, 18);
    ctx.strokeStyle = '#ff5050';
    ctx.globalAlpha = 0.6;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(nx - 5, ny - 18); ctx.lineTo(nx + 5, ny - 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(nx + 5, ny - 18); ctx.lineTo(nx - 5, ny - 10); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Label — clean badge
  const lbl = connected ? 'NODE' : 'OFFLINE';
  ctx.font = 'bold 8px monospace';
  const labelW = ctx.measureText(lbl).width;
  const pW = labelW + 12;
  const pH = 13;
  const pX = nx - pW / 2;
  const pY = ny + 8;
  // Label bg
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(pX, pY, pW, pH);
  ctx.strokeStyle = connected ? '#E67E22' : '#ff5050';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  ctx.strokeRect(pX, pY, pW, pH);
  ctx.globalAlpha = 1;
  ctx.fillStyle = connected ? '#E67E22' : '#ff5050';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(lbl, nx, pY + pH / 2);
}

// ─── Helpers ───
function lighten(hex, amt) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.min(255, r + amt); g = Math.min(255, g + amt); b = Math.min(255, b + amt);
  return `rgb(${r},${g},${b})`;
}

function darken(hex, amt) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, r - amt); g = Math.max(0, g - amt); b = Math.max(0, b - amt);
  return `rgb(${r},${g},${b})`;
}

// ─── Main component ───
export default function OfficeCanvas({ agents, nodeConnected, events }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const animRef = useRef(null);
  const agentsRef = useRef(agents);
  const nodeConnectedRef = useRef(nodeConnected);
  const eventsRef = useRef(events || []);

  agentsRef.current = agents;
  nodeConnectedRef.current = nodeConnected;
  eventsRef.current = events || [];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    P = cw >= 700 ? 3 : 1.2;
    frameRef.current++;
    const frame = frameRef.current;
    const currentAgents = agentsRef.current;
    const currentNodeConnected = nodeConnectedRef.current;

    // Background — dark with purple undertone
    ctx.fillStyle = '#08080e';
    ctx.fillRect(0, 0, cw, ch);

    // Grid — subtle line grid
    ctx.strokeStyle = 'rgba(100, 80, 160, 0.04)';
    ctx.lineWidth = 0.5;
    for (let gx = 0; gx < cw; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, ch); ctx.stroke();
    }
    for (let gy = 0; gy < ch; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(cw, gy); ctx.stroke();
    }

    drawWatermark(ctx, cw, ch);
    drawRooms(ctx, cw, ch, frame);
    drawFurniture(ctx, cw, ch, frame);
    drawParticles(ctx, cw, ch, frame);
    drawConnections(ctx, currentAgents, cw, ch, frame);

    if (currentAgents) {
      const agentPositions = currentAgents.map(agentData => ({
        agentData,
        pos: getSmoothedPos(agentData.name, agentData, cw, ch),
      }));

      const MIN_DIST = 28;
      for (let i = 0; i < agentPositions.length; i++) {
        for (let j = i + 1; j < agentPositions.length; j++) {
          const a = agentPositions[i].pos;
          const b = agentPositions[j].pos;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MIN_DIST && dist > 0) {
            const overlap = (MIN_DIST - dist) / 2;
            const nx2 = dx / dist;
            const ny2 = dy / dist;
            a.x -= nx2 * overlap;
            a.y -= ny2 * overlap;
            b.x += nx2 * overlap;
            b.y += ny2 * overlap;
            const nameA = agentPositions[i].agentData.name;
            const nameB = agentPositions[j].agentData.name;
            if (agentAnimPos[nameA]) { agentAnimPos[nameA].x = a.x; agentAnimPos[nameA].y = a.y; }
            if (agentAnimPos[nameB]) { agentAnimPos[nameB].x = b.x; agentAnimPos[nameB].y = b.y; }
          }
        }
      }

      agentPositions.forEach(({ agentData, pos }) => {
        drawAgent(ctx, pos.x, pos.y, agentData.name, agentData, frame);
      });
    }

    drawNodeIndicator(ctx, cw, ch, frame, currentNodeConnected);
    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : 900;
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

  const latestEvents = (events || []).slice(-3);
  const activeAgents = (agents || []).filter(a => {
    const s = (a.status || '').toLowerCase();
    return s === 'working' || s === 'thinking' || s === 'talking' || s === 'posting' || s === 'researching';
  });
  const latestMission = latestEvents.length > 0 ? latestEvents[latestEvents.length - 1] : null;
  const missionAgent = latestMission ? (AGENTS[latestMission.agent] || {}) : {};
  const missionTime = latestMission?.created_at
    ? (() => {
        const diff = Math.floor((Date.now() - new Date(latestMission.created_at).getTime()) / 60000);
        if (diff < 1) return 'just now';
        if (diff < 60) return `${diff}m ago`;
        return `${Math.floor(diff / 60)}h ago`;
      })()
    : '';

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'auto',
          border: '1px solid rgba(140, 120, 200, 0.2)',
          display: 'block',
        }}
      />
      {/* Mission Bar */}
      <div style={{
        background: '#1a1a24',
        borderRadius: '0 0 8px 8px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        minHeight: 40,
        overflow: 'hidden',
        marginTop: '-1px',
      }}>
        {/* Agent face avatars — overlapping circles */}
        <div style={{ display: 'flex', flexShrink: 0, paddingLeft: 4 }}>
          {Object.entries(AGENTS).map(([name, cfg], idx) => {
            const agentData = (agents || []).find(a => a.name === name);
            const isBusy = agentData && ['working', 'thinking', 'talking', 'posting', 'researching'].includes((agentData.status || '').toLowerCase());
            return (
              <div key={name} style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                border: `2px solid ${cfg.color}`,
                background: '#1a1a24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: idx > 0 ? -6 : 0,
                zIndex: 10 - idx,
                overflow: 'hidden',
                opacity: isBusy ? 1 : 0.7,
                transition: 'all 0.3s',
                boxShadow: isBusy ? `0 0 8px ${cfg.color}40` : 'none',
              }}>
                {AGENT_FACES[name] ? AGENT_FACES[name]({ size: 26 }) : <span style={{ fontSize: 12 }}>{cfg.icon}</span>}
              </div>
            );
          })}
        </div>

        {/* Mission counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00e676', boxShadow: '0 0 6px #00e67660' }} />
          <span style={{ color: '#00e676', fontSize: 11, fontFamily: 'monospace', fontWeight: 900, letterSpacing: 0.5 }}>
            MISSION {activeAgents.length}/{Object.keys(AGENTS).length}
          </span>
        </div>

        {/* Mission title */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {latestMission ? (
            <span style={{ color: '#fff', fontSize: 13, fontFamily: 'monospace', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
              {(latestMission.title || latestMission.detail || '').slice(0, 60)}
            </span>
          ) : (
            <span style={{ color: '#555', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>Waiting for agent activity...</span>
          )}
        </div>

        {/* Timestamp */}
        {missionTime && (
          <span style={{ color: 'rgba(200,200,220,0.35)', fontSize: 11, fontFamily: 'monospace', flexShrink: 0, fontWeight: 600 }}>
            {missionTime}
          </span>
        )}
      </div>
    </div>
  );
}
