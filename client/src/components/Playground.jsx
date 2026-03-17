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

export default function Playground({ category, theme = 'default', color }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);

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

      stateRef.current = {
        t: 0,
        charX: 0.2,
        charVX: 0.002,
        stars,
        notes,
        splashes,
        platforms,
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

    function drawSmiley(ctx, cx, cy, r, bounceY) {
      const y = cy + bounceY;
      // Body
      ctx.beginPath();
      ctx.arc(cx, y, r, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe066';
      ctx.fill();
      ctx.strokeStyle = '#c8a800';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Eyes
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(cx - r * 0.35, y - r * 0.2, r * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + r * 0.35, y - r * 0.2, r * 0.12, 0, Math.PI * 2); ctx.fill();
      // Smile
      ctx.beginPath();
      ctx.arc(cx, y + r * 0.05, r * 0.5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    function drawMusik(t, W, H) {
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

      // Floating notes
      state.notes.forEach(n => {
        n.y += n.vy;
        if (n.y < -0.05) n.y = 1.05;
        const wobble = 0.03 * Math.sin(t * 2 + n.phase);
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 1.5 + n.phase);
        ctx.fillStyle = '#a78bfa';
        ctx.font = `${n.size}px serif`;
        ctx.fillText('♪', (n.x + wobble) * W, n.y * H);
      });
      ctx.globalAlpha = 1;

      // Character bouncing
      const bounceY = 8 * Math.sin(t * 2);
      drawSmiley(ctx, W * 0.5, H * 0.6, 28, bounceY);
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
      drawSmiley(ctx, state.charX * W, H * 0.75, 22, runBounce);
    }

    function drawRitprogram(t, W, H) {
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
      drawSmiley(ctx, cx, cy, 26, bounceY);

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
      drawSmiley(ctx, cx, cy, 22, 0);
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
      drawSmiley(ctx, W * 0.5, H * 0.55, 30, bounceY);
    }

    function applyColorTint(t, W, H) {
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

      if (cat === 'musik')      drawMusik(t, W, H);
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
  // Re-run only when category or theme changes; color is read live from closure via prop ref trick
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, theme]);

  // Keep color accessible in the running loop without restarting it
  const colorRef = useRef(color);
  useEffect(() => { colorRef.current = color; }, [color]);

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
