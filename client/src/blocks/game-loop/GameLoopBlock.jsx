import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createEngine } from '../../lib/gameEngine.js';
import { TitleScene, SceneManager } from '../../lib/sceneManager.js';

const BG_SWATCHES = ['#1a1a2e', '#0d1b2a', '#1b2838', '#2d1b33', '#1a2e1a', '#2e1a1a'];
const CANVAS_SIZES = [
  { label: '320x240', w: 320, h: 240 },
  { label: '480x270', w: 480, h: 270 },
  { label: '640x360', w: 640, h: 360 },
];
const WORD_ADJECTIVES = ['Super', 'Mega', 'Ultra', 'Turbo', 'Hyper', 'Galaxy', 'Laser', 'Ninja'];
const WORD_NOUNS     = ['Hopp', 'Lopp', 'Kamp', 'Äventyr', 'Quest', 'Rush', 'Dash', 'Jump'];

function randomTitle() {
  const adj  = WORD_ADJECTIVES[Math.floor(Math.random() * WORD_ADJECTIVES.length)];
  const noun = WORD_NOUNS[Math.floor(Math.random() * WORD_NOUNS.length)];
  return adj + ' ' + noun;
}

export default function GameLoopBlock({ config, onConfigChange }) {
  const cfg = {
    gameTitle: 'Mitt Spel',
    backgroundColor: '#1a1a2e',
    canvasSizeIndex: 0,
    ...config,
  };

  const [fps, setFps] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const fpsTimerRef = useRef(null);

  const stopPreview = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }
    if (fpsTimerRef.current) {
      clearInterval(fpsTimerRef.current);
      fpsTimerRef.current = null;
    }
    setFps(0);
    setPreviewing(false);
  }, []);

  const startPreview = useCallback(() => {
    if (!canvasRef.current) return;
    const sizeConf = CANVAS_SIZES[cfg.canvasSizeIndex] || CANVAS_SIZES[0];
    const canvas = canvasRef.current;
    canvas.width = sizeConf.w;
    canvas.height = sizeConf.h;

    const engine = createEngine(canvas);
    const manager = new SceneManager(engine);
    const title = new TitleScene({
      gameTitle: cfg.gameTitle,
      backgroundColor: cfg.backgroundColor,
      manager,
    });
    engine.setScene(title);
    engine.start();
    engineRef.current = engine;

    fpsTimerRef.current = setInterval(() => {
      setFps(engine.fps);
    }, 500);

    setPreviewing(true);
  }, [cfg.gameTitle, cfg.backgroundColor, cfg.canvasSizeIndex]);

  useEffect(() => {
    return () => stopPreview();
  }, [stopPreview]);

  const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 8, marginTop: 16 };
  const swatch = (color, selected) => ({
    width: 32, height: 32, borderRadius: 6, background: color,
    border: selected ? '3px solid #58a6ff' : '3px solid transparent',
    cursor: 'pointer', flexShrink: 0,
  });
  const sizeBtn = (selected) => ({
    padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
    border: selected ? '2px solid #58a6ff' : '2px solid #30363d',
    background: selected ? '#0d2744' : '#21262d',
    color: selected ? '#58a6ff' : '#c9d1d9',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
        Spelmotor
      </div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>
        Rattlar och motor for ditt spel
      </div>

      {/* Game title */}
      <div style={label}>SPELTITEL</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={cfg.gameTitle}
          onChange={e => onConfigChange({ gameTitle: e.target.value })}
          style={{
            flex: 1, background: '#21262d', border: '1px solid #30363d',
            color: '#e6edf3', borderRadius: 8, padding: '8px 12px',
            fontSize: '0.9rem', outline: 'none',
          }}
        />
        <button
          onClick={() => onConfigChange({ gameTitle: randomTitle() })}
          style={{
            padding: '8px 12px', borderRadius: 8, border: '1px solid #30363d',
            background: '#21262d', color: '#c9d1d9', cursor: 'pointer',
            fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap',
          }}
        >
          Slumpa!
        </button>
      </div>

      {/* Background color */}
      <div style={label}>BAKGRUNDSFARG</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {BG_SWATCHES.map(c => (
          <div
            key={c}
            style={swatch(c, cfg.backgroundColor === c)}
            onClick={() => onConfigChange({ backgroundColor: c })}
          />
        ))}
      </div>

      {/* Canvas size */}
      <div style={label}>STORLEK</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {CANVAS_SIZES.map((s, i) => (
          <button
            key={s.label}
            style={sizeBtn(cfg.canvasSizeIndex === i)}
            onClick={() => onConfigChange({ canvasSizeIndex: i })}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* FPS display */}
      {previewing && (
        <div style={{
          marginTop: 12, padding: '6px 12px', borderRadius: 8,
          background: '#21262d', border: '1px solid #30363d',
          color: fps >= 50 ? '#3fb950' : fps >= 30 ? '#f0883e' : '#f85149',
          fontWeight: 700, fontSize: '0.85rem', textAlign: 'center',
        }}>
          {fps} FPS
        </div>
      )}

      {/* Preview button */}
      <button
        onClick={previewing ? stopPreview : startPreview}
        style={{
          marginTop: 16, padding: '12px', borderRadius: 10, border: 'none',
          background: previewing ? '#6e40c9' : '#1f6feb',
          color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
        }}
      >
        {previewing ? 'Stoppa' : 'Testa spelet'}
      </button>

      {/* Preview canvas */}
      {previewing && (
        <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d' }}>
          <canvas
            ref={canvasRef}
            style={{ display: 'block', width: '100%', imageRendering: 'pixelated' }}
          />
        </div>
      )}
      {!previewing && (
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      )}
    </div>
  );
}
