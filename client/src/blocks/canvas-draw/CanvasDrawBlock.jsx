import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { floodFill } from './floodFill.js';
import { exportCanvasAsPng } from '../../lib/pngExport.js';

const TOOLS = [
  { id: 'round',  label: 'Rund',    emoji: '\uD83D\uDD8C\uFE0F' },
  { id: 'square', label: 'Fyrkant', emoji: '\u2B1B' },
  { id: 'spray',  label: 'Spray',   emoji: '\uD83D\uDCA8' },
  { id: 'eraser', label: 'Sudd',    emoji: '\u25FB\uFE0F' },
  { id: 'fill',   label: 'Fyll',    emoji: '\uD83E\uDEA3' },
];

const SWATCHES = [
  '#e94560', '#6c3bbd', '#2d7dd2', '#f18f01',
  '#3bb273', '#e84855', '#ff6b6b', '#4ecdc4',
  '#ffe66d', '#a8e6cf', '#ffffff', '#1a1a2e',
  '#f8f0e3', '#c0c0c0', '#8b4513', '#ff69b4',
  '#b0e0ff', '#98ff98', '#ffd700', '#000000',
];

const MAX_HISTORY = 20;
const CANVAS_W = 480;
const CANVAS_H = 360;
const LAYER_COUNT = 3;

