import React, { useRef, useEffect, useState, useCallback } from 'react';
import { exportPixelGridAsPng } from '../../lib/pngExport.js';
import { exportAnimationAsGif } from '../../lib/gifExport.js';

const CANVAS_SIZE = 320;
const MAX_FRAMES = 8;
const THUMB_SIZE = 32;

const PALETTE = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#ff8800', '#8800ff', '#00ff88', '#ff0088', '#888888', '#444444', '#cccccc', '#ffccaa',
  '#aaccff', '#ffaacc', '#aaffcc', '#ccaaff', '#884400', '#004488', '#448800', '#880044',
];

const TOOLS = [
  { id: 'pencil', emoji: '\u270F\uFE0F', label: 'Penna' },
  { id: 'eraser', emoji: '\u{1F9F9}', label: 'Sudd' },
  { id: 'fill',   emoji: '\u{1FAA3}', label: 'Fyll' },
  { id: 'line',   emoji: '\u2196\uFE0F', label: 'Linje' },
  { id: 'eyedropper', emoji: '\u{1F50D}', label: 'Pipett' },
];

const FPS_OPTIONS = [4, 8, 12];

function makeEmptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

function floodFillGrid(grid, row, col, targetColor, fillColor, size) {
  if (targetColor === fillColor) return grid;
  const next = grid.map(r => [...r]);
  const stack = [[row, col]];
  while (stack.length > 0) {
    const [r, c] = stack.pop();
    if (r < 0 || r >= size || c < 0 || c >= size) continue;
    if (next[r][c] !== targetColor) continue;
    next[r][c] = fillColor;
    stack.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]);
  }
  return next;
}

function getLinePixels(r0, c0, r1, c1) {
  const pixels = [];
  let dr = Math.abs(r1 - r0), dc = Math.abs(c1 - c0);
  let sr = r0 < r1 ? 1 : -1, sc = c0 < c1 ? 1 : -1;
  let err = dr - dc;
  let r = r0, c = c0;
  while (true) {
    pixels.push([r, c]);
    if (r === r1 && c === c1) break;
    let e2 = 2 * err;
    if (e2 > -dc) { err -= dc; r += sr; }
    if (e2 < dr)  { err += dr; c += sc; }
  }
  return pixels;
}

function drawGridToCanvas(canvas, grid, size, showGrid = true) {
  const ctx = canvas.getContext('2d');
  const cellSize = canvas.width / size;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Pixels
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) {
        ctx.fillStyle = grid[r][c];
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }
  // Grid lines
  if (showGrid && cellSize >= 4) {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= size; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
  }
}

function drawThumb(canvas, grid, size) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, THUMB_SIZE, THUMB_SIZE);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, THUMB_SIZE, THUMB_SIZE);
  const cellSize = THUMB_SIZE / size;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c]) {
        ctx.fillStyle = grid[r][c];
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }
}

function initConfig(config) {
  const gridSize = config.gridSize || 16;
  const frames = config.frames && config.frames.length > 0
    ? config.frames
    : [makeEmptyGrid(gridSize)];
  const activeFrame = config.activeFrame || 0;
  const fps = config.fps || 8;
  return { gridSize, frames, activeFrame, fps };
}

