import React, { useRef, useEffect } from 'react';
import { WIZARD_CONFIG } from '../lib/wizardConfig.js';
import { buildPrompt } from '../lib/promptBuilder.js';
import { getSpelConfig, getRunnerConfig, getObbyConfig, getMemoryConfig, getMusicConfig, getAnimationConfig, getHemsidaConfig, getRostlabConfig, getFilmstudioConfig, getLarospelConfig, getBradspelConfig, getSnapConfig, getTopTrumpsConfig, getBeratelseConfig, getPixelartConfig, getQuizConfig } from '../lib/templateConfigs.js';

// ─── World background colors ────────────────────────────────────────────────
const WORLD_COLORS = {
  rymden:          { top: '#0d0d2b', bot: '#1a1a4e' },
  djungeln:        { top: '#0a2e0a', bot: '#1a5e1a' },
  havet:           { top: '#001a3e', bot: '#0047ab' },
  staden:          { top: '#1a1a2e', bot: '#2d2d4e' },
  dromvarlden:     { top: '#1a0a2e', bot: '#3d1a5e' },
  vulkanen:        { top: '#2e0a00', bot: '#5e1a00' },
  istiden:         { top: '#001a2e', bot: '#003366' },
  skogen:          { top: '#0a1f0a', bot: '#1a3d1a' },
  sandoknen:       { top: '#2e1a00', bot: '#5d3a00' },
  arktis:          { top: '#001a2e', bot: '#003366' },
  undervattnet:    { top: '#001a3e', bot: '#003388' },
  halloweenstaden: { top: '#1a0a00', bot: '#2e1500' },
  candyland:       { top: '#cc2266', bot: '#aa1155' },
  ingenstandsland: { top: '#1a0030', bot: '#2e0060' },
};

const GENRE_COLORS = {
  pop:         '#ff69b4',
  hiphop:      '#ffd700',
  rock:        '#cc2200',
  elektronisk: '#00e5ff',
  jazz:        '#9c27b0',
  klassisk:    '#f5f0dc',
  reggae:      '#00e676',
  metal:       '#ff1744',
  country:     '#ff8f00',
  kpop:        '#f48fb1',
};

const FILM_COLORS = {
  aventyr:     '#ffd700',
  komedi:      '#ff9800',
  skrack:      '#880000',
  scifi:       '#00e5ff',
  saga:        '#ab47bc',
  superhjälte: '#1565c0',
};

const TEMA_COLORS = {
  djur:        '#66bb6a',
  rymden:      '#3949ab',
  mat:         '#ff7043',
  sport:       '#26a69a',
  dinosaurier: '#8d6e63',
  superhjältar:'#f44336',
  pirater:     '#4e342e',
  djungeln:    '#2e7d32',
  medeltiden:  '#5d4037',
  framtiden:   '#0288d1',
};

const HEMSIDA_TEMA = {
  rosa:   '#f48fb1',
  bla:    '#42a5f5',
  gron:   '#66bb6a',
  lila:   '#ab47bc',
  orange: '#ff7043',
  svart:  '#424242',
};

// ─── Utility ─────────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function rand(min, max) { return min + Math.random() * (max - min); }

function drawGradientBg(ctx, w, h, top, bot) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(1, bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawStickFigure(ctx, x, y, scale, color, pose) {
  // pose: 0=stand, 1=jump, 2=run-left, 3=run-right
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // head
  ctx.beginPath();
  ctx.arc(0, -30, 8, 0, Math.PI * 2);
  ctx.stroke();

  // body
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(0, 0);
  ctx.stroke();

  const legAngle = pose === 1 ? 0.6 : (pose === 2 ? -0.5 : (pose === 3 ? 0.5 : 0.2));
  // legs
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-10 * Math.cos(legAngle), 18 + 4 * Math.abs(Math.sin(legAngle)));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(10 * Math.cos(legAngle), 18 - 4 * Math.abs(Math.sin(legAngle)));
  ctx.stroke();

  // arms
  const armAngle = pose === 1 ? -0.8 : 0.4;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(-12, -6 + armAngle * 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(12, -6 - armAngle * 8);
  ctx.stroke();

  ctx.restore();
}

// ─── Scene: spel ─────────────────────────────────────────────────────────────
function initSpel(answers) {
  const varld = answers?.varld ?? 'rymden';
  const hasFiende = (answers?.fiende ?? 'inga') !== 'inga';
  const platforms = [
    { x: 80,  y: 0.75, w: 160, color: '#4a9' },
    { x: 320, y: 0.60, w: 130, color: '#a49' },
    { x: 520, y: 0.72, w: 150, color: '#94a' },
    { x: 740, y: 0.55, w: 140, color: '#4aa' },
  ];
  const coins = Array.from({ length: 8 }, (_, i) => ({
    x: 120 + i * 110,
    baseY: 0,
    alive: true,
    phase: i * 0.7,
  }));
  const enemy = hasFiende
    ? { x: 330, vx: 1.5, platIdx: 1 }
    : null;
  return {
    varld,
    platforms,
    coins,
    enemy,
    hero: { x: 100, vx: 1.2, vy: 0, platIdx: 0, jumping: false, jumpT: 0 },
    score: 0,
    scoreTick: 0,
    scrollX: 0,
    stars: Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), r: rand(1, 3), twinkle: Math.random() * Math.PI * 2 })),
  };
}

