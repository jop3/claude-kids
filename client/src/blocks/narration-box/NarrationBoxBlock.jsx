import React, { useEffect, useRef } from 'react';

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

const BOX_STYLES = [
  { id: 'rpg',     label: 'RPG',     emoji: '⚔️',  bg: 'rgba(0,0,0,0.85)', color: '#fff',    border: '#58a6ff' },
  { id: 'book',    label: 'Bok',     emoji: '📜',  bg: '#f4e4c1',           color: '#3d2b00', border: '#8b6914' },
  { id: 'modern',  label: 'Modernt', emoji: '✨',  bg: 'rgba(255,255,255,0.15)', color: '#fff', border: 'rgba(255,255,255,0.4)' },
];

const FONT_SIZES = [
  { id: 'small',  label: 'Liten',  px: 11 },
  { id: 'medium', label: 'Medel',  px: 14 },
  { id: 'large',  label: 'Stor',   px: 18 },
];

function NarrationPreview({ text, boxStyle, fontSize }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 200;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#1a2332';
    ctx.fillRect(0, 0, 200, 80);

    const style = BOX_STYLES.find(s => s.id === boxStyle) || BOX_STYLES[0];
    const fs = FONT_SIZES.find(f => f.id === fontSize) || FONT_SIZES[1];

    // Box
    if (boxStyle === 'modern') {
      ctx.save();
      ctx.filter = 'blur(4px)';
      ctx.fillStyle = 'rgba(100,120,150,0.3)';
      ctx.fillRect(4, 4, 192, 72);
      ctx.filter = 'none';
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = style.bg;
    ctx.strokeStyle = style.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(4, 4, 192, 72, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Text
    ctx.fillStyle = style.color;
    ctx.font = `${fs.px}px ${boxStyle === 'book' ? 'Georgia, serif' : 'sans-serif'}`;
    ctx.textBaseline = 'top';
    const display = (text || 'Det var en gang...').slice(0, 60);
    const maxW = 174;
    let line = '';
    let y = 14;
    for (const word of display.split(' ')) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, 14, y);
        line = word;
        y += fs.px + 4;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, 14, y);

    // Tap indicator
    ctx.fillStyle = style.color;
    ctx.globalAlpha = 0.6;
    ctx.font = `${fs.px - 1}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText('👆 Tryck for att fortsatta', 190, 60);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }, [text, boxStyle, fontSize]);

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d', display: 'inline-block' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

export default function NarrationBoxBlock({ config, onConfigChange }) {
  const cfg = {
    text: 'Det var en gang en liten robot...',
    boxStyle: 'rpg',
    fontSize: 'medium',
    ...config,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Berattarruta</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Textruta for att beratta historien</div>

      <div style={label}>TEXT</div>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onConfigChange({ text: e.currentTarget.innerText.trim() || cfg.text })}
        style={{
          background: '#21262d', border: '1px solid #30363d', borderRadius: 8,
          padding: '10px 12px', color: '#e6edf3', fontSize: '0.9rem',
          minHeight: 60, outline: 'none', lineHeight: 1.5,
        }}
      >
        {cfg.text}
      </div>

      <div style={label}>STIL</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {BOX_STYLES.map(s => (
          <button key={s.id} onClick={() => onConfigChange({ boxStyle: s.id })}
            style={{
              flex: 1, padding: '10px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.boxStyle === s.id ? '#0d2744' : '#21262d',
              color: cfg.boxStyle === s.id ? '#58a6ff' : '#8b949e',
              outline: cfg.boxStyle === s.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.75rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2,
            }}>
            <span style={{ fontSize: '1.2rem' }}>{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div style={label}>TEXTSTORLEK</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {FONT_SIZES.map(f => (
          <button key={f.id} onClick={() => onConfigChange({ fontSize: f.id })}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.fontSize === f.id ? '#0d2744' : '#21262d',
              color: cfg.fontSize === f.id ? '#58a6ff' : '#8b949e',
              outline: cfg.fontSize === f.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.85rem',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...label, marginTop: 0 }}>FORHANDSVISNING</div>
        <NarrationPreview text={cfg.text} boxStyle={cfg.boxStyle} fontSize={cfg.fontSize} />
      </div>
    </div>
  );
}
