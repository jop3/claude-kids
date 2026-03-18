import React, { useEffect, useRef } from 'react';
import {
  drawBouncingText,
  drawShakingText,
  drawRainbowText,
  drawFadeInText,
  drawWaveText,
} from '../../lib/textFx.js';

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

const EFFECTS = [
  { id: 'bounce',  label: 'Studsar', emoji: '🎈' },
  { id: 'shake',   label: 'Skakar',  emoji: '📳' },
  { id: 'rainbow', label: 'Regnbage', emoji: '🌈' },
  { id: 'fadein',  label: 'Tonar in', emoji: '✨' },
  { id: 'wave',    label: 'Vag',      emoji: '🌊' },
];

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

function FxPreview({ effect, intensity, speed, loop }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 200;
    canvas.height = 80;
    startRef.current = null;
    progressRef.current = 0;

    const DURATION = 2; // seconds for fadein cycle

    function render(ts) {
      rafRef.current = requestAnimationFrame(render);
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const time = elapsed;

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 200, 80);
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, 200, 80);

      const config = { intensity, speed, font: 'bold 24px sans-serif', color: '#e6edf3' };
      const text = 'Halla!';
      const tw = ctx.measureText;
      ctx.font = config.font;
      const textW = ctx.measureText(text).width;
      const x = (200 - textW) / 2;
      const y = 40;

      if (effect === 'bounce') {
        drawBouncingText(ctx, text, x, y, time, config);
      } else if (effect === 'shake') {
        drawShakingText(ctx, text, x, y, time, config);
      } else if (effect === 'rainbow') {
        drawRainbowText(ctx, text, x, y, time, config);
      } else if (effect === 'fadein') {
        let progress = (elapsed % DURATION) / DURATION;
        if (!loop && elapsed >= DURATION) progress = 1;
        drawFadeInText(ctx, text, x, y, progress, config);
      } else if (effect === 'wave') {
        drawWaveText(ctx, text, x, y, time, config);
      }
    }

    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effect, intensity, speed, loop]);

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d', display: 'inline-block' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

export default function TextFxBlock({ config, onConfigChange }) {
  const cfg = {
    effect: 'bounce',
    intensity: 3,
    speed: 3,
    loop: true,
    ...config,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Texteffekter</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Animera din text pa roliga satt</div>

      <div style={label}>EFFEKT</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {EFFECTS.map(fx => (
          <button key={fx.id} onClick={() => onConfigChange({ effect: fx.id })}
            style={{
              flex: 1, padding: '10px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.effect === fx.id ? '#0d2744' : '#21262d',
              color: cfg.effect === fx.id ? '#58a6ff' : '#8b949e',
              outline: cfg.effect === fx.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.7rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2,
            }}>
            <span style={{ fontSize: '1.1rem' }}>{fx.emoji}</span>
            <span>{fx.label}</span>
          </button>
        ))}
      </div>

      <SliderRow lbl="INTENSITET" min={1} max={5} value={cfg.intensity}
        onChange={v => onConfigChange({ intensity: v })} />
      <SliderRow lbl="HASTIGHET" min={1} max={5} value={cfg.speed}
        onChange={v => onConfigChange({ speed: v })} />

      <button onClick={() => onConfigChange({ loop: !cfg.loop })}
        style={{
          marginTop: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: cfg.loop ? '#0d2744' : '#21262d',
          color: cfg.loop ? '#58a6ff' : '#8b949e',
          outline: cfg.loop ? '2px solid #58a6ff' : '2px solid #30363d',
          fontWeight: 700, fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
        <span>🔁</span>
        <span>Repetera</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{cfg.loop ? 'PA' : 'AV'}</span>
      </button>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...label, marginTop: 0 }}>FORHANDSVISNING</div>
        <FxPreview effect={cfg.effect} intensity={cfg.intensity} speed={cfg.speed} loop={cfg.loop} />
      </div>
    </div>
  );
}
