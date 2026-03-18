import React from 'react';

const DAMAGE_SOURCES = [
  { id: 'enemies', label: 'Fiender', emoji: '👾' },
  { id: 'spikes',  label: 'Taggar',  emoji: '🌵' },
  { id: 'falls',   label: 'Fall',    emoji: '⬇️' },
];

const INVINCIBILITY = [
  { id: 0.5, label: '0.5s' },
  { id: 1,   label: '1s' },
  { id: 2,   label: '2s' },
];

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

function HeartPreview({ lives, useBar }) {
  if (useBar) {
    return (
      <div style={{
        background: '#21262d', borderRadius: 8, padding: '10px 14px',
        border: '1px solid #30363d', marginTop: 10,
      }}>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: 6 }}>Livsbar</div>
        <div style={{ background: '#30363d', borderRadius: 6, height: 14, overflow: 'hidden' }}>
          <div style={{
            width: '75%', height: '100%',
            background: 'linear-gradient(90deg, #e05252, #ff7b7b)',
            borderRadius: 6,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>
    );
  }
  return (
    <div style={{
      background: '#21262d', borderRadius: 8, padding: '10px 14px',
      border: '1px solid #30363d', marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap',
    }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ fontSize: '1.4rem', opacity: i < lives ? 1 : 0.2 }}>❤️</span>
      ))}
    </div>
  );
}

export default function HealthBlock({ config, onConfigChange }) {
  const cfg = {
    useBar: false,
    maxLives: 3,
    damageSources: ['enemies', 'spikes', 'falls'],
    invincibilityFrames: 1,
    ...config,
  };

  function toggleSource(id) {
    const sources = cfg.damageSources.includes(id)
      ? cfg.damageSources.filter(s => s !== id)
      : [...cfg.damageSources, id];
    onConfigChange({ damageSources: sources });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Halsa</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Liv och hälsa för spelaren</div>

      <div style={label}>VISNINGSSTIL</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onConfigChange({ useBar: false })}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: !cfg.useBar ? '#0d2744' : '#21262d',
            color: !cfg.useBar ? '#58a6ff' : '#8b949e',
            outline: !cfg.useBar ? '2px solid #58a6ff' : '2px solid #30363d',
            fontWeight: 700, fontSize: '0.85rem',
          }}>
          ❤️ Liv
        </button>
        <button onClick={() => onConfigChange({ useBar: true })}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: cfg.useBar ? '#0d2744' : '#21262d',
            color: cfg.useBar ? '#58a6ff' : '#8b949e',
            outline: cfg.useBar ? '2px solid #58a6ff' : '2px solid #30363d',
            fontWeight: 700, fontSize: '0.85rem',
          }}>
          ▬ Livsbar
        </button>
      </div>

      {!cfg.useBar && (
        <div>
          <div style={{ ...label, display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
            <span>MAX LIV</span>
            <span style={{ color: '#58a6ff' }}>{cfg.maxLives}</span>
          </div>
          <input type="range" min={1} max={5} value={cfg.maxLives}
            onChange={e => onConfigChange({ maxLives: Number(e.target.value) })}
            style={{ width: '100%', accentColor: '#58a6ff' }} />
        </div>
      )}

      <HeartPreview lives={cfg.maxLives} useBar={cfg.useBar} />

      <div style={label}>SKADA FRAN</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {DAMAGE_SOURCES.map(s => {
          const active = cfg.damageSources.includes(s.id);
          return (
            <button key={s.id} onClick={() => toggleSource(s.id)}
              style={{
                padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: active ? '#0d2744' : '#21262d',
                color: active ? '#58a6ff' : '#8b949e',
                outline: active ? '2px solid #58a6ff' : '2px solid #30363d',
                fontWeight: 700, fontSize: '0.85rem',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
              <span style={{ fontSize: '1.1rem' }}>{s.emoji}</span>
              <span>{s.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>{active ? 'PÅ' : 'AV'}</span>
            </button>
          );
        })}
      </div>

      <div style={label}>OSKADBARHET EFTER SKADA</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {INVINCIBILITY.map(iv => (
          <button key={iv.id} onClick={() => onConfigChange({ invincibilityFrames: iv.id })}
            style={{
              flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: cfg.invincibilityFrames === iv.id ? '#0d2744' : '#21262d',
              color: cfg.invincibilityFrames === iv.id ? '#58a6ff' : '#8b949e',
              outline: cfg.invincibilityFrames === iv.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.85rem',
            }}>
            {iv.label}
          </button>
        ))}
      </div>
    </div>
  );
}
