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

export default function Playground({ category, theme = 'default', color, bpm = 120, addedBlocks = [], isPlaying = false }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

  // Keep live props accessible in animation loop without restarting
  const propsRef = useRef({ color, bpm, addedBlocks, isPlaying });
  useEffect(() => {
    propsRef.current = { color, bpm, addedBlocks, isPlaying };
  }, [color, bpm, addedBlocks, isPlaying]);

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

    function drawSpel(t, W, H) {
      // Sky gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1e3a5f');
      grad.addColorStop(1, '#3a7bd5');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Ground
      ctx.fillStyle = '#2d6a2d';
      ctx.fillRect(0, H * 0.8, W, H * 0.2);
      ctx.fillStyle = '#3a8a3a';
      ctx.fillRect(0, H * 0.8, W, 6);

      // Platforms
      state.platforms.forEach(p => {
        ctx.fillStyle = '#5a3a1a';
        ctx.beginPath();
        ctx.roundRect(p.x * W, p.y * H, p.w * W, 12, 4);
        ctx.fill();
        ctx.fillStyle = '#3a8a3a';
        ctx.fillRect(p.x * W, p.y * H, p.w * W, 4);
      });

      // Running character
      state.charX += state.charVX;
      if (state.charX > 0.85) { state.charX = 0.85; state.charVX = -Math.abs(state.charVX); }
      if (state.charX < 0.1)  { state.charX = 0.1;  state.charVX =  Math.abs(state.charVX); }
      const runBounce = -3 * Math.abs(Math.sin(t * 8));
      drawSmiley(state.charX * W, H * 0.75, 22, runBounce, 0);
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
