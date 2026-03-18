import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tilemap, TILE_TYPES, TILE_COLORS, TILE_LABELS } from '../../lib/tilemap.js';

const GRID_PRESETS = [
  { label: '10×8',  cols: 10, rows: 8 },
  { label: '16×12', cols: 16, rows: 12 },
  { label: '20×15', cols: 20, rows: 15 },
];

const TILE_ORDER = [0, 1, 2, 3, 4, 5];

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

function serializeMap(tilemapRef) {
  return tilemapRef.current ? tilemapRef.current.toJSON() : null;
}

export default function TilemapBlock({ config, onConfigChange }) {
  const cfg = {
    gridPresetIndex: 0,
    activeTile: TILE_TYPES.SOLID,
    zoom: 2,
    mapData: null,
    ...config,
  };

  const preset = GRID_PRESETS[cfg.gridPresetIndex] || GRID_PRESETS[0];

  const editorCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const tilemapRef = useRef(null);
  const isPaintingRef = useRef(false);
  const isErasingRef = useRef(false);

  // Initialize or restore tilemap
  const initTilemap = useCallback((mapData, cols, rows) => {
    const tm = new Tilemap(cols, rows, 16);
    if (mapData && mapData.cols === cols && mapData.rows === rows) {
      tm.fromJSON(mapData);
    }
    tilemapRef.current = tm;
  }, []);

  useEffect(() => {
    initTilemap(cfg.mapData, preset.cols, preset.rows);
    drawEditor();
    drawPreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.gridPresetIndex]);

  useEffect(() => {
    if (!tilemapRef.current && cfg.mapData) {
      initTilemap(cfg.mapData, preset.cols, preset.rows);
    } else if (!tilemapRef.current) {
      initTilemap(null, preset.cols, preset.rows);
    }
    drawEditor();
    drawPreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drawEditor() {
    const canvas = editorCanvasRef.current;
    const tm = tilemapRef.current;
    if (!canvas || !tm) return;

    const zoom = cfg.zoom;
    const ts = 16 * zoom;
    canvas.width = tm.cols * ts;
    canvas.height = tm.rows * ts;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw tiles scaled
    ctx.save();
    ctx.scale(zoom, zoom);
    tm.draw(ctx, 0, 0);
    ctx.restore();

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= tm.rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * ts);
      ctx.lineTo(tm.cols * ts, r * ts);
      ctx.stroke();
    }
    for (let c = 0; c <= tm.cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * ts, 0);
      ctx.lineTo(c * ts, tm.rows * ts);
      ctx.stroke();
    }
  }

  function drawPreview() {
    const canvas = previewCanvasRef.current;
    const tm = tilemapRef.current;
    if (!canvas || !tm) return;

    const W = 150, H = 100;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    const scaleX = W / (tm.cols * 16);
    const scaleY = H / (tm.rows * 16);
    const scale = Math.min(scaleX, scaleY);

    ctx.save();
    ctx.scale(scale, scale);
    tm.draw(ctx, 0, 0);
    ctx.restore();
  }

  function getTileCoords(e) {
    const canvas = editorCanvasRef.current;
    if (!canvas || !tilemapRef.current) return null;
    const rect = canvas.getBoundingClientRect();
    const zoom = cfg.zoom;
    const ts = 16 * zoom;
    const col = Math.floor((e.clientX - rect.left) / ts);
    const row = Math.floor((e.clientY - rect.top) / ts);
    return { col, row };
  }

  function paintAt(e) {
    const coords = getTileCoords(e);
    if (!coords) return;
    const tileType = isErasingRef.current ? TILE_TYPES.EMPTY : cfg.activeTile;
    tilemapRef.current.setTile(coords.col, coords.row, tileType);
    drawEditor();
    drawPreview();
    onConfigChange({ mapData: serializeMap(tilemapRef) });
  }

  function handlePointerDown(e) {
    e.preventDefault();
    isPaintingRef.current = true;
    isErasingRef.current = e.button === 2;
    paintAt(e);
  }

  function handlePointerMove(e) {
    if (!isPaintingRef.current) return;
    paintAt(e);
  }

  function handlePointerUp() {
    isPaintingRef.current = false;
  }

  function handleContextMenu(e) {
    e.preventDefault();
  }

  function handleFillRow() {
    if (!tilemapRef.current) return;
    const tm = tilemapRef.current;
    const row = Math.floor(tm.rows / 2);
    tm.fillRow(row, cfg.activeTile);
    drawEditor();
    drawPreview();
    onConfigChange({ mapData: serializeMap(tilemapRef) });
  }

  function handleFillCol() {
    if (!tilemapRef.current) return;
    const tm = tilemapRef.current;
    const col = Math.floor(tm.cols / 2);
    tm.fillCol(col, cfg.activeTile);
    drawEditor();
    drawPreview();
    onConfigChange({ mapData: serializeMap(tilemapRef) });
  }

  function handleClear() {
    if (!tilemapRef.current) return;
    if (!window.confirm('Rensa hela banan?')) return;
    tilemapRef.current.clear();
    drawEditor();
    drawPreview();
    onConfigChange({ mapData: serializeMap(tilemapRef) });
  }

  function handleZoom(delta) {
    const next = Math.max(1, Math.min(4, cfg.zoom + delta));
    onConfigChange({ zoom: next });
    setTimeout(() => { drawEditor(); drawPreview(); }, 0);
  }

  function handlePresetChange(idx) {
    const p = GRID_PRESETS[idx];
    const tm = new Tilemap(p.cols, p.rows, 16);
    tilemapRef.current = tm;
    onConfigChange({ gridPresetIndex: idx, mapData: tm.toJSON() });
    setTimeout(() => { drawEditor(); drawPreview(); }, 0);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
        Bandesign
      </div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 8 }}>
        Rita din bana cell for cell
      </div>

      {/* Tile type picker */}
      <div style={label}>TILE-TYP</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {TILE_ORDER.map(t => (
          <button
            key={t}
            onClick={() => onConfigChange({ activeTile: t })}
            style={{
              width: 44, height: 44, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: t === 0 ? '#21262d' : TILE_COLORS[t],
              outline: cfg.activeTile === t ? '3px solid #58a6ff' : '2px solid transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: 2,
            }}
            title={TILE_LABELS[t]}
          >
            {t === 0 ? (
              <span style={{ fontSize: '0.6rem', color: '#555', fontWeight: 700 }}>TOM</span>
            ) : t === 4 ? (
              <span style={{ fontSize: '1.1rem' }}>🪙</span>
            ) : t === 5 ? (
              <span style={{ fontSize: '1.1rem' }}>⭐</span>
            ) : (
              <span style={{ fontSize: '0.55rem', color: '#fff', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                {TILE_LABELS[t].toUpperCase()}
              </span>
            )}
          </button>
        ))}
      </div>
      <div style={{ color: '#58a6ff', fontSize: '0.75rem', marginTop: 4 }}>
        Valt: {TILE_LABELS[cfg.activeTile]} &nbsp;|&nbsp; Hogerklick = radera
      </div>

      {/* Grid size */}
      <div style={label}>BANSTORLK</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {GRID_PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => handlePresetChange(i)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: '0.78rem',
              fontWeight: 700, cursor: 'pointer',
              border: cfg.gridPresetIndex === i ? '2px solid #58a6ff' : '2px solid #30363d',
              background: cfg.gridPresetIndex === i ? '#0d2744' : '#21262d',
              color: cfg.gridPresetIndex === i ? '#58a6ff' : '#c9d1d9',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Zoom */}
      <div style={{ ...label, marginTop: 14 }}>ZOOM</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => handleZoom(-1)} style={zoomBtn}>−</button>
        <span style={{ color: '#e6edf3', fontWeight: 700, minWidth: 30, textAlign: 'center' }}>{cfg.zoom}x</span>
        <button onClick={() => handleZoom(1)} style={zoomBtn}>+</button>
      </div>

      {/* Editor canvas */}
      <div style={{ ...label, marginTop: 14 }}>RITBORD (klicka/dra)</div>
      <div style={{
        maxWidth: '100%', overflow: 'auto', borderRadius: 8,
        border: '1px solid #30363d', background: '#0d1117', cursor: 'crosshair',
      }}>
        <canvas
          ref={editorCanvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onContextMenu={handleContextMenu}
          style={{ display: 'block', imageRendering: 'pixelated', touchAction: 'none' }}
        />
      </div>

      {/* Utility buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={handleFillRow} style={utilBtn}>Fyll rad</button>
        <button onClick={handleFillCol} style={utilBtn}>Fyll kolumn</button>
        <button
          onClick={handleClear}
          style={{ ...utilBtn, background: '#3a1212', color: '#f85149', borderColor: '#6e1111' }}
        >
          Rensa
        </button>
      </div>

      {/* Preview */}
      <div style={{ marginTop: 14 }}>
        <div style={label}>FORHANDSVISNING</div>
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d', display: 'inline-block' }}>
          <canvas ref={previewCanvasRef} style={{ display: 'block', imageRendering: 'pixelated' }} />
        </div>
      </div>
    </div>
  );
}

const zoomBtn = {
  width: 36, height: 36, borderRadius: 8, border: '1px solid #30363d',
  background: '#21262d', color: '#e6edf3', fontSize: '1.1rem',
  fontWeight: 700, cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};

const utilBtn = {
  flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: '0.78rem',
  fontWeight: 700, cursor: 'pointer', border: '1px solid #30363d',
  background: '#21262d', color: '#c9d1d9',
};
