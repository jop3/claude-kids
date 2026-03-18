import React, { useRef, useEffect, useState } from 'react';

const SHAPES = [
  { id: 'circle',   label: 'Cirkel',   emoji: '\u26ab' },
  { id: 'square',   label: 'Kvadrat',  emoji: '\u2b1b' },
  { id: 'star',     label: 'Stjarna',  emoji: '\u2b50' },
  { id: 'pawn',     label: 'Bonde',    emoji: '\u265f\ufe0f' },
  { id: 'triangle', label: 'Triangel', emoji: '\ud83d\udd3a' },
  { id: 'heart',    label: 'Hjarta',   emoji: '\u2764\ufe0f' },
];

const COLORS = ['#e94560', '#2e86de', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c'];
const SIZES  = [
  { id: 'small',  label: 'Liten',  r: 8 },
  { id: 'medium', label: 'Medel',  r: 13 },
  { id: 'large',  label: 'Stor',   r: 18 },
];

function drawPiece(ctx, x, y, shape, color, r) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.95;

  if (shape === 'circle') {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'square') {
    ctx.beginPath();
    ctx.roundRect(x - r, y - r, r * 2, r * 2, 3);
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'star') {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outer = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      const inner = outer + Math.PI / 5;
      if (i === 0) ctx.moveTo(x + Math.cos(outer) * r, y + Math.sin(outer) * r);
      else         ctx.lineTo(x + Math.cos(outer) * r, y + Math.sin(outer) * r);
      ctx.lineTo(x + Math.cos(inner) * r * 0.45, y + Math.sin(inner) * r * 0.45);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'pawn') {
    ctx.beginPath();
    ctx.arc(x, y - r * 0.3, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - r * 0.6, y + r * 0.8);
    ctx.quadraticCurveTo(x - r * 0.7, y + r * 0.1, x - r * 0.35, y + r * 0.15);
    ctx.lineTo(x + r * 0.35, y + r * 0.15);
    ctx.quadraticCurveTo(x + r * 0.7, y + r * 0.1, x + r * 0.6, y + r * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r * 0.87, y + r * 0.5);
    ctx.lineTo(x - r * 0.87, y + r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'heart') {
    ctx.beginPath();
    ctx.moveTo(x, y + r * 0.6);
    ctx.bezierCurveTo(x - r * 1.1, y - r * 0.1, x - r * 1.1, y - r * 0.9, x, y - r * 0.3);
    ctx.bezierCurveTo(x + r * 1.1, y - r * 0.9, x + r * 1.1, y - r * 0.1, x, y + r * 0.6);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export default function GamePieceBlock({ config = {}, onConfigChange }) {
  const shape      = config.shape      || 'circle';
  const color      = config.color      || COLORS[0];
  const sizeId     = config.size       || 'medium';
  const count      = config.count      || 2;
  const sizeObj    = SIZES.find(s => s.id === sizeId) || SIZES[1];

  const canvasRef  = useRef(null);
  const [movedIdx, setMovedIdx] = useState(null);
  const [positions, setPositions] = useState(null);

  const CANVAS_W = 200;
  const CANVAS_H = 80;

  function getDefaultPositions(n, r) {
    return Array.from({ length: n }, (_, i) => ({
      x: 20 + i * ((CANVAS_W - 40) / Math.max(n - 1, 1)),
      y: CANVAS_H / 2,
      moved: false,
    }));
  }

  // Reset positions when count/size changes
  useEffect(() => {
    setPositions(getDefaultPositions(count, sizeObj.r));
    setMovedIdx(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, sizeId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Board segment background
    const pat = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    pat.addColorStop(0, '#2d5a1a');
    pat.addColorStop(1, '#1a3a1a');
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid lines hint
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_W; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
    }
    for (let y = 0; y < CANVAS_H; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
    }

    const pos = positions || getDefaultPositions(count, sizeObj.r);
    pos.forEach((p, i) => {
      const pColor = i === 0 ? color : COLORS[i % COLORS.length];
      drawPiece(ctx, p.x, p.y, shape, pColor, sizeObj.r);
      if (movedIdx === i) {
        // Highlight ring
        ctx.save();
        ctx.strokeStyle = '#ffe066';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, sizeObj.r + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    });
  }, [shape, color, sizeObj, count, positions, movedIdx]);

  function handleCanvasClick(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top)  * scaleY;

    const pos = positions || getDefaultPositions(count, sizeObj.r);
    const hitIdx = pos.findIndex(p => Math.hypot(cx - p.x, cy - p.y) < sizeObj.r + 6);
    if (hitIdx >= 0) {
      // "Move" that piece one step to the right
      setMovedIdx(hitIdx);
      setPositions(prev => {
        const next = prev ? [...prev] : getDefaultPositions(count, sizeObj.r);
        const p = { ...next[hitIdx] };
        p.x = Math.min(CANVAS_W - sizeObj.r - 4, p.x + 20);
        next[hitIdx] = p;
        return next;
      });
    }
  }

  const label = { color: '#8b949e', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4, marginTop: 10 };

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>Spelbricker</div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onClick={handleCanvasClick}
        style={{ display: 'block', margin: '0 auto', cursor: 'pointer', borderRadius: 6, border: '1px solid #30363d', maxWidth: '100%' }}
      />
      <div style={{ textAlign: 'center', color: '#8b949e', fontSize: '0.72rem', marginTop: 4 }}>Tryck pa en bricka for att flytta den</div>

      <div style={{ background: '#21262d', borderRadius: 8, padding: '10px 12px', marginTop: 10 }}>
        <div style={label}>Form</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SHAPES.map(s => (
            <button key={s.id} onClick={() => onConfigChange({ shape: s.id })}
              style={{ padding: '5px 9px', borderRadius: 8, border: shape === s.id ? '2px solid #58a6ff' : '1px solid #30363d', background: shape === s.id ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontSize: '1rem' }}
              title={s.label}>
              {s.emoji}
            </button>
          ))}
        </div>

        <div style={label}>Farg (spelare 1)</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => onConfigChange({ color: c })}
              style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
          ))}
        </div>

        <div style={label}>Storlek</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {SIZES.map(s => (
            <button key={s.id} onClick={() => onConfigChange({ size: s.id })}
              style={{ flex: 1, padding: '6px', borderRadius: 6, border: sizeId === s.id ? '2px solid #58a6ff' : '1px solid #30363d', background: sizeId === s.id ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={label}>Antal brickor</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4].map(n => (
            <button key={n} onClick={() => onConfigChange({ count: n })}
              style={{ flex: 1, padding: '6px', borderRadius: 6, border: count === n ? '2px solid #58a6ff' : '1px solid #30363d', background: count === n ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontWeight: 700 }}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
