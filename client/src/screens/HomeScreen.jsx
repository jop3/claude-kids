import React, { useState, useEffect } from 'react';
import { tap } from '../lib/haptics.js';
import { playTap } from '../lib/sfx.js';
import { getProjects } from '../lib/projectStore.js';
import { getUnlocked, ACHIEVEMENTS } from '../lib/achievements.js';
import { getProfile } from '../lib/creatorProfile.js';

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
  { id: 'berattelse', name: 'Berattelse',    emoji: '📖', bg: '#c0392b' },
  { id: 'pixelart',   name: 'Pixel Art',     emoji: '🎨', bg: '#8e44ad' },
  { id: 'quiz',       name: 'Quiz-skaparen', emoji: '🧠', bg: '#e67e22' },
];

export default function HomeScreen({ navigate }) {
  const [highContrast, setHighContrast] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [achCount, setAchCount] = useState(0);
  const [showAchModal, setShowAchModal] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setProjectCount(getProjects().length);
    setAchCount(getUnlocked().length);
    setProfile(getProfile());
  }, []);

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
      {/* Achievement modal */}
      {showAchModal && (
        <div
          onClick={() => setShowAchModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a2e',
              border: '2px solid rgba(255,215,0,0.4)',
              borderRadius: 24,
              padding: '24px 20px',
              maxWidth: 360, width: '90%',
              maxHeight: '80vh', overflowY: 'auto',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffd700' }}>🏅 Prestationer</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                {achCount}/{ACHIEVEMENTS.length} upplåsta
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ACHIEVEMENTS.map(ach => {
                const unlocked = getUnlocked().includes(ach.id);
                return (
                  <div key={ach.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: unlocked ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)',
                    border: unlocked ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: '12px 14px',
                    opacity: unlocked ? 1 : 0.45,
                  }}>
                    <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{ach.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{ach.title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>{ach.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowAchModal(false)}
              style={{
                width: '100%', marginTop: 16, padding: '12px 0',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12, color: '#fff', fontSize: '1rem', cursor: 'pointer',
              }}
            >
              Stäng
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', margin: 0, textAlign: 'center', color: '#fff' }}>
          ClaudeKids ✨
        </h1>
        <div style={{ position: 'absolute', left: 0, display: 'flex', gap: 8 }}>
          {profile && (
            <button
              onClick={() => navigate('setupProfile')}
              title="Redigera profil"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.25)',
                borderRadius: 12, fontSize: '1.5rem',
                cursor: 'pointer', padding: '4px 10px',
                minWidth: 44, minHeight: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {profile.avatar}
            </button>
          )}
        </div>
        <div style={{ position: 'absolute', right: 0, display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowAchModal(true)}
            title="Prestationer"
            style={{
              background: achCount > 0 ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.08)',
              border: achCount > 0 ? '2px solid rgba(255,215,0,0.5)' : '2px solid rgba(255,255,255,0.2)',
              borderRadius: 12,
              color: '#ffd700',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              padding: '8px 12px',
              minHeight: 44,
              whiteSpace: 'nowrap',
            }}
          >
            🏅 {achCount}
          </button>
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
            Mina Saker 📁{projectCount > 0 && <span style={{ marginLeft: 6, fontSize: '0.8rem', opacity: 0.85 }}>({projectCount} sparade)</span>}
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
