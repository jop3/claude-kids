import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

const COLOR_PRESETS = [
  { id: 'cyan',  label: 'Cyan',  color: '#4ecdc4' },
  { id: 'purple', label: 'Lila', color: '#6c3bbd' },
  { id: 'green', label: 'Neon',  color: '#a8e6cf' },
];

export default function WaveformBlock({ config, onConfigChange }) {
  const mode        = config?.mode        ?? 'waveform'; // 'waveform' | 'spectrum'
  const colorId     = config?.colorId     ?? 'cyan';
  const sensitivity = config?.sensitivity ?? 50;

  const canvasRef   = useRef(null);
  const analyserRef = useRef(null);
  const rafRef      = useRef(null);

  const colorEntry  = COLOR_PRESETS.find(c => c.id === colorId) || COLOR_PRESETS[0];
  const drawColor   = colorEntry.color;

  // Create / recreate analyser when mode changes
  useEffect(() => {
    // Dispose old analyser
    if (analyserRef.current) {
      try { analyserRef.current.disconnect(); } catch (_) {}
      try { analyserRef.current.dispose(); } catch (_) {}
      analyserRef.current = null;
    }

    const analyserType = mode === 'spectrum' ? 'fft' : 'waveform';
    const size         = mode === 'spectrum' ? 32 : 256;
    const analyser     = new Tone.Analyser(analyserType, size);
    Tone.getDestination().connect(analyser);
    analyserRef.current = analyser;

    return () => {
      cancelAnimationFrame(rafRef.current);
      try { analyser.disconnect(); } catch (_) {}
      try { analyser.dispose(); } catch (_) {}
    };
  }, [mode]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let running = true;

    function draw() {
      if (!running) return;
      rafRef.current = requestAnimationFrame(draw);

      const analyser = analyserRef.current;
      if (!analyser) return;

      const ctx = canvas.getContext('2d');
      const W   = canvas.width;
      const H   = canvas.height;
      const amp = sensitivity / 50; // 0..2

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, W, H);

      let data;
      try { data = analyser.getValue(); } catch (_) { return; }

      ctx.strokeStyle = drawColor;
      ctx.fillStyle   = drawColor;
      ctx.lineWidth   = 2;

      if (mode === 'waveform') {
        // oscilloscope line
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
          const x = (i / (data.length - 1)) * W;
          const y = H / 2 - data[i] * (H / 2) * amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        // frequency bars
        const barW = W / data.length;
        for (let i = 0; i < data.length; i++) {
          // data is dB values roughly -100..0
          const normalized = Math.max(0, (data[i] + 100) / 100) * amp;
          const barH = normalized * H;
          const x = i * barW;
          ctx.fillRect(x, H - barH, barW - 1, barH);
        }
      }
    }

    draw();
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, drawColor, sensitivity]);

  // Keep canvas sized to its container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        canvas.width  = entry.contentRect.width;
        canvas.height = 120;
      }
    });
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  function set(patch) {
    onConfigChange({ ...config, ...patch });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        〰️ Vågor
      </div>

      {/* Canvas */}
      <div style={{ width: '100%', borderRadius: 10, overflow: 'hidden', background: '#0d1117', border: '1px solid #30363d' }}>
        <canvas
          ref={canvasRef}
          width={300}
          height={120}
          style={{ display: 'block', width: '100%', height: 120 }}
        />
      </div>

      {/* Mode toggle */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          LÄGE
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'waveform', label: '〰️ Våg' },
            { id: 'spectrum', label: '📊 Spektrum' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => set({ mode: m.id })}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 10,
                border: mode === m.id ? '2px solid #58a6ff' : '2px solid #30363d',
                background: mode === m.id ? '#0d2744' : '#21262d',
                color: '#e6edf3',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color presets */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          FÄRG
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {COLOR_PRESETS.map(cp => (
            <button
              key={cp.id}
              onClick={() => set({ colorId: cp.id })}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 10,
                border: colorId === cp.id ? `2px solid ${cp.color}` : '2px solid #30363d',
                background: colorId === cp.id ? '#0d2744' : '#21262d',
                color: cp.color,
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {cp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sensitivity slider */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          KÄNSLIGHET — {sensitivity}
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={sensitivity}
          onChange={e => set({ sensitivity: Number(e.target.value) })}
          style={{ width: '100%', accentColor: drawColor }}
        />
      </div>
    </div>
  );
}
