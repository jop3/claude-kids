import React, { useEffect, useRef } from 'react';

const POWERUP_TYPES = [
  { id: 'life',     label: 'Extra liv',  emoji: '⭐' },
  { id: 'speed',    label: 'Hastighet',  emoji: '⚡' },
  { id: 'shield',   label: 'Sköld',      emoji: '🛡️' },
  { id: 'double',   label: 'Poäng x2',   emoji: '💰' },
  { id: 'key',      label: 'Nyckel',     emoji: '🔑' },
  { id: 'bomb',     label: 'Bomb',       emoji: '💣' },
];

const RESPAWN = [
  { id: 0,  label: 'Aldrig' },
  { id: 5,  label: '5s' },
  { id: 10, label: '10s' },
  { id: 30, label: '30s' },
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

function SpinningIcon({ emoji }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 80;
    canvas.height = 80;

    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      const t = ts / 1000;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 80, 80);

      // Glow
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);
      ctx.shadowBlur = 10 + pulse * 10;
      ctx.shadowColor = '#ffd700';

      ctx.save();
      ctx.translate(40, 40);
      ctx.rotate(t * 1.5);
      ctx.scale(1 + pulse * 0.1, 1 + pulse * 0.1);
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 0, 0);
      ctx.restore();
      ctx.shadowBlur = 0;
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [emoji]);

  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #30363d', display: 'inline-block', background: '#0d1117' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}

export default function PowerupBlock({ config, onConfigChange }) {
  const cfg = {
    type: 'life',
    spawnRandom: true,
    spawnX: 200,
    spawnY: 200,
    respawnTime: 10,
    ...config,
  };

  const currentType = POWERUP_TYPES.find(t => t.id === cfg.type) || POWERUP_TYPES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Power-up</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Specialföremål spelaren kan plocka upp</div>

      <div style={label}>TYP</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        {POWERUP_TYPES.map(t => (
          <button key={t.id} onClick={() => onConfigChange({ type: t.id })}
            style={{
              padding: '8px 6px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.type === t.id ? '#0d2744' : '#21262d',
              color: cfg.type === t.id ? '#58a6ff' : '#8b949e',
              outline: cfg.type === t.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.78rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            }}>
            <span style={{ fontSize: '1.3rem' }}>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div style={label}>PLACERING</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onConfigChange({ spawnRandom: true })}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: cfg.spawnRandom ? '#0d2744' : '#21262d',
            color: cfg.spawnRandom ? '#58a6ff' : '#8b949e',
            outline: cfg.spawnRandom ? '2px solid #58a6ff' : '2px solid #30363d',
            fontWeight: 700, fontSize: '0.85rem',
          }}>
          🎲 Slumpmässig
        </button>
        <button onClick={() => onConfigChange({ spawnRandom: false })}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: !cfg.spawnRandom ? '#0d2744' : '#21262d',
            color: !cfg.spawnRandom ? '#58a6ff' : '#8b949e',
            outline: !cfg.spawnRandom ? '2px solid #58a6ff' : '2px solid #30363d',
            fontWeight: 700, fontSize: '0.85rem',
          }}>
          📍 Fast plats
        </button>
      </div>

      {!cfg.spawnRandom && (
        <>
          <SliderRow lbl="X-POSITION" min={0} max={800} value={cfg.spawnX}
            onChange={v => onConfigChange({ spawnX: v })} />
          <SliderRow lbl="Y-POSITION" min={0} max={600} value={cfg.spawnY}
            onChange={v => onConfigChange({ spawnY: v })} />
        </>
      )}

      <div style={label}>ATERKOMST</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {RESPAWN.map(r => (
          <button key={r.id} onClick={() => onConfigChange({ respawnTime: r.id })}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: cfg.respawnTime === r.id ? '#0d2744' : '#21262d',
              color: cfg.respawnTime === r.id ? '#58a6ff' : '#8b949e',
              outline: cfg.respawnTime === r.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.8rem',
            }}>
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <SpinningIcon emoji={currentType.emoji} />
        <div>
          <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>{currentType.emoji} {currentType.label}</div>
          <div style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 4 }}>
            {cfg.spawnRandom ? 'Dyker upp slumpmässigt' : `Plats: ${cfg.spawnX}, ${cfg.spawnY}`}
          </div>
          <div style={{ color: '#8b949e', fontSize: '0.8rem' }}>
            {cfg.respawnTime === 0 ? 'Kommer inte tillbaka' : `Återkommer efter ${cfg.respawnTime}s`}
          </div>
        </div>
      </div>
    </div>
  );
}
