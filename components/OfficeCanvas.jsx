'use client';
import { useEffect, useRef, useCallback } from 'react';
import { AGENTS, ROOMS, DESK_POSITIONS, ROOM_POSITIONS, STATUS_VISUALS } from '@/lib/agents';

// ─── Smooth position interpolation store ───
const agentAnimPos = {};
const LERP_SPEED = 0.04;

function lerp(a, b, t) { return a + (b - a) * t; }

function getTargetPos(name, agentData, cw, ch) {
  const room = agentData?.current_room || 'desk';
  if (room === 'desk') {
    const dp = DESK_POSITIONS[name];
    return dp ? { x: dp.x * cw, y: dp.y * ch } : { x: cw * 0.5, y: ch * 0.5 };
  }
  const rp = ROOM_POSITIONS[room];
  if (!rp) return { x: cw * 0.5, y: ch * 0.5 };
  const agents = Object.keys(AGENTS);
  const idx = agents.indexOf(name);
  const spread = 38;
  const ox = (idx % 3) * spread - spread;
  const oy = Math.floor(idx / 3) * 32;
  return { x: rp.x * cw + ox, y: rp.y * ch + oy };
}

function getSmoothedPos(name, agentData, cw, ch) {
  const target = getTargetPos(name, agentData, cw, ch);
  if (!agentAnimPos[name]) {
    agentAnimPos[name] = { x: target.x, y: target.y };
    return target;
  }
  const cur = agentAnimPos[name];
  cur.x = lerp(cur.x, target.x, LERP_SPEED);
  cur.y = lerp(cur.y, target.y, LERP_SPEED);
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

// Pixel helper: draw a filled rect (1 pixel unit = 2px on canvas)
const P = 2; // pixel scale
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

  // ── Legs (2px wide each, slightly apart) ──
  const walk = (status === 'working' || status === 'talking' || status === 'researching')
    ? Math.floor(frame * 0.08) % 2 : 0;
  px(ctx, ox + 4 * P, oy + 17 * P, look.pants, 2, 3);
  px(ctx, ox + 8 * P, oy + 17 * P, look.pants, 2, 3);
  // Feet
  px(ctx, ox + 3 * P, oy + 20 * P - walk * P, '#333', 3, 1);
  px(ctx, ox + 8 * P, oy + 20 * P + walk * P, '#333', 3, 1);

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

  // Smooth gentle bob
  const bob = status === 'sleeping' ? 0 : Math.sin(frame * 0.03) * 1.5;
  const ay = y + bob;

  // ── Glow behind sprite ──
  const pulse = 0.6 + Math.sin(frame * 0.06) * 0.4;
  ctx.save();
  ctx.shadowColor = vis.glow;
  ctx.shadowBlur = status === 'idle' || status === 'sleeping' ? 6 : 18 * pulse;
  ctx.globalAlpha = status === 'idle' ? 0.25 : 0.6;
  ctx.fillStyle = vis.glow;
  ctx.beginPath();
  ctx.ellipse(x, ay + 2, 14, SPRITE_H / 2 + 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Draw pixel character directly ──
  drawPixelAgent(ctx, x, ay + SPRITE_H / 2 - 2, name, frame, status);

  // ── Shadow under feet ──
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x, ay + SPRITE_H / 2 + 2, 12, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Status dot (bottom-right of sprite) ──
  ctx.beginPath();
  ctx.arc(x + 12, ay + SPRITE_H / 2 - 4, 4, 0, Math.PI * 2);
  ctx.fillStyle = vis.glow;
  ctx.fill();
  ctx.strokeStyle = '#0d0d1a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── Name tag (colored pill below) ──
  const label = config.label;
  ctx.font = 'bold 10px monospace';
  const lw = ctx.measureText(label).width;
  const pillW = lw + 10;
  const pillH = 15;
  const pillX = x - pillW / 2;
  const pillY = ay + SPRITE_H / 2 + 6;

  ctx.fillStyle = config.color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 4);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, pillY + pillH / 2);

  // ── Role tag (smaller, below name pill) ──
  const role = config.role;
  ctx.font = '8px monospace';
  const rw = ctx.measureText(role).width;
  const rolePillW = rw + 8;
  const rolePillH = 12;
  const rolePillX = x - rolePillW / 2;
  const rolePillY = pillY + pillH + 2;

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.roundRect(rolePillX, rolePillY, rolePillW, rolePillH, 3);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = config.color;
  ctx.lineWidth = 0.8;
  ctx.stroke();

  ctx.fillStyle = config.color;
  ctx.globalAlpha = 0.9;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '8px monospace';
  ctx.fillText(role, x, rolePillY + rolePillH / 2);
  ctx.globalAlpha = 1;

  // ── Speech bubble ──
  if (agentData?.current_task && status !== 'idle' && status !== 'sleeping') {
    drawBubble(ctx, x, ay - SPRITE_H / 2 - 10, agentData.current_task, config.color);
  }

  // ── Status effects ──
  if (status === 'sleeping') {
    for (let i = 0; i < 3; i++) {
      const zz = ((frame * 0.015 + i * 0.33) % 1);
      ctx.globalAlpha = 1 - zz;
      ctx.font = `${9 + zz * 8}px monospace`;
      ctx.fillStyle = '#8888bb';
      ctx.textAlign = 'center';
      ctx.fillText('z', x + 14 + zz * 12 + i * 4, ay - 10 - zz * 22);
    }
    ctx.globalAlpha = 1;
  }

  if (status === 'thinking') {
    for (let i = 0; i < 3; i++) {
      const p = (frame * 0.06 + i * 0.7) % 3;
      ctx.globalAlpha = p < 1 ? p : p < 2 ? 1 : 3 - p;
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(x + 20 + i * 7, ay - 6, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (status === 'working') {
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const angle = (frame * 0.03 + i * Math.PI / 2) % (Math.PI * 2);
      const pr = 28 + Math.sin(frame * 0.05 + i) * 3;
      const ppx = x + Math.cos(angle) * pr;
      const ppy = ay + Math.sin(angle) * pr;
      ctx.fillStyle = config.color;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(ppx, ppy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (status === 'error') {
    ctx.save();
    const flash = Math.sin(frame * 0.15) > 0;
    if (flash) {
      ctx.beginPath();
      ctx.arc(x, ay, 24, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(231, 76, 60, 0.2)';
      ctx.fill();
    }
    ctx.restore();
  }
}

// ─── Bubble ───
function drawBubble(ctx, x, y, text, borderColor) {
  const t = text.length > 28 ? text.slice(0, 26) + '...' : text;
  ctx.font = '10px monospace';
  const tw = ctx.measureText(t).width;
  const pad = 10;
  const bw = tw + pad * 2;
  const bh = 20;
  const bx = x - bw / 2;
  const by = y - bh;

  ctx.fillStyle = 'rgba(25, 25, 45, 0.92)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 6);
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pointer
  ctx.beginPath();
  ctx.moveTo(x - 5, by + bh);
  ctx.lineTo(x, by + bh + 6);
  ctx.lineTo(x + 5, by + bh);
  ctx.fillStyle = 'rgba(25, 25, 45, 0.92)';
  ctx.fill();

  ctx.fillStyle = '#e0e0e0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(t, x, by + bh / 2);
}

// ─── Animated dashed connection lines between talking/working agents ───
function drawConnections(ctx, agents, cw, ch, frame) {
  if (!agents || agents.length < 2) return;
  const active = agents.filter(a =>
    a.status === 'talking' || a.status === 'working' || a.status === 'researching'
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

// ─── Room zones (polished with icons, gradients, glow) ───
const ROOM_ICONS = {
  desk:     '💻',
  meeting:  '🗣️',
  research: '🧪',
  social:   '💬',
  break:    '☕',
  board:    '📋',
};

function drawRooms(ctx, cw, ch, frame) {
  Object.entries(ROOMS).forEach(([key, room]) => {
    const rx = room.x * cw + 2, ry = room.y * ch + 2;
    const rw = room.w * cw - 4, rh = room.h * ch - 4;

    // ── Room background gradient ──
    const grad = ctx.createLinearGradient(rx, ry, rx, ry + rh);
    grad.addColorStop(0, room.bg);
    grad.addColorStop(1, 'rgba(8,8,18,0.6)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, 8);
    ctx.fill();

    // ── Inner subtle pattern (diagonal lines) ──
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, 8);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.012)';
    ctx.lineWidth = 1;
    for (let d = -rh; d < rw + rh; d += 16) {
      ctx.beginPath();
      ctx.moveTo(rx + d, ry);
      ctx.lineTo(rx + d - rh, ry + rh);
      ctx.stroke();
    }
    ctx.restore();

    // ── Animated border glow ──
    const glowPulse = 0.4 + Math.sin(frame * 0.02 + Object.keys(ROOMS).indexOf(key) * 1.2) * 0.2;
    ctx.save();
    ctx.shadowColor = room.border;
    ctx.shadowBlur = 6;
    ctx.globalAlpha = glowPulse;
    ctx.strokeStyle = room.border;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, 8);
    ctx.stroke();
    ctx.restore();

    // ── Corner accents (small L shapes) ──
    ctx.strokeStyle = room.border;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.5;
    const cLen = 10;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(rx + cLen, ry); ctx.lineTo(rx, ry); ctx.lineTo(rx, ry + cLen);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(rx + rw - cLen, ry); ctx.lineTo(rx + rw, ry); ctx.lineTo(rx + rw, ry + cLen);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(rx + cLen, ry + rh); ctx.lineTo(rx, ry + rh); ctx.lineTo(rx, ry + rh - cLen);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(rx + rw - cLen, ry + rh); ctx.lineTo(rx + rw, ry + rh); ctx.lineTo(rx + rw, ry + rh - cLen);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // ── Room icon (top-left) ──
    const icon = ROOM_ICONS[key] || '';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, rx + 7, ry + 15);

    // ── Room label (top, next to icon) ──
    ctx.font = 'bold 8px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(room.label, rx + 22, ry + 15);

    // ── Bottom status line ──
    ctx.fillStyle = room.border;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(rx + 8, ry + rh - 3, rw - 16, 1);
    ctx.globalAlpha = 1;
  });
}

// ─── Furniture (detailed desks, monitors, decorations) ───
function drawFurniture(ctx, cw, ch, frame) {
  // ── Individual desks with monitors ──
  Object.entries(DESK_POSITIONS).forEach(([name, dp]) => {
    const dx = dp.x * cw, dy = dp.y * ch;
    const config = AGENTS[name];

    // Desk surface with wood-like gradient
    const deskGrad = ctx.createLinearGradient(dx - 24, dy + 6, dx + 24, dy + 6);
    deskGrad.addColorStop(0, '#2a2a48');
    deskGrad.addColorStop(0.5, '#323252');
    deskGrad.addColorStop(1, '#2a2a48');
    ctx.fillStyle = deskGrad;
    ctx.beginPath();
    ctx.roundRect(dx - 24, dy + 6, 48, 12, 3);
    ctx.fill();
    // Desk edge highlight
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(dx - 22, dy + 6, 44, 1);

    // Desk legs
    ctx.fillStyle = '#1e1e38';
    ctx.fillRect(dx - 20, dy + 18, 3, 6);
    ctx.fillRect(dx + 17, dy + 18, 3, 6);

    // Monitor frame
    ctx.fillStyle = '#111128';
    ctx.beginPath();
    ctx.roundRect(dx - 16, dy - 24, 32, 24, 4);
    ctx.fill();

    // Screen content (animated scan line)
    const screenGrad = ctx.createLinearGradient(dx - 13, dy - 21, dx - 13, dy - 4);
    screenGrad.addColorStop(0, darken(config.color, 80));
    screenGrad.addColorStop(1, 'rgba(0,0,0,0.9)');
    ctx.fillStyle = screenGrad;
    ctx.fillRect(dx - 13, dy - 21, 26, 17);

    // Screen text lines (tiny code-like)
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = config.color;
    for (let li = 0; li < 4; li++) {
      const lw = 8 + (((name.charCodeAt(0) * 7 + li * 13) % 12));
      ctx.fillRect(dx - 10, dy - 19 + li * 4, lw, 1.5);
    }
    ctx.globalAlpha = 1;

    // Scan line
    const scanY = dy - 21 + ((frame * 0.5 + Object.keys(AGENTS).indexOf(name) * 30) % 17);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(dx - 13, scanY, 26, 2);

    // Monitor border glow
    ctx.strokeStyle = config.color;
    ctx.globalAlpha = 0.2;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(dx - 16, dy - 24, 32, 24, 4);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Monitor stand
    ctx.fillStyle = '#2a2a48';
    ctx.fillRect(dx - 2, dy, 4, 6);
    ctx.fillRect(dx - 5, dy + 4, 10, 2);

    // Power LED on monitor
    ctx.fillStyle = config.color;
    ctx.globalAlpha = 0.6 + Math.sin(frame * 0.04) * 0.3;
    ctx.beginPath();
    ctx.arc(dx + 13, dy - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Chair (ergonomic style)
    ctx.fillStyle = '#1a1a30';
    ctx.beginPath();
    ctx.ellipse(dx, dy + 28, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Chair back
    ctx.fillStyle = '#222240';
    ctx.beginPath();
    ctx.roundRect(dx - 8, dy + 18, 16, 8, 3);
    ctx.fill();
    // Chair highlight
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fillRect(dx - 6, dy + 19, 12, 2);
  });

  // ── Meeting table (detailed) ──
  const mt = ROOM_POSITIONS.meeting;
  if (mt) {
    const mx = mt.x * cw, my = mt.y * ch;
    // Table shadow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(mx, my + 14, 44, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Table surface
    const tGrad = ctx.createRadialGradient(mx, my + 10, 5, mx, my + 10, 42);
    tGrad.addColorStop(0, '#3a4a5a');
    tGrad.addColorStop(1, '#2a3a4a');
    ctx.fillStyle = tGrad;
    ctx.beginPath();
    ctx.ellipse(mx, my + 10, 42, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a6a7a';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Coffee cups on table
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(mx - 16, my + 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b4226';
    ctx.beginPath();
    ctx.arc(mx - 16, my + 6, 2, 0, Math.PI * 2);
    ctx.fill();
    // Papers
    ctx.fillStyle = '#e8e8d0';
    ctx.globalAlpha = 0.15;
    ctx.fillRect(mx + 8, my + 4, 10, 7);
    ctx.fillRect(mx + 10, my + 2, 10, 7);
    ctx.globalAlpha = 1;
  }

  // ── Break room couch (comfy) ──
  const br = ROOM_POSITIONS.break;
  if (br) {
    const bx = br.x * cw, by = br.y * ch;
    // Couch shadow
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.roundRect(bx - 30, by + 12, 60, 8, 4);
    ctx.fill();
    ctx.restore();
    // Couch base
    ctx.fillStyle = '#4a3040';
    ctx.beginPath();
    ctx.roundRect(bx - 28, by + 2, 56, 14, 5);
    ctx.fill();
    // Couch back
    ctx.fillStyle = '#553848';
    ctx.beginPath();
    ctx.roundRect(bx - 28, by - 8, 56, 12, 5);
    ctx.fill();
    // Cushion lines
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx - 9, by + 3);
    ctx.lineTo(bx - 9, by + 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + 9, by + 3);
    ctx.lineTo(bx + 9, by + 14);
    ctx.stroke();
    // Pillow
    ctx.fillStyle = '#6a4a5a';
    ctx.beginPath();
    ctx.roundRect(bx + 16, by - 4, 10, 8, 3);
    ctx.fill();
  }

  // ── Research station extras ──
  const rs = ROOM_POSITIONS.research;
  if (rs) {
    const rrx = rs.x * cw, rry = rs.y * ch;
    // Bookshelf
    ctx.fillStyle = '#2a2a1a';
    ctx.fillRect(rrx + 28, rry - 30, 28, 45);
    ctx.strokeStyle = '#3a3a2a';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(rrx + 28, rry - 30, 28, 45);
    // Shelf dividers
    for (let si = 0; si < 3; si++) {
      ctx.fillStyle = '#3a3a2a';
      ctx.fillRect(rrx + 29, rry - 18 + si * 14, 26, 1);
    }
    // Books (colored spines)
    const bookColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];
    for (let si = 0; si < 3; si++) {
      for (let bi = 0; bi < 4; bi++) {
        const bci = (si * 4 + bi) % bookColors.length;
        ctx.fillStyle = bookColors[bci];
        ctx.globalAlpha = 0.4;
        ctx.fillRect(rrx + 31 + bi * 6, rry - 28 + si * 14, 4, 12);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ── Social corner extras ──
  const sc = ROOM_POSITIONS.social;
  if (sc) {
    const sx = sc.x * cw, sy = sc.y * ch;
    // Whiteboard
    ctx.fillStyle = '#f0f0e8';
    ctx.globalAlpha = 0.08;
    ctx.fillRect(sx - 30, sy - 24, 40, 26);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(sx - 30, sy - 24, 40, 26);
    // Sticky notes on whiteboard
    const stickyColors = ['#ffeb3b', '#ff9800', '#4caf50', '#2196f3'];
    for (let si = 0; si < 4; si++) {
      ctx.fillStyle = stickyColors[si];
      ctx.globalAlpha = 0.12;
      ctx.fillRect(sx - 26 + (si % 2) * 18, sy - 20 + Math.floor(si / 2) * 12, 8, 8);
    }
    ctx.globalAlpha = 1;
  }

  // ── Board room extras ──
  const bd = ROOM_POSITIONS.board;
  if (bd) {
    const bdx = bd.x * cw, bdy = bd.y * ch;
    // Kanban board on wall
    ctx.fillStyle = 'rgba(20,20,40,0.5)';
    ctx.beginPath();
    ctx.roundRect(bdx - 30, bdy - 14, 60, 20, 3);
    ctx.fill();
    ctx.strokeStyle = '#334';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    // Columns
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.moveTo(bdx - 10, bdy - 12);
    ctx.lineTo(bdx - 10, bdy + 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bdx + 10, bdy - 12);
    ctx.lineTo(bdx + 10, bdy + 4);
    ctx.stroke();
    // Cards
    const cardColors = ['#2ecc71', '#f1c40f', '#e74c3c'];
    for (let ci = 0; ci < 3; ci++) {
      ctx.fillStyle = cardColors[ci];
      ctx.globalAlpha = 0.2;
      ctx.fillRect(bdx - 26 + ci * 20, bdy - 10, 14, 4);
      ctx.fillRect(bdx - 26 + ci * 20, bdy - 4, 14, 4);
    }
    ctx.globalAlpha = 1;
  }

  // ── Potted plant decorations ──
  drawPlant(ctx, 0.54 * cw, 0.12 * ch);
  drawPlant(ctx, 0.57 * cw, 0.52 * ch);
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

// ─── Floor accent lines & glowing separators ───
function drawFloorAccents(ctx, cw, ch, frame) {
  // ── Glowing separator lines ──
  // Horizontal separator at 57%
  const hGrad = ctx.createLinearGradient(0, ch * 0.57, cw * 0.58, ch * 0.57);
  hGrad.addColorStop(0, 'rgba(0,188,212,0)');
  hGrad.addColorStop(0.3, 'rgba(0,188,212,0.08)');
  hGrad.addColorStop(0.7, 'rgba(0,188,212,0.08)');
  hGrad.addColorStop(1, 'rgba(0,188,212,0)');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, ch * 0.57 - 0.5, cw * 0.58, 1);

  // Vertical separator at 58%
  const vGrad = ctx.createLinearGradient(cw * 0.58, 0, cw * 0.58, ch);
  vGrad.addColorStop(0, 'rgba(0,188,212,0)');
  vGrad.addColorStop(0.2, 'rgba(0,188,212,0.06)');
  vGrad.addColorStop(0.8, 'rgba(0,188,212,0.06)');
  vGrad.addColorStop(1, 'rgba(0,188,212,0)');
  ctx.fillStyle = vGrad;
  ctx.fillRect(cw * 0.58 - 0.5, 0, 1, ch);

  // ── Moving dot on separators ──
  const dotPos = (frame * 0.003) % 1;
  ctx.fillStyle = '#00bcd4';
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(dotPos * cw * 0.58, ch * 0.57, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cw * 0.58, dotPos * ch, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
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
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.012)';
  ctx.fillText('DEV HQ', cw / 2, ch / 2);
  ctx.restore();
}

// ─── Node Connection Indicator — pixel art laptop in bottom-right ───
function drawNodeIndicator(ctx, cw, ch, frame, connected) {
  const nx = cw * 0.88;
  const ny = ch * 0.88;

  // ── Connection line from node to PULSE agent only (when online) ──
  if (connected) {
    const pulseDp = DESK_POSITIONS['pulse'];
    if (pulseDp) {
      ctx.save();
      ctx.setLineDash([3, 5]);
      ctx.lineDashOffset = -frame * 0.4;
      ctx.lineWidth = 1.5;

      const ax = pulseDp.x * cw;
      const ay = pulseDp.y * ch;
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

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    frameRef.current++;
    const frame = frameRef.current;

    // Background with radial vignette
    const bgGrad = ctx.createRadialGradient(cw / 2, ch / 2, 100, cw / 2, ch / 2, cw * 0.7);
    bgGrad.addColorStop(0, '#101020');
    bgGrad.addColorStop(1, '#080810');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cw, ch);

    // Subtle dot grid (instead of lines)
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let gx = 14; gx < cw; gx += 28) {
      for (let gy = 14; gy < ch; gy += 28) {
        ctx.beginPath();
        ctx.arc(gx, gy, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawWatermark(ctx, cw, ch);
    drawFloorAccents(ctx, cw, ch, frame);
    drawRooms(ctx, cw, ch, frame);
    drawFurniture(ctx, cw, ch, frame);
    drawParticles(ctx, cw, ch, frame);

    // Connection lines (before agents so lines go behind)
    drawConnections(ctx, agents, cw, ch, frame);

    // Agent avatars
    if (agents) {
      agents.forEach(agentData => {
        const pos = getSmoothedPos(agentData.name, agentData, cw, ch);
        drawAgent(ctx, pos.x, pos.y, agentData.name, agentData, frame);
      });
    }

    // Node connection indicator (drawn on top of everything)
    drawNodeIndicator(ctx, cw, ch, frame, nodeConnected);

    animRef.current = requestAnimationFrame(draw);
  }, [agents, nodeConnected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : 900;
      const h = Math.round(w * (480 / 900));
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