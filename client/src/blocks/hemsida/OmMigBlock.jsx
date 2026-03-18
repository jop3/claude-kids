import React, { useState } from 'react';
import { SPRITES } from '../../lib/sprites.js';

const AVATAR_SPRITES = SPRITES.filter(s => s.category === 'Människor' || s.category === 'Monster');

const ADJECTIVES = [
  'Rolig', 'Glad', 'Snabb', 'Modig', 'Smart', 'Cool', 'Vild', 'Lugn',
  'Energisk', 'Kreativ', 'Busig', 'Snäll', 'Stark', 'Nyfiken', 'Tokig',
];

const NOUNS = [
  'Äventyraren', 'Hjälten', 'Konstnären', 'Spelaren', 'Byggaren',
  'Drömmaren', 'Forskararen', 'Musikern', 'Läsaren', 'Mästaren',
  'Utforskaren', 'Uppfinnaren', 'Trollkarlen', 'Stjärnan', 'Roboten',
];

function pickRandom(arr, exclude) {
  let idx = Math.floor(Math.random() * arr.length);
  while (arr[idx] === exclude && arr.length > 1) idx = Math.floor(Math.random() * arr.length);
  return idx;
}

export default function OmMigBlock({ config = {}, onConfigChange }) {
  const spriteIdx = config.spriteIdx ?? 0;
  const adjIdx = config.adjIdx ?? 0;
  const nounIdx = config.nounIdx ?? 0;
  const [adjFlip, setAdjFlip] = useState(false);
  const [nounFlip, setNounFlip] = useState(false);

  const sprite = AVATAR_SPRITES[spriteIdx % AVATAR_SPRITES.length];

  function nextSprite() {
    onConfigChange({ spriteIdx: (spriteIdx + 1) % AVATAR_SPRITES.length });
  }

  function spinAdj() {
    if (adjFlip) return;
    setAdjFlip(true);
    setTimeout(() => {
      onConfigChange({ adjIdx: pickRandom(ADJECTIVES, ADJECTIVES[adjIdx]) });
      setAdjFlip(false);
    }, 200);
  }

  function spinNoun() {
    if (nounFlip) return;
    setNounFlip(true);
    setTimeout(() => {
      onConfigChange({ nounIdx: pickRandom(NOUNS, NOUNS[nounIdx]) });
      setNounFlip(false);
    }, 200);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1 }}>
        Om Mig
      </div>

      {/* Avatar picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          onClick={nextSprite}
          style={{
            width: 96, height: 96,
            background: 'linear-gradient(135deg, #6c3bbd, #2d7dd2)',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <img src={sprite.dataUrl} alt={sprite.name} style={{ width: 72, height: 72 }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>
            {sprite.name}
          </div>
          <div style={{ color: '#8b949e', fontSize: '0.8rem', lineHeight: 1.4 }}>
            Tryck på avataren för att byta karaktär!
          </div>
        </div>
      </div>

      {/* Name word cards */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div
          onClick={spinAdj}
          style={{
            flex: 1,
            background: adjFlip ? 'rgba(108,59,189,0.3)' : 'linear-gradient(135deg, #6c3bbd, #a855f7)',
            borderRadius: 14,
            padding: '14px 8px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s, opacity 0.2s',
            transform: adjFlip ? 'rotateY(90deg) scale(0.9)' : 'rotateY(0deg) scale(1)',
            opacity: adjFlip ? 0.4 : 1,
            userSelect: 'none',
          }}
        >
          <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>
            {ADJECTIVES[adjIdx]}
          </div>
        </div>
        <div
          onClick={spinNoun}
          style={{
            flex: 1,
            background: nounFlip ? 'rgba(45,125,210,0.3)' : 'linear-gradient(135deg, #2d7dd2, #06b6d4)',
            borderRadius: 14,
            padding: '14px 8px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s, opacity 0.2s',
            transform: nounFlip ? 'rotateY(90deg) scale(0.9)' : 'rotateY(0deg) scale(1)',
            opacity: nounFlip ? 0.4 : 1,
            userSelect: 'none',
          }}
        >
          <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem' }}>
            {NOUNS[nounIdx]}
          </div>
        </div>
      </div>

      <div style={{ color: '#6e7681', fontSize: '0.75rem', textAlign: 'center' }}>
        Tryck på korten för att byta namn!
      </div>
    </div>
  );
}

export { AVATAR_SPRITES, ADJECTIVES, NOUNS };
