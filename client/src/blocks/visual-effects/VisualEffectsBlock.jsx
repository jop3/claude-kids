import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  playShake,
  playFlash,
  playGlow,
  playTrail,
  playExplosion,
  playRainbow,
} from '../../lib/visualEffects.js';

const EFFECTS = [
  { id: 'shake',     emoji: '\u{1F4F3}', label: 'Skaka' },
  { id: 'flash',     emoji: '\u26A1',    label: 'Blixt' },
  { id: 'glow',      emoji: '\u{1F31F}', label: 'Glow' },
  { id: 'trail',     emoji: '\u{1F4AB}', label: 'Spar' },
  { id: 'explosion', emoji: '\u{1F4A5}', label: 'Explosion' },
  { id: 'rainbow',   emoji: '\u{1F308}', label: 'Regnbage' },
];

const GLOW_COLORS = ['#00e5ff', '#ff6bcb', '#ffd93d', '#6bcb77', '#c77dff'];
const FLASH_COLORS = ['#ffffff', '#ffd93d', '#ff6b6b', '#00e5ff', '#c77dff'];

export default function VisualEffectsBlock({ config = {}, onConfigChange }) {
  const [selectedEffect, setSelectedEffect] = useState(config.effect || 'shake');
  const [intensity, setIntensity] = useState(config.intensity ?? 3);
  const [loop, setLoop] = useState(config.loop ?? false);
  const [previewing, setPreviewing] = useState(false);
  const previewCanvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const stopFnRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stopFnRef.current) stopFnRef.current();
    };
  }, []);

  function handleSelect(effectId) {
    stopPreview();
    setSelectedEffect(effectId);
    onConfigChange({ effect: effectId, intensity, loop });
  }

  function handleIntensityChange(val) {
    const v = Number(val);
    setIntensity(v);
    onConfigChange({ effect: selectedEffect, intensity: v, loop });
  }

  function handleLoopToggle() {
    const next = !loop;
    setLoop(next);
    onConfigChange({ effect: selectedEffect, intensity, loop: next });
  }

  function stopPreview() {
    if (stopFnRef.current) {
      stopFnRef.current();
      stopFnRef.current = null;
    }
    setPreviewing(false);
    // Clear canvases
    const oc = overlayCanvasRef.current;
    if (oc) {
      const ctx = oc.getContext('2d');
      ctx.clearRect(0, 0, oc.width, oc.height);
      oc.style.transform = '';
    }
    const pc = previewCanvasRef.current;
    if (pc) pc.style.transform = '';
  }

  const runPreview = useCallback(() => {
    if (previewing) { stopPreview(); return; }

    const overlayCanvas = overlayCanvasRef.current;
    const shakeTarget = previewCanvasRef.current;
    if (!overlayCanvas || !shakeTarget) return;

    setPreviewing(true);

    const onComplete = () => {
      stopFnRef.current = null;
      setPreviewing(false);
    };

    let stopFn;
    switch (selectedEffect) {
      case 'shake':
        stopFn = playShake(shakeTarget, intensity, loop, onComplete);
        break;
      case 'flash':
        stopFn = playFlash(overlayCanvas, FLASH_COLORS[intensity - 1] || '#ffffff', intensity, loop, onComplete);
        break;
      case 'glow':
        stopFn = playGlow(overlayCanvas, GLOW_COLORS[intensity - 1] || '#00e5ff', intensity, loop, onComplete);
        break;
      case 'trail': {
        // Generate sample positions
        const W = overlayCanvas.width;
        const H = overlayCanvas.height;
        const positions = Array.from({ length: intensity * 3 }, (_, i) => ({
          x: 20 + (i / (intensity * 3)) * (W - 40),
          y: H / 2 + Math.sin(i * 0.8) * 30,
        }));
        playTrail(overlayCanvas, positions, intensity, onComplete);
        stopFn = () => {
          const ctx = overlayCanvas.getContext('2d');
          ctx.clearRect(0, 0, W, H);
        };
        break;
      }
      case 'explosion': {
        const W = overlayCanvas.width;
        const H = overlayCanvas.height;
        stopFn = playExplosion(overlayCanvas, W / 2, H / 2, intensity, onComplete);
        break;
      }
      case 'rainbow':
        stopFn = playRainbow(overlayCanvas, intensity, loop, onComplete);
        break;
      default:
        onComplete();
        return;
    }

    stopFnRef.current = stopFn || (() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEffect, intensity, loop, previewing]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        {'\u{1F4A5}'} Effekter
      </div>

      {/* 2x3 effect grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}>
        {EFFECTS.map(e => (
          <button
            key={e.id}
            onClick={() => handleSelect(e.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '12px 8px',
              borderRadius: 10,
              border: selectedEffect === e.id ? '2px solid #58a6ff' : '2px solid #30363d',
              background: selectedEffect === e.id ? '#0d2744' : '#21262d',
              color: '#e6edf3',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: 64,
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>{e.emoji}</span>
            <span>{e.label}</span>
          </button>
        ))}
      </div>

      {/* Intensity slider */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.8rem', marginBottom: 6, fontWeight: 600 }}>
          Styrka: {intensity}
        </div>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={intensity}
          onChange={e => handleIntensityChange(e.target.value)}
          style={{ width: '100%', accentColor: '#58a6ff' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b949e', fontSize: '0.7rem' }}>
          <span>Svag</span><span>Stark</span>
        </div>
      </div>

      {/* Loop toggle */}
      <button
        onClick={handleLoopToggle}
        style={{
          padding: '10px',
          borderRadius: 8,
          border: loop ? '2px solid #58a6ff' : '2px solid #30363d',
          background: loop ? '#0d2744' : '#21262d',
          color: loop ? '#58a6ff' : '#8b949e',
          fontWeight: 700,
          fontSize: '0.85rem',
          cursor: 'pointer',
        }}
      >
        {loop ? '\u{1F501} Loopas' : '\u{1F502} En gang'}
      </button>

      {/* Preview canvas */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ color: '#8b949e', fontSize: '0.8rem', fontWeight: 600 }}>Forhandsgranskning</div>
        <div style={{ position: 'relative', width: 150, height: 150 }}>
          {/* Base canvas — checker background */}
          <canvas
            ref={previewCanvasRef}
            width={150}
            height={150}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: 8,
              background: 'repeating-conic-gradient(#21262d 0% 25%, #2d333b 0% 50%) 0 0 / 20px 20px',
            }}
          />
          {/* Character dot */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6c3bbd, #58a6ff)',
            pointerEvents: 'none',
          }} />
          {/* Overlay canvas for effects */}
          <canvas
            ref={overlayCanvasRef}
            width={150}
            height={150}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: 8,
              pointerEvents: 'none',
            }}
          />
        </div>
        <button
          onClick={runPreview}
          style={{
            padding: '8px 24px',
            borderRadius: 8,
            border: 'none',
            background: previewing ? '#6e40c9' : '#238636',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          {previewing ? '\u23F9 Stoppa' : '\u25B6 Testa'}
        </button>
      </div>
    </div>
  );
}
