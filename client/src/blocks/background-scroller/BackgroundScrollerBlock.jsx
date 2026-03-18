import React, { useState, useRef, useEffect, useCallback } from 'react';

const PATTERNS = [
  { id: 'sky',      label: 'Himmel' },
  { id: 'stars',    label: 'Stjarnor' },
  { id: 'clouds',   label: 'Moln' },
  { id: 'mountain', label: 'Berg' },
  { id: 'hills',    label: 'Kullar' },
  { id: 'city',     label: 'Stad' },
];

const DEFAULT_LAYERS = [
  { speed: 0.5, pattern: 'sky',   opacity: 100, direction: 'left' },
  { speed: 1.0, pattern: 'hills', opacity: 90,  direction: 'left' },
  { speed: 2.0, pattern: 'city',  opacity: 85,  direction: 'left' },
];

// Draw a single layer onto ctx at offset x
function drawLayer(ctx, pattern, W, H, offsetX, opacity) {
  ctx.save();
  ctx.globalAlpha = opacity / 100;

  switch (pattern) {
    case 'sky': {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1a1a4e');
      grad.addColorStop(1, '#2e6db4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      break;
    }
    case 'stars': {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, W, H);
      // Tiled stars
      const seed = 42;
      for (let i = 0; i < 60; i++) {
        const sx = ((Math.sin(i * 127.1 + seed) * 0.5 + 0.5) * W * 2 + offsetX * 0.3) % W;
        const sy = (Math.sin(i * 311.7 + seed) * 0.5 + 0.5) * H;
        const sr = 0.5 + (Math.sin(i * 17.3) * 0.5 + 0.5) * 1.5;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = (opacity / 100) * (0.5 + (Math.sin(i * 73.1) * 0.5 + 0.5) * 0.5);
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'clouds': {
      ctx.fillStyle = '#87ceeb';
      ctx.fillRect(0, 0, W, H);
      // Draw a few cloud puffs, tiled
      const cloudPositions = [
        { x: 0.1, y: 0.2, r: 18 },
        { x: 0.4, y: 0.1, r: 22 },
        { x: 0.7, y: 0.25, r: 16 },
        { x: 0.9, y: 0.15, r: 20 },
      ];
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      cloudPositions.forEach(c => {
        const cx = ((c.x * W + offsetX) % (W + c.r * 4)) - c.r * 2;
        const cy = c.y * H;
        ctx.globalAlpha = opacity / 100;
        ctx.beginPath();
        ctx.arc(cx, cy, c.r, 0, Math.PI * 2);
        ctx.arc(cx + c.r * 0.8, cy - c.r * 0.3, c.r * 0.8, 0, Math.PI * 2);
        ctx.arc(cx + c.r * 1.6, cy, c.r * 0.9, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case 'mountain': {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1a2a4a');
      grad.addColorStop(1, '#2d4a7a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // Mountain silhouette
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.moveTo(0, H);
      const peaks = [0.1, 0.3, 0.5, 0.7, 0.9, 1.1];
      peaks.forEach(px => {
        const bx = ((px * W + offsetX) % (W * 1.2)) - W * 0.1;
        ctx.lineTo(bx - 40, H);
        ctx.lineTo(bx, H * 0.3);
        ctx.lineTo(bx + 40, H);
      });
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
      // Snow caps
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      peaks.forEach(px => {
        const bx = ((px * W + offsetX) % (W * 1.2)) - W * 0.1;
        ctx.beginPath();
        ctx.moveTo(bx, H * 0.3);
        ctx.lineTo(bx - 12, H * 0.38);
        ctx.lineTo(bx + 12, H * 0.38);
        ctx.closePath();
        ctx.fill();
      });
      break;
    }
    case 'hills': {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1a3a1a');
      grad.addColorStop(1, '#2d6b2d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // Rolling hills
      const hillColors = ['#1a4a1a', '#2d7b2d', '#3a9a3a'];
      hillColors.forEach((color, hi) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, H);
        const freq = 0.008 + hi * 0.003;
        const amp = 15 + hi * 10;
        const yBase = H * (0.5 + hi * 0.1);
        for (let x = 0; x <= W; x += 2) {
          const y = yBase + Math.sin((x + offsetX * (1 + hi * 0.3)) * freq) * amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
      });
      break;
    }
    case 'city': {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0a0a1e');
      grad.addColorStop(1, '#1a1a3e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      // Buildings
      const buildings = [
        { x: 0.05, w: 0.08, h: 0.4 },
        { x: 0.15, w: 0.06, h: 0.6 },
        { x: 0.25, w: 0.1,  h: 0.35 },
        { x: 0.38, w: 0.07, h: 0.55 },
        { x: 0.5,  w: 0.09, h: 0.45 },
        { x: 0.62, w: 0.06, h: 0.65 },
        { x: 0.72, w: 0.08, h: 0.38 },
        { x: 0.82, w: 0.1,  h: 0.5  },
        { x: 0.93, w: 0.07, h: 0.42 },
      ];
      buildings.forEach(b => {
        const bx = ((b.x * W + offsetX) % (W + b.w * W)) - b.w * W;
        const bw = b.w * W;
        const bh = b.h * H;
        const by = H - bh;
        ctx.fillStyle = '#0d1a2e';
        ctx.fillRect(bx, by, bw, bh);
        // Windows
        ctx.fillStyle = 'rgba(255, 240, 100, 0.7)';
        const cols = Math.floor(bw / 8);
        const rows = Math.floor(bh / 10);
        for (let r = 1; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (Math.sin(b.x * 100 + r * 7 + c * 13) > 0.1) {
              ctx.fillRect(bx + c * 8 + 2, by + r * 10, 4, 5);
            }
          }
        }
      });
      break;
    }
    default:
      ctx.fillStyle = '#21262d';
      ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();
}

export default function BackgroundScrollerBlock({ config = {}, onConfigChange }) {
  const initLayers = config.layers && config.layers.length === 3 ? config.layers : DEFAULT_LAYERS;
  const [layers, setLayers] = useState(initLayers);
  const [autoScroll, setAutoScroll] = useState(config.autoScroll !== false);
  const canvasRef = useRef(null);
  const offsetsRef = useRef([0, 0, 0]);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const layersRef = useRef(layers);
  const autoScrollRef = useRef(autoScroll);

  useEffect(() => { layersRef.current = layers; }, [layers]);
  useEffect(() => { autoScrollRef.current = autoScroll; }, [autoScroll]);

  const renderFrame = useCallback((now) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const dt = lastTimeRef.current ? Math.min(now - lastTimeRef.current, 50) : 16;
    lastTimeRef.current = now;

    const currentLayers = layersRef.current;

    if (autoScrollRef.current) {
      currentLayers.forEach((layer, i) => {
        const dir = layer.direction === 'right' ? -1 : 1;
        offsetsRef.current[i] = (offsetsRef.current[i] + layer.speed * dir * dt * 0.05) % W;
      });
    }

    ctx.clearRect(0, 0, W, H);

    // Draw back to front
    currentLayers.forEach((layer, i) => {
      drawLayer(ctx, layer.pattern, W, H, offsetsRef.current[i], layer.opacity);
    });

    rafRef.current = requestAnimationFrame(renderFrame);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [renderFrame]);

  function updateLayer(index, changes) {
    const next = layers.map((l, i) => i === index ? { ...l, ...changes } : l);
    setLayers(next);
    onConfigChange({ layers: next, autoScroll });
  }

  function toggleAutoScroll() {
    const next = !autoScroll;
    setAutoScroll(next);
    onConfigChange({ layers, autoScroll: next });
  }

  const LAYER_NAMES = ['Bakre', 'Mitten', 'Framre'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        {'\u{1F304}'} Bakgrundsrullning
      </div>

      {/* Preview canvas */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <canvas
          ref={canvasRef}
          width={200}
          height={120}
          style={{ borderRadius: 8, border: '1px solid #30363d', display: 'block' }}
        />
        <button
          onClick={toggleAutoScroll}
          style={{
            padding: '6px 20px',
            borderRadius: 8,
            background: autoScroll ? '#238636' : '#21262d',
            color: autoScroll ? '#fff' : '#8b949e',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            border: autoScroll ? '2px solid transparent' : '1px solid #30363d',
          }}
        >
          {autoScroll ? '\u23F8 Pausa' : '\u25B6 Spela'}
        </button>
      </div>

      {/* Layer rows */}
      {layers.map((layer, i) => (
        <div
          key={i}
          style={{
            background: '#21262d',
            borderRadius: 10,
            border: '1px solid #30363d',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '0.9rem' }}>
            {LAYER_NAMES[i]}
          </div>

          {/* Pattern picker */}
          <div>
            <div style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: 4, fontWeight: 600 }}>Motiv</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {PATTERNS.map(p => (
                <button
                  key={p.id}
                  onClick={() => updateLayer(i, { pattern: p.id })}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: layer.pattern === p.id ? '2px solid #58a6ff' : '2px solid #30363d',
                    background: layer.pattern === p.id ? '#0d2744' : '#161b22',
                    color: layer.pattern === p.id ? '#58a6ff' : '#8b949e',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div>
            <div style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: 4, fontWeight: 600 }}>
              Hastighet: {layer.speed.toFixed(1)}
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={layer.speed}
              onChange={e => updateLayer(i, { speed: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#58a6ff' }}
            />
          </div>

          {/* Opacity */}
          <div>
            <div style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: 4, fontWeight: 600 }}>
              Genomskinlighet: {layer.opacity}%
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={layer.opacity}
              onChange={e => updateLayer(i, { opacity: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#58a6ff' }}
            />
          </div>

          {/* Direction toggle */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['left', 'right'].map(dir => (
              <button
                key={dir}
                onClick={() => updateLayer(i, { direction: dir })}
                style={{
                  flex: 1,
                  padding: '6px',
                  borderRadius: 6,
                  border: layer.direction === dir ? '2px solid #58a6ff' : '2px solid #30363d',
                  background: layer.direction === dir ? '#0d2744' : '#161b22',
                  color: layer.direction === dir ? '#58a6ff' : '#8b949e',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {dir === 'left' ? '\u2190 Vanster' : 'Hoger \u2192'}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