export default function PixelEditorBlock({ config, onConfigChange }) {
  const { gridSize: initSize, frames: initFrames, activeFrame: initActiveFrame, fps: initFps } = initConfig(config);

  const [gridSize, setGridSize] = useState(initSize);
  const [frames, setFrames] = useState(initFrames);
  const [activeFrame, setActiveFrame] = useState(initActiveFrame);
  const [fps, setFps] = useState(initFps);
  const [activeColor, setActiveColor] = useState('#ff0000');
  const [gifStatus, setGifStatus] = useState(null); // null | 'encoding' | 'done'
  const [tool, setTool] = useState('pencil');
  const [symmetry, setSymmetry] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animFrame, setAnimFrame] = useState(0);

  // Line tool state
  const [lineStart, setLineStart] = useState(null);
  const [linePreview, setLinePreview] = useState(null);

  const canvasRef = useRef(null);
  const thumbRefs = useRef([]);
  const animCanvasRef = useRef(null);
  const animTimerRef = useRef(null);
  const isDrawing = useRef(false);

  // Sync config out
  const syncConfig = useCallback((newFrames, newGridSize, newActiveFrame, newFps) => {
    onConfigChange({
      gridSize: newGridSize,
      frames: newFrames,
      activeFrame: newActiveFrame,
      fps: newFps,
    });
  }, [onConfigChange]);

  // Redraw main canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const currentGrid = frames[activeFrame] || makeEmptyGrid(gridSize);
    let displayGrid = currentGrid;
    // Overlay line preview
    if (linePreview && linePreview.length > 0) {
      displayGrid = cloneGrid(currentGrid);
      linePreview.forEach(([r, c]) => {
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          displayGrid[r][c] = activeColor;
        }
      });
    }
    drawGridToCanvas(canvasRef.current, displayGrid, gridSize, true);
  }, [frames, activeFrame, gridSize, linePreview, activeColor]);

  // Redraw thumbnails
  useEffect(() => {
    frames.forEach((grid, i) => {
      const canvas = thumbRefs.current[i];
      if (canvas) drawThumb(canvas, grid, gridSize);
    });
  }, [frames, gridSize]);

  // Animation
  useEffect(() => {
    if (isAnimating && frames.length > 1) {
      animTimerRef.current = setInterval(() => {
        setAnimFrame(f => (f + 1) % frames.length);
      }, 1000 / fps);
    } else {
      clearInterval(animTimerRef.current);
      if (!isAnimating) setAnimFrame(activeFrame);
    }
    return () => clearInterval(animTimerRef.current);
  }, [isAnimating, fps, frames.length, activeFrame]);

  // Draw animation frame to anim canvas
  useEffect(() => {
    if (!animCanvasRef.current) return;
    const grid = frames[animFrame] || makeEmptyGrid(gridSize);
    drawGridToCanvas(animCanvasRef.current, grid, gridSize, false);
  }, [animFrame, frames, gridSize]);

  function getCellFromEvent(e) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cellPx = rect.width / gridSize;
    const col = Math.floor(x / cellPx);
    const row = Math.floor(y / cellPx);
    if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) return null;
    return { row, col };
  }

  function applyPixel(grid, row, col, color, erase) {
    const next = cloneGrid(grid);
    const c = erase ? null : color;
    next[row][col] = c;
    if (symmetry) {
      next[row][gridSize - 1 - col] = c;
    }
    return next;
  }

  function handlePointerDown(e) {
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (!cell) return;
    const { row, col } = cell;
    const currentGrid = frames[activeFrame] || makeEmptyGrid(gridSize);

    if (tool === 'eyedropper') {
      const c = currentGrid[row][col];
      if (c) setActiveColor(c);
      return;
    }

    if (tool === 'fill') {
      const target = currentGrid[row][col];
      const filled = floodFillGrid(currentGrid, row, col, target, activeColor, gridSize);
      const newFrames = frames.map((f, i) => i === activeFrame ? filled : f);
      setFrames(newFrames);
      syncConfig(newFrames, gridSize, activeFrame, fps);
      return;
    }

    if (tool === 'line') {
      setLineStart({ row, col });
      setLinePreview([[row, col]]);
      isDrawing.current = true;
      return;
    }

    isDrawing.current = true;
    const erase = tool === 'eraser';
    // Toggle: clicking same color clears
    const existingColor = currentGrid[row][col];
    const shouldErase = erase || (!erase && existingColor === activeColor);
    const newGrid = applyPixel(currentGrid, row, col, activeColor, shouldErase);
    const newFrames = frames.map((f, i) => i === activeFrame ? newGrid : f);
    setFrames(newFrames);
    syncConfig(newFrames, gridSize, activeFrame, fps);
  }

  function handlePointerMove(e) {
    e.preventDefault();
    if (!isDrawing.current) return;
    const cell = getCellFromEvent(e);
    if (!cell) return;
    const { row, col } = cell;

    if (tool === 'line') {
      if (!lineStart) return;
      const preview = getLinePixels(lineStart.row, lineStart.col, row, col);
      setLinePreview(preview);
      return;
    }

    const currentGrid = frames[activeFrame] || makeEmptyGrid(gridSize);
    const erase = tool === 'eraser';
    const newGrid = applyPixel(currentGrid, row, col, activeColor, erase);
    const newFrames = frames.map((f, i) => i === activeFrame ? newGrid : f);
    setFrames(newFrames);
    syncConfig(newFrames, gridSize, activeFrame, fps);
  }

  function handlePointerUp(e) {
    e.preventDefault();
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (tool === 'line' && linePreview && linePreview.length > 0) {
      const currentGrid = frames[activeFrame] || makeEmptyGrid(gridSize);
      let newGrid = cloneGrid(currentGrid);
      linePreview.forEach(([r, c]) => {
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
          newGrid[r][c] = activeColor;
          if (symmetry) newGrid[r][gridSize - 1 - c] = activeColor;
        }
      });
      const newFrames = frames.map((f, i) => i === activeFrame ? newGrid : f);
      setFrames(newFrames);
      syncConfig(newFrames, gridSize, activeFrame, fps);
      setLineStart(null);
      setLinePreview(null);
    }
  }

  function handleGridSizeChange(size) {
    const newFrames = [makeEmptyGrid(size)];
    setGridSize(size);
    setFrames(newFrames);
    setActiveFrame(0);
    setIsAnimating(false);
    syncConfig(newFrames, size, 0, fps);
  }

  function handleAddFrame() {
    if (frames.length >= MAX_FRAMES) return;
    const current = frames[activeFrame] || makeEmptyGrid(gridSize);
    const newFrame = cloneGrid(current);
    const newFrames = [...frames, newFrame];
    const newActive = newFrames.length - 1;
    setFrames(newFrames);
    setActiveFrame(newActive);
    syncConfig(newFrames, gridSize, newActive, fps);
  }

  function handleDeleteFrame(idx) {
    if (frames.length <= 1) return;
    const newFrames = frames.filter((_, i) => i !== idx);
    const newActive = Math.min(activeFrame, newFrames.length - 1);
    setFrames(newFrames);
    setActiveFrame(newActive);
    syncConfig(newFrames, gridSize, newActive, fps);
  }

  function handleSelectFrame(idx) {
    setActiveFrame(idx);
    setIsAnimating(false);
    syncConfig(frames, gridSize, idx, fps);
  }

  function handleFpsChange(f) {
    setFps(f);
    syncConfig(frames, gridSize, activeFrame, f);
  }

  async function handleExportGif() {
    if (frames.length === 0) return;
    setGifStatus('encoding');
    try {
      const scale = 4;
      const cellPx = gridSize * scale;
      // Build canvas frames
      const canvasFrames = frames.map(grid => {
        const c = document.createElement('canvas');
        c.width = cellPx;
        c.height = cellPx;
        const tc = c.getContext('2d');
        tc.fillStyle = '#1a1a1a';
        tc.fillRect(0, 0, cellPx, cellPx);
        for (let r = 0; r < gridSize; r++) {
          for (let col = 0; col < gridSize; col++) {
            const color = grid[r] && grid[r][col];
            if (color) {
              tc.fillStyle = color;
              tc.fillRect(col * scale, r * scale, scale, scale);
            }
          }
        }
        return c;
      });
      await exportAnimationAsGif(canvasFrames, cellPx, cellPx, 'pixelkonst.gif', fps);
      setGifStatus('done');
      setTimeout(() => setGifStatus(null), 2500);
    } catch (err) {
      console.error('GIF export failed:', err);
      setGifStatus(null);
    }
  }

  const btnBase = {
    border: 'none',
    cursor: 'pointer',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: '0.85rem',
    padding: '6px 10px',
    minHeight: 34,
  };

  const sectionLabel = {
    color: '#8b949e',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: 10,
    textTransform: 'uppercase',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, color: '#e6edf3' }}>
      {/* Grid size selector */}
      <div style={sectionLabel}>Rutstorlek</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        {[16, 32, 64].map(s => (
          <button
            key={s}
            onClick={() => handleGridSizeChange(s)}
            style={{
              ...btnBase,
              flex: 1,
              background: gridSize === s ? '#1f6feb' : '#21262d',
              color: '#e6edf3',
              border: gridSize === s ? '2px solid #58a6ff' : '2px solid #30363d',
            }}
          >
            {s}&times;{s}
          </button>
        ))}
      </div>

      {/* Main canvas */}
      <div
        style={{
          position: 'relative',
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          maxWidth: '100%',
          background: '#1a1a1a',
          borderRadius: 6,
          border: '2px solid #30363d',
          overflow: 'hidden',
          touchAction: 'none',
          cursor: tool === 'eyedropper' ? 'crosshair' : tool === 'fill' ? 'cell' : 'crosshair',
          flexShrink: 0,
          alignSelf: 'center',
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      {/* Tools */}
      <div style={sectionLabel}>Verktyg</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
        {TOOLS.map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            title={t.label}
            style={{
              ...btnBase,
              background: tool === t.id ? '#1f6feb' : '#21262d',
              color: '#e6edf3',
              border: tool === t.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontSize: '1.1rem',
              padding: '4px 8px',
              minHeight: 36,
            }}
          >
            {t.emoji}
          </button>
        ))}
        <button
          onClick={() => setSymmetry(s => !s)}
          title="Spegling"
          style={{
            ...btnBase,
            background: symmetry ? '#6e40c9' : '#21262d',
            color: '#e6edf3',
            border: symmetry ? '2px solid #a78bfa' : '2px solid #30363d',
            fontSize: '1.1rem',
            padding: '4px 8px',
            minHeight: 36,
          }}
        >
          {'\uD83E\uDDD0'}
        </button>
      </div>

      {/* Color palette */}
      <div style={sectionLabel}>Paletten</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, marginBottom: 4 }}>
        {PALETTE.map(hex => (
          <button
            key={hex}
            onClick={() => setActiveColor(hex)}
            title={hex}
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: 4,
              background: hex,
              border: activeColor === hex ? '2px solid #fff' : '1px solid rgba(255,255,255,0.12)',
              boxShadow: activeColor === hex ? '0 0 0 2px #58a6ff' : 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Current color swatch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: activeColor, border: '2px solid #444', flexShrink: 0 }} />
        <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>{activeColor}</span>
        <input
          type="color"
          value={activeColor}
          onChange={e => setActiveColor(e.target.value)}
          style={{ width: 32, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none', padding: 0 }}
        />
      </div>

      {/* Frames panel */}
      <div style={sectionLabel}>Bilder (frames)</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 4 }}>
        {frames.map((_, idx) => (
          <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
            <canvas
              ref={el => { thumbRefs.current[idx] = el; }}
              width={THUMB_SIZE}
              height={THUMB_SIZE}
              onClick={() => handleSelectFrame(idx)}
              style={{
                display: 'block',
                imageRendering: 'pixelated',
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                border: idx === activeFrame ? '2px solid #58a6ff' : '2px solid #30363d',
                borderRadius: 4,
                cursor: 'pointer',
                background: '#1a1a1a',
              }}
            />
            {frames.length > 1 && (
              <button
                onClick={() => handleDeleteFrame(idx)}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#6e2020',
                  border: 'none',
                  color: '#ff7b7b',
                  fontSize: '0.6rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  lineHeight: 1,
                  fontWeight: 700,
                }}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        {frames.length < MAX_FRAMES && (
          <button
            onClick={handleAddFrame}
            style={{
              ...btnBase,
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              background: '#21262d',
              color: '#58a6ff',
              border: '2px dashed #30363d',
              fontSize: '1.2rem',
              padding: 0,
              flexShrink: 0,
            }}
          >
            +
          </button>
        )}
      </div>

      {/* Export buttons */}
      <div style={{ display: 'flex', gap: 6, marginTop: 4, marginBottom: 2 }}>
        <button
          onClick={() => exportPixelGridAsPng(frames, gridSize, 'pixelkonst.png', 4)}
          style={{
            ...btnBase,
            flex: 1,
            background: '#1a2d1a',
            color: '#7bff7b',
            border: '2px solid #206e20',
          }}
          title="Ladda ner som PNG"
        >
          &#x2B07; Exportera PNG
        </button>
        <button
          onClick={handleExportGif}
          disabled={gifStatus === 'encoding'}
          title="Ladda ner som animerad GIF"
          style={{
            ...btnBase,
            flex: 1,
            background: gifStatus === 'done' ? '#238636' : gifStatus === 'encoding' ? '#21262d' : '#4a1d96',
            color: gifStatus === 'encoding' ? '#6e7681' : '#e6edf3',
            border: `2px solid ${gifStatus === 'done' ? '#238636' : gifStatus === 'encoding' ? '#30363d' : '#7c3aed'}`,
            cursor: gifStatus === 'encoding' ? 'not-allowed' : 'pointer',
          }}
        >
          {gifStatus === 'encoding' ? 'Skapar...' : gifStatus === 'done' ? '✅ GIF klar!' : '🎬 GIF'}
        </button>
      </div>

      {/* Animation controls */}
      {frames.length > 1 && (
        <>
          <div style={sectionLabel}>Animation</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 }}>
            <button
              onClick={() => setIsAnimating(a => !a)}
              style={{
                ...btnBase,
                background: isAnimating ? '#238636' : '#1f6feb',
                color: '#fff',
                border: 'none',
                fontSize: '0.9rem',
              }}
            >
              {isAnimating ? '\u23F9 Stopp' : '\u25B6 Animera'}
            </button>
            {FPS_OPTIONS.map(f => (
              <button
                key={f}
                onClick={() => handleFpsChange(f)}
                style={{
                  ...btnBase,
                  background: fps === f ? '#21262d' : '#21262d',
                  color: fps === f ? '#58a6ff' : '#8b949e',
                  border: fps === f ? '2px solid #58a6ff' : '2px solid #30363d',
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                }}
              >
                {f} FPS
              </button>
            ))}
          </div>
          {isAnimating && (
            <canvas
              ref={animCanvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              style={{
                display: 'block',
                width: CANVAS_SIZE,
                height: CANVAS_SIZE,
                maxWidth: '100%',
                imageRendering: 'pixelated',
                border: '2px solid #238636',
                borderRadius: 6,
                alignSelf: 'center',
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