const CanvasDrawBlock = forwardRef(function CanvasDrawBlock({ config, onConfigChange, projectName }, ref) {
  const [tool, setTool] = useState('round');
  const [brushSize, setBrushSize] = useState(10);
  const [color, setColor] = useState('#e94560');
  const [activeLayer, setActiveLayer] = useState(0);
  const [layerOpacity, setLayerOpacity] = useState([100, 100, 100]);
  const [exportToast, setExportToast] = useState(false);
  const exportToastTimer = useRef(null);

  // Expose exportPng for parent components
  useImperativeHandle(ref, () => ({
    exportPng,
  }));

  // Refs for the 3 canvas layers
  const canvasRefs = [useRef(null), useRef(null), useRef(null)];
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const sprayInterval = useRef(null);

  // Undo/redo stacks per layer: history[layerIdx] = [ImageData, ...]
  const history = useRef([[], [], []]);
  const historyIndex = useRef([-1, -1, -1]);

  function getCtx(layerIdx) {
    const c = canvasRefs[layerIdx].current;
    return c ? c.getContext('2d') : null;
  }

  // Save snapshot of active layer to history
  const saveSnapshot = useCallback(() => {
    const ctx = getCtx(activeLayer);
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    const stack = history.current[activeLayer];
    const idx = historyIndex.current[activeLayer];
    // Remove any redo states
    stack.splice(idx + 1);
    stack.push(snap);
    if (stack.length > MAX_HISTORY) stack.shift();
    historyIndex.current[activeLayer] = stack.length - 1;
  }, [activeLayer]);

  function undo() {
    const stack = history.current[activeLayer];
    let idx = historyIndex.current[activeLayer];
    if (idx <= 0) {
      // Clear to blank
      const ctx = getCtx(activeLayer);
      if (ctx) ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      historyIndex.current[activeLayer] = -1;
      return;
    }
    idx -= 1;
    historyIndex.current[activeLayer] = idx;
    const ctx = getCtx(activeLayer);
    if (ctx) ctx.putImageData(stack[idx], 0, 0);
  }

  function redo() {
    const stack = history.current[activeLayer];
    let idx = historyIndex.current[activeLayer];
    if (idx >= stack.length - 1) return;
    idx += 1;
    historyIndex.current[activeLayer] = idx;
    const ctx = getCtx(activeLayer);
    if (ctx) ctx.putImageData(stack[idx], 0, 0);
  }

  function clearLayer() {
    if (!window.confirm('Rensa det aktiva lagret?')) return;
    const ctx = getCtx(activeLayer);
    if (!ctx) return;
    saveSnapshot();
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    saveSnapshot();
  }

  function exportPng() {
    // Build an offscreen canvas with layer opacity applied before compositing
    const tmp = document.createElement('canvas');
    tmp.width = CANVAS_W;
    tmp.height = CANVAS_H;
    const tc = tmp.getContext('2d');
    tc.fillStyle = '#ffffff';
    tc.fillRect(0, 0, CANVAS_W, CANVAS_H);
    for (let i = 0; i < LAYER_COUNT; i++) {
      const c = canvasRefs[i].current;
      if (!c) continue;
      tc.globalAlpha = layerOpacity[i] / 100;
      tc.drawImage(c, 0, 0);
    }
    tc.globalAlpha = 1;
    const filename = (projectName ? projectName + '_ritning' : 'ritning') + '.png';
    exportCanvasAsPng([tmp], filename);
    // Show toast
    if (exportToastTimer.current) clearTimeout(exportToastTimer.current);
    setExportToast(true);
    exportToastTimer.current = setTimeout(() => setExportToast(false), 2000);
  }

  function getCanvasPos(e) {
    const canvas = canvasRefs[activeLayer].current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function drawAt(ctx, x, y) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    if (tool === 'round') {
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tool === 'square') {
      const half = brushSize / 2;
      ctx.fillRect(x - half, y - half, brushSize, brushSize);
    } else if (tool === 'eraser') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawLine(ctx, x0, y0, x1, y1) {
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(dist / (brushSize * 0.25)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      drawAt(ctx, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t);
    }
  }

  function startSpray(ctx, x, y) {
    if (sprayInterval.current) clearInterval(sprayInterval.current);
    sprayInterval.current = setInterval(() => {
      const r = brushSize * 1.5;
      ctx.fillStyle = color;
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * r;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }, 30);
  }

  function stopSpray() {
    if (sprayInterval.current) {
      clearInterval(sprayInterval.current);
      sprayInterval.current = null;
    }
  }

  function handlePointerDown(e) {
    e.preventDefault();
    const ctx = getCtx(activeLayer);
    if (!ctx) return;
    const pos = getCanvasPos(e);

    if (tool === 'fill') {
      saveSnapshot();
      floodFill(ctx, pos.x, pos.y, color);
      saveSnapshot();
      return;
    }

    saveSnapshot();
    isDrawing.current = true;
    lastPos.current = pos;

    if (tool === 'spray') {
      startSpray(ctx, pos.x, pos.y);
    } else {
      drawAt(ctx, pos.x, pos.y);
    }
  }

  function handlePointerMove(e) {
    e.preventDefault();
    if (!isDrawing.current) return;
    const ctx = getCtx(activeLayer);
    if (!ctx) return;
    const pos = getCanvasPos(e);

    if (tool === 'spray') {
      stopSpray();
      startSpray(ctx, pos.x, pos.y);
    } else {
      const last = lastPos.current || pos;
      drawLine(ctx, last.x, last.y, pos.x, pos.y);
    }
    lastPos.current = pos;
  }

  function handlePointerUp(e) {
    e.preventDefault();
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;
    stopSpray();
    saveSnapshot();
  }

  // Bind pointer events to ALL layer canvases but route to active layer
  const pointerHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerLeave: handlePointerUp,
  };

  const btnBase = {
    border: 'none',
    cursor: 'pointer',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: '0.85rem',
    padding: '6px 10px',
    minHeight: 36,
  };

  const sectionLabel = {
    color: '#8b949e',
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 12,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, color: '#e6edf3', position: 'relative' }}>
      {exportToast && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#238636',
          color: '#fff',
          padding: '6px 18px',
          borderRadius: 20,
          fontWeight: 700,
          fontSize: '0.9rem',
          zIndex: 999,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          Laddar ner!
        </div>
      )}
      {/* Canvas area */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${CANVAS_W}/${CANVAS_H}`,
        background: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        border: '2px solid #30363d',
        touchAction: 'none',
        cursor: tool === 'eraser' ? 'cell' : tool === 'fill' ? 'crosshair' : 'crosshair',
      }}>
        {canvasRefs.map((ref, i) => (
          <canvas
            key={i}
            ref={ref}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%',
              height: '100%',
              opacity: layerOpacity[i] / 100,
              pointerEvents: i === activeLayer ? 'auto' : 'none',
              touchAction: 'none',
            }}
            {...(i === activeLayer ? pointerHandlers : {})}
          />
        ))}
      </div>

      {/* Controls */}
      <div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Tool picker */}
        <div style={sectionLabel}>Verktyg</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
                fontSize: '1.2rem',
                padding: '4px 8px',
              }}
            >
              {t.emoji}
            </button>
          ))}
        </div>

        {/* Brush size */}
        <div style={sectionLabel}>Penselstorlek: {brushSize}px</div>
        <input
          type="range"
          min={2}
          max={40}
          value={brushSize}
          onChange={e => setBrushSize(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#58a6ff' }}
        />

        {/* Color swatches */}
        <div style={sectionLabel}>Färg</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 5 }}>
          {SWATCHES.map(hex => (
            <button
              key={hex}
              onClick={() => setColor(hex)}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '50%',
                background: hex,
                border: color === hex ? '3px solid #fff' : '2px solid transparent',
                boxShadow: color === hex ? '0 0 0 2px #58a6ff' : '0 0 0 1px rgba(255,255,255,0.15)',
                cursor: 'pointer',
                padding: 0,
              }}
              aria-label={hex}
            />
          ))}
        </div>

        {/* Layer controls */}
        <div style={sectionLabel}>Lager</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <button
              key={i}
              onClick={() => setActiveLayer(i)}
              style={{
                ...btnBase,
                flex: 1,
                background: activeLayer === i ? '#0d2744' : '#21262d',
                color: '#e6edf3',
                border: activeLayer === i ? '2px solid #58a6ff' : '2px solid #30363d',
              }}
            >
              Lager {i + 1}
            </button>
          ))}
        </div>

        {/* Opacity for active layer */}
        <div style={sectionLabel}>Opacitet lager {activeLayer + 1}: {layerOpacity[activeLayer]}%</div>
        <input
          type="range"
          min={10}
          max={100}
          value={layerOpacity[activeLayer]}
          onChange={e => {
            const val = Number(e.target.value);
            setLayerOpacity(prev => {
              const next = [...prev];
              next[activeLayer] = val;
              return next;
            });
          }}
          style={{ width: '100%', accentColor: '#a78bfa' }}
        />

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <button
            onClick={undo}
            style={{ ...btnBase, background: '#21262d', color: '#e6edf3', border: '2px solid #30363d', flex: 1 }}
            title="Ångra"
          >
            &#x21A9; Ångra
          </button>
          <button
            onClick={redo}
            style={{ ...btnBase, background: '#21262d', color: '#e6edf3', border: '2px solid #30363d', flex: 1 }}
            title="Gör om"
          >
            &#x21AA; Gör om
          </button>
          <button
            onClick={clearLayer}
            style={{ ...btnBase, background: '#3d1a1a', color: '#ff7b7b', border: '2px solid #6e2020', flex: 1 }}
            title="Rensa lager"
          >
            &#x1F5D1; Rensa
          </button>
          <button
            onClick={exportPng}
            style={{ ...btnBase, background: '#1a2d1a', color: '#7bff7b', border: '2px solid #206e20', flex: 1 }}
            title="Ladda ner som PNG"
          >
            &#x2B07; PNG
          </button>
        </div>
      </div>
    </div>
  );
});

export default CanvasDrawBlock;
