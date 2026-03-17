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
      const { color } = propsRef.current;
      // Colorful bg
      ctx.fillStyle = '#1a0a2e';
      ctx.fillRect(0, 0, W, H);

      // Floating paint splashes
      state.splashes.forEach(s => {
        const pulse = 1 + s.pulsate * Math.sin(t * 1.5 + s.phase);
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = `hsl(${s.hue}, 80%, 60%)`;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Character with paintbrush
      const bounceY = 5 * Math.sin(t * 1.5);
      const cx = W * 0.45, cy = H * 0.55;
      drawSmiley(cx, cy, 26, bounceY, 0);

      // Paintbrush arm
      const by = cy + bounceY;
      ctx.strokeStyle = '#e6edf3';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 26, by);
      ctx.lineTo(cx + 58, by - 20);
      ctx.stroke();
      // Brush tip with color
      ctx.fillStyle = color || '#f0a030';
      ctx.beginPath();
      ctx.ellipse(cx + 62, by - 23, 7, 4, -0.4, 0, Math.PI * 2);
      ctx.fill();
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
