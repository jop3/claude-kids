import React, { useEffect, useRef } from 'react';

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

const BUBBLE_STYLES = [
  { id: 'round',   label: 'Pratbubbla', emoji: '💬' },
  { id: 'thought', label: 'Tankebubbla', emoji: '💭' },
  { id: 'shout',   label: 'Rop',        emoji: '💥' },
  { id: 'whisper', label: 'Viskning',   emoji: '🤫' },
];

const POSITIONS = [
  { id: 'top',    label: 'Uppe',   emoji: '⬆️' },
  { id: 'bottom', label: 'Nere',   emoji: '⬇️' },
  { id: 'left',   label: 'Vanster', emoji: '⬅️' },
  { id: 'right',  label: 'Hoger',  emoji: '➡️' },
];

const SPRITES = [
  { id: 'pojke',  emoji: '👦', label: 'Pojke' },
  { id: 'flicka', emoji: '👧', label: 'Flicka' },
  { id: 'katt',   emoji: '🐱', label: 'Katt' },
  { id: 'hund',   emoji: '🐶', label: 'Hund' },
  { id: 'robot',  emoji: '🤖', label: 'Robot' },
  { id: 'drake',  emoji: '🐲', label: 'Drake' },
];

function BubblePreview({ text, bubbleStyle, position }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 200;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, 200, 80);

    const bx = 10, by = 8, bw = 160, bh = 52;
    const r = 14;

    ctx.save();
    if (bubbleStyle === 'whisper') {
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = '#8b949e';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(139,148,158,0.1)';
    } else if (bubbleStyle === 'shout') {
      ctx.fillStyle = '#fff3cd';
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
    } else if (bubbleStyle === 'thought') {
      ctx.fillStyle = '#e8f4ff';
      ctx.strokeStyle = '#58a6ff';
      ctx.lineWidth = 2;
    } else {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#30363d';
      ctx.lineWidth = 2;
    }

    if (bubbleStyle === 'shout') {
      // Star/spiky shape
      ctx.beginPath();
      const cx2 = bx + bw / 2, cy2 = by + bh / 2;
      const spikes = 8, ro = bw / 2, ri = bw / 2 - 10;
      for (let i = 0; i < spikes * 2; i++) {
        const a = (i * Math.PI) / spikes - Math.PI / 2;
        const rr = i % 2 === 0 ? ro : ri;
        if (i === 0) ctx.moveTo(cx2 + rr * Math.cos(a), cy2 + rr * Math.sin(a));
        else ctx.lineTo(cx2 + rr * Math.cos(a), cy2 + rr * Math.sin(a));
      }
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, r);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Tail
    if (bubbleStyle !== 'thought' && bubbleStyle !== 'shout') {
      ctx.save();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      if (position === 'bottom') {
        ctx.moveTo(bx + bw / 2 - 8, by + bh);
        ctx.lineTo(bx + bw / 2, by + bh + 14);
        ctx.lineTo(bx + bw / 2 + 8, by + bh);
      } else {
        ctx.moveTo(bx + bw / 2 - 8, by);
        ctx.lineTo(bx + bw / 2, by - 14);
        ctx.lineTo(bx + bw / 2 + 8, by);
      }
      ctx.fill();
      ctx.restore();
    } else if (bubbleStyle === 'thought') {
      // Thought bubbles
      [[bx + bw / 2, by + bh + 8, 5], [bx + bw / 2 + 6, by + bh + 16, 3]].forEach(([x, y, rr]) => {
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fillStyle = '#e8f4ff';
        ctx.strokeStyle = '#58a6ff';
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
      });
    }

    // Text
    ctx.fillStyle = bubbleStyle === 'shout' ? '#333' : '#333';
    ctx.font = 'bold 11px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    const display = (text || 'Hej!').slice(0, 30);
    ctx.fillText(display, bx + bw / 2, by + bh / 2);
  }, [text, bubbleStyle, position]);

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d', display: 'inline-block' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

export default function SpeechBubbleBlock({ config, onConfigChange }) {
  const cfg = {
    text: 'Hej da!',
    bubbleStyle: 'round',
    position: 'top',
    characterId: 'pojke',
    ...config,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Pratbubbla</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Latt att lasa pratbubbla for din figur</div>

      <div style={label}>TEXT</div>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onConfigChange({ text: e.currentTarget.innerText.trim() || cfg.text })}
        style={{
          background: '#21262d', border: '1px solid #30363d', borderRadius: 8,
          padding: '10px 12px', color: '#e6edf3', fontSize: '0.9rem',
          minHeight: 40, outline: 'none',
        }}
      >
        {cfg.text}
      </div>

      <div style={label}>BUBBLA-STIL</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {BUBBLE_STYLES.map(s => (
          <button key={s.id} onClick={() => onConfigChange({ bubbleStyle: s.id })}
            style={{
              flex: 1, padding: '10px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.bubbleStyle === s.id ? '#0d2744' : '#21262d',
              color: cfg.bubbleStyle === s.id ? '#58a6ff' : '#8b949e',
              outline: cfg.bubbleStyle === s.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.75rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2,
            }}>
            <span style={{ fontSize: '1.2rem' }}>{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div style={label}>POSITION</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {POSITIONS.map(p => (
          <button key={p.id} onClick={() => onConfigChange({ position: p.id })}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.position === p.id ? '#0d2744' : '#21262d',
              color: cfg.position === p.id ? '#58a6ff' : '#8b949e',
              outline: cfg.position === p.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.75rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2,
            }}>
            <span style={{ fontSize: '1rem' }}>{p.emoji}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      <div style={label}>FIGUR</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {SPRITES.map(s => (
          <button key={s.id} onClick={() => onConfigChange({ characterId: s.id })}
            style={{
              padding: '8px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.characterId === s.id ? '#0d2744' : '#21262d',
              color: cfg.characterId === s.id ? '#58a6ff' : '#8b949e',
              outline: cfg.characterId === s.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.75rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2,
            }}>
            <span style={{ fontSize: '1.3rem' }}>{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...label, marginTop: 0 }}>FORHANDSVISNING</div>
        <BubblePreview text={cfg.text} bubbleStyle={cfg.bubbleStyle} position={cfg.position} />
      </div>
    </div>
  );
}
