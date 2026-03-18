import React, { useState, useRef, useEffect } from 'react';
import { BoardGrid } from '../../lib/boardEngine.js';

const GRID_SIZES = [
  { id: '6x6', cols: 6, rows: 6 },
  { id: '8x8', cols: 8, rows: 8 },
  { id: '10x10', cols: 10, rows: 10 },
];
const CELL_COLORS = ['#c84b31', '#2e86de', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c'];
const CELL_TYPES = [
  { id: 'normal', label: 'Normal', emoji: '' },
  { id: 'blocked', label: 'Blockad', emoji: '🚫' },
  { id: 'special', label: 'Special', emoji: '⭐' },
  { id: 'goal', label: 'Mal', emoji: '🏁' },
];
const GRID_STYLES = [
  { id: 'chess', label: 'Schack' },
  { id: 'go', label: 'Go' },
  { id: 'hex', label: 'Hex' },
  { id: 'custom', label: 'Anpassad' },
];

function getChessColors(c, r) {
  return (c + r) % 2 === 0 ? '#f0d9b5' : '#b58863';
}
function getGoColors(c, r) {
  return '#dcb97a';
}

export default function BoardGridBlock({ config = {}, onConfigChange }) {
  const sizeId = config.gridSize || '8x8';
  const gridSize = GRID_SIZES.find(g => g.id === sizeId) || GRID_SIZES[1];
  const cellData = config.cellData || {};
  const gridStyle = config.gridStyle || 'chess';
  const paintColor = config.paintColor || CELL_COLORS[0];
  const paintType = config.paintType || 'normal';

  const canvasRef = useRef(null);

  const cellSize = gridSize.cols <= 6 ? 28 : gridSize.cols <= 8 ? 24 : 20;
  const canvasW = gridSize.cols * cellSize;
  const canvasH = gridSize.rows * cellSize;

  function getCellBg(c, r) {
    const key = `${c},${r}`;
    if (cellData[key]?.color) return cellData[key].color;
    if (gridStyle === 'chess') return getChessColors(c, r);
    if (gridStyle === 'go') return getGoColors(c, r);
    if (gridStyle === 'hex') return (c + r) % 2 === 0 ? '#e8d5a3' : '#c9a86c';
    return '#21262d';
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasW, canvasH);

    for (let r = 0; r < gridSize.rows; r++) {
      for (let c = 0; c < gridSize.cols; c++) {
        const key = `${c},${r}`;
        const cell = cellData[key] || {};
        const x = c * cellSize;
        const y = r * cellSize;
        ctx.fillStyle = cell.color || getCellBg(c, r);
        ctx.fillRect(x, y, cellSize, cellSize);
        ctx.strokeStyle = gridStyle === 'go' ? '#8b6914' : '#00000033';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
        if (cell.type === 'blocked') {
          ctx.fillStyle = '#00000055';
          ctx.fillRect(x, y, cellSize, cellSize);
        }
        if (cell.type === 'special' || cell.type === 'goal') {
          const typeInfo = CELL_TYPES.find(t => t.id === cell.type);
          ctx.font = `${cellSize * 0.65}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(typeInfo.emoji, x + cellSize / 2, y + cellSize / 2);
        }
      }
    }
  }, [gridSize, cellData, gridStyle, cellSize, canvasW, canvasH]);

  function handleCanvasClick(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasW / rect.width;
    const scaleY = canvasH / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (col < 0 || col >= gridSize.cols || row < 0 || row >= gridSize.rows) return;
    const key = `${col},${row}`;
    const current = cellData[key] || {};
    const next = { ...cellData };
    if (paintType === 'normal' && !current.color) {
      // painting color on normal
      next[key] = { ...current, color: paintColor, type: 'normal' };
    } else if (current.color === paintColor && paintType === 'normal') {
      delete next[key];
    } else {
      next[key] = { ...current, color: paintType !== 'normal' ? (current.color || paintColor) : paintColor, type: paintType };
    }
    onConfigChange({ cellData: next });
  }

  function clearGrid() {
    onConfigChange({ cellData: {} });
  }

  const label = { color: '#8b949e', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4, marginTop: 8 };

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>Spelbrädets rutnät</div>

      <canvas
        ref={canvasRef}
        width={canvasW}
        height={canvasH}
        onClick={handleCanvasClick}
        style={{ display: 'block', margin: '0 auto', cursor: 'crosshair', borderRadius: 4, maxWidth: '100%', border: '1px solid #30363d' }}
      />

      <div style={{ background: '#21262d', borderRadius: 8, padding: '10px 12px', marginTop: 10 }}>
        <div style={label}>Storlek</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {GRID_SIZES.map(g => (
            <button key={g.id} onClick={() => onConfigChange({ gridSize: g.id, cellData: {} })}
              style={{ flex: 1, padding: '6px', borderRadius: 6, border: sizeId === g.id ? '2px solid #58a6ff' : '1px solid #30363d', background: sizeId === g.id ? '#0d2744' : '#0d1117', color: '#e6edf3', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
              {g.id}
            </button>
          ))}
        </div>

        <div style={label}>Stilmall</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {GRID_STYLES.map(s => (
            <button key={s.id} onClick={() => onConfigChange({ gridStyle: s.id })}
              style={{ padding: '4px 10px', borderRadius: 6, border: gridStyle === s.id ? '2px solid #58a6ff' : '1px solid #30363d', background: gridStyle === s.id ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontSize: '0.78rem' }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={label}>Mallafarg</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
          {CELL_COLORS.map(c => (
            <button key={c} onClick={() => onConfigChange({ paintColor: c, paintType: 'normal' })}
              style={{ width: 26, height: 26, borderRadius: 6, background: c, border: paintColor === c && paintType === 'normal' ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
          ))}
        </div>

        <div style={label}>Celltyp</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CELL_TYPES.map(t => (
            <button key={t.id} onClick={() => onConfigChange({ paintType: t.id })}
              style={{ padding: '4px 8px', borderRadius: 6, border: paintType === t.id ? '2px solid #58a6ff' : '1px solid #30363d', background: paintType === t.id ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontSize: '0.78rem' }}>
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <button onClick={clearGrid}
          style={{ marginTop: 8, width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #30363d', background: '#0d1117', color: '#8b949e', cursor: 'pointer', fontWeight: 600 }}>
          Rensa allt
        </button>
      </div>
    </div>
  );
}
