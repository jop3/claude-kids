import React, { useEffect, useRef } from 'react';

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

const FONT_STYLES = [
  { id: 'comic',       label: 'Serietidning', font: 'Comic Sans MS, cursive',         emoji: '💬' },
  { id: 'scary',       label: 'Laaskigt',     font: 'Papyrus, fantasy',               emoji: '💀' },
  { id: 'fantasy',     label: 'Sagolik',      font: 'Palatino Linotype, serif',        emoji: '🏰' },
  { id: 'tech',        label: 'Tekniskt',     font: 'Courier New, monospace',          emoji: '🤖' },
  { id: 'cute',        label: 'Gulligt',      font: 'Arial Rounded MT Bold, sans-serif', emoji: '🌸' },
  { id: 'bold',        label: 'Fett',         font: 'Impact, sans-serif',              emoji: '💪' },
  { id: 'handwriting', label: 'Handskrivet',  font: 'Brush Script MT, cursive',        emoji: '✍️' },
  { id: 'alien',       label: 'Utomjording',  font: 'Trebuchet MS, sans-serif',        emoji: '👽' },
];

const TEXT_COLORS = [
  '#ffffff', '#ff4444', '#ff8800', '#ffdd00',
  '#44ff44', '#00ccff', '#8844ff', '#ff44aa',
  '#000000', '#888888', '#ffd700', '#00ffcc',
];

function FontPreview({ fontStyle, color, fontSize }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 200;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, 200, 80);

    const style = FONT_STYLES.find(f => f.id === fontStyle) || FONT_STYLES[0];
    const fSize = Math.min(Math.max(fontSize || 24, 12), 72);

    ctx.font = `bold ${Math.min(fSize, 36)}px ${style.font}`;
    ctx.fillStyle = color || '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText('Abc 123', 100, 40);
  }, [fontStyle, color, fontSize]);

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d', display: 'inline-block' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

export default function FontPickerBlock({ config, onConfigChange }) {
  const cfg = {
    fontStyle: 'comic',
    color: '#ffffff',
    fontSize: 24,
    ...config,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Typsnittsval</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Valj hur din text ska se ut</div>

      <div style={label}>TYPSNITT</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {FONT_STYLES.map(f => (
          <button key={f.id} onClick={() => onConfigChange({ fontStyle: f.id })}
            style={{
              padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.fontStyle === f.id ? '#0d2744' : '#21262d',
              color: cfg.fontStyle === f.id ? '#58a6ff' : '#8b949e',
              outline: cfg.fontStyle === f.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: f.font,
              textAlign: 'left',
            }}>
            <span style={{ fontSize: '1rem', fontFamily: 'sans-serif' }}>{f.emoji}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      <div style={label}>FARG</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {TEXT_COLORS.map(c => (
          <button key={c} onClick={() => onConfigChange({ color: c })}
            style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: c,
              outline: cfg.color === c ? '3px solid #58a6ff' : '2px solid #30363d',
              outlineOffset: 2,
            }}
          />
        ))}
      </div>

      <div style={label}>STORLEK</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input type="range" min={12} max={72} value={cfg.fontSize}
          onChange={e => onConfigChange({ fontSize: Number(e.target.value) })}
          style={{ flex: 1, accentColor: '#58a6ff' }} />
        <span style={{ color: '#58a6ff', fontWeight: 700, minWidth: 32 }}>{cfg.fontSize}</span>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...label, marginTop: 0 }}>FORHANDSVISNING</div>
        <FontPreview fontStyle={cfg.fontStyle} color={cfg.color} fontSize={cfg.fontSize} />
      </div>
    </div>
  );
}
