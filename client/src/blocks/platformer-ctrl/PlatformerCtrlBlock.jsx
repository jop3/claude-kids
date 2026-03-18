import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlatformerController } from '../../lib/platformerController.js';

const DEMO_PLATFORMS = [
  { x: 0, y: 118, w: 200, h: 32 },  // ground
  { x: 40, y: 85, w: 50, h: 8 },    // platform 1
  { x: 120, y: 65, w: 50, h: 8 },   // platform 2
];

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

function SliderRow({ lbl, min, max, value, onChange, format }) {
  return (
    <div>
      <div style={{ ...label, display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <span>{lbl}</span>
        <span style={{ color: '#58a6ff' }}>{format ? format(value) : value}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#58a6ff' }}
      />
    </div>
  );
}

function Toggle({ lbl, emoji, value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
        background: value ? '#0d2744' : '#21262d',
        color: value ? '#58a6ff' : '#8b949e',
        fontWeight: 700, fontSize: '0.9rem',
        outline: value ? '2px solid #58a6ff' : '2px solid #30363d',
        width: '100%', justifyContent: 'flex-start',
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
      <span>{lbl}</span>
      <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{value ? 'PÅ' : 'AV'}</span>
    </button>
  );
}

export default function PlatformerCtrlBlock({ config, onConfigChange }) {
  const cfg = {
    speed: 150,
    jumpForce: 400,
    gravity: 800,
    doubleJump: false,
    wallJump: false,
    ...config,
  };

  const canvasRef = useRef(null);
  const ctrlRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, up: false, jump: false });
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const jumpConsumedRef = useRef(false);

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 200;
    canvas.height = 150;

    ctrlRef.current = new PlatformerController({
      speed: cfg.speed,
      jumpForce: cfg.jumpForce,
      gravity: cfg.gravity,
      doubleJump: cfg.doubleJump,
      wallJump: cfg.wallJump,
      startX: 20,
      startY: 80,
    });

    lastTimeRef.current = null;

    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      if (lastTimeRef.current === null) { lastTimeRef.current = ts; return; }
      const dt = Math.min(ts - lastTimeRef.current, 50);
      lastTimeRef.current = ts;

      const keys = keysRef.current;
      const input = {
        left: keys.left,
        right: keys.right,
        up: keys.up && !jumpConsumedRef.current,
        jump: keys.jump && !jumpConsumedRef.current,
      };
      if (keys.up || keys.jump) {
        jumpConsumedRef.current = true;
      }

      const ctrl = ctrlRef.current;
      ctrl.setConfig({ speed: cfg.speed, jumpForce: cfg.jumpForce, gravity: cfg.gravity, doubleJump: cfg.doubleJump, wallJump: cfg.wallJump });
      ctrl.update(dt, input, DEMO_PLATFORMS);

      // Clamp to canvas
      if (ctrl.x < 0) ctrl.x = 0;
      if (ctrl.x > canvas.width - 24) ctrl.x = canvas.width - 24;
      if (ctrl.y > canvas.height) {
        ctrl.x = 20;
        ctrl.y = 80;
      }

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw platforms
      for (const p of DEMO_PLATFORMS) {
        ctx.fillStyle = p.y > 100 ? '#3d4f6b' : '#5c4a3a';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = p.y > 100 ? '#4a6080' : '#7d6550';
        ctx.fillRect(p.x, p.y, p.w, 3);
      }

      ctrl.draw(ctx);
    }

    stopLoop();
    rafRef.current = requestAnimationFrame(loop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.speed, cfg.jumpForce, cfg.gravity, cfg.doubleJump, cfg.wallJump, stopLoop]);

  useEffect(() => {
    const onDown = (e) => {
      const k = keysRef.current;
      if (e.code === 'ArrowLeft'  || e.code === 'KeyA') k.left  = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') k.right = true;
      if (e.code === 'ArrowUp'    || e.code === 'KeyW' || e.code === 'Space') {
        if (!k.up && !k.jump) jumpConsumedRef.current = false;
        k.up = true; k.jump = true;
      }
    };
    const onUp = (e) => {
      const k = keysRef.current;
      if (e.code === 'ArrowLeft'  || e.code === 'KeyA') k.left  = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') k.right = false;
      if (e.code === 'ArrowUp'    || e.code === 'KeyW' || e.code === 'Space') {
        k.up = false; k.jump = false;
        jumpConsumedRef.current = false;
      }
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    startLoop();
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      stopLoop();
    };
  }, [startLoop, stopLoop]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
        Plattformsspel
      </div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 4 }}>
        Hopp och rorelser for din karaktar
      </div>

      <SliderRow lbl="HASTIGHET" min={50} max={300} value={cfg.speed}
        onChange={v => onConfigChange({ speed: v })} />
      <SliderRow lbl="HOPPHOJD" min={200} max={600} value={cfg.jumpForce}
        onChange={v => onConfigChange({ jumpForce: v })} />
      <SliderRow lbl="GRAVITATION" min={400} max={1200} value={cfg.gravity}
        onChange={v => onConfigChange({ gravity: v })} />

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Toggle lbl="Dubbelhopp" emoji="🦘" value={cfg.doubleJump}
          onChange={v => onConfigChange({ doubleJump: v })} />
        <Toggle lbl="Vagghopp" emoji="🧗" value={cfg.wallJump}
          onChange={v => onConfigChange({ wallJump: v })} />
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...label, marginTop: 0 }}>TESTA (pil-tangenter / WASD)</div>
        <div style={{
          borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d',
          display: 'inline-block', cursor: 'crosshair',
        }}>
          <canvas ref={canvasRef} style={{ display: 'block', imageRendering: 'pixelated' }} />
        </div>
      </div>
    </div>
  );
}
