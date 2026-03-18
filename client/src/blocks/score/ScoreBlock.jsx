import React, { useEffect, useRef } from 'react';

const DISPLAY_STYLES = [
  { id: 'topleft',  label: 'Uppe vänster', emoji: '↖️' },
  { id: 'center',   label: 'Mitt popup',   emoji: '🎯' },
  { id: 'arcade',   label: 'Arcade-stil',  emoji: '🕹️' },
];

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

function SliderRow({ lbl, min, max, value, onChange }) {
  return (
    <div>
      <div style={{ ...label, display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <span>{lbl}</span>
        <span style={{ color: '#58a6ff' }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#58a6ff' }} />
    </div>
  );
}

function AnimatedScore({ displayStyle, showHighScore, pointsPerCoin }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const scoreRef = useRef(0);
  const targetRef = useRef(0);
  const lastCoinRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 200;
    canvas.height = 80;

    let t = 0;

    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      t = ts / 1000;

      // Simulate coin collection every 2s
      if (Math.floor(t) !== Math.floor(lastCoinRef.current)) {
        lastCoinRef.current = t;
        targetRef.current += pointsPerCoin;
      }
      scoreRef.current += (targetRef.current - scoreRef.current) * 0.15;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, 200, 80);

      const score = Math.round(scoreRef.current);

      if (displayStyle === 'topleft') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.roundRect(6, 6, 100, 28, 6);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px monospace';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐ ' + score, 14, 20);
        if (showHighScore) {
          ctx.fillStyle = '#8b949e';
          ctx.font = '10px monospace';
          ctx.fillText('BÄST: ' + Math.max(score, 100), 14, 46);
        }
      } else if (displayStyle === 'center') {
        const alpha = 0.5 + 0.5 * Math.abs(Math.sin(t * 1.5));
        ctx.fillStyle = `rgba(255,215,0,${alpha * 0.15})`;
        ctx.beginPath();
        ctx.roundRect(50, 20, 100, 40, 12);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(score, 100, 40);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#8b949e';
        ctx.fillText('POANG', 100, 56);
        ctx.textAlign = 'left';
      } else {
        // Arcade
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 200, 80);
        ctx.strokeStyle = '#ff0040';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 198, 78);
        ctx.fillStyle = '#ff0040';
        ctx.font = 'bold 10px monospace';
        ctx.textBaseline = 'top';
        ctx.fillText('1UP', 10, 8);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(score).padStart(6, '0'), 100, 44);
        ctx.textAlign = 'left';
      }
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayStyle, showHighScore, pointsPerCoin]);

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d', display: 'inline-block' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

export default function ScoreBlock({ config, onConfigChange }) {
  const cfg = {
    startingScore: 0,
    pointsPerCoin: 10,
    showHighScore: true,
    displayStyle: 'topleft',
    ...config,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Poang</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Håll koll på spelarens poäng</div>

      <SliderRow lbl="STARTPOANG" min={0} max={1000} value={cfg.startingScore}
        onChange={v => onConfigChange({ startingScore: v })} />
      <SliderRow lbl="POANG PER MYNT" min={1} max={100} value={cfg.pointsPerCoin}
        onChange={v => onConfigChange({ pointsPerCoin: v })} />

      <div style={label}>VISNINGSSTIL</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {DISPLAY_STYLES.map(s => (
          <button key={s.id} onClick={() => onConfigChange({ displayStyle: s.id })}
            style={{
              padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.displayStyle === s.id ? '#0d2744' : '#21262d',
              color: cfg.displayStyle === s.id ? '#58a6ff' : '#8b949e',
              outline: cfg.displayStyle === s.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
            }}>
            <span style={{ fontSize: '1.1rem' }}>{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <button onClick={() => onConfigChange({ showHighScore: !cfg.showHighScore })}
        style={{
          marginTop: 10, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: cfg.showHighScore ? '#0d2744' : '#21262d',
          color: cfg.showHighScore ? '#58a6ff' : '#8b949e',
          outline: cfg.showHighScore ? '2px solid #58a6ff' : '2px solid #30363d',
          fontWeight: 700, fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
        <span style={{ fontSize: '1.1rem' }}>🏆</span>
        <span>Visa högsta poäng</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{cfg.showHighScore ? 'PÅ' : 'AV'}</span>
      </button>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...label, marginTop: 0 }}>FORHANDSVISNING</div>
        <AnimatedScore displayStyle={cfg.displayStyle} showHighScore={cfg.showHighScore} pointsPerCoin={cfg.pointsPerCoin} />
      </div>
    </div>
  );
}
