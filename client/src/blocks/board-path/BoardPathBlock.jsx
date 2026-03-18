import React, { useState, useRef, useEffect } from 'react';
import { BoardPath } from '../../lib/boardEngine.js';

const PATH_LENGTHS = [20, 40, 64];
const PATH_STYLES = [
  { id: 'spiral', label: 'Spiral' },
  { id: 'snake', label: 'Orm' },
  { id: 'zigzag', label: 'Sicksack' },
  { id: 'free', label: 'Fri' },
];
const COLOR_PRESETS = [
  { id: 'ocean', colors: ['#2980b9', '#3498db', '#1abc9c', '#16a085'] },
  { id: 'forest', colors: ['#27ae60', '#2ecc71', '#f39c12', '#e74c3c'] },
  { id: 'candy', colors: ['#e74c3c', '#e91e8c', '#9b59b6', '#3498db'] },
  { id: 'space', colors: ['#2c3e50', '#8e44ad', '#2980b9', '#1abc9c'] },
];
const SQUARE_TYPES = [
  { id: 'normal', label: 'Normal', color: '#3498db' },
  { id: 'start', label: 'Start', color: '#27ae60' },
  { id: 'finish', label: 'Mal', color: '#e74c3c' },
  { id: 'snake_head', label: 'Orm', color: '#c0392b' },
  { id: 'ladder_bottom', label: 'Stege', color: '#f1c40f' },
  { id: 'special', label: 'Special', color: '#9b59b6' },
];

function generatePath(length, style, canvasW, canvasH) {
  const margin = 30;
  const squares = [];
  if (style === 'spiral' || style === 'snake' || style === 'zigzag') {
    return BoardPath.generateSpiral(length, canvasW, canvasH);
  }
  // free: random walk
  for (let i = 0; i < length; i++) {
    squares.push({
      x: margin + Math.random() * (canvasW - margin * 2),
      y: margin + Math.random() * (canvasH - margin * 2),
      type: 'normal',
    });
  }
  if (squares.length > 0) squares[0].type = 'start';
  if (squares.length > 1) squares[squares.length - 1].type = 'finish';
  return squares;
}

export default function BoardPathBlock({ config = {}, onConfigChange }) {
  const pathLength = config.pathLength || 40;
  const pathStyle = config.pathStyle || 'spiral';
  const colorPresetId = config.colorPreset || 'ocean';
  const squareTypes = config.squareTypes || {};
  const [selectedSquare, setSelectedSquare] = useState(null);

  const canvasRef = useRef(null);
  const canvasW = 260;
  const canvasH = 220;

  const squares = React.useMemo(() => generatePath(pathLength, pathStyle, canvasW, canvasH), [pathLength, pathStyle]);
  const colorPreset = COLOR_PRESETS.find(p => p.id === colorPresetId) || COLOR_PRESETS[0];

  function getSquareType(idx) {
    if (squareTypes[idx]) return squareTypes[idx];
    if (idx === 0) return 'start';
    if (idx === squares.length - 1) return 'finish';
    return 'normal';
  }

  function getTypeColor(type) {
    return SQUARE_TYPES.find(t => t.id === type)?.color || colorPreset.colors[0];
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasW, canvasH);

    // Draw connecting lines
    if (squares.length > 1) {
      ctx.beginPath();
      ctx.moveTo(squares[0].x, squares[0].y);
      for (let i = 1; i < squares.length; i++) {
        ctx.lineTo(squares[i].x, squares[i].y);
      }
      ctx.strokeStyle = '#ffffff22';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw squares
    const SZ = pathLength > 40 ? 22 : pathLength > 20 ? 26 : 30;
    squares.forEach((s, i) => {
      const type = getSquareType(i);
      const color = getTypeColor(type);
      const isSelected = selectedSquare === i;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(s.x - SZ / 2, s.y - SZ / 2, SZ, SZ, 4);
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${SZ * 0.38}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i + 1, s.x, s.y);
    });
  }, [squares, squareTypes, colorPresetId, selectedSquare]);

  function handleCanvasClick(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasW / rect.width;
    const scaleY = canvasH / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const SZ = pathLength > 40 ? 22 : pathLength > 20 ? 26 : 30;
    for (let i = 0; i < squares.length; i++) {
      const s = squares[i];
      if (Math.abs(mx - s.x) < SZ / 2 + 4 && Math.abs(my - s.y) < SZ / 2 + 4) {
        setSelectedSquare(prev => prev === i ? null : i);
        return;
      }
    }
    setSelectedSquare(null);
  }

  function assignType(type) {
    if (selectedSquare === null) return;
    onConfigChange({ squareTypes: { ...squareTypes, [selectedSquare]: type } });
  }

  const label = { color: '#8b949e', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4, marginTop: 8 };

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>Spelstigen</div>

      <canvas
        ref={canvasRef}
        width={canvasW}
        height={canvasH}
        onClick={handleCanvasClick}
        style={{ display: 'block', margin: '0 auto', cursor: 'pointer', borderRadius: 8, background: '#0d1117', border: '1px solid #30363d', maxWidth: '100%' }}
      />

      {selectedSquare !== null && (
        <div style={{ background: '#1a2332', border: '1px solid #58a6ff', borderRadius: 8, padding: '8px 10px', marginTop: 8 }}>
          <div style={{ fontSize: '0.78rem', color: '#58a6ff', fontWeight: 700, marginBottom: 6 }}>Ruta {selectedSquare + 1} - välj typ</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SQUARE_TYPES.map(t => (
              <button key={t.id} onClick={() => assignType(t.id)}
                style={{ padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', background: t.color + '33', border: `1px solid ${t.color}`, color: '#e6edf3', cursor: 'pointer', fontWeight: getSquareType(selectedSquare) === t.id ? 700 : 400 }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: '#21262d', borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
        <div style={label}>Antal rutor</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {PATH_LENGTHS.map(n => (
            <button key={n} onClick={() => onConfigChange({ pathLength: n, squareTypes: {} })}
              style={{ flex: 1, padding: '6px', borderRadius: 6, border: pathLength === n ? '2px solid #58a6ff' : '1px solid #30363d', background: pathLength === n ? '#0d2744' : '#0d1117', color: '#e6edf3', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
              {n}
            </button>
          ))}
        </div>

        <div style={label}>Stil</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PATH_STYLES.map(s => (
            <button key={s.id} onClick={() => onConfigChange({ pathStyle: s.id, squareTypes: {} })}
              style={{ padding: '4px 10px', borderRadius: 6, border: pathStyle === s.id ? '2px solid #58a6ff' : '1px solid #30363d', background: pathStyle === s.id ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontSize: '0.78rem' }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={label}>Fargschema</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {COLOR_PRESETS.map(p => (
            <button key={p.id} onClick={() => onConfigChange({ colorPreset: p.id })}
              style={{ width: 36, height: 20, borderRadius: 4, background: `linear-gradient(to right, ${p.colors[0]}, ${p.colors[3]})`, border: colorPresetId === p.id ? '2px solid #fff' : '1px solid #444', cursor: 'pointer', padding: 0 }} />
          ))}
        </div>

        <button onClick={() => onConfigChange({ squareTypes: {} })}
          style={{ marginTop: 8, width: '100%', padding: '7px', borderRadius: 6, border: '1px solid #30363d', background: '#0d1117', color: '#8b949e', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
          Aterstall rutor
        </button>
      </div>
    </div>
  );
}
