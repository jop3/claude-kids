import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ParticleEngine } from '../../lib/particleEngine.js';

const EFFECTS = [
  { id: 'fire',     emoji: '\uD83D\uDD25', name: 'Eld' },
  { id: 'snow',     emoji: '\u2744\uFE0F', name: 'Sn\u00F6' },
  { id: 'confetti', emoji: '\uD83C\uDF89', name: 'Konfetti' },
  { id: 'sparkles', emoji: '\u2728',       name: 'Gnistor' },
  { id: 'rain',     emoji: '\uD83C\uDF27\uFE0F', name: 'Regn' },
  { id: 'bubbles',  emoji: '\uD83E\uDEA7', name: 'Bubblor' },
];

const TINT_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bcb', '#c77dff'];

const DEFAULT_CONFIG = {
  type: 'confetti',
  count: 50,
  speed: 5,
  size: 6,
  continuous: true,
  tint: null,
};

export default function ParticleFxBlock({ config = {}, onConfigChange }) {
  const merged = { ...DEFAULT_CONFIG, ...config };
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const mergedRef = useRef(merged);

  // Keep mergedRef in sync
  useEffect(() => {
    mergedRef.current = { ...DEFAULT_CONFIG, ...config };
  }, [config]);

  const startEngine = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = 200;
    canvas.height = 200;

    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current.clear();
    }

    const engine = new ParticleEngine(canvas, ctx);
    engineRef.current = engine;

    const cfg = mergedRef.current;
    engine.spawn(cfg.type, {
      count: cfg.count,
      speed: cfg.speed,
      size: cfg.size,
      continuous: cfg.continuous,
      tint: cfg.tint,
    });

    let running = true;
    lastTimeRef.current = null;

    function loop(ts) {
      if (!running) return;
      if (lastTimeRef.current === null) lastTimeRef.current = ts;
      const dt = Math.min(ts - lastTimeRef.current, 50);
      lastTimeRef.current = ts;

      ctx.clearRect(0, 0, 200, 200);

      // dark bg
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, 200, 200);

      engine.update(dt);
      engine.draw();

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Restart engine when type changes
  useEffect(() => {
    const cleanup = startEngine();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (engineRef.current) { engineRef.current.stop(); engineRef.current.clear(); }
      if (cleanup) cleanup();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merged.type]);

  // Update engine config on slider changes without full restart
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    engine.stop();
    engine.clear();
    engine.spawn(merged.type, {
      count: merged.count,
      speed: merged.speed,
      size: merged.size,
      continuous: merged.continuous,
      tint: merged.tint,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merged.count, merged.speed, merged.size, merged.continuous, merged.tint]);

  function update(partial) {
    onConfigChange && onConfigChange({ ...merged, ...partial });
  }

  const labelStyle = {
    color: '#8b949e',
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 6,
    display: 'block',
  };

  const sliderStyle = {
    width: '100%',
    accentColor: '#58a6ff',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title */}
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        ✨ Effekter
      </div>

      {/* Effect picker — 2×3 grid */}
      <div>
        <span style={labelStyle}>VÄLJ EFFEKT</span>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}>
          {EFFECTS.map(fx => (
            <button
              key={fx.id}
              onClick={() => update({ type: fx.id })}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '10px 8px',
                borderRadius: 10,
                border: merged.type === fx.id ? '2px solid #58a6ff' : '2px solid #30363d',
                background: merged.type === fx.id ? '#0d2744' : '#21262d',
                color: '#e6edf3',
                fontSize: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span>{fx.emoji}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{fx.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live preview canvas */}
      <div>
        <span style={labelStyle}>FÖRHANDSVISNING</span>
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          style={{
            borderRadius: 10,
            border: '1px solid #30363d',
            display: 'block',
            width: '100%',
            maxWidth: 200,
          }}
        />
      </div>

      {/* Config sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <span style={labelStyle}>ANTAL ({merged.count})</span>
          <input
            type="range"
            min={10}
            max={200}
            value={merged.count}
            onChange={e => update({ count: Number(e.target.value) })}
            style={sliderStyle}
          />
        </div>
        <div>
          <span style={labelStyle}>HASTIGHET ({merged.speed})</span>
          <input
            type="range"
            min={1}
            max={10}
            value={merged.speed}
            onChange={e => update({ speed: Number(e.target.value) })}
            style={sliderStyle}
          />
        </div>
        <div>
          <span style={labelStyle}>STORLEK ({merged.size})</span>
          <input
            type="range"
            min={2}
            max={20}
            value={merged.size}
            onChange={e => update({ size: Number(e.target.value) })}
            style={sliderStyle}
          />
        </div>
      </div>

      {/* Color tint (for confetti/sparkles) */}
      {(merged.type === 'confetti' || merged.type === 'sparkles') && (
        <div>
          <span style={labelStyle}>FÄRG</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => update({ tint: null })}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: merged.tint === null ? '3px solid #58a6ff' : '2px solid #30363d',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 33%, #6bcb77 66%, #4d96ff 100%)',
                cursor: 'pointer',
              }}
              title="Slumpmässig"
            />
            {TINT_COLORS.map(c => (
              <button
                key={c}
                onClick={() => update({ tint: c })}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: merged.tint === c ? '3px solid #58a6ff' : '2px solid #30363d',
                  background: c,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Emitter mode toggle */}
      <div>
        <span style={labelStyle}>LÄGE</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: '💥 Burst', value: false },
            { label: '♾️ Löpande', value: true },
          ].map(opt => (
            <button
              key={String(opt.value)}
              onClick={() => update({ continuous: opt.value })}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 8,
                border: merged.continuous === opt.value ? '2px solid #58a6ff' : '2px solid #30363d',
                background: merged.continuous === opt.value ? '#0d2744' : '#21262d',
                color: '#e6edf3',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
