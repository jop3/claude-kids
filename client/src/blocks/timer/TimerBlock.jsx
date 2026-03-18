import React, { useEffect, useRef } from 'react';

const DURATIONS = [10, 30, 60, 120];
const ON_EXPIRE = [
  { id: 'gameover', label: 'Game Over', emoji: '💀' },
  { id: 'win',      label: 'Vinn',      emoji: '🏆' },
  { id: 'continue', label: 'Fortsatt',  emoji: '▶️' },
];
const DISPLAY_STYLES = [
  { id: 'digital', label: 'Digital',  emoji: '🔢' },
  { id: 'bar',     label: 'Bar',      emoji: '▬' },
];

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

function TimerPreview({ mode, duration, displayStyle }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 200;
    canvas.height = 70;
    startRef.current = null;

    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ((ts - startRef.current) / 1000) % duration;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, 200, 70);

      const displaySec = mode === 'countdown' ? Math.max(0, duration - elapsed) : elapsed;
      const mins = Math.floor(displaySec / 60);
      const secs = Math.floor(displaySec % 60);
      const timeStr = mins > 0
        ? `${mins}:${String(secs).padStart(2, '0')}`
        : String(secs).padStart(2, '0');

      if (displayStyle === 'digital') {
        ctx.fillStyle = mode === 'countdown' && displaySec < 10 ? '#ff4444' : '#58a6ff';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(timeStr, 100, 35);
      } else {
        // Bar
        const ratio = mode === 'countdown'
          ? Math.max(0, (duration - elapsed) / duration)
          : Math.min(1, elapsed / duration);
        const barColor = ratio < 0.25 ? '#ff4444' : ratio < 0.5 ? '#ffa500' : '#4caf50';
        ctx.fillStyle = '#21262d';
        ctx.beginPath();
        ctx.roundRect(20, 20, 160, 20, 6);
        ctx.fill();
        if (ratio > 0) {
          ctx.fillStyle = barColor;
          ctx.beginPath();
          ctx.roundRect(20, 20, Math.max(12, 160 * ratio), 20, 6);
          ctx.fill();
        }
        ctx.fillStyle = '#e6edf3';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(timeStr, 100, 54);
      }
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, duration, displayStyle]);

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d', display: 'inline-block' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

export default function TimerBlock({ config, onConfigChange }) {
  const cfg = {
    mode: 'countdown',
    duration: 60,
    onExpire: 'gameover',
    displayStyle: 'digital',
    ...config,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Timer</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Nedrakning eller stoppur</div>

      <div style={label}>LÄGE</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onConfigChange({ mode: 'countdown' })}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: cfg.mode === 'countdown' ? '#0d2744' : '#21262d',
            color: cfg.mode === 'countdown' ? '#58a6ff' : '#8b949e',
            outline: cfg.mode === 'countdown' ? '2px solid #58a6ff' : '2px solid #30363d',
            fontWeight: 700, fontSize: '0.85rem',
          }}>
          ⏬ Nedrakning
        </button>
        <button onClick={() => onConfigChange({ mode: 'stopwatch' })}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: cfg.mode === 'stopwatch' ? '#0d2744' : '#21262d',
            color: cfg.mode === 'stopwatch' ? '#58a6ff' : '#8b949e',
            outline: cfg.mode === 'stopwatch' ? '2px solid #58a6ff' : '2px solid #30363d',
            fontWeight: 700, fontSize: '0.85rem',
          }}>
          ⏱️ Stoppur
        </button>
      </div>

      {cfg.mode === 'countdown' && (
        <>
          <div style={label}>TID (SEKUNDER)</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {DURATIONS.map(d => (
              <button key={d} onClick={() => onConfigChange({ duration: d })}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: cfg.duration === d ? '#0d2744' : '#21262d',
                  color: cfg.duration === d ? '#58a6ff' : '#8b949e',
                  outline: cfg.duration === d ? '2px solid #58a6ff' : '2px solid #30363d',
                  fontWeight: 700, fontSize: '0.85rem',
                }}>
                {d}s
              </button>
            ))}
          </div>

          <div style={label}>NAR TIDEN TAR SLUT</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ON_EXPIRE.map(e => (
              <button key={e.id} onClick={() => onConfigChange({ onExpire: e.id })}
                style={{
                  padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: cfg.onExpire === e.id ? '#0d2744' : '#21262d',
                  color: cfg.onExpire === e.id ? '#58a6ff' : '#8b949e',
                  outline: cfg.onExpire === e.id ? '2px solid #58a6ff' : '2px solid #30363d',
                  fontWeight: 700, fontSize: '0.85rem',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                <span style={{ fontSize: '1.1rem' }}>{e.emoji}</span>
                <span>{e.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div style={label}>VISNINGSSTIL</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {DISPLAY_STYLES.map(s => (
          <button key={s.id} onClick={() => onConfigChange({ displayStyle: s.id })}
            style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.displayStyle === s.id ? '#0d2744' : '#21262d',
              color: cfg.displayStyle === s.id ? '#58a6ff' : '#8b949e',
              outline: cfg.displayStyle === s.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.85rem',
            }}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...label, marginTop: 0 }}>FORHANDSVISNING</div>
        <TimerPreview mode={cfg.mode} duration={cfg.duration} displayStyle={cfg.displayStyle} />
      </div>
    </div>
  );
}
