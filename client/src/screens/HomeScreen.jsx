import React, { useState } from 'react';
import { tap } from '../lib/haptics.js';
import { playTap } from '../lib/sfx.js';

const CATEGORIES = [
  { id: 'musik',      name: 'Musik Studio',  emoji: '🎵', bg: '#6c3bbd' },
  { id: 'spel',       name: 'Spel',          emoji: '🎮', bg: '#2d7dd2' },
  { id: 'ritprogram', name: 'Ritprogram',    emoji: '🎨', bg: '#e84855' },
  { id: 'animation',  name: 'Animation',     emoji: '🌀', bg: '#f18f01' },
  { id: 'hemsida',    name: 'Min Hemsida',   emoji: '🌐', bg: '#3bb273' },
  { id: 'filmstudio', name: 'Filmstudio',    emoji: '🎬', bg: '#c33c54' },
  { id: 'kortspel',   name: 'Kortspel',      emoji: '🃏', bg: '#5c6bc0' },
  { id: 'bradspel',   name: 'Brädspel',      emoji: '🎲', bg: '#8d6748' },
  { id: 'larospel',   name: 'Lärospel',      emoji: '🧠', bg: '#00897b' },
  { id: 'rostlab',    name: 'Röstlab',       emoji: '🎤', bg: '#e53935' },
];

export default function HomeScreen({ navigate }) {
  const [highContrast, setHighContrast] = useState(false);

  function toggleContrast() {
    const next = !highContrast;
    setHighContrast(next);
    if (next) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 900, padding: '24px 16px', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', margin: 0, textAlign: 'center', color: '#fff' }}>
          ClaudeKids ✨
        </h1>
        <div style={{ position: 'absolute', right: 0, display: 'flex', gap: 8 }}>
          <button
            onClick={toggleContrast}
            title={highContrast ? 'Normal vy' : 'Hogkontrastlage'}
            style={{
              background: highContrast ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: 12,
              color: '#fff',
              fontSize: '1.1rem',
              cursor: 'pointer',
              padding: '8px 12px',
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            👁
          </button>
          <button
            onClick={() => navigate('myStuff')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: 12,
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              padding: '8px 16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              minHeight: 44,
            }}
          >
            Mina Saker 📁
          </button>
        </div>
      </div>

      {/* Category grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16,
      }}>
        {CATEGORIES.map(cat => (
          <CategoryCard key={cat.id} cat={cat} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ cat, navigate }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={() => { tap(); playTap(); navigate('wizard', { category: cat.id }); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        minHeight: 120,
        background: cat.bg,
        border: 'none',
        borderRadius: 16,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.1s ease',
        padding: 12,
      }}
    >
      <span style={{ fontSize: 48, lineHeight: 1 }}>{cat.emoji}</span>
      <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
        {cat.name}
      </span>
    </button>
  );
}
