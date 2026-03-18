import React, { useEffect, useRef, useCallback } from 'react';
import { Enemy } from '../../lib/enemyAI.js';

const BEHAVIORS = [
  { id: 'patrol', label: 'Patrull', emoji: '\u{1F479}' },
  { id: 'chase',  label: 'Jagar',   emoji: '\u{1F608}' },
  { id: 'fly',    label: 'Flyger',  emoji: '\u{1F987}' },
  { id: 'flee',   label: 'Flyr',    emoji: '\u{1F631}' },
];

const COLORS = ['#e05252', '#e08c2e', '#4caf50', '#2196f3', '#9c27b0', '#e91e63'];

const SIZES = [
  { id: 'small',  label: 'Liten',  w: 18, h: 18 },
  { id: 'medium', label: 'Medel',  w: 28, h: 28 },
  { id: 'large',  label: 'Stor',   w: 40, h: 40 },
];

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

function SliderRow({ lbl, min, max, value, onChange }) {
  return (
    <div>
      <div style={{ ...label, display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <span>{lbl}</span>
        <span style={{ color: '#58a6ff' }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#58a6ff' }} />
    </div>
  );
}

export default function EnemyAIBlock({ config, onConfigChange }) {
  const cfg = {
    behavior: 'patrol',
    speed: 100,
    range: 150,
    color: '#e05252',
    size: 'medium',
    count: 3,
    ...config,
  };

  const canvasRef = useRef(null);
  const enemiesRef = useRef([]);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  const sizeObj = SIZES.find(s => s.id === cfg.size) || SIZES[1];

  const stopLoop = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const startLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 200;
    canvas.height = 150;
    const W = canvas.width;
    const H = canvas.height;

    // Spawn 2 demo enemies
    enemiesRef.current = [
      new Enemy(40, H * 0.55, {
        behavior: cfg.behavior, speed: cfg.speed, range: cfg.range,
        color: cfg.color, width: sizeObj.w, height: sizeObj.h,
        patrolLeft: 10, patrolRight: W * 0.5 - 10,
      }),
      new Enemy(W * 0.6, H * 0.55, {
        behavior: cfg.behavior, speed: cfg.speed, range: cfg.range,
        color: cfg.color, width: sizeObj.w, height: sizeObj.h,
        patrolLeft: W * 0.5 + 10, patrolRight: W - 20,
      }),
    ];
    lastTimeRef.current = null;

    // Fake player that oscillates
    let playerT = 0;

    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      if (lastTimeRef.current === null) { lastTimeRef.current = ts; return; }
      const dt = Math.min(ts - lastTimeRef.current, 50);
      lastTimeRef.current = ts;

      playerT += dt / 1000;
      const px = W / 2 + Math.cos(playerT * 0.8) * 60;
      const py = H * 0.6;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, W, H);

      // Ground
      ctx.fillStyle = '#3d4f6b';
      ctx.fillRect(0, H * 0.75, W, H * 0.25);
      ctx.fillStyle = '#4a6080';
      ctx.fillRect(0, H * 0.75, W, 3);

      // Fake player dot
      ctx.fillStyle = '#58a6ff';
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();

      for (const e of enemiesRef.current) {
        e.update(dt, px, py, [], { x: 0, y: 0, w: W, h: H });
        e.draw(ctx);
      }
    }

    stopLoop();
    rafRef.current = requestAnimationFrame(loop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.behavior, cfg.speed, cfg.range, cfg.color, cfg.size, stopLoop]);

  useEffect(() => {
    startLoop();
    return stopLoop;
  }, [startLoop, stopLoop]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Fiender</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Lagg till motstandare i spelet</div>

      <div style={label}>BETEENDE</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {BEHAVIORS.map(b => (
          <button key={b.id} onClick={() => onConfigChange({ behavior: b.id })}
            style={{
              padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.behavior === b.id ? '#0d2744' : '#21262d',
              color: cfg.behavior === b.id ? '#58a6ff' : '#8b949e',
              outline: cfg.behavior === b.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.85rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4,
            }}>
            <span style={{ fontSize: '1.4rem' }}>{b.emoji}</span>
            <span>{b.label}</span>
          </button>
        ))}
      </div>

      <SliderRow lbl="HASTIGHET" min={50} max={300} value={cfg.speed}
        onChange={v => onConfigChange({ speed: v })} />
      {(cfg.behavior === 'chase' || cfg.behavior === 'flee') && (
        <SliderRow lbl="DETEKTIONSRADIE" min={50} max={300} value={cfg.range}
          onChange={v => onConfigChange({ range: v })} />
      )}
      <SliderRow lbl="ANTAL" min={1} max={10} value={cfg.count}
        onChange={v => onConfigChange({ count: v })} />

      <div style={{ ...label, marginTop: 14 }}>STORLEK</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {SIZES.map(s => (
          <button key={s.id} onClick={() => onConfigChange({ size: s.id })}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: cfg.size === s.id ? '#0d2744' : '#21262d',
              color: cfg.size === s.id ? '#58a6ff' : '#8b949e',
              outline: cfg.size === s.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.8rem',
            }}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ ...label, marginTop: 14 }}>FARG</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {COLORS.map(c => (
          <button key={c} onClick={() => onConfigChange({ color: c })}
            style={{
              width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: c,
              outline: cfg.color === c ? '3px solid #58a6ff' : '2px solid #30363d',
              outlineOffset: 2,
            }} />
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...label, marginTop: 0 }}>FORHANDSVISNING</div>
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d', display: 'inline-block' }}>
          <canvas ref={canvasRef} style={{ display: 'block', imageRendering: 'pixelated' }} />
        </div>
      </div>
    </div>
  );
}
