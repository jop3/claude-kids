import React, { useEffect, useRef, useState } from 'react';
import { TypewriterEffect } from '../../lib/storyEngine.js';

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

const SPEEDS = [
  { id: 'slow',   label: 'Lång',   chars: 10 },
  { id: 'medium', label: 'Medel',  chars: 30 },
  { id: 'fast',   label: 'Snabb',  chars: 80 },
];

function TypewriterPreview({ text, speed, sound }) {
  const canvasRef = useRef(null);
  const twRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    twRef.current = new TypewriterEffect(text || 'Hallå!', speed);
    lastTsRef.current = null;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 200;
    canvas.height = 80;

    function playBlip() {
      if (!sound) return;
      try {
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 600 + Math.random() * 200;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } catch {}
    }

    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.1);
      lastTsRef.current = ts;

      const tw = twRef.current;
      if (tw.isDone) {
        setTimeout(() => { tw.reset(); lastTsRef.current = null; }, 800);
      }
      const newChars = tw.update(dt);
      if (newChars > 0) playBlip();

      const ctx2d = canvas.getContext('2d');
      ctx2d.fillStyle = '#0d1117';
      ctx2d.fillRect(0, 0, 200, 80);
      ctx2d.fillStyle = '#e6edf3';
      ctx2d.font = '13px monospace';
      ctx2d.textBaseline = 'top';

      const visible = tw.visibleText;
      const maxW = 190;
      const words = visible.split(' ');
      let line = '';
      let lineY = 8;
      for (const word of words) {
        const test = line ? line + ' ' + word : word;
        if (ctx2d.measureText(test).width > maxW && line) {
          ctx2d.fillText(line, 5, lineY);
          line = word;
          lineY += 18;
        } else {
          line = test;
        }
      }
      if (line) ctx2d.fillText(line, 5, lineY);

      // Cursor blink
      const blink = Math.floor(ts / 400) % 2 === 0;
      if (!tw.isDone && blink) {
        const lastLine = visible.split('\n').pop() || '';
        const cw = ctx2d.measureText(line).width;
        ctx2d.fillStyle = '#58a6ff';
        ctx2d.fillRect(5 + cw + 2, lineY, 2, 14);
      }
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, sound]);

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d', display: 'inline-block' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

export default function TypewriterBlock({ config, onConfigChange }) {
  const cfg = {
    text: 'Skriv din text har...',
    speed: 30,
    sound: false,
    ...config,
  };

  const speedId = SPEEDS.find(s => s.chars === cfg.speed)?.id || 'medium';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Skrivmaskin</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Text som skrivs fram bokstav for bokstav</div>

      <div style={label}>TEXT</div>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onConfigChange({ text: e.currentTarget.innerText.trim() || cfg.text })}
        style={{
          background: '#21262d',
          border: '1px solid #30363d',
          borderRadius: 8,
          padding: '10px 12px',
          color: '#e6edf3',
          fontSize: '0.9rem',
          minHeight: 60,
          outline: 'none',
          lineHeight: 1.5,
        }}
      >
        {cfg.text}
      </div>

      <div style={label}>HASTIGHET</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {SPEEDS.map(s => (
          <button key={s.id} onClick={() => onConfigChange({ speed: s.chars })}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: speedId === s.id ? '#0d2744' : '#21262d',
              color: speedId === s.id ? '#58a6ff' : '#8b949e',
              outline: speedId === s.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.85rem',
            }}>
            {s.label}
          </button>
        ))}
      </div>

      <button onClick={() => onConfigChange({ sound: !cfg.sound })}
        style={{
          marginTop: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: cfg.sound ? '#0d2744' : '#21262d',
          color: cfg.sound ? '#58a6ff' : '#8b949e',
          outline: cfg.sound ? '2px solid #58a6ff' : '2px solid #30363d',
          fontWeight: 700, fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
        <span>⌨️</span>
        <span>Tangentbordsljud</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{cfg.sound ? 'PA' : 'AV'}</span>
      </button>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...label, marginTop: 0 }}>FORHANDSVISNING</div>
        <TypewriterPreview text={cfg.text} speed={cfg.speed} sound={cfg.sound} />
        <button
          onClick={() => {}}
          style={{
            marginTop: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid #30363d',
            background: '#21262d', color: '#e6edf3', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
          }}>
          Hoppa over
        </button>
      </div>
    </div>
  );
}
