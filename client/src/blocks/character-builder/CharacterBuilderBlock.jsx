import React, { useRef, useEffect, useCallback } from 'react';
import { CHARACTER_PARTS, DEFAULT_CHARACTER } from '../../lib/characterParts.js';

const CANVAS_SIZE = 128;
const DISPLAY_SIZE = 256;

const SLOT_LABELS = {
  huvud: 'Huvud',
  ogon: 'Ogon',
  mun: 'Mun',
  kropp: 'Kropp',
  armar: 'Armar',
  ben: 'Ben',
  accessoar: 'Accessoar',
};

// Draw order: back to front
const DRAW_ORDER = ['ben', 'kropp', 'armar', 'huvud', 'ogon', 'mun', 'accessoar'];

const SKIN_COLORS = ['#ffcba4', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#4a2912'];
const HAIR_COLORS = ['#4a3728', '#c49a6c', '#f7dc6f', '#e74c3c', '#8e44ad', '#2c3e50', '#fff', '#111'];
const EYE_COLORS = ['#2d7dd2', '#27ae60', '#8e44ad', '#e74c3c', '#4a3728', '#111'];

function applySkinColors(svg, skinColor, eyeColor) {
  return svg
    .replace(/VAR_SKIN/g, skinColor)
    .replace(/VAR_EYE/g, eyeColor);
}

function svgToDataUrl(svg) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function CharacterBuilderBlock({ config, onConfigChange }) {
  const canvasRef = useRef(null);

  const cfg = { ...DEFAULT_CHARACTER, ...config };

  const redraw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (const slot of DRAW_ORDER) {
      const parts = CHARACTER_PARTS[slot];
      const idx = cfg[slot] ?? 0;
      const part = parts[idx];
      if (!part) continue;
      if (slot === 'accessoar' && idx === 0) continue; // "Ingen"

      const svg = applySkinColors(part.svg, cfg.skinColor, cfg.eyeColor);
      const dataUrl = svgToDataUrl(svg);

      try {
        const img = await loadImage(dataUrl);
        ctx.drawImage(img, part.offsetX, part.offsetY);
      } catch (e) {
        // skip failed part
      }
    }
  }, [cfg.huvud, cfg.ogon, cfg.mun, cfg.kropp, cfg.armar, cfg.ben, cfg.accessoar, cfg.skinColor, cfg.eyeColor]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  function update(changes) {
    onConfigChange({ ...cfg, ...changes });
  }

  const sectionLabel = {
    color: '#8b949e',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  };

  const rowStyle = {
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
    overflowX: 'auto',
    paddingBottom: 4,
  };

  function thumbStyle(active) {
    return {
      width: 40,
      height: 40,
      borderRadius: 8,
      border: active ? '2px solid #58a6ff' : '2px solid #30363d',
      background: active ? '#0d2744' : '#21262d',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      padding: 2,
    };
  }

  function swatchStyle(active, color) {
    return {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: color,
      border: active ? '3px solid #58a6ff' : '2px solid #30363d',
      cursor: 'pointer',
      flexShrink: 0,
    };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Preview canvas */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{
            width: DISPLAY_SIZE / 2,
            height: DISPLAY_SIZE / 2,
            imageRendering: 'pixelated',
            background: '#1a2332',
            borderRadius: 12,
            border: '2px solid #30363d',
          }}
        />
      </div>

      {/* Part selectors */}
      {DRAW_ORDER.map(slot => {
        const parts = CHARACTER_PARTS[slot];
        const selectedIdx = cfg[slot] ?? 0;
        return (
          <div key={slot}>
            <div style={sectionLabel}>{SLOT_LABELS[slot]}</div>
            <div style={rowStyle}>
              {parts.map((part, idx) => (
                <button
                  key={part.id}
                  onClick={() => update({ [slot]: idx })}
                  style={thumbStyle(selectedIdx === idx)}
                  title={part.name}
                >
                  <img
                    src={svgToDataUrl(applySkinColors(part.svg, cfg.skinColor, cfg.eyeColor))}
                    alt={part.name}
                    style={{ width: 34, height: 34, objectFit: 'contain' }}
                  />
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Color pickers */}
      <div>
        <div style={sectionLabel}>Hudton</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SKIN_COLORS.map(c => (
            <button
              key={c}
              onClick={() => update({ skinColor: c })}
              style={swatchStyle(cfg.skinColor === c, c)}
              title={c}
            />
          ))}
        </div>
      </div>

      <div>
        <div style={sectionLabel}>Harfarg</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {HAIR_COLORS.map(c => (
            <button
              key={c}
              onClick={() => update({ hairColor: c })}
              style={swatchStyle(cfg.hairColor === c, c)}
              title={c}
            />
          ))}
        </div>
      </div>

      <div>
        <div style={sectionLabel}>Ogonfarg</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EYE_COLORS.map(c => (
            <button
              key={c}
              onClick={() => update({ eyeColor: c })}
              style={swatchStyle(cfg.eyeColor === c, c)}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