function drawSpel(ctx, w, h, s, dt, t) {
  const wc = WORLD_COLORS[s.varld] ?? WORLD_COLORS.rymden;
  drawGradientBg(ctx, w, h, wc.top, wc.bot);

  // stars for rymden/dromvarlden
  if (s.varld === 'rymden' || s.varld === 'dromvarlden') {
    s.stars.forEach(st => {
      const alpha = 0.5 + 0.5 * Math.sin(t * 1.5 + st.twinkle);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(st.x * w, st.y * h * 0.7, st.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ground
  ctx.fillStyle = '#2a4a2a';
  ctx.fillRect(0, h * 0.88, w, h * 0.12);

  // platforms (progressive reveal)
  const visiblePlatforms = s.streamProgress < 1
    ? s.platforms.slice(0, Math.max(1, Math.ceil(s.streamProgress * s.platforms.length)))
    : s.platforms;
  visiblePlatforms.forEach(p => {
    const py = h * p.y;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.roundRect(p.x, py, p.w, 16, 8);
    ctx.fill();
    // legs down to ground
    ctx.fillStyle = '#555';
    ctx.fillRect(p.x + 10, py + 16, 6, h * 0.88 - py - 16);
    ctx.fillRect(p.x + p.w - 16, py + 16, 6, h * 0.88 - py - 16);
  });

  // coins (progressive reveal — only show for visible platforms)
  s.coins.forEach((c, i) => {
    if (!c.alive) return;
    if (i >= visiblePlatforms.length) return;
    const plat = s.platforms[i % s.platforms.length];
    const cy = h * plat.y - 24 + Math.sin(t * 3 + c.phase) * 4;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(plat.x + plat.w / 2 + (i % 2 === 0 ? 20 : -20), cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff9900';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // enemy
  if (s.enemy) {
    const ep = s.platforms[s.enemy.platIdx];
    s.enemy.x += s.enemy.vx;
    if (s.enemy.x < ep.x + 10 || s.enemy.x > ep.x + ep.w - 10) s.enemy.vx *= -1;
    const ey = h * ep.y - 20;
    ctx.fillStyle = '#e53935';
    ctx.beginPath();
    ctx.arc(s.enemy.x, ey, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(s.enemy.x - 6, ey - 4, 4, 4);
    ctx.fillRect(s.enemy.x + 2, ey - 4, 4, 4);
  }

  // hero movement
  const hero = s.hero;
  const plat = s.platforms[hero.platIdx];
  hero.x += hero.vx;
  if (hero.x < plat.x + 8 || hero.x > plat.x + plat.w - 8) {
    hero.vx *= -1;
    // occasionally jump to another platform
    hero.platIdx = (hero.platIdx + 1) % s.platforms.length;
  }
  const heroGroundY = h * plat.y - 20;
  // simple jump arc
  if (!hero.jumping && Math.random() < 0.008) {
    hero.jumping = true;
    hero.jumpT = 0;
    hero.jumpFrom = heroGroundY;
    hero.jumpTo = h * s.platforms[(hero.platIdx + 1) % s.platforms.length].y - 20;
  }
  let heroY = heroGroundY;
  if (hero.jumping) {
    hero.jumpT += dt * 1.5;
    const arc = -Math.sin(hero.jumpT * Math.PI) * 60;
    heroY = lerp(hero.jumpFrom, hero.jumpTo, Math.min(hero.jumpT, 1)) + arc;
    if (hero.jumpT >= 1) hero.jumping = false;
  }

  const pose = hero.jumping ? 1 : (hero.vx > 0 ? 3 : 2);
  drawStickFigure(ctx, hero.x, heroY, 1, '#7ec8e3', pose);

  // score
  s.scoreTick += dt;
  if (s.scoreTick > 0.5) { s.score += 10; s.scoreTick = 0; }
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(`★ ${s.score}`, 20, 36);
}

// ─── Scene: musik ─────────────────────────────────────────────────────────────
const INSTRUMENT_EMOJIS = {
  piano: '🎹', gitarr: '🎸', trummor: '🥁', synth: '🎛️',
  trumpet: '🎺', violin: '🎻', saxofon: '🎷', bas: '🎵',
  slagverk: '🪘', harpa: '🪗', orgel: '🎹',
};

function initMusik(answers) {
  const genre = answers?.genre ?? 'pop';
  const stamning = answers?.stamning ?? 'glad';
  const color = GENRE_COLORS[genre] ?? '#ff69b4';
  const rawInstr = answers?.instrument ?? ['piano', 'trummor'];
  const instruments = (Array.isArray(rawInstr) ? rawInstr : [rawInstr]).slice(0, 3);
  const bpmBase = { pop:120, hiphop:90, rock:140, elektronisk:128, jazz:100, klassisk:80, reggae:80, metal:180, country:110, kpop:130 };
  const bpm = bpmBase[genre] ?? 120;
  // floating instrument icons
  const icons = instruments.map((instr, i) => ({
    emoji: INSTRUMENT_EMOJIS[instr] ?? '🎵',
    x: rand(0.15, 0.85),
    y: rand(0.15, 0.75),
    vx: rand(-0.03, 0.03),
    vy: rand(-0.015, 0.015),
    phase: i * 1.2,
  }));
  return {
    genre, stamning, color, bpm, instruments, icons,
    notes: Array.from({ length: 8 }, (_, i) => ({
      x: rand(0.1, 0.9),
      y: rand(0.2, 0.85),
      vy: rand(0.25, 0.65),
      size: rand(14, 24),
      alpha: rand(0.5, 1),
      phase: i * 0.7,
    })),
    bars: Array.from({ length: 8 }, (_, i) => ({ phase: i * 0.55 })),
    beatPhase: 0,
    stars: Array.from({ length: 30 }, () => ({ x: rand(0, 1), y: rand(0, 1), phase: Math.random() * Math.PI * 2 })),
  };
}

function drawMusik(ctx, w, h, s, dt, t) {
  // dark bg
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, w, h);

  // tinted radial glow
  const glow = ctx.createRadialGradient(w / 2, h * 0.5, 0, w / 2, h * 0.5, w * 0.7);
  glow.addColorStop(0, s.color + '30');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // genre label — large, centered, glowing
  const labelScale = 1 + 0.04 * Math.sin(t * 2);
  ctx.save();
  ctx.translate(w / 2, h * 0.18);
  ctx.scale(labelScale, labelScale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(w * 0.11)}px sans-serif`;
  ctx.shadowColor = s.color;
  ctx.shadowBlur = 24;
  ctx.fillStyle = s.color;
  ctx.fillText(s.genre.toUpperCase(), 0, 0);
  ctx.restore();
  ctx.shadowBlur = 0;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // BPM counter — top-right corner
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = `bold ${Math.round(w * 0.055)}px monospace`;
  ctx.textAlign = 'right';
  ctx.fillText(`${s.bpm} BPM`, w - 12, 28);
  ctx.textAlign = 'left';

  // animated equalizer bars — 8 bars, genre color, bottom section
  const barCount = 8;
  const barW = Math.round(w * 0.055);
  const barGap = Math.round(w * 0.022);
  const barAreaW = barCount * (barW + barGap) - barGap;
  const barX0 = (w - barAreaW) / 2;
  const barMaxH = h * 0.28;
  const barBaseY = h * 0.82;
  s.bars.forEach((b, i) => {
    const bh = barMaxH * (0.25 + 0.75 * Math.abs(Math.sin(t * (4 + i * 0.3) + b.phase)));
    // bar glow
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 12;
    const alpha = 0.55 + 0.45 * Math.abs(Math.sin(t * 3 + b.phase));
    ctx.fillStyle = s.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
    ctx.fillRect(barX0 + i * (barW + barGap), barBaseY - bh, barW, bh);
  });
  ctx.shadowBlur = 0;

  // bar baseline
  ctx.fillStyle = s.color + '44';
  ctx.fillRect(barX0 - 4, barBaseY, barAreaW + 8, 2);

  // floating instrument icons
  s.icons.forEach(ic => {
    ic.x += ic.vx * dt;
    ic.y += ic.vy * dt;
    if (ic.x < 0.08 || ic.x > 0.92) ic.vx *= -1;
    if (ic.y < 0.08 || ic.y > 0.72) ic.vy *= -1;
    const emojiScale = 1 + 0.08 * Math.sin(t * 2 + ic.phase);
    ctx.save();
    ctx.translate(ic.x * w, ic.y * h);
    ctx.scale(emojiScale, emojiScale);
    ctx.font = `${Math.round(w * 0.09)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.85;
    ctx.fillText(ic.emoji, 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
  });

  // floating music notes
  s.notes.forEach(n => {
    n.y -= n.vy * dt * 0.035;
    if (n.y < -0.05) { n.y = 0.92; n.x = rand(0.1, 0.9); }
    const alpha = n.alpha * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.8 + n.phase)));
    ctx.fillStyle = s.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
    ctx.font = `${n.size}px serif`;
    ctx.textAlign = 'left';
    ctx.fillText('♪', n.x * w, n.y * h);
  });
}

// ─── Scene: ritprogram ────────────────────────────────────────────────────────
function initRitprogram(answers) {
  const palett = answers?.palett ?? 'regnbage';
  const motiv = answers?.motiv ?? 'abstrakt';
  const palettes = {
    regnbage:  ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6'],
    pastell:   ['#ffb3ba','#ffdfba','#ffffba','#baffc9','#bae1ff','#e8baff'],
    mork:      ['#1a1a2e','#16213e','#0f3460','#533483','#e94560','#ffffff'],
    neon:      ['#ff00ff','#00ffff','#ff4500','#39ff14','#ff69b4','#ffff00'],
    naturlig:  ['#5d4037','#795548','#8d6e63','#4caf50','#81c784','#a5d6a7'],
    svartvit:  ['#000','#333','#666','#999','#ccc','#fff'],
  };
  const colors = palettes[palett] ?? palettes.regnbage;

  // strokes for the motiv drawing
  const strokeSets = {
    landskap: [
      [[0.1,0.7],[0.3,0.5],[0.5,0.6],[0.7,0.4],[0.9,0.55]],
      [[0.0,0.8],[1.0,0.8]],
      [[0.55,0.1],[0.55,0.35],[0.65,0.25],[0.55,0.35],[0.45,0.25]],
    ],
    abstrakt: [
      [[0.2,0.2],[0.5,0.5],[0.8,0.2],[0.5,0.8],[0.2,0.2]],
      [[0.5,0.1],[0.9,0.5],[0.5,0.9],[0.1,0.5],[0.5,0.1]],
    ],
    portratt: [
      [[0.5,0.2],[0.5,0.3],[0.4,0.3],[0.4,0.5],[0.6,0.5],[0.6,0.3],[0.5,0.3]],
      [[0.4,0.5],[0.35,0.75],[0.65,0.75],[0.6,0.5]],
    ],
    djur: [
      [[0.3,0.4],[0.5,0.25],[0.7,0.4],[0.7,0.7],[0.5,0.8],[0.3,0.7],[0.3,0.4]],
      [[0.35,0.35],[0.25,0.2]],
      [[0.65,0.35],[0.75,0.2]],
    ],
    stad: [
      [[0.1,0.9],[0.1,0.4],[0.25,0.4],[0.25,0.9]],
      [[0.35,0.9],[0.35,0.3],[0.55,0.3],[0.55,0.9]],
      [[0.65,0.9],[0.65,0.5],[0.9,0.5],[0.9,0.9]],
    ],
    rymd: [
      [[0.5,0.3],[0.6,0.5],[0.5,0.45],[0.4,0.5],[0.5,0.3]],
      [[0.5,0.5],[0.5,0.7]],
      [[0.4,0.65],[0.6,0.65]],
    ],
  };
  const strokes = strokeSets[motiv] ?? strokeSets.abstrakt;
  const totalPoints = strokes.reduce((a, s) => a + s.length, 0);

  return { colors, strokes, totalPoints, motiv, palett, progress: 0, splashes: [] };
}

function drawRitprogram(ctx, w, h, s, dt, t) {
  // white canvas
  ctx.fillStyle = '#fff8f0';
  ctx.fillRect(0, 0, w, h);

  // draw strokes progressively
  s.progress = Math.min(s.progress + dt * 0.3, 1);
  let pointsDone = Math.floor(s.progress * s.totalPoints);

  s.strokes.forEach((stroke, si) => {
    const color = s.colors[si % s.colors.length];
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    stroke.forEach((pt, pi) => {
      if (pointsDone <= 0) return;
      if (pi === 0) ctx.moveTo(pt[0] * w, pt[1] * h);
      else ctx.lineTo(pt[0] * w, pt[1] * h);
      pointsDone--;
    });
    ctx.stroke();
  });

  // brush cursor at last drawn point (animate)
  const cursor = s.strokes[0][0];
  const bx = cursor[0] * w + Math.sin(t * 2) * 30;
  const by = cursor[1] * h + Math.cos(t * 2) * 20;
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + 12, by - 28);
  ctx.lineTo(bx + 16, by - 26);
  ctx.lineTo(bx + 6, by);
  ctx.closePath();
  ctx.stroke();

  // paint splashes
  if (Math.random() < 0.04) {
    s.splashes.push({
      x: rand(0.1, 0.9) * w, y: rand(0.1, 0.9) * h,
      r: rand(6, 18), color: s.colors[Math.floor(Math.random() * s.colors.length)],
      alpha: 1, life: 1,
    });
  }
  s.splashes = s.splashes.filter(sp => sp.life > 0);
  s.splashes.forEach(sp => {
    sp.life -= dt * 0.6;
    ctx.globalAlpha = Math.max(0, sp.life);
    ctx.fillStyle = sp.color;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // palette swatches
  s.colors.forEach((c, i) => {
    const sx = w - 48;
    const sy = h * 0.25 + i * 36;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.roundRect(sx, sy, 28, 28, 6);
    ctx.fill();
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

// ─── Scene: filmstudio ────────────────────────────────────────────────────────
function initFilmstudio(answers) {
  const genre = answers?.genre ?? 'aventyr';
  const color = FILM_COLORS[genre] ?? '#ffd700';
  return {
    genre, color,
    panels: [
      { revealed: 0, x: 0.04, y: 0.15, w: 0.28, h: 0.55 },
      { revealed: 0, x: 0.36, y: 0.15, w: 0.28, h: 0.55 },
      { revealed: 0, x: 0.68, y: 0.15, w: 0.28, h: 0.55 },
    ],
    bubble: { alpha: 0 },
  };
}

function drawFilmstudio(ctx, w, h, s, dt, t) {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, w, h);

  // Film strip holes top/bottom
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, w, h * 0.12);
  ctx.fillRect(0, h * 0.88, w, h * 0.12);
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.roundRect(i * (w / 10) + w * 0.02, h * 0.02, w * 0.06, h * 0.08, 4);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(i * (w / 10) + w * 0.02, h * 0.9, w * 0.06, h * 0.08, 4);
    ctx.fill();
  }

  s.panels.forEach((p, i) => {
    const delay = i * 0.5;
    p.revealed = Math.min(p.revealed + dt * 0.8, Math.max(0, t - delay) > 0 ? 1 : 0);

    const px = p.x * w, py = p.y * h, pw = p.w * w, ph = p.h * h;
    const alpha = p.revealed;
    if (alpha <= 0) return;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = s.color + '22';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(px, py, pw, ph);

    // simple scene inside panel
    const cx = px + pw / 2, cy = py + ph * 0.55;
    if (i === 0) {
      // hero
      drawStickFigure(ctx, cx, cy, 1.1, s.color, 3);
    } else if (i === 1) {
      // action
      ctx.strokeStyle = '#ff4500';
      ctx.lineWidth = 4;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy - 10, 18 + r * 14 + Math.sin(t * 4) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      drawStickFigure(ctx, cx, cy, 0.9, '#fff', 1);
    } else {
      // finale
      ctx.fillStyle = s.color;
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⭐', cx, cy);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('SLUT!', cx, cy + 28);
    }
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  });

  // speech bubble
  s.bubble.alpha = Math.min(s.bubble.alpha + dt * 0.5, Math.sin(t * 0.7) > 0 ? 1 : 0);
  if (s.bubble.alpha > 0.1) {
    const bx = w * 0.38, by = h * 0.22;
    ctx.globalAlpha = s.bubble.alpha;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.roundRect(bx, by, 120, 40, 12);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(bx + 20, by + 40);
    ctx.lineTo(bx + 10, by + 58);
    ctx.lineTo(bx + 35, by + 40);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('...', bx + 60, by + 26);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

// ─── Scene: kortspel ─────────────────────────────────────────────────────────
function initKortspel(answers) {
  const tema = answers?.tema ?? 'djur';
  const color = TEMA_COLORS[tema] ?? '#66bb6a';
  const temaEmojis = {
    djur: ['🐶','🐱','🐸','🦊'],
    rymden: ['🚀','⭐','🌙','🪐'],
    mat: ['🍕','🍔','🍩','🍦'],
    sport: ['⚽','🏀','🎾','🏈'],
    dinosaurier: ['🦕','🦖','🐉','🦎'],
    superhjältar: ['🦸','⚡','🦹','💥'],
  };
  const icons = temaEmojis[tema] ?? temaEmojis.djur;
  return {
    tema, color, icons,
    cards: Array.from({ length: 6 }, (_, i) => ({
      x: 0.5, y: 0.5, targetX: 0.15 + (i % 3) * 0.28, targetY: i < 3 ? 0.32 : 0.62,
      angle: rand(-0.3, 0.3), faceUp: false, flipT: 0, delay: i * 0.25,
    })),
    score: 0, scoreTick: 0,
    shuffling: false, shuffleT: 0,
  };
}

function drawKortspel(ctx, w, h, s, dt, t) {
  // felt
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
  g.addColorStop(0, '#2d6a2d');
  g.addColorStop(1, '#1a3d1a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const visibleCards = s.streamProgress < 1
    ? s.cards.slice(0, Math.max(2, Math.ceil(s.streamProgress * s.cards.length)))
    : s.cards;
  visibleCards.forEach((c, i) => {
    const age = t - c.delay;
    if (age < 0) return;

    // move to position
    c.x = lerp(c.x, c.targetX, dt * 3);
    c.y = lerp(c.y, c.targetY, dt * 3);

    if (age > 0.5 && !c.faceUp) { c.faceUp = true; c.flipT = 0; }
    if (c.faceUp) c.flipT = Math.min(c.flipT + dt * 2, 1);

    const cx = c.x * w, cy = c.y * h;
    const cw = 70, ch = 96;
    const flipScale = c.faceUp ? Math.cos(Math.PI * (1 - c.flipT)) : 1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(c.angle + Math.sin(t * 0.5 + i) * 0.03);
    ctx.scale(flipScale, 1);

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.roundRect(-cw / 2 + 4, -ch / 2 + 4, cw, ch, 8);
    ctx.fill();

    // card face
    if (c.faceUp && c.flipT > 0.5) {
      ctx.fillStyle = '#fffde7';
      ctx.beginPath();
      ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 8);
      ctx.fill();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.font = '32px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.icons[i % s.icons.length], 0, 0);
    } else {
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.roundRect(-cw / 2, -ch / 2, cw, ch, 8);
      ctx.fill();
      ctx.strokeStyle = '#fff4';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🃏', 0, 0);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  });

  // score
  s.scoreTick += dt;
  if (s.scoreTick > 1.2) { s.score += 50; s.scoreTick = 0; }
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(`♠ ${s.score}`, w - 120, 36);
}

// ─── Scene: bradspel ─────────────────────────────────────────────────────────
function initBradspel(answers) {
  const tema = answers?.tema ?? 'rymden';
  const color = TEMA_COLORS[tema] ?? '#3949ab';
  const squareColors = ['#e53935','#fb8c00','#fdd835','#43a047','#1e88e5','#8e24aa'];
  const path = [];
  // winding path: 14 squares
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    path.push({
      x: 0.5 + 0.34 * Math.cos(angle),
      y: 0.5 + 0.28 * Math.sin(angle),
      color: squareColors[i % squareColors.length],
    });
  }
  return {
    tema, color, path,
    pieces: [
      { pathIdx: 0, t: 0, color: '#e53935' },
      { pathIdx: 3, t: 0, color: '#1e88e5' },
    ],
    dice: { val: 1, rolling: false, rollT: 0, phase: 0 },
    moveTick: 0,
  };
}

function drawBradspel(ctx, w, h, s, dt, t) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#f5f5dc');
  g.addColorStop(1, '#e8e0cc');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // path squares
  s.path.forEach((sq, i) => {
    const px = sq.x * w, py = sq.y * h;
    ctx.fillStyle = sq.color + 'cc';
    ctx.beginPath();
    ctx.roundRect(px - 22, py - 22, 44, 44, 8);
    ctx.fill();
    ctx.strokeStyle = '#fff8';
    ctx.lineWidth = 2;
    ctx.stroke();
    // connect to next
    if (i < s.path.length - 1) {
      const nx = s.path[i + 1].x * w, ny = s.path[i + 1].y * h;
      ctx.strokeStyle = '#aaa6';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // move pieces
  s.moveTick += dt;
  if (s.moveTick > 1.4) {
    s.moveTick = 0;
    s.pieces.forEach(p => {
      p.pathIdx = (p.pathIdx + 1) % s.path.length;
    });
    s.dice.val = 1 + Math.floor(Math.random() * 6);
    s.dice.rolling = true;
    s.dice.rollT = 0;
  }

  // pieces (hop animation)
  s.pieces.forEach(p => {
    const sq = s.path[p.pathIdx];
    const hop = -Math.abs(Math.sin(t * 3 + (p.color === '#e53935' ? 0 : 1))) * 12;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(sq.x * w, sq.y * h + hop, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  // dice
  if (s.dice.rolling) { s.dice.rollT += dt * 6; if (s.dice.rollT > 1) s.dice.rolling = false; }
  const diceVal = s.dice.rolling ? (1 + Math.floor(s.dice.rollT * 4) % 6) : s.dice.val;
  const dx = w - 80, dy = h - 80;
  const diceR = s.dice.rolling ? (Math.sin(s.dice.rollT * 10) * 0.2) : 0;
  ctx.save();
  ctx.translate(dx, dy);
  ctx.rotate(diceR);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(-24, -24, 48, 48, 8);
  ctx.fill();
  ctx.strokeStyle = s.color;
  ctx.lineWidth = 3;
  ctx.stroke();
  const dotPositions = {
    1: [[0,0]], 2: [[-9,-9],[9,9]], 3: [[-9,-9],[0,0],[9,9]],
    4: [[-9,-9],[9,-9],[-9,9],[9,9]], 5: [[-9,-9],[9,-9],[0,0],[-9,9],[9,9]],
    6: [[-9,-9],[9,-9],[-9,0],[9,0],[-9,9],[9,9]],
  };
  ctx.fillStyle = '#333';
  (dotPositions[diceVal] || dotPositions[1]).forEach(([dx2, dy2]) => {
    ctx.beginPath();
    ctx.arc(dx2, dy2, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

// ─── Scene: larospel ─────────────────────────────────────────────────────────
function initLarospel(answers) {
  const amne = answers?.amne ?? 'matte';
  const subjectIcon = {
    matte: '➕', svenska: '📖', geografi: '🌍', natur: '🌱', historia: '🏛', engelska: '🇬🇧',
  };
  const icon = subjectIcon[amne] ?? '❓';
  return {
    amne, icon,
    phase: 0, phaseT: 0,
    stars: [],
    questionAlpha: 0,
    answerAlpha: 0,
  };
}

function drawLarospel(ctx, w, h, s, dt, t) {
  // blackboard
  ctx.fillStyle = '#1b3a1b';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2a5a2a';
  ctx.beginPath();
  ctx.roundRect(w * 0.06, h * 0.08, w * 0.88, h * 0.7, 12);
  ctx.fill();
  // chalk lines
  ctx.strokeStyle = '#ffffff18';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(w * 0.06, h * 0.18 + i * h * 0.1);
    ctx.lineTo(w * 0.94, h * 0.18 + i * h * 0.1);
    ctx.stroke();
  }
  // frame
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 12;
  ctx.strokeRect(w * 0.06, h * 0.08, w * 0.88, h * 0.7);

  // cycling: question -> answer -> stars
  s.phaseT += dt;
  if (s.phaseT > 2.5) { s.phaseT = 0; s.phase = (s.phase + 1) % 3; }

  if (s.phase === 0) {
    // question
    s.questionAlpha = Math.min(s.questionAlpha + dt * 2, 1);
    s.answerAlpha = Math.max(s.answerAlpha - dt * 3, 0);
    ctx.globalAlpha = s.questionAlpha;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 80px serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', w / 2, h * 0.5);
    ctx.font = '36px serif';
    ctx.fillText(s.icon, w / 2, h * 0.25);
  } else if (s.phase === 1) {
    // answer appears
    s.answerAlpha = Math.min(s.answerAlpha + dt * 2, 1);
    ctx.globalAlpha = s.answerAlpha;
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 56px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.icon + ' !', w / 2, h * 0.48);
    // add stars
    if (Math.random() < 0.2) {
      s.stars.push({ x: rand(0.1, 0.9) * w, y: h * 0.6, vy: rand(0.8, 1.5), vx: rand(-0.5, 0.5), alpha: 1, life: 1 });
    }
  } else {
    // stars rain
    if (Math.random() < 0.3) {
      s.stars.push({ x: rand(0.05, 0.95) * w, y: h * 0.12, vy: rand(1, 2.5), vx: rand(-0.8, 0.8), alpha: 1, life: 1 });
    }
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';

  // draw stars
  s.stars = s.stars.filter(st => st.life > 0);
  s.stars.forEach(st => {
    st.y += st.vy * dt * h * 0.4;
    st.x += st.vx * dt * 20;
    st.life -= dt * 0.4;
    ctx.globalAlpha = Math.max(0, st.life);
    ctx.fillStyle = '#ffd700';
    ctx.font = '22px serif';
    ctx.fillText('⭐', st.x, st.y);
  });
  ctx.globalAlpha = 1;
}

// ─── Scene: rostlab ──────────────────────────────────────────────────────────
function initRostlab(answers) {
  const effekt = answers?.effekt ?? 'robot';
  const effektLabels = {
    robot: 'ROBOT', chipmunk: 'CHIPMUNK', monster: 'MONSTER',
    echo: 'ECHO', reverb: 'REVERB', pitchupp: 'PITCH+',
  };
  const effektColors = {
    robot: '#00e5ff', chipmunk: '#ff9800', monster: '#e53935',
    echo: '#7c4dff', reverb: '#00bcd4', pitchupp: '#76ff03',
  };
  return {
    effekt,
    label: effektLabels[effekt] ?? effekt.toUpperCase(),
    color: effektColors[effekt] ?? '#00e5ff',
    rings: [],
    wavePhase: 0,
    bars: Array.from({ length: 24 }, (_, i) => ({ phase: i * 0.3 })),
    textMorphT: 0,
  };
}

function drawRostlab(ctx, w, h, s, dt, t) {
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, w, h);

  // mic
  const mx = w / 2, my = h * 0.38;
  ctx.fillStyle = '#444';
  ctx.beginPath();
  ctx.roundRect(mx - 14, my - 38, 28, 56, 14);
  ctx.fill();
  ctx.fillStyle = s.color;
  ctx.beginPath();
  ctx.roundRect(mx - 10, my - 32, 20, 44, 10);
  ctx.fill();
  // mic stand
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(mx, my + 20);
  ctx.lineTo(mx, my + 65);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(mx - 28, my + 65);
  ctx.lineTo(mx + 28, my + 65);
  ctx.stroke();
  // grille lines
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(mx - 10, my - 26 + i * 10);
    ctx.lineTo(mx + 10, my - 26 + i * 10);
    ctx.stroke();
  }

  // radiating rings
  if (Math.random() < 0.08) {
    s.rings.push({ r: 20, alpha: 0.8, life: 1 });
  }
  s.rings = s.rings.filter(r => r.life > 0);
  s.rings.forEach(r => {
    r.r += dt * 120;
    r.life -= dt * 0.7;
    ctx.globalAlpha = Math.max(0, r.life * 0.7);
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(mx, my - 10, r.r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // waveform
  const wy = h * 0.75;
  ctx.strokeStyle = s.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 0; x < w; x += 3) {
    const amp = 28 * Math.sin(x * 0.04 + t * 5) * Math.sin(x * 0.01);
    if (x === 0) ctx.moveTo(x, wy + amp);
    else ctx.lineTo(x, wy + amp);
  }
  ctx.stroke();

  // floating effect label
  const scale = 1 + 0.05 * Math.sin(t * 3);
  const ly = h * 0.88 + Math.sin(t * 1.5) * 6;
  ctx.save();
  ctx.translate(w / 2, ly);
  ctx.scale(scale, scale);
  ctx.fillStyle = s.color;
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = s.color;
  ctx.shadowBlur = 16;
  ctx.fillText(s.label, 0, 0);
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowBlur = 0;
}

// ─── Scene: animation ─────────────────────────────────────────────────────────
const ANIM_CHAR_EMOJIS = {
  ninja: '🥷', robot: '🤖', katt: '🐱', dinosaurie: '🦕',
  enhörning: '🦄', pirat: '🏴‍☠️', astronaut: '👨‍🚀', drake: '🐉',
  haj: '🦈', häxa: '🧙', haxan: '🧙‍♀️', superhjälte: '🦸', enhornin: '🦄',
  bjorn: '🐻', pingvin: '🐧', rymdalien: '👽', delfin: '🐬',
};

function initAnimation(answers) {
  const karaktar = answers?.karaktar ?? 'ninja';
  const bakgrund = answers?.bakgrund ?? 'rymden';
  const rorelse = answers?.rorelse ?? 'hoppa';
  const effekter = answers?.effekter ?? 'stjarnor';
  // fuzzy match character key
  const charKey = Object.keys(ANIM_CHAR_EMOJIS).find(k => karaktar?.toLowerCase().includes(k)) ?? 'ninja';
  const charEmoji = ANIM_CHAR_EMOJIS[charKey] ?? '🥷';
  const particles = Array.from({ length: 30 }, () => ({
    x: rand(0, 1), y: rand(0, 1),
    vx: rand(-0.4, 0.4), vy: rand(-0.6, -0.1),
    size: rand(4, 12), alpha: rand(0.4, 1),
    phase: Math.random() * Math.PI * 2,
    life: Math.random(),
  }));
  return { karaktar, charEmoji, bakgrund, rorelse, effekter, particles, charX: 0.5, charY: 0.55, figureT: 0, flyAngle: 0 };
}

function drawAnimation(ctx, w, h, s, dt, t) {
  const wc = WORLD_COLORS[s.bakgrund] ?? WORLD_COLORS.rymden;
  drawGradientBg(ctx, w, h, wc.top, wc.bot);

  // stars for rymden
  if (s.bakgrund === 'rymden' || s.bakgrund === 'dromvarlden') {
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 137.5) % 1) * w;
      const sy = ((i * 97.3) % 1) * h * 0.7;
      const a = 0.4 + 0.6 * Math.abs(Math.sin(t + i));
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ground
  ctx.fillStyle = wc.bot + 'aa';
  ctx.fillRect(0, h * 0.82, w, h * 0.18);

  // character position based on rorelse
  let cx = s.charX * w, cy;
  s.figureT += dt;

  switch (s.rorelse) {
    case 'hoppa':
      cy = h * 0.62 - Math.abs(Math.sin(s.figureT * 2.5)) * h * 0.22;
      break;
    case 'dansa':
      cx = w / 2 + Math.sin(s.figureT * 2) * 40;
      cy = h * 0.62 + Math.sin(s.figureT * 4) * 10;
      break;
    case 'flyga': {
      s.flyAngle += dt * 1.2;
      cx = w / 2 + Math.cos(s.flyAngle) * w * 0.28;
      cy = h * 0.45 + Math.sin(s.flyAngle * 2) * h * 0.15;
      break;
    }
    case 'snurra':
      cx = w / 2;
      cy = h * 0.55;
      break;
    case 'vinka':
      cx = w / 2;
      cy = h * 0.62;
      break;
    case 'springa':
      cx = (((s.figureT * 0.15) % 1.2) - 0.1) * w;
      cy = h * 0.62;
      break;
    case 'simma':
      cx = w / 2 + Math.sin(s.figureT * 1.5) * w * 0.3;
      cy = h * 0.52 + Math.sin(s.figureT * 3) * h * 0.04;
      break;
    case 'smyga':
      cx = (((s.figureT * 0.08) % 1.2) - 0.1) * w;
      cy = h * 0.68 + Math.sin(s.figureT * 1.5) * h * 0.025;
      break;
    case 'studsa':
      cx = w / 2 + Math.sin(s.figureT * 2.2) * w * 0.15;
      cy = h * 0.62 - Math.abs(Math.sin(s.figureT * 5)) * h * 0.14;
      break;
    default:
      cy = h * 0.62;
  }

  const rotate = s.rorelse === 'snurra' ? s.figureT * 3 : 0;
  const emojiSize = Math.round(Math.min(w, h) * 0.18);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotate);
  ctx.font = `${emojiSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s.charEmoji, 0, 0);
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // character name label at bottom
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `bold ${Math.round(w * 0.055)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(s.karaktar, w / 2, h * 0.93);
  ctx.textAlign = 'left';

  // particles / effects
  const effColors = {
    konfetti:  ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6'],
    stjarnor:  ['#ffd700','#fff','#fffacd'],
    eld:       ['#ff4500','#ff8c00','#ffd700'],
    bubblor:   ['#aef','#bdf','#cef'],
    regnbage:  ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#3498db','#9b59b6'],
    blixt:     ['#fff','#ffff00','#00ffff'],
    sno:       ['#e0f7fa','#b3e5fc','#fff','#e1f5fe'],
    hjartan:   ['#ff69b4','#ff1493','#ffb6c1','#ff69b4'],
    musik:     ['#ffd700','#ff69b4','#00e5ff','#9c27b0'],
    magi:      ['#ea80fc','#e040fb','#fff','#ffeb3b'],
  };
  const pColors = effColors[s.effekter] ?? effColors.stjarnor;

  const fallDown = s.effekter === 'sno';
  s.particles.forEach(p => {
    p.x += p.vx * dt * 0.3;
    p.y += (fallDown ? 1 : 1) * p.vy * dt * 0.3;
    p.life -= dt * 0.3;
    const offscreen = fallDown ? p.y > 1.05 : p.y < -0.1;
    if (p.life <= 0 || offscreen || p.x < -0.1 || p.x > 1.1) {
      if (s.effekter === 'eld') {
        p.x = cx / w; p.y = cy / h;
      } else if (fallDown) {
        p.x = rand(0, 1); p.y = -0.05;
      } else {
        p.x = rand(0, 1); p.y = rand(0.3, 0.9);
      }
      p.life = 1;
      p.vy = fallDown ? rand(0.15, 0.45) : rand(-0.6, -0.1);
      p.vx = rand(-0.15, 0.15);
    }
    const color = pColors[Math.floor(p.x * pColors.length) % pColors.length];
    const a = p.life * 0.8;
    ctx.globalAlpha = a;
    if (s.effekter === 'bubblor') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
      ctx.stroke();
    } else if (s.effekter === 'blixt') {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x * w, p.y * h);
      ctx.lineTo(p.x * w + rand(-10, 10), p.y * h + rand(10, 20));
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.font = `${p.size + 4}px serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      if (s.effekter === 'stjarnor' || s.effekter === 'regnbage') {
        ctx.fillText('★', p.x * w, p.y * h);
      } else if (s.effekter === 'sno') {
        ctx.fillText('❄', p.x * w, p.y * h);
      } else if (s.effekter === 'hjartan') {
        ctx.fillText('♥', p.x * w, p.y * h);
      } else if (s.effekter === 'musik') {
        ctx.fillText(p.life > 0.5 ? '♪' : '♫', p.x * w, p.y * h);
      } else if (s.effekter === 'magi') {
        ctx.fillText('✦', p.x * w, p.y * h);
      } else {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
    }
  });
  ctx.globalAlpha = 1;
}

// ─── Scene: hemsida ───────────────────────────────────────────────────────────
function initHemsida(answers) {
  const tema = answers?.tema ?? 'bla';
  const color = HEMSIDA_TEMA[tema] ?? '#42a5f5';
  const furniture = [
    { type: 'desk',  x: 0.15, y: 0.55, revealed: 0, delay: 0.2 },
    { type: 'plant', x: 0.75, y: 0.62, revealed: 0, delay: 0.7 },
    { type: 'poster',x: 0.5,  y: 0.22, revealed: 0, delay: 1.2 },
    { type: 'lamp',  x: 0.85, y: 0.4,  revealed: 0, delay: 1.7 },
    { type: 'rug',   x: 0.5,  y: 0.78, revealed: 0, delay: 2.2 },
  ];
  return { tema, color, furniture, charX: -0.1 };
}

function drawHemsida(ctx, w, h, s, dt, t) {
  // room bg
  ctx.fillStyle = s.color + '33';
  ctx.fillRect(0, 0, w, h);
  // wall
  ctx.fillStyle = s.color + '55';
  ctx.fillRect(0, 0, w, h * 0.72);
  // floor
  ctx.fillStyle = '#c8a96e';
  ctx.fillRect(0, h * 0.72, w, h * 0.28);
  // floor planks
  ctx.strokeStyle = '#b8995e';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72 + i * 12);
    ctx.lineTo(w, h * 0.72 + i * 12);
    ctx.stroke();
  }
  // window
  ctx.fillStyle = '#87ceeb88';
  ctx.fillRect(w * 0.62, h * 0.08, w * 0.2, h * 0.25);
  ctx.strokeStyle = s.color;
  ctx.lineWidth = 4;
  ctx.strokeRect(w * 0.62, h * 0.08, w * 0.2, h * 0.25);
  // cross
  ctx.beginPath();
  ctx.moveTo(w * 0.72, h * 0.08); ctx.lineTo(w * 0.72, h * 0.33);
  ctx.moveTo(w * 0.62, h * 0.205); ctx.lineTo(w * 0.82, h * 0.205);
  ctx.stroke();

  // furniture
  s.furniture.forEach(f => {
    f.revealed = Math.min(f.revealed + dt * 1.2, Math.max(0, t - f.delay) > 0 ? 1 : 0);
    if (f.revealed <= 0) return;
    ctx.globalAlpha = f.revealed;
    const fx = f.x * w, fy = f.y * h;
    ctx.fillStyle = s.color;
    if (f.type === 'desk') {
      ctx.fillRect(fx - 50, fy, 100, 10);
      ctx.fillRect(fx - 44, fy + 10, 10, 30);
      ctx.fillRect(fx + 34, fy + 10, 10, 30);
    } else if (f.type === 'plant') {
      ctx.fillStyle = '#4caf50';
      ctx.beginPath(); ctx.arc(fx, fy - 18, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#795548';
      ctx.fillRect(fx - 8, fy - 10, 16, 20);
    } else if (f.type === 'poster') {
      ctx.fillStyle = s.color + 'bb';
      ctx.fillRect(fx - 30, fy, 60, 40);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(fx - 30, fy, 60, 40);
      ctx.font = '20px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.fillText('★', fx, fy + 28);
      ctx.textAlign = 'left';
    } else if (f.type === 'lamp') {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(fx - 16, fy);
      ctx.lineTo(fx + 16, fy);
      ctx.lineTo(fx + 8, fy + 24);
      ctx.lineTo(fx - 8, fy + 24);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fx, fy + 24);
      ctx.lineTo(fx, fy + 70);
      ctx.stroke();
    } else if (f.type === 'rug') {
      ctx.fillStyle = s.color + 'aa';
      ctx.beginPath();
      ctx.ellipse(fx, fy, 80, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });

  // character walks in
  s.charX = Math.min(s.charX + dt * 0.06, 0.72);
  const charY = h * 0.72;
  drawStickFigure(ctx, s.charX * w, charY, 1.1, s.color, 3);
}

// ─── Scene: quiz ─────────────────────────────────────────────────────────────
function initQuiz(answers) {
  const amne = answers?.amne || 'djur';
  const amneEmojis = { djur:'🐾', mat:'🍕', sport:'⚽', film:'🎬', musik:'🎵', geografi:'🌍' };
  const emoji = amneEmojis[amne] || '🧠';
  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    label: ['?','!','A','B','C','D'][i % 6],
    x: Math.random(), y: Math.random(),
    vx: rand(-0.02, 0.02), vy: rand(-0.03, -0.01),
    r: rand(18, 32),
    phase: Math.random() * Math.PI * 2,
    color: ['#e67e22','#f1c40f','#e74c3c','#3498db','#2ecc71','#9b59b6'][i % 6],
  }));
  return { amne, emoji, bubbles };
}

function drawQuiz(ctx, w, h, s, dt, t) {
  ctx.fillStyle = '#1a0a00';
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, w * 0.6);
  glow.addColorStop(0, '#e67e2230');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Floating quiz bubbles
  s.bubbles.forEach(b => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.y < -0.1) { b.y = 1.05; b.x = Math.random(); }
    if (b.x < -0.1 || b.x > 1.1) b.vx *= -1;

    const scale = 0.85 + 0.15 * Math.sin(t * 1.5 + b.phase);
    ctx.save();
    ctx.translate(b.x * w, b.y * h);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(0, 0, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.round(b.r * 0.9)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label, 0, 1);
    ctx.restore();
    ctx.globalAlpha = 1;
  });

  // Big brain emoji center
  const pulse = 1 + 0.06 * Math.sin(t * 2);
  const emojiSize = Math.round(Math.min(w, h) * 0.22);
  ctx.save();
  ctx.translate(w / 2, h * 0.45);
  ctx.scale(pulse, pulse);
  ctx.font = `${emojiSize}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s.emoji, 0, 0);
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ─── Scene: pixelart ─────────────────────────────────────────────────────────
function initPixelart(answers) {
  const palName = (answers?.palett || 'regnbage').toLowerCase();
  const PALETTE_SAMPLES = {
    regnbage: ['#e74c3c','#f1c40f','#2ecc71','#3498db','#9b59b6'],
    neon:     ['#ff00ff','#00ffff','#39ff14','#ff69b4','#ffff00'],
    pastell:  ['#ffb3ba','#baffc9','#bae1ff','#ffffba','#e8baff'],
    svartvit: ['#000','#333','#666','#999','#fff'],
    havet:    ['#001a3e','#0080ff','#00b4ba','#cbf3f0','#ffffff'],
    brand:    ['#e60000','#ff8c00','#ffd700','#ffffff','#333333'],
    skog:     ['#1a3d1a','#5cb85c','#a5d6a7','#795548','#fff8e1'],
  };
  const colors = PALETTE_SAMPLES[palName] || PALETTE_SAMPLES.regnbage;
  const GRID = 8; // tiny preview grid
  const pixels = Array.from({ length: GRID * GRID }, () =>
    Math.random() < 0.4 ? colors[Math.floor(Math.random() * colors.length)] : null
  );
  return { colors, pixels, GRID, drawT: 0, cursor: { x: 0, y: 0, vx: 2, vy: 1.5 } };
}

function drawPixelart(ctx, w, h, s, dt, t) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, w, h);

  const cellSize = Math.min(w, h) * 0.55 / s.GRID;
  const offX = (w - cellSize * s.GRID) / 2;
  const offY = (h - cellSize * s.GRID) / 2;

  // Slowly fill pixels
  s.drawT += dt * 3;
  const filled = Math.min(Math.floor(s.drawT), s.GRID * s.GRID);
  for (let i = 0; i < filled; i++) {
    if (!s.pixels[i]) continue;
    const gx = i % s.GRID, gy = Math.floor(i / s.GRID);
    ctx.fillStyle = s.pixels[i];
    ctx.fillRect(offX + gx * cellSize + 1, offY + gy * cellSize + 1, cellSize - 2, cellSize - 2);
  }

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= s.GRID; x++) {
    ctx.beginPath(); ctx.moveTo(offX + x * cellSize, offY); ctx.lineTo(offX + x * cellSize, offY + s.GRID * cellSize); ctx.stroke();
  }
  for (let y = 0; y <= s.GRID; y++) {
    ctx.beginPath(); ctx.moveTo(offX, offY + y * cellSize); ctx.lineTo(offX + s.GRID * cellSize, offY + y * cellSize); ctx.stroke();
  }

  // Moving cursor
  s.cursor.x += s.cursor.vx * dt * 40;
  s.cursor.y += s.cursor.vy * dt * 30;
  if (s.cursor.x < offX || s.cursor.x > offX + s.GRID * cellSize) s.cursor.vx *= -1;
  if (s.cursor.y < offY || s.cursor.y > offY + s.GRID * cellSize) s.cursor.vy *= -1;

  // Pencil cursor
  ctx.fillStyle = '#ffd700';
  ctx.font = `${Math.round(cellSize * 1.6)}px serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText('✏️', s.cursor.x, s.cursor.y);

  // Palette swatches below grid
  const swSize = Math.round(Math.min(w, h) * 0.06);
  const swGap = 6;
  const swTotal = s.colors.length * (swSize + swGap) - swGap;
  const swX0 = (w - swTotal) / 2;
  const swY = offY + s.GRID * cellSize + 16;
  s.colors.forEach((c, i) => {
    const pulse = 1 + 0.1 * Math.sin(t * 2 + i * 0.8);
    const sz = swSize * pulse;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.roundRect(swX0 + i * (swSize + swGap) + (swSize - sz) / 2, swY + (swSize - sz) / 2, sz, sz, 4);
    ctx.fill();
    ctx.strokeStyle = '#fff4';
    ctx.lineWidth = 1;
    ctx.stroke();
  });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ─── Scene: berattelse ───────────────────────────────────────────────────────
const GENRE_EMOJIS = {
  aventyr: ['⚔️','🗺️','🏰','🐉','💎'],
  komedi:  ['😂','🤡','🎭','💥','🤪'],
  skrack:  ['👻','🕷️','🦇','💀','🌑'],
  saga:    ['🧙','✨','🌟','🦄','🌈'],
  scifi:   ['🚀','👽','🤖','⭐','🌌'],
  karlekshistoria: ['❤️','🌹','💫','🦋','🌸'],
};

function initBerattelse(answers) {
  const genre = (answers?.genre || 'aventyr').toLowerCase();
  const emojis = GENRE_EMOJIS[genre] || GENRE_EMOJIS.aventyr;
  const particles = Array.from({ length: 20 }, (_, i) => ({
    emoji: emojis[i % emojis.length],
    x: Math.random(),
    y: Math.random(),
    vx: rand(-0.015, 0.015),
    vy: rand(-0.025, -0.005),
    phase: Math.random() * Math.PI * 2,
    size: rand(18, 36),
  }));
  return { genre, emojis, particles, pageT: 0, pageFlip: 0 };
}

function drawBerattelse(ctx, w, h, s, dt, t) {
  // Dark gradient background
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#0d1f3c');
  g.addColorStop(1, '#1a3a6e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Floating genre emojis
  s.particles.forEach(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.y < -0.1) { p.y = 1.05; p.x = Math.random(); }
    if (p.x < -0.1 || p.x > 1.1) p.vx *= -1;
    const scale = 0.8 + 0.2 * Math.sin(t * 1.5 + p.phase);
    ctx.save();
    ctx.translate(p.x * w, p.y * h);
    ctx.scale(scale, scale);
    ctx.globalAlpha = 0.5;
    ctx.font = `${p.size}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.emoji, 0, 0);
    ctx.restore();
  });
  ctx.globalAlpha = 1;

  // Book shape
  const bx = w * 0.5, by = h * 0.5;
  const bw = w * 0.6, bh = h * 0.55;
  s.pageFlip += dt * 0.8;

  // Left page
  ctx.fillStyle = '#fffde7';
  ctx.beginPath();
  ctx.roundRect(bx - bw / 2, by - bh / 2, bw / 2 - 2, bh, [8, 0, 0, 8]);
  ctx.fill();

  // Right page (with page turn ripple)
  const ripple = Math.sin(s.pageFlip) * 4;
  ctx.fillStyle = '#fff8e1';
  ctx.beginPath();
  ctx.moveTo(bx + 2, by - bh / 2);
  ctx.lineTo(bx + bw / 2, by - bh / 2);
  ctx.arcTo(bx + bw / 2, by - bh / 2, bx + bw / 2, by + bh / 2, 8);
  ctx.lineTo(bx + bw / 2, by + bh / 2);
  ctx.arcTo(bx + bw / 2, by + bh / 2, bx + 2, by + bh / 2, 8);
  ctx.bezierCurveTo(bx + bw * 0.3, by + bh / 2 + ripple, bx + 2, by + ripple, bx + 2, by - bh / 2);
  ctx.closePath();
  ctx.fill();

  // Spine
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(bx - 3, by - bh / 2, 6, bh);

  // Lines on left page
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const ly = by - bh * 0.35 + i * bh * 0.1;
    ctx.beginPath();
    ctx.moveTo(bx - bw * 0.43, ly);
    ctx.lineTo(bx - bw * 0.07, ly);
    ctx.stroke();
  }

  // Lines on right page
  for (let i = 0; i < 6; i++) {
    const ly = by - bh * 0.35 + i * bh * 0.1;
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.07, ly);
    ctx.lineTo(bx + bw * 0.43, ly);
    ctx.stroke();
  }

  // Big emoji on left page
  const emojiIdx = Math.floor(t * 0.6) % s.emojis.length;
  ctx.font = `${Math.round(bh * 0.32)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.8;
  ctx.fillText(s.emojis[emojiIdx], bx - bw * 0.25, by);
  ctx.globalAlpha = 1;

  // Shadow under book
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(bx, by + bh / 2 + 10, bw * 0.45, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ─── Scene dispatcher ─────────────────────────────────────────────────────────
const SCENES = {
  spel:       { init: initSpel,       draw: drawSpel },
  musik:      { init: initMusik,      draw: drawMusik },
  ritprogram: { init: initRitprogram, draw: drawRitprogram },
  filmstudio: { init: initFilmstudio, draw: drawFilmstudio },
  kortspel:   { init: initKortspel,   draw: drawKortspel },
  bradspel:   { init: initBradspel,   draw: drawBradspel },
  larospel:   { init: initLarospel,   draw: drawLarospel },
  rostlab:    { init: initRostlab,    draw: drawRostlab },
  animation:  { init: initAnimation,  draw: drawAnimation },
  hemsida:    { init: initHemsida,    draw: drawHemsida },
  berattelse: { init: initBerattelse, draw: drawBerattelse },
  pixelart:   { init: initPixelart,   draw: drawPixelart },
  quiz:       { init: initQuiz,       draw: drawQuiz },
};

// ─── Building animation styles ────────────────────────────────────────────────
const buildingStyles = `
@keyframes bounce {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-12px); }
}
@keyframes spinGear {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes fadeInTool {
  0%   { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}
`;

// ─── Animated dots ────────────────────────────────────────────────────────────
function AnimatedDots() {
  const [frame, setFrame] = React.useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % 4), 500);
    return () => clearInterval(id);
  }, []);
  return <span aria-hidden="true">{'...'.slice(0, (frame % 3) + 1)}</span>;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PlaygroundScreen({ category, answers, navigate }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);
  const rafRef    = useRef(null);
  const lastRef   = useRef(null);
  const startRef  = useRef(null);
  const abortRef  = useRef(null);

  const wizConfig = WIZARD_CONFIG[category] ?? {};
  const catLabel = wizConfig.label ?? category;
  const catEmoji = wizConfig.emoji ?? '⚙️';

  function getThumb() {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    try { return canvas.toDataURL('image/jpeg', 0.6); } catch { return ''; }
  }

  // Generation via SSE
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    async function generate() {
      const prompt = buildPrompt(category, answers ?? {}, 'skapelse');
      let detectedFile = null;
      let accText = '';

      // Progressive reveal: increment streamProgress every 500ms while streaming
      if (stateRef.current) stateRef.current.streamProgress = 0.05;
      const progressInterval = setInterval(() => {
        if (stateRef.current) {
          stateRef.current.streamProgress = Math.min(
            (stateRef.current.streamProgress || 0) + 0.08,
            0.95
          );
        }
      }, 500);
      try {
        const resp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt }),
          signal: controller.signal,
        });
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const obj = JSON.parse(line.slice(6));
              if (obj.type === 'text') accText += obj.text;
              if (obj.type === 'file') detectedFile = obj.file;
              if (obj.type === 'done') {
                if (category === 'spel') {
                  // Parse title from JSON response, then render template
                  let title = 'Mitt Spel';
                  try {
                    const parsed = JSON.parse(accText.trim());
                    if (parsed.title) title = parsed.title;
                  } catch {}
                  const speltyp = answers?.speltyp ?? '';
                  const isRunner = speltyp.toLowerCase().includes('runner');
                  const isObby   = speltyp.toLowerCase().includes('obby');
                  const config = isRunner
                    ? getRunnerConfig(answers ?? {}, title)
                    : isObby
                    ? getObbyConfig(answers ?? {}, title)
                    : getSpelConfig(answers ?? {}, title);
                  const templateName = isRunner ? 'runner' : isObby ? 'obby' : 'platform';
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName, config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'kortspel' && answers?.speltyp === 'memory') {
                  let title = 'Memory';
                  try {
                    const parsed = JSON.parse(accText.trim());
                    if (parsed.title) title = parsed.title;
                  } catch {}
                  const config = getMemoryConfig(answers ?? {}, title);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'memory', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'kortspel' && answers?.speltyp === 'snap') {
                  let title = 'Snap!';
                  try { const p = JSON.parse(accText.trim()); if (p.title) title = p.title; } catch {}
                  const config = getSnapConfig(answers ?? {}, title);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'snap', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'kortspel' && answers?.speltyp === 'toptrumps') {
                  let title = 'Top Trumps';
                  try { const p = JSON.parse(accText.trim()); if (p.title) title = p.title; } catch {}
                  const config = getTopTrumpsConfig(answers ?? {}, title);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'toptrumps', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'musik') {
                  let title = 'Musik Studio';
                  try {
                    const parsed = JSON.parse(accText.trim());
                    if (parsed.title) title = parsed.title;
                  } catch {}
                  const config = getMusicConfig(answers ?? {}, title);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'musik', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'hemsida') {
                  let title = 'Min Hemsida';
                  try {
                    const parsed = JSON.parse(accText.trim());
                    if (parsed.title) title = parsed.title;
                  } catch {}
                  const config = getHemsidaConfig(answers ?? {}, title);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'hemsida', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'bradspel') {
                  let title = 'Brädspel';
                  try {
                    const parsed = JSON.parse(accText.trim());
                    if (parsed.title) title = parsed.title;
                  } catch {}
                  const config = getBradspelConfig(answers ?? {}, title);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'bradspel', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'larospel') {
                  let title = 'Quiz';
                  try {
                    const parsed = JSON.parse(accText.trim());
                    if (parsed.title) title = parsed.title;
                  } catch {}
                  const config = getLarospelConfig(answers ?? {}, title);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'larospel', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'filmstudio') {
                  let title = 'Min Film';
                  try {
                    const parsed = JSON.parse(accText.trim());
                    if (parsed.title) title = parsed.title;
                  } catch {}
                  const config = getFilmstudioConfig(answers ?? {}, title);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'filmstudio', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'rostlab') {
                  let title = 'Rostlab';
                  try {
                    const parsed = JSON.parse(accText.trim());
                    if (parsed.title) title = parsed.title;
                  } catch {}
                  const config = getRostlabConfig(answers ?? {}, title);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'rostlab', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'quiz') {
                  let title = 'Mitt Quiz';
                  try { const p = JSON.parse(accText.trim()); if (p.title) title = p.title; } catch {}
                  const config = getQuizConfig(answers ?? {}, title);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'quiz', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'pixelart') {
                  let title = 'Pixel Art';
                  try { const p = JSON.parse(accText.trim()); if (p.title) title = p.title; } catch {}
                  const config = getPixelartConfig(answers ?? {}, title);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'pixelart', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'berattelse') {
                  let title = 'Min Berattelse';
                  let chaptersJson = '[]';
                  try {
                    const parsed = JSON.parse(accText.trim());
                    if (parsed.title) title = parsed.title;
                    if (parsed.chapters) chaptersJson = JSON.stringify(parsed.chapters);
                  } catch {}
                  const config = getBeratelseConfig(answers ?? {}, title, chaptersJson);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'berattelse', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                if (category === 'animation') {
                  let title = 'Animation';
                  try {
                    const parsed = JSON.parse(accText.trim());
                    if (parsed.title) title = parsed.title;
                  } catch {}
                  const config = getAnimationConfig(answers ?? {}, title);
                  const renderResp = await fetch('/api/render-template', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ templateName: 'animation', config }),
                    signal: controller.signal,
                  });
                  const renderData = await renderResp.json();
                  clearInterval(progressInterval);
                  if (stateRef.current) stateRef.current.streamProgress = 1;
                  if (renderData.file) {
                    navigate('result', { category, answers, file: renderData.file, thumb: getThumb() });
                  } else {
                    navigate('result', { category, answers, error: true });
                  }
                  return;
                }
                clearInterval(progressInterval);
                if (stateRef.current) stateRef.current.streamProgress = 1;
                navigate('result', { category, answers, file: detectedFile, thumb: getThumb() });
                return;
              }
              if (obj.type === 'error') {
                clearInterval(progressInterval);
                navigate('result', { category, answers, error: true });
                return;
              }
            } catch {}
          }
        }
      } catch (err) {
        clearInterval(progressInterval);
        if (err.name === 'AbortError') return;
        navigate('result', { category, answers, error: true });
      }
    }

    generate();

    return () => {
      controller.abort();
    };
  }, [category]);

  // Canvas animation
  useEffect(() => {
    const scene = SCENES[category];
    if (!scene) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    stateRef.current = scene.init(answers ?? {});
    stateRef.current.streamProgress = 0.05;
    startRef.current = null;
    lastRef.current = null;

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function loop(ts) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const dt = lastRef.current ? Math.min((ts - lastRef.current) / 1000, 0.05) : 0.016;
      lastRef.current = ts;

      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      scene.draw(ctx, w, h, stateRef.current, dt, elapsed);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [category]);

  return (
    <>
      <style>{buildingStyles}</style>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
        {/* Full-screen canvas */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        />

        {/* Back button — always visible */}
        <button
          onClick={() => { abortRef.current?.abort(); navigate('wizard', { category, answers }); }}
          style={{
            position: 'absolute', top: 16, left: 16,
            background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 10, color: '#fff', fontSize: '0.9rem', fontWeight: 600,
            padding: '8px 16px', cursor: 'pointer', backdropFilter: 'blur(4px)',
            zIndex: 10,
          }}
        >
          ← Tillbaka
        </button>

        {/* Centered building animation overlay */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 5,
          pointerEvents: 'none',
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.60)',
            backdropFilter: 'blur(12px)',
            borderRadius: 24,
            padding: '32px 44px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            minWidth: 280, maxWidth: 360,
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            position: 'relative',
          }}>
            {/* Slow-spinning gear behind emoji */}
            <div style={{
              position: 'absolute', fontSize: 96, opacity: 0.08,
              animation: 'spinGear 8s linear infinite',
              userSelect: 'none', pointerEvents: 'none',
            }}>
              ⚙️
            </div>

            {/* Bouncing category emoji */}
            <div style={{
              fontSize: 64, lineHeight: 1,
              animation: 'bounce 1.2s ease-in-out infinite',
              position: 'relative',
            }}>
              {catEmoji}
            </div>

            {/* Title */}
            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
              Bygger ditt {catLabel}...
            </div>

            {/* Tool icons appearing one by one */}
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <span style={{
                fontSize: 28,
                opacity: 0,
                animation: 'fadeInTool 0.4s ease forwards 1s',
              }}>🔧</span>
              <span style={{
                fontSize: 28,
                opacity: 0,
                animation: 'fadeInTool 0.4s ease forwards 2s',
              }}>⚙️</span>
              <span style={{
                fontSize: 28,
                opacity: 0,
                animation: 'fadeInTool 0.4s ease forwards 3s',
              }}>✨</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
