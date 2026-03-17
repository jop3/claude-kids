import React, { useState, useRef } from 'react';
import { SPRITES, SPRITE_CATEGORIES } from '../../lib/sprites.js';

const TINT_COLORS = ['#ffffff', '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];

export default function SpritePickerBlock({ config, onConfigChange }) {
  const [activeCategory, setActiveCategory] = useState(SPRITE_CATEGORIES[0]);
  const [selectedSprite, setSelectedSprite] = useState(null);
  const [size, setSize] = useState(64);
  const [tint, setTint] = useState('#ffffff');

  const visibleSprites = SPRITES.filter(s => s.category === activeCategory);

  function stampOnCanvas(sprite) {
    // Find canvas-draw active canvas via DOM — look for the topmost pointer-events:auto canvas
    const canvases = Array.from(document.querySelectorAll('canvas'));
    // Pick the one that has pointer-events auto (active layer in CanvasDrawBlock)
    const activeCanvas = canvases.find(c => c.style.pointerEvents === 'auto' || c.style.pointerEvents === '');
    if (!activeCanvas) return false;

    const ctx = activeCanvas.getContext('2d');
    if (!ctx) return false;

    const img = new Image();
    img.onload = () => {
      const w = activeCanvas.width;
      const h = activeCanvas.height;
      const drawSize = size;
      const x = (w - drawSize) / 2;
      const y = (h - drawSize) / 2;

      if (tint !== '#ffffff') {
        // Draw tinted version using offscreen canvas
        const off = document.createElement('canvas');
        off.width = drawSize;
        off.height = drawSize;
        const octx = off.getContext('2d');
        octx.drawImage(img, 0, 0, drawSize, drawSize);
        octx.globalCompositeOperation = 'multiply';
        octx.fillStyle = tint;
        octx.fillRect(0, 0, drawSize, drawSize);
        octx.globalCompositeOperation = 'destination-in';
        octx.drawImage(img, 0, 0, drawSize, drawSize);
        ctx.drawImage(off, x, y);
      } else {
        ctx.drawImage(img, x, y, drawSize, drawSize);
      }
    };
    img.src = sprite.dataUrl;
    return true;
  }

  function handleSpriteClick(sprite) {
    setSelectedSprite(sprite);
    stampOnCanvas(sprite);
  }

  const sectionLabel = {
    color: '#8b949e',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, color: '#e6edf3' }}>
      {/* Category tabs */}
      <div style={sectionLabel}>Kategori</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {SPRITE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '5px 10px',
              borderRadius: 999,
              border: activeCategory === cat ? '2px solid #58a6ff' : '2px solid #30363d',
              background: activeCategory === cat ? '#0d2744' : '#21262d',
              color: activeCategory === cat ? '#58a6ff' : '#c9d1d9',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sprite grid */}
      <div style={sectionLabel}>Figurer — tryck för att stämpla</div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 6,
        marginBottom: 10,
      }}>
        {visibleSprites.map(sprite => (
          <button
            key={sprite.id}
            onClick={() => handleSpriteClick(sprite)}
            title={sprite.name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: 4,
              borderRadius: 8,
              border: selectedSprite?.id === sprite.id ? '2px solid #58a6ff' : '2px solid #30363d',
              background: selectedSprite?.id === sprite.id ? '#0d2744' : '#21262d',
              cursor: 'pointer',
              minHeight: 72,
            }}
          >
            <img
              src={sprite.dataUrl}
              alt={sprite.name}
              width={48}
              height={48}
              style={{ display: 'block', imageRendering: 'auto' }}
            />
            <span style={{ fontSize: '0.65rem', color: '#8b949e', textAlign: 'center', lineHeight: 1.2 }}>
              {sprite.name}
            </span>
          </button>
        ))}
      </div>

      {/* Tint color */}
      <div style={sectionLabel}>Färgton</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {TINT_COLORS.map(c => (
          <button
            key={c}
            onClick={() => setTint(c)}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: c,
              border: tint === c ? '3px solid #fff' : '2px solid #444',
              boxShadow: tint === c ? '0 0 0 2px #58a6ff' : 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label={c}
          />
        ))}
      </div>

      {/* Size slider */}
      <div style={sectionLabel}>Storlek: {size}px</div>
      <input
        type="range"
        min={32}
        max={256}
        value={size}
        onChange={e => setSize(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#58a6ff', marginBottom: 8 }}
      />

      {/* Preview of selected sprite if no canvas found */}
      {selectedSprite && (
        <div style={{ marginTop: 6, textAlign: 'center' }}>
          <div style={sectionLabel}>Vald figur</div>
          <img
            src={selectedSprite.dataUrl}
            alt={selectedSprite.name}
            width={Math.min(size, 80)}
            height={Math.min(size, 80)}
            style={{ display: 'inline-block', border: '2px solid #30363d', borderRadius: 8 }}
          />
          <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: 4 }}>{selectedSprite.name}</div>
          <button
            onClick={() => selectedSprite && stampOnCanvas(selectedSprite)}
            style={{
              marginTop: 6,
              padding: '6px 16px',
              borderRadius: 8,
              border: '2px solid #30363d',
              background: '#238636',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Stämpla igen
          </button>
        </div>
      )}
    </div>
  );
}
