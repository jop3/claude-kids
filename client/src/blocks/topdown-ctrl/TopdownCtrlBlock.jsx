import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TopdownController } from '../../lib/topdownController.js';

const DEMO_OBSTACLES = [
  { x: 60, y: 40, w: 20, h: 20 },
  { x: 120, y: 80, w: 20, h: 20 },
  { x: 30, y: 100, w: 20, h: 20 },
  { x: 150, y: 30, w: 20, h: 20 },
];

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

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

export default function TopdownCtrlBlock({ config, onConfigChange }) {
  const cfg = {
    speed: 200,
    diagonal: true,
    cameraFollow: false,
    ...config,
  };

  const canvasRef = useRef(null);
  const ctrlRef = useRef(null);
  const keysRef = useRef({ left: false, right: false, up: false, down: false });
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const camRef = useRef({ x: 0, y: 0 });

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

    ctrlRef.current = new TopdownController({
      speed: cfg.speed,
      diagonal: cfg.diagonal,
      startX: 90,
      startY: 65,
    });
    camRef.current = { x: 0, y: 0 };
    lastTimeRef.current = null;

    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      if (lastTimeRef.current === null) { lastTimeRef.current = ts; return; }
      const dt = Math.min(ts - lastTimeRef.current, 50);
      lastTimeRef.current = ts;

      const ctrl = ctrlRef.current;
      ctrl.setConfig({ speed: cfg.speed, diagonal: cfg.diagonal });
      ctrl.update(dt, keysRef.current, DEMO_OBSTACLES);

      // Clamp to canvas bounds
      if (ctrl.x < 0) ctrl.x = 0;
      if (ctrl.y < 0) ctrl.y = 0;
      if (ctrl.x > canvas.width - 20) ctrl.x = canvas.width - 20;
      if (ctrl.y > canvas.height - 20) ctrl.y = canvas.height - 20;

      // Camera follow (smooth)
      if (cfg.cameraFollow) {
        const targetCx = ctrl.x - canvas.width / 2 + 10;
        const targetCy = ctrl.y - canvas.height / 2 + 10;
        camRef.current.x += (targetCx - camRef.current.x) * 0.1;
        camRef.current.y += (targetCy - camRef.current.y) * 0.1;
      } else {
        camRef.current.x = 0;
        camRef.current.y = 0;
      }

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1a2e1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const ox = -camRef.current.x;
      const oy = -camRef.current.y;

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let gx = ox % gridSize; gx < canvas.width; gx += gridSize) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, canvas.height); ctx.stroke();
      }
      for (let gy = oy % gridSize; gy < canvas.height; gy += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(canvas.width, gy); ctx.stroke();
      }

      // Obstacles
      for (const o of DEMO_OBSTACLES) {
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(ox + o.x, oy + o.y, o.w, o.h);
        ctx.fillStyle = '#6b5240';
        ctx.fillRect(ox + o.x, oy + o.y, o.w, 3);
      }

      // Player
      const savedX = ctrl.x;
      const savedY = ctrl.y;
      ctrl.x = ox + savedX;
      ctrl.y = oy + savedY;
      ctrl.draw(ctx);
      ctrl.x = savedX;
      ctrl.y = savedY;
    }

    stopLoop();
    rafRef.current = requestAnimationFrame(loop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.speed, cfg.diagonal, cfg.cameraFollow, stopLoop]);

  useEffect(() => {
    const onDown = (e) => {
      const k = keysRef.current;
      if (e.code === 'ArrowLeft'  || e.code === 'KeyA') k.left  = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') k.right = true;
      if (e.code === 'ArrowUp'    || e.code === 'KeyW') k.up    = true;
      if (e.code === 'ArrowDown'  || e.code === 'KeyS') k.down  = true;
    };
    const onUp = (e) => {
      const k = keysRef.current;
      if (e.code === 'ArrowLeft'  || e.code === 'KeyA') k.left  = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') k.right = false;
      if (e.code === 'ArrowUp'    || e.code === 'KeyW') k.up    = false;
      if (e.code === 'ArrowDown'  || e.code === 'KeyS') k.down  = false;
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
        Uppifrån-spel
      </div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 4 }}>
        Rorelser i alla riktningar
      </div>

      <div style={{ ...label, marginTop: 14, display: 'flex', justifyContent: 'space-between' }}>
        <span>HASTIGHET</span>
        <span style={{ color: '#58a6ff' }}>{cfg.speed}</span>
      </div>
      <input
        type="range" min={50} max={400} value={cfg.speed}
        onChange={e => onConfigChange({ speed: Number(e.target.value) })}
        style={{ width: '100%', accentColor: '#58a6ff' }}
      />

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Toggle lbl="Diagonal rorning" emoji="↗️" value={cfg.diagonal}
          onChange={v => onConfigChange({ diagonal: v })} />
        <Toggle lbl="Kamera foljer" emoji="🎥" value={cfg.cameraFollow}
          onChange={v => onConfigChange({ cameraFollow: v })} />
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
