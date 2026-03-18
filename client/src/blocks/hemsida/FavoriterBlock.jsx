import React, { useState } from 'react';

const CATEGORIES = [
  {
    id: 'musik', label: 'Musik', emoji: '🎵',
    items: ['🎸', '🎹', '🥁', '🎺', '🎻', '🎤'],
  },
  {
    id: 'sport', label: 'Sport', emoji: '⚽',
    items: ['⚽', '🏀', '🎾', '🏊', '🚴', '⛷️'],
  },
  {
    id: 'djur', label: 'Djur', emoji: '🐱',
    items: ['🐱', '🐶', '🐰', '🦊', '🐼', '🦁'],
  },
  {
    id: 'mat', label: 'Mat', emoji: '🍕',
    items: ['🍕', '🍔', '🍦', '🍩', '🍣', '🥞'],
  },
  {
    id: 'bocker', label: 'Böcker', emoji: '📚',
    items: ['📚', '🧙', '🦸', '🐉', '🌌', '🔮'],
  },
  {
    id: 'spel', label: 'Spel', emoji: '🎮',
    items: ['🎮', '🕹️', '🎲', '♟️', '🧩', '🃏'],
  },
];

export default function FavoriterBlock({ config = {}, onConfigChange }) {
  const picks = config.picks || [];
  const [openCat, setOpenCat] = useState(null);

  function togglePick(emoji) {
    const already = picks.includes(emoji);
    if (already) {
      onConfigChange({ picks: picks.filter(p => p !== emoji) });
    } else if (picks.length < 12) {
      onConfigChange({ picks: [...picks, emoji] });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1 }}>
        Favoriter
      </div>

      {/* Category buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}
            style={{
              padding: '12px 6px',
              borderRadius: 14,
              border: openCat === cat.id ? '2px solid #58a6ff' : '2px solid #30363d',
              background: openCat === cat.id ? '#0d2744' : '#21262d',
              color: '#e6edf3',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              minHeight: 64,
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Sub-grid for open category */}
      {openCat && (
        <div style={{ background: '#0d1117', borderRadius: 12, padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {CATEGORIES.find(c => c.id === openCat)?.items.map(emoji => (
              <button
                key={emoji}
                onClick={() => togglePick(emoji)}
                style={{
                  background: picks.includes(emoji) ? '#238636' : '#21262d',
                  border: picks.includes(emoji) ? '2px solid #3fb950' : '2px solid #30363d',
                  borderRadius: 12,
                  padding: '10px 4px',
                  cursor: 'pointer',
                  fontSize: '1.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  aspectRatio: '1',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Picked chips */}
      {picks.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {picks.map((emoji, i) => (
            <div
              key={i}
              onClick={() => togglePick(emoji)}
              style={{
                background: '#21262d',
                border: '1px solid #30363d',
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                userSelect: 'none',
              }}
              title="Tryck för att ta bort"
            >
              {emoji}
            </div>
          ))}
        </div>
      )}

      {picks.length === 0 && (
        <div style={{ color: '#6e7681', fontSize: '0.8rem', textAlign: 'center' }}>
          Tryck på en kategori och välj dina favoriter!
        </div>
      )}
    </div>
  );
}
