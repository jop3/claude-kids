import { useRef, useEffect } from 'react';

const THEMES = {
  rymden:  { bg: '#0d1b2a', ground: null },
  havet:   { bg: '#006994', ground: '#1a4a6b' },
  djungeln:{ bg: '#1a3a1a', ground: '#2d5a1a' },
  default: { bg: '#1a1a2e', ground: '#2d2d5a' },
};

function hexToRgb(hex) {
  if (!hex) return null;
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;
  const r = parseInt(clean.slice(0,2), 16);
  const g = parseInt(clean.slice(2,4), 16);
  const b = parseInt(clean.slice(4,6), 16);
  return { r, g, b };
}

function lerp(a, b, t) { return a + (b - a) * t; }

const NOTE_SYMBOLS = ['♩', '♪', '♫', '♬'];
const NOTE_COLORS = ['#a78bfa', '#f472b6', '#4ecdc4', '#f59e0b', '#818cf8'];

const ART_SPLASH_COLORS = ['#e94560','#f18f01','#3bb273','#2d7dd2','#6c3bbd','#ff6b6b','#ffe66d','#4ecdc4'];

export default function Playground({ category, theme = 'default', color, bpm = 120, addedBlocks = [], isPlaying = false, celebrate = false }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  // Keep live props accessible in animation loop without restarting
  const propsRef = useRef({ color, bpm, addedBlocks, isPlaying, celebrate });
  useEffect(() => {
    propsRef.current = { color, bpm, addedBlocks, isPlaying, celebrate };
  }, [color, bpm, addedBlocks, isPlaying, celebrate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Initialize persistent state once
    if (!stateRef.current) {
      const stars = Array.from({ length: 50 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
      }));

      const notes = Array.from({ length: 6 }, (_, i) => ({
        x: 0.15 + (i % 3) * 0.3,
        y: 0.4 + Math.floor(i / 3) * 0.3,
        vy: -(0.001 + Math.random() * 0.001),
        alpha: 0.7 + Math.random() * 0.3,
        size: 16 + Math.random() * 10,
        phase: Math.random() * Math.PI * 2,
      }));

      const splashes = Array.from({ length: 8 }, (_, i) => ({
        x: 0.1 + Math.random() * 0.8,
        y: 0.15 + Math.random() * 0.6,
        r: 15 + Math.random() * 30,
        hue: (i * 45) % 360,
        phase: Math.random() * Math.PI * 2,
        pulsate: 0.3 + Math.random() * 0.4,
      }));

      const platforms = [
        { x: 0.55, y: 0.55, w: 0.18 },
        { x: 0.25, y: 0.45, w: 0.15 },
        { x: 0.65, y: 0.35, w: 0.12 },
      ];

      // Floating music notes for musik category
      const floatingNotes = Array.from({ length: 8 }, () => ({
        x: 0.3 + Math.random() * 0.4,
        y: 0.5 + Math.random() * 0.3,
        vy: 0,
        alpha: 0,
        size: 16 + Math.random() * 16,
        symbol: NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)],
        colorIdx: Math.floor(Math.random() * NOTE_COLORS.length),
        drift: (Math.random() - 0.5) * 0.0008,
        active: false,
        spawnAt: Math.random() * 3,
      }));

      // Art / ritprogram state
      const artPaintStrokes = [];
      const artSplashes = [];
      const artDrops = Array.from({ length: 12 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 4 + Math.random() * 4,
        color: ART_SPLASH_COLORS[Math.floor(Math.random() * ART_SPLASH_COLORS.length)],
        vy: 0.0008 + Math.random() * 0.0006,
        drift: (Math.random() - 0.5) * 0.0003,
        alpha: 0.6 + Math.random() * 0.4,
      }));
      const PIXEL_COLS = 8;
      const PIXEL_ROWS = 6;
      const pixelGrid = Array.from({ length: PIXEL_COLS * PIXEL_ROWS }, () => null);
      const pastelColors = ['#ffadad','#ffd6a5','#fdffb6','#caffbf','#9bf6ff','#a0c4ff','#bdb2ff','#ffc6ff','#fffffc'];

      // Animation category state
      const animStars = Array.from({ length: 20 }, () => ({
        x: Math.random(),
        y: Math.random() * 0.75,
        r: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 2,
      }));

      const animConfetti = [];
      const animCelebration = { active: false, startT: 0, particles: [] };

      // Spotlight sweep state
      const spotlights = [
        { side: 'left',  sweepPhase: 0 },
        { side: 'right', sweepPhase: Math.PI },
      ];

      // Spel category state
      const spelPlatforms = [
        { xr: 0.15, yr: 0.60, wr: 0.20, phase: 0.0 },
        { xr: 0.45, yr: 0.45, wr: 0.18, phase: 1.2 },
        { xr: 0.68, yr: 0.55, wr: 0.16, phase: 2.5 },
      ];

      stateRef.current = {
        t: 0,
        charX: 0.2,
        charVX: 0.002,
        stars,
        notes,
        splashes,
        platforms,
        floatingNotes,
        lastNoteSpawn: 0,
        currentBg: null,
        targetBg: null,
        // art
        artPaintStrokes,
        artSplashes,
        artDrops,
        pixelGrid,
        pastelColors,
        lastSplashTime: 0,
        lastPixelFill: 0,
        lastStrokeTime: 0,
        artSpriteWave: 0,
        artSparkles: [],
        // animation category
        animStars,
        animConfetti,
        animCelebration,
        spotlights,
        animTimelinePhase: 0, // 0=walk-left,1=stop,2=jump,3=spin,4=walk-right
        animPhaseStart: 0,
        // spel category
        spelPlatforms,
        spelCharX: 0.15,
        spelCharY: 0.0,   // normalized Y (0=top, 1=bottom of play area)
        spelCharVX: 0.0018,
        spelCharVY: 0,
        spelOnGround: true,
        spelCurrentPlatform: null, // index or null
        spelJumpSquash: 1.0,       // scaleY for squash/stretch
        spelJumpSquashV: 0,        // velocity of squash back to 1
        spelEnemies: [
          { xr: 0.17, platformIdx: 0, dir: 1, speed: 0.0012 },
          { xr: 0.70, platformIdx: 2, dir: -1, speed: 0.0015 },
        ],
        spelScorePopups: [],
        spelLastScoreTime: 0,
        spelCoins: [
          { xr: 0.20, platformIdx: 0, spinPhase: 0 },
          { xr: 0.50, platformIdx: 1, spinPhase: 1.2 },
          { xr: 0.72, platformIdx: 2, spinPhase: 2.4 },
        ],
        spelTimerStart: null,
        spelTileFlips: Array.from({ length: 16 }, () => ({ active: false, timer: 0 })),
        spelLastTileFlip: 0,
      };
    }

    const state = stateRef.current;
    let rafId;
    let running = true;

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    }

    function drawSmiley(cx, cy, r, bounceY, tiltAngle = 0) {
      const y = cy + bounceY;
      ctx.save();
      ctx.translate(cx, y);
      ctx.rotate(tiltAngle);
      // Body
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe066';
      ctx.fill();
      ctx.strokeStyle = '#c8a800';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Eyes
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.2, r * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc( r * 0.35, -r * 0.2, r * 0.12, 0, Math.PI * 2); ctx.fill();
      // Smile
      ctx.beginPath();
      ctx.arc(0, r * 0.05, r * 0.5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    function drawDancingCharacter(t, cx, cy, r, speedMult) {
      const bounceY = 10 * Math.sin(t * 3 * speedMult);
      const tilt = 0.18 * Math.sin(t * 2.5 * speedMult);
      const armAngle = 0.6 * Math.sin(t * 3 * speedMult);

      const by = cy + bounceY;

      // Left arm
      ctx.save();
      ctx.translate(cx - r, by);
      ctx.rotate(Math.PI * 0.5 + armAngle);
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, r * 1.2);
      ctx.stroke();
      ctx.restore();

      // Right arm
      ctx.save();
      ctx.translate(cx + r, by);
      ctx.rotate(-Math.PI * 0.5 - armAngle);
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, r * 1.2);
      ctx.stroke();
      ctx.restore();

      // Head with tilt
      drawSmiley(cx, cy, r, bounceY, tilt);
    }

    function spawnFloatingNote(t, W, H, cx, cy) {
      const n = state.floatingNotes.find(n => !n.active);
      if (!n) return;
      n.active = true;
      // Spawn near the character
      n.x = (cx / W) + (Math.random() - 0.5) * 0.15;
      n.y = (cy / H) - 0.05;
      n.vy = -(0.0012 + Math.random() * 0.001);
      n.alpha = 0.9;
      n.size = 16 + Math.random() * 16;
      n.symbol = NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)];
      n.colorIdx = Math.floor(Math.random() * NOTE_COLORS.length);
      n.drift = (Math.random() - 0.5) * 0.001;
    }

    function drawFloatingNotes(t, W, H) {
      state.floatingNotes.forEach(n => {
        if (!n.active) return;
        n.y += n.vy;
        n.x += n.drift;
        n.alpha -= 0.004;
        if (n.alpha <= 0 || n.y < -0.1) {
          n.active = false;
          return;
        }
        ctx.globalAlpha = n.alpha;
        ctx.fillStyle = NOTE_COLORS[n.colorIdx];
        ctx.font = `bold ${n.size}px serif`;
        ctx.fillText(n.symbol, n.x * W, n.y * H);
      });
      ctx.globalAlpha = 1;
    }

    function drawBeatVisualizer(t, W, H, bpm, speedMult) {
      const barCount = 8;
      const barW = 14;
      const gap = 8;
      const totalW = barCount * (barW + gap) - gap;
      const startX = (W - totalW) / 2;
      const baseY = H - 18;
      const bpmFreq = (bpm / 60) * speedMult;

      for (let i = 0; i < barCount; i++) {
        const phase = (i / barCount) * Math.PI * 2;
        const barH = 10 + 30 * (0.5 + 0.5 * Math.sin(t * bpmFreq * Math.PI * 2 + phase));
        const x = startX + i * (barW + gap);
        const y = baseY - barH;

        const grad = ctx.createLinearGradient(x, baseY, x, y);
        grad.addColorStop(0, '#4ecdc4');
        grad.addColorStop(1, '#6c3bbd');
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawDrumIcon(x, y, t) {
      const bounce = 4 * Math.sin(t * 3.5 + 1.2);
      ctx.save();
      ctx.translate(x, y + bounce);
      ctx.globalAlpha = 0.55;
      // Drum body
      ctx.fillStyle = '#c8a800';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8a7000';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Top ellipse
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.ellipse(0, -12, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Drumsticks
      const stickAngle = 0.3 * Math.sin(t * 5);
      ctx.strokeStyle = '#a0522d';
      ctx.lineWidth = 2.5;
      ctx.save();
      ctx.rotate(-0.5 + stickAngle);
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(14, -28); ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.rotate(0.5 - stickAngle);
      ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-14, -28); ctx.stroke();
      ctx.restore();
      ctx.restore();
    }

    function drawSynthIcon(x, y, t) {
      const float = 5 * Math.sin(t * 1.8 + 0.5);
      ctx.save();
      ctx.translate(x, y + float);
      ctx.globalAlpha = 0.55;
      // Body
      ctx.fillStyle = '#1a1a4e';
      ctx.strokeStyle = '#4040a0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-28, -10, 56, 22, 3);
      ctx.fill();
      ctx.stroke();
      // White keys
      const keyW = 7, keyH = 16, keyGap = 1;
      for (let k = 0; k < 5; k++) {
        ctx.fillStyle = '#e6edf3';
        ctx.beginPath();
        ctx.roundRect(-25 + k * (keyW + keyGap), -8, keyW, keyH, 1);
        ctx.fill();
      }
      // Black keys
      const blackPos = [0, 1, 3, 4];
      blackPos.forEach(k => {
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.roundRect(-25 + k * (keyW + keyGap) + 4, -8, 5, 10, 1);
        ctx.fill();
      });
      ctx.restore();
    }

    function drawMicIcon(x, y, t) {
      const float = 5 * Math.sin(t * 2.1 + 1.0);
      ctx.save();
      ctx.translate(x, y + float);
      ctx.globalAlpha = 0.55;
      // Mic head
      ctx.fillStyle = '#888';
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-7, -20, 14, 18, 7);
      ctx.fill();
      ctx.stroke();
      // Mic body
      ctx.fillStyle = '#666';
      ctx.beginPath();
      ctx.rect(-3, -2, 6, 14);
      ctx.fill();
      // Stand
      ctx.strokeStyle = '#777';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -2, 12, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 10); ctx.lineTo(0, 18);
      ctx.moveTo(-8, 18); ctx.lineTo(8, 18);
      ctx.stroke();
      ctx.restore();
    }

    function drawMusik(t, W, H, bpm, addedBlocks, isPlaying) {
      const speedMult = isPlaying ? 1.4 : 1.0;

      // Sky
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, W, H);

      // Stars twinkling
      state.stars.forEach(s => {
        const alpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      const cx = W * 0.5;
      const cy = H * 0.55;
      const r = 28;

      // Floating instrument icons in background
      const hasDrums = addedBlocks.some(b => b.type === 'drums');
      const hasSynth = addedBlocks.some(b => b.type === 'synth');
      const hasVoice = addedBlocks.some(b => b.type === 'voice');

      if (hasDrums) drawDrumIcon(W * 0.18, H * 0.62, t);
      if (hasSynth) drawSynthIcon(W * 0.82, H * 0.35, t);
      if (hasVoice) drawMicIcon(W * 0.78, H * 0.65, t);

      // Spawn floating notes periodically
      const noteInterval = 0.8 / speedMult;
      if (t - state.lastNoteSpawn > noteInterval) {
        spawnFloatingNote(t, W, H, cx, cy);
        state.lastNoteSpawn = t;
      }

      // Draw floating notes (behind character)
      drawFloatingNotes(t, W, H);

      // Dancing character
      drawDancingCharacter(t, cx, cy, r, speedMult);

      // Beat visualizer at bottom
      drawBeatVisualizer(t, W, H, bpm, speedMult);
    }

    function drawSpelPlatform(px, py, pw, ph) {
      // Wood plank texture: alternating stripes
      const stripeH = Math.max(4, Math.floor(ph / 3));
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#7a4e28' : '#5a3a1a';
        ctx.fillRect(px, py + i * stripeH, pw, Math.min(stripeH, ph - i * stripeH));
      }
      // Top grass strip
      ctx.fillStyle = '#4aa84a';
      ctx.fillRect(px, py, pw, 4);
      // Slight highlight
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(px, py + 4, pw, 2);
    }

    function drawSpelPlayer(px, py, scaleY, facingRight) {
      const W24 = 24, H32 = 32;
      ctx.save();
      ctx.translate(px + W24 / 2, py + H32 / 2);
      ctx.scale(1, scaleY);
      ctx.translate(-(W24 / 2), -(H32 / 2));
      // Body
      ctx.fillStyle = '#58a6ff';
      ctx.beginPath();
      ctx.roundRect(0, 0, W24, H32, 4);
      ctx.fill();
      // Eyes
      const eyeY = 8;
      const eyeXL = facingRight ? 14 : 4;
      const eyeXR = facingRight ? 18 : 8;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(eyeXL, eyeY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeXR, eyeY, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#222';
      ctx.beginPath(); ctx.arc(eyeXL + (facingRight ? 1 : -1), eyeY, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(eyeXR + (facingRight ? 1 : -1), eyeY, 2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    function drawSpelEnemy(px, py, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      // Body
      ctx.fillStyle = '#e05252';
      ctx.beginPath();
      ctx.roundRect(px, py, 20, 22, 3);
      ctx.fill();
      // Eyes (angry)
      ctx.fillStyle = '#fff';
      ctx.fillRect(px + 3, py + 5, 6, 5);
      ctx.fillRect(px + 11, py + 5, 6, 5);
      ctx.fillStyle = '#222';
      ctx.fillRect(px + 5, py + 7, 3, 3);
      ctx.fillRect(px + 13, py + 7, 3, 3);
      ctx.restore();
    }

    function drawSpelCoin(cx, cy, spinPhase, t) {
      const spin = Math.sin(t * 3 + spinPhase);
      const scaleX = Math.abs(spin);
      ctx.save();
      ctx.translate(cx, cy + 4 * Math.sin(t * 1.5 + spinPhase));
      ctx.scale(scaleX, 1);
      ctx.fillStyle = '#ffe066';
      ctx.strokeStyle = '#c8a800';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Shine
      if (spin > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(-2, -3, 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawSpel(t, W, H) {
      const { addedBlocks } = propsRef.current;
      const hasEnemyAI = addedBlocks.some(b => b.type === 'enemy-ai');
      const hasScore   = addedBlocks.some(b => b.type === 'score');
      const hasPowerup = addedBlocks.some(b => b.type === 'powerup');
      const hasHealth  = addedBlocks.some(b => b.type === 'health');
      const hasTimer   = addedBlocks.some(b => b.type === 'timer');
      const hasTilemap = addedBlocks.some(b => b.type === 'tilemap');

      const GROUND_Y = H * 0.82;
      const PLAT_H = 14;

      // ---- Sky gradient ----
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0d1f3c');
      grad.addColorStop(0.6, '#1e4a8f');
      grad.addColorStop(1, '#2d6ecc');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // ---- Tilemap grid (background) ----
      if (hasTilemap) {
        const CELL = 20;
        const cols = Math.ceil(W / CELL);
        const rows = Math.ceil((GROUND_Y * 0.75) / CELL);
        const sp = state.spelTileFlips;
        // Flip tiles randomly
        if (t - state.spelLastTileFlip > 0.4) {
          state.spelLastTileFlip = t;
          const idx = Math.floor(Math.random() * sp.length);
          sp[idx].active = !sp[idx].active;
          sp[idx].timer = t;
        }
        ctx.globalAlpha = 0.13;
        ctx.strokeStyle = '#7ec8e3';
        ctx.lineWidth = 0.5;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const i = (r * cols + c) % sp.length;
            const px2 = c * CELL, py2 = r * CELL;
            ctx.strokeRect(px2 + 0.5, py2 + 0.5, CELL - 1, CELL - 1);
            if (sp[i].active) {
              const age = t - sp[i].timer;
              const a = Math.max(0, Math.min(1, age * 3)) * 0.25;
              ctx.globalAlpha = a;
              ctx.fillStyle = '#4ecdc4';
              ctx.fillRect(px2 + 1, py2 + 1, CELL - 2, CELL - 2);
              ctx.globalAlpha = 0.13;
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      // ---- Ground ----
      ctx.fillStyle = '#1a4a1a';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      // Ground top stripe
      ctx.fillStyle = '#3a8a3a';
      ctx.fillRect(0, GROUND_Y, W, 5);
      ctx.fillStyle = '#5ac05a';
      ctx.fillRect(0, GROUND_Y, W, 2);

      // ---- Platforms (bobbing) ----
      const platRects = state.spelPlatforms.map(p => {
        const bob = 3 * Math.sin(t * 0.8 + p.phase);
        const px = p.xr * W;
        const py = p.yr * H + bob;
        const pw = p.wr * W;
        return { px, py, pw, ph: PLAT_H, xr: p.xr, yr: p.yr, wr: p.wr };
      });
      platRects.forEach(r => drawSpelPlatform(r.px, r.py, r.pw, r.ph));

      // ---- Coins / powerups ----
      if (hasPowerup) {
        state.spelCoins.forEach(coin => {
          const pr = platRects[coin.platformIdx];
          if (!pr) return;
          const cx = pr.px + coin.xr * pr.pw;
          const cy = pr.py - 18;
          drawSpelCoin(cx, cy, coin.spinPhase, t);
        });
      }

      // ---- Enemy patrol ----
      if (hasEnemyAI) {
        state.spelEnemies.forEach(en => {
          const pr = platRects[en.platformIdx];
          if (!pr) return;
          const minX = pr.px;
          const maxX = pr.px + pr.pw - 20;
          en.xr += en.dir * en.speed;
          const ex = minX + en.xr * pr.pw;
          if (ex <= minX || ex >= maxX) {
            en.dir = -en.dir;
            en.xr = Math.max(0, Math.min(en.xr, (maxX - minX) / pr.pw));
          }
          const ey = pr.py - 22;
          // Flash when near player
          const playerX = state.spelCharX * W;
          const playerY = GROUND_Y - 32;
          const dist = Math.sqrt((ex - playerX) ** 2 + (ey - playerY) ** 2);
          const flash = dist < 80 ? 0.5 + 0.5 * Math.sin(t * 12) : 1.0;
          drawSpelEnemy(ex, ey, flash);
        });
      }

      // ---- Player character ----
      {
        const sp = state;
        const charW = 24, charH = 32;

        // Update squash/stretch spring
        sp.spelJumpSquash += sp.spelJumpSquashV;
        sp.spelJumpSquashV += (1.0 - sp.spelJumpSquash) * 0.3;
        sp.spelJumpSquashV *= 0.7;

        // Determine if on a platform
        let onPlat = null;
        for (let i = 0; i < platRects.length; i++) {
          const pr = platRects[i];
          const charPixX = sp.spelCharX * W;
          if (
            charPixX + charW > pr.px &&
            charPixX < pr.px + pr.pw
          ) {
            const platTop = pr.py;
            if (sp.spelOnGround && sp.spelCurrentPlatform === i) {
              onPlat = { i, pr };
              break;
            }
          }
        }

        if (sp.spelOnGround) {
          // Move horizontally
          sp.spelCharX += sp.spelCharVX;

          const charPixX = sp.spelCharX * W;

          // Check platform edges to trigger jump
          if (sp.spelCurrentPlatform !== null) {
            const pr = platRects[sp.spelCurrentPlatform];
            if (charPixX + charW > pr.px + pr.pw + 2 || charPixX < pr.px - 2) {
              // Fell off or reached edge — jump to another or ground
              sp.spelCurrentPlatform = null;
              sp.spelOnGround = false;
              sp.spelCharVY = -0.0055;
              // stretch on take-off
              sp.spelJumpSquash = 1.2;
              sp.spelJumpSquashV = 0;
            }
          } else {
            // On ground — check edges
            if (charPixX + charW >= W * 0.9) {
              sp.spelCharVX = -Math.abs(sp.spelCharVX);
            }
            if (charPixX <= W * 0.05) {
              sp.spelCharVX = Math.abs(sp.spelCharVX);
            }
            // Occasionally jump onto nearest platform ahead
            const nearPlat = platRects.findIndex(pr => {
              const ahead = sp.spelCharVX > 0
                ? (pr.px > charPixX && pr.px < charPixX + W * 0.3)
                : (pr.px + pr.pw < charPixX && pr.px + pr.pw > charPixX - W * 0.3);
              return ahead;
            });
            if (nearPlat >= 0 && Math.random() < 0.004) {
              sp.spelOnGround = false;
              sp.spelCharVY = -0.0065;
              sp.spelJumpSquash = 1.2;
              sp.spelJumpSquashV = 0;
              sp._jumpTargetPlat = nearPlat;
            }
          }

          // Keep Y on ground or platform
          if (sp.spelCurrentPlatform !== null) {
            const pr = platRects[sp.spelCurrentPlatform];
            sp.spelCharY = (pr.py - charH) / H;
          } else {
            sp.spelCharY = (GROUND_Y - charH) / H;
          }
        } else {
          // Airborne
          sp.spelCharY += sp.spelCharVY;
          sp.spelCharX += sp.spelCharVX * 0.7;
          sp.spelCharVY += 0.00025; // gravity

          const charPixX = sp.spelCharX * W;
          const charPixY = sp.spelCharY * H;

          // Land on platform?
          let landed = false;
          for (let i = 0; i < platRects.length; i++) {
            const pr = platRects[i];
            if (
              charPixX + charW > pr.px &&
              charPixX < pr.px + pr.pw &&
              sp.spelCharVY > 0 &&
              charPixY + charH >= pr.py &&
              charPixY + charH <= pr.py + PLAT_H + 8
            ) {
              sp.spelOnGround = true;
              sp.spelCurrentPlatform = i;
              sp.spelCharY = (pr.py - charH) / H;
              sp.spelCharVY = 0;
              // squash on land
              sp.spelJumpSquash = 0.7;
              sp.spelJumpSquashV = 0.03;
              landed = true;
              break;
            }
          }

          if (!landed) {
            // Land on ground?
            if (charPixY + charH >= GROUND_Y) {
              sp.spelOnGround = true;
              sp.spelCurrentPlatform = null;
              sp.spelCharY = (GROUND_Y - charH) / H;
              sp.spelCharVY = 0;
              sp.spelJumpSquash = 0.7;
              sp.spelJumpSquashV = 0.03;
            }
            // Clamp horizontal
            if (sp.spelCharX < 0.03) { sp.spelCharX = 0.03; sp.spelCharVX = Math.abs(sp.spelCharVX); }
            if (sp.spelCharX > 0.93) { sp.spelCharX = 0.93; sp.spelCharVX = -Math.abs(sp.spelCharVX); }
          }
        }

        // Run bounce when on ground
        let bounce = 0;
        if (sp.spelOnGround) {
          bounce = -2 * Math.abs(Math.sin(t * 10));
        }

        const drawX = sp.spelCharX * W;
        const drawY = sp.spelCharY * H + bounce;
        const facingRight = sp.spelCharVX >= 0;
        drawSpelPlayer(drawX, drawY, Math.max(0.5, sp.spelJumpSquash), facingRight);
      }

      // ---- Score popups ----
      if (hasScore) {
        if (t - state.spelLastScoreTime > 3.0) {
          state.spelLastScoreTime = t;
          const labels = ['+10', '+10', '+10', '+100', '+50'];
          state.spelScorePopups.push({
            x: W * (0.15 + Math.random() * 0.7),
            y: H * (0.3 + Math.random() * 0.4),
            label: labels[Math.floor(Math.random() * labels.length)],
            born: t,
            color: ['#ffe066','#ff6b6b','#4ecdc4','#a78bfa','#f472b6'][Math.floor(Math.random() * 5)],
          });
        }
        state.spelScorePopups = state.spelScorePopups.filter(p => {
          const age = t - p.born;
          if (age > 1.0) return false;
          const alpha = 1 - age;
          const py2 = p.y - age * 40;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.font = 'bold 20px sans-serif';
          ctx.fillStyle = '#111';
          ctx.fillText(p.label, p.x + 2, py2 + 2);
          ctx.fillStyle = p.color;
          ctx.fillText(p.label, p.x, py2);
          ctx.restore();
          return true;
        });
      }

      // ---- Health hearts ----
      if (hasHealth) {
        const heartBeat = 0.85 + 0.15 * Math.abs(Math.sin(t * 1.5));
        ctx.save();
        ctx.font = `${Math.round(20 * heartBeat)}px serif`;
        for (let i = 0; i < 3; i++) {
          ctx.globalAlpha = 0.9;
          ctx.fillText('\u2764', 10 + i * 26, 28);
        }
        ctx.restore();
      }

      // ---- Timer display ----
      if (hasTimer) {
        if (state.spelTimerStart === null) state.spelTimerStart = t;
        const elapsed = (t - state.spelTimerStart) % 90;
        const remaining = Math.max(0, 90 - elapsed);
        const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
        const secs = Math.floor(remaining % 60).toString().padStart(2, '0');
        const timerStr = `${mins}:${secs}`;
        ctx.save();
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = '#111';
        ctx.fillText(timerStr, W - 50 + 1, 24 + 1);
        ctx.fillStyle = '#ffe066';
        ctx.fillText(timerStr, W - 50, 24);
        ctx.restore();
      }
    }

    function drawRitprogram(t, W, H) {
      const { color, addedBlocks } = propsRef.current;

      // Background
      ctx.fillStyle = '#fdf6e3';
      ctx.fillRect(0, 0, W, H);

      // --- Pixel grid materializing in background ---
      const PCOLS = 8, PROWS = 6;
      const cellW = Math.floor(W * 0.55 / PCOLS);
      const cellH = Math.floor(H * 0.55 / PROWS);
      const gridX = W * 0.05;
      const gridY = H * 0.08;

      // Fill one cell per second
      if (t - state.lastPixelFill > 1.0) {
        state.lastPixelFill = t;
        const empty = state.pixelGrid.map((c, i) => c === null ? i : -1).filter(i => i >= 0);
        if (empty.length === 0) {
          // Reset
          for (let i = 0; i < state.pixelGrid.length; i++) state.pixelGrid[i] = null;
        } else {
          const pick = empty[Math.floor(Math.random() * empty.length)];
          state.pixelGrid[pick] = state.pastelColors[Math.floor(Math.random() * state.pastelColors.length)];
        }
      }
      for (let row = 0; row < PROWS; row++) {
        for (let col = 0; col < PCOLS; col++) {
          const c = state.pixelGrid[row * PCOLS + col];
          const px = gridX + col * (cellW + 1);
          const py = gridY + row * (cellH + 1);
          if (c) {
            ctx.fillStyle = c;
            ctx.globalAlpha = 0.55;
            ctx.fillRect(px, py, cellW, cellH);
          }
          ctx.globalAlpha = 0.12;
          ctx.strokeStyle = '#888';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(px, py, cellW, cellH);
        }
      }
      ctx.globalAlpha = 1;

      // --- Canvas texture (parchment rectangle center-right) ---
      const canvX = W * 0.55, canvY = H * 0.12, canvW = W * 0.38, canvH = H * 0.65;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#fffbe8';
      ctx.strokeStyle = '#d4b896';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(canvX, canvY, canvW, canvH, 4);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 1;

      // --- Paint strokes accumulate on the ground ---
      if (t - state.lastStrokeTime > 0.6) {
        state.lastStrokeTime = t;
        const cx0 = W * 0.3 + (Math.random() - 0.5) * W * 0.25;
        const groundY = H * 0.84;
        state.artPaintStrokes.push({
          x: cx0, y: groundY,
          len: 12 + Math.random() * 20,
          angle: (Math.random() - 0.5) * 0.8,
          color: ART_SPLASH_COLORS[Math.floor(Math.random() * ART_SPLASH_COLORS.length)],
          w: 3 + Math.random() * 4,
        });
        if (state.artPaintStrokes.length > 30) state.artPaintStrokes.shift();
      }
      state.artPaintStrokes.forEach(s => {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.w;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.moveTo(-s.len / 2, 0);
        ctx.lineTo(s.len / 2, 0);
        ctx.stroke();
        ctx.restore();
      });
      ctx.globalAlpha = 1;

      // --- Color splashes: spawn every 2s, grow then fade ---
      if (t - state.lastSplashTime > 2.0 && state.artSplashes.length < 8) {
        state.lastSplashTime = t;
        state.artSplashes.push({
          x: W * (0.1 + Math.random() * 0.8),
          y: H * (0.3 + Math.random() * 0.5),
          color: ART_SPLASH_COLORS[Math.floor(Math.random() * ART_SPLASH_COLORS.length)],
          born: t,
        });
      }
      state.artSplashes = state.artSplashes.filter(s => {
        const age = t - s.born;
        if (age > 1.0) return false;
        let r, alpha;
        if (age < 0.5) {
          r = 5 + (age / 0.5) * 20;
          alpha = 0.7;
        } else {
          r = 25;
          alpha = 0.7 * (1 - (age - 0.5) / 0.5);
        }
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;

      // --- Floating paint drops from top ---
      state.artDrops.forEach(d => {
        d.y += d.vy;
        d.x += d.drift;
        if (d.y > 1.05) {
          d.y = -0.05;
          d.x = Math.random();
          d.color = ART_SPLASH_COLORS[Math.floor(Math.random() * ART_SPLASH_COLORS.length)];
        }
        const fadeStart = 0.75;
        const alpha = d.y > fadeStart ? d.alpha * (1 - (d.y - fadeStart) / 0.3) : d.alpha;
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // --- addedBlocks reactions ---
      const hasSprite = addedBlocks.some(b => b.type === 'sprite-picker');
      const hasParticle = addedBlocks.some(b => b.type === 'particle-fx');

      // Sprite silhouette waves at bottom-left if sprite-picker added
      if (hasSprite) {
        const sx = W * 0.12, sy = H * 0.72;
        const wave = Math.sin(t * 3) * 0.15;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.globalAlpha = 0.7;
        // Head
        ctx.fillStyle = '#ffadad';
        ctx.beginPath();
        ctx.arc(0, -18, 10, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.fillStyle = '#a0c4ff';
        ctx.beginPath();
        ctx.roundRect(-8, -8, 16, 22, 4);
        ctx.fill();
        // Waving arm
        ctx.save();
        ctx.translate(8, -5);
        ctx.rotate(-0.4 + wave * 3);
        ctx.fillStyle = '#ffadad';
        ctx.beginPath();
        ctx.roundRect(0, 0, 5, 16, 3);
        ctx.fill();
        ctx.restore();
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      // Sparkles rain from top if particle-fx added
      if (hasParticle) {
        // Spawn new sparkles
        if (state.artSparkles.length < 20 && Math.random() < 0.3) {
          state.artSparkles.push({
            x: Math.random() * W,
            y: 0,
            vy: 1 + Math.random() * 2,
            alpha: 1,
            size: 10 + Math.random() * 8,
            rot: Math.random() * Math.PI * 2,
            color: ART_SPLASH_COLORS[Math.floor(Math.random() * ART_SPLASH_COLORS.length)],
          });
        }
        state.artSparkles = state.artSparkles.filter(sp => {
          sp.y += sp.vy;
          sp.alpha -= 0.01;
          sp.rot += 0.05;
          if (sp.alpha <= 0 || sp.y > H) return false;
          ctx.save();
          ctx.translate(sp.x, sp.y);
          ctx.rotate(sp.rot);
          ctx.globalAlpha = sp.alpha;
          ctx.fillStyle = sp.color;
          ctx.font = `${sp.size}px serif`;
          ctx.fillText('✨', -sp.size / 2, sp.size / 2);
          ctx.restore();
          return true;
        });
        ctx.globalAlpha = 1;
      }

      // --- Paintbrush character ---
      const charCx = W * 0.32, charCy = H * 0.62;
      const armSwing = 0.7 * Math.sin(t * 2.0); // painting rhythm
      const bounceY = 4 * Math.sin(t * 2.0);
      const by = charCy + bounceY;

      // Left arm (simple)
      ctx.save();
      ctx.translate(charCx - 26, by);
      ctx.rotate(Math.PI * 0.5 + 0.3 * Math.sin(t * 1.5));
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 28);
      ctx.stroke();
      ctx.restore();

      // Right arm holding paintbrush — moves up/down
      const brushAngle = -0.5 + armSwing * 0.5;
      const armLen = 30;
      const brushTipX = charCx + 26 + Math.cos(brushAngle) * armLen;
      const brushTipY = by + Math.sin(brushAngle) * armLen;

      // Arm line
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(charCx + 26, by);
      ctx.lineTo(brushTipX, brushTipY);
      ctx.stroke();

      // Paintbrush handle (rectangle)
      ctx.save();
      ctx.translate(brushTipX, brushTipY);
      ctx.rotate(brushAngle + Math.PI * 0.1);
      ctx.fillStyle = '#a0522d';
      ctx.beginPath();
      ctx.roundRect(-3, -22, 6, 22, 2);
      ctx.fill();
      // Brush ferrule
      ctx.fillStyle = '#aaa';
      ctx.fillRect(-4, -24, 8, 5);
      // Brush bristles
      ctx.fillStyle = color || '#e94560';
      ctx.beginPath();
      ctx.ellipse(0, -30, 5, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Head
      drawSmiley(charCx, charCy, 26, bounceY, 0.08 * Math.sin(t * 2.0));

      // Ground line
      ctx.strokeStyle = '#c8a800';
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.85);
      ctx.lineTo(W, H * 0.85);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function drawRostlab(t, W, H) {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;

      // Radiating sound rings
      for (let i = 0; i < 5; i++) {
        const phase = (t * 0.8 + i * 0.4) % 1;
        const radius = phase * Math.min(W, H) * 0.45;
        const alpha = (1 - phase) * 0.5;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2 + (1 - phase) * 3;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Waveform bar
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const waveW = W * 0.6, waveX = W * 0.2, waveY = H * 0.72;
      ctx.moveTo(waveX, waveY);
      for (let x = 0; x <= waveW; x += 3) {
        const amp = 18 * Math.sin(x * 0.07 + t * 4);
        ctx.lineTo(waveX + x, waveY + amp);
      }
      ctx.stroke();

      // Small smiley mic in center
      drawSmiley(cx, cy, 22, 0, 0);
    }

    function drawDefault(t, W, H) {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, W, H);

      // Twinkling starfield
      state.stars.forEach(s => {
        const alpha = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      const bounceY = 10 * Math.sin(t * 1.8);
      drawSmiley(W * 0.5, H * 0.55, 30, bounceY, 0);
    }

    // ---- ANIMATION CATEGORY ----

    function drawStageCharacter(t, cx, cy, r, phase, mode, glowActive) {
      // mode: 'bounce-wave' | 'walk-left' | 'stop' | 'jump' | 'spin' | 'walk-right'
      let bounceY = 0, tiltAngle = 0, armAngle = 0, extraOffsetX = 0;

      if (mode === 'bounce-wave') {
        bounceY = 8 * Math.sin(t * 2.5 + phase);
        tiltAngle = 0.12 * Math.sin(t * 2 + phase);
        armAngle = 0.7 * Math.sin(t * 2.5 + phase);
      } else if (mode === 'walk-left') {
        bounceY = -4 * Math.abs(Math.sin(t * 5 + phase));
        armAngle = 0.8 * Math.sin(t * 5 + phase);
        tiltAngle = -0.08;
      } else if (mode === 'walk-right') {
        bounceY = -4 * Math.abs(Math.sin(t * 5 + phase));
        armAngle = 0.8 * Math.sin(t * 5 + phase);
        tiltAngle = 0.08;
      } else if (mode === 'stop') {
        bounceY = 0;
        armAngle = 0;
        tiltAngle = 0.15 * Math.sin(t * 1.5 + phase);
      } else if (mode === 'jump') {
        bounceY = -30 * Math.abs(Math.sin(t * 3 + phase));
        armAngle = 1.2;
        tiltAngle = 0;
      } else if (mode === 'spin') {
        tiltAngle = t * 6 + phase;
        bounceY = -5 * Math.abs(Math.sin(t * 4 + phase));
        armAngle = 1.0;
      }

      const by = cy + bounceY;

      // Glow effect
      if (glowActive) {
        const glowAlpha = 0.3 + 0.25 * Math.sin(t * 4 + phase);
        const grd = ctx.createRadialGradient(cx, by, r * 0.5, cx, by, r * 2.5);
        grd.addColorStop(0, `rgba(255,220,50,${glowAlpha})`);
        grd.addColorStop(1, 'rgba(255,220,50,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, by, r * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Left arm
      ctx.save();
      ctx.translate(cx - r, by);
      ctx.rotate(Math.PI * 0.5 + armAngle);
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, r * 1.2);
      ctx.stroke();
      ctx.restore();

      // Right arm (waving)
      ctx.save();
      ctx.translate(cx + r, by);
      ctx.rotate(-Math.PI * 0.5 - armAngle * 0.8);
      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, r * 1.2);
      ctx.stroke();
      ctx.restore();

      // Body
      ctx.save();
      ctx.translate(cx, by + r * 0.9);
      ctx.rotate(tiltAngle * 0.3);
      ctx.fillStyle = '#a0c4ff';
      ctx.beginPath();
      ctx.roundRect(-r * 0.6, 0, r * 1.2, r * 1.4, 4);
      ctx.fill();
      ctx.restore();

      // Head
      drawSmiley(cx, cy, r, bounceY, tiltAngle);
    }

    function getTimelineMode(t, state) {
      // Cycle: walk-left(2s) → stop(1s) → jump(1s) → spin(1s) → walk-right(2s) → repeat
      const CYCLE = 7;
      const elapsed = (t - state.animPhaseStart) % CYCLE;
      if (elapsed < 2)   return 'walk-left';
      if (elapsed < 3)   return 'stop';
      if (elapsed < 4)   return 'jump';
      if (elapsed < 5)   return 'spin';
      return 'walk-right';
    }

    function drawSpotlight(W, H, side, sweepPhase) {
      const tipY = 0;
      const tipX = side === 'left' ? 0 : W;
      // Sweep angle: center ~50–70deg down, oscillates ±15deg
      const baseAngle = side === 'left' ? 0.45 : Math.PI - 0.45;
      const sweep = 0.18 * Math.sin(sweepPhase);
      const angle = baseAngle + sweep;

      const length = H * 1.2;
      const spreadHalf = 0.25; // cone half-angle in radians

      const ax = tipX + Math.cos(angle - spreadHalf) * length;
      const ay = tipY + Math.sin(angle - spreadHalf) * length;
      const bx = tipX + Math.cos(angle + spreadHalf) * length;
      const by2 = tipY + Math.sin(angle + spreadHalf) * length;

      ctx.save();
      ctx.globalAlpha = 0.07;
      const grad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, length);
      grad.addColorStop(0, 'rgba(255,255,220,1)');
      grad.addColorStop(1, 'rgba(255,255,220,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(ax, ay);
      ctx.lineTo(bx, by2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawCurtains(t, W, H) {
      const curtainW = W * 0.10;
      const sway = 4 * Math.sin(t * 0.7);

      // Left curtain
      ctx.save();
      ctx.translate(sway, 0);
      ctx.fillStyle = '#5a0a14';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(curtainW, 0);
      ctx.lineTo(curtainW + 8, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
      // Curtain folds
      for (let i = 1; i < 4; i++) {
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(curtainW * i / 4, 0);
        ctx.lineTo(curtainW * i / 4 + 4, H);
        ctx.stroke();
      }
      ctx.restore();

      // Right curtain
      ctx.save();
      ctx.translate(-sway, 0);
      ctx.fillStyle = '#5a0a14';
      ctx.beginPath();
      ctx.moveTo(W, 0);
      ctx.lineTo(W - curtainW, 0);
      ctx.lineTo(W - curtainW - 8, H);
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      for (let i = 1; i < 4; i++) {
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(W - curtainW * i / 4, 0);
        ctx.lineTo(W - curtainW * i / 4 - 4, H);
        ctx.stroke();
      }
      ctx.restore();
    }

    function spawnConfetti(state, W, H) {
      const CONF_COLORS = ['#e94560','#f18f01','#ffe066','#4ecdc4','#a78bfa','#f472b6','#3bb273'];
      for (let i = 0; i < 8; i++) {
        state.animConfetti.push({
          x: Math.random() * W,
          y: -10,
          vx: (Math.random() - 0.5) * 2,
          vy: 1.5 + Math.random() * 2,
          rot: Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.15,
          w: 6 + Math.random() * 6,
          h: 4 + Math.random() * 4,
          color: CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)],
        });
      }
      if (state.animConfetti.length > 200) state.animConfetti.splice(0, state.animConfetti.length - 200);
    }

    function drawConfetti(state, W, H) {
      state.animConfetti = state.animConfetti.filter(c => {
        c.x += c.vx;
        c.y += c.vy;
        c.rot += c.rotV;
        if (c.y > H + 10) return false;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
        return true;
      });
      ctx.globalAlpha = 1;
    }

    function drawCelebrationBurst(t, W, H, state) {
      const cel = state.animCelebration;
      if (!cel.active) return;
      const age = t - cel.startT;
      if (age > 2.0) {
        cel.active = false;
        cel.particles = [];
        return;
      }
      // Rainbow arc
      const rainbowAlpha = Math.max(0, 1 - age / 2.0) * 0.5;
      const cx = W / 2, cy = H * 0.8;
      const RAINBOW = ['#e94560','#f18f01','#ffe066','#3bb273','#2d7dd2','#6c3bbd'];
      RAINBOW.forEach((col, i) => {
        ctx.globalAlpha = rainbowAlpha;
        ctx.strokeStyle = col;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(cx, cy, H * 0.25 + i * 8, Math.PI, 0);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // Burst particles
      cel.particles = cel.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.alpha -= 0.02;
        if (p.alpha <= 0) return false;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px serif`;
        ctx.fillText('★', p.x, p.y);
        return true;
      });
      ctx.globalAlpha = 1;

      // Spawn more particles early in burst
      if (age < 0.5 && cel.particles.length < 40) {
        const COLORS = ['#ffe066','#f472b6','#a78bfa','#4ecdc4','#f18f01','#e94560'];
        for (let i = 0; i < 4; i++) {
          cel.particles.push({
            x: W / 2 + (Math.random() - 0.5) * W * 0.4,
            y: H * 0.5,
            vx: (Math.random() - 0.5) * 6,
            vy: -(2 + Math.random() * 5),
            alpha: 1,
            size: 14 + Math.random() * 10,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
        }
      }
    }

    function drawAnimation(t, W, H) {
      const { addedBlocks, isPlaying, celebrate } = propsRef.current;

      const hasCharBuilder = addedBlocks.some(b => b.type === 'character-builder');
      const hasTimeline   = addedBlocks.some(b => b.type === 'animation-timeline');
      const hasVFX        = addedBlocks.some(b => b.type === 'visual-effects');

      // BPM-like speed multiplier (120bpm baseline)
      const bpmSpeed = isPlaying ? 1.6 : 1.0;

      // --- Background: dark blue sky ---
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#0a0520');
      bgGrad.addColorStop(0.75, '#1a0a30');
      bgGrad.addColorStop(1, '#2a0a10');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // --- Twinkling stars (sky area, above stage) ---
      state.animStars.forEach(s => {
        const alpha = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H * 0.78, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // --- Spotlights (drawn before stage so they appear behind curtains/floor) ---
      state.spotlights[0].sweepPhase += 0.012;
      state.spotlights[1].sweepPhase += 0.012;
      drawSpotlight(W, H, 'left',  state.spotlights[0].sweepPhase);
      drawSpotlight(W, H, 'right', state.spotlights[1].sweepPhase);

      // --- Stage floor: wooden planks at bottom 20% ---
      const stageY = H * 0.80;
      const stageH = H * 0.20;
      const PLANK_H = Math.max(6, Math.floor(stageH / 5));
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#5a3010' : '#6b3a14';
        ctx.fillRect(0, stageY + i * PLANK_H, W, PLANK_H);
      }
      // Stage edge highlight
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(0, stageY, W, 3);

      // --- Curtains ---
      drawCurtains(t, W, H);

      // --- Characters ---
      const stageCharY = stageY - 35;
      const mainR = hasCharBuilder ? 30 : 24;
      const sideR = Math.round(mainR * 0.78);

      // Determine movement mode
      let mode = 'bounce-wave';
      if (hasTimeline) {
        mode = getTimelineMode(t * bpmSpeed, state);
      }

      // Confetti when playing
      if (isPlaying && hasTimeline && Math.random() < 0.15) {
        spawnConfetti(state, W, H);
      }

      // Celebration burst trigger
      if (celebrate && !state.animCelebration.active) {
        state.animCelebration.active = true;
        state.animCelebration.startT = t;
        state.animCelebration.particles = [];
        spawnConfetti(state, W, H);
        spawnConfetti(state, W, H);
        spawnConfetti(state, W, H);
      }

      // Main character (center-left of stage)
      const mainX = W * 0.42;
      drawStageCharacter(t * bpmSpeed, mainX, stageCharY, mainR, 0, mode, hasVFX);

      // Sidekick (slightly right, phase offset 0.3s)
      const sideX = mainX + mainR * 2 + sideR * 2 + 14;
      const sidePhase = 0.3 * bpmSpeed;
      drawStageCharacter(t * bpmSpeed, sideX, stageCharY + 4, sideR, sidePhase, mode, hasVFX);

      // Confetti
      drawConfetti(state, W, H);

      // Celebration burst
      drawCelebrationBurst(t, W, H, state);
    }

    // ---- END ANIMATION CATEGORY ----

    function applyColorTint(t, W, H) {
      const { color } = propsRef.current;
      if (!color) return;
      const rgb = hexToRgb(color);
      if (!rgb) return;
      ctx.globalAlpha = 0.12 + 0.06 * Math.sin(t * 0.5);
      ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    function drawGroundBar(W, H, themeKey) {
      const t = THEMES[themeKey] || THEMES.default;
      if (!t.ground) return;
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = t.ground;
      ctx.fillRect(0, H * 0.85, W, H * 0.15);
      ctx.globalAlpha = 1;
    }

    function frame(ts) {
      if (!running) return;
      resizeCanvas();
      const W = canvas.width;
      const H = canvas.height;
      if (W === 0 || H === 0) { rafId = requestAnimationFrame(frame); return; }

      state.t = ts / 1000;
      const t = state.t;
      const cat = category || 'default';
      const { bpm, addedBlocks, isPlaying } = propsRef.current;

      if (cat === 'musik')      drawMusik(t, W, H, bpm, addedBlocks, isPlaying);
      else if (cat === 'spel')  drawSpel(t, W, H);
      else if (cat === 'ritprogram' || cat === 'konst') drawRitprogram(t, W, H);
      else if (cat === 'rostlab') drawRostlab(t, W, H);
      else if (cat === 'animation') drawAnimation(t, W, H);
      else                       drawDefault(t, W, H);

      // Theme ground bar (only for non-spel which draws its own)
      if (cat !== 'spel') drawGroundBar(W, H, theme);

      // Color tint overlay
      applyColorTint(t, W, H);

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => {
      running = false;
      cancelAnimationFrame(rafId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}
