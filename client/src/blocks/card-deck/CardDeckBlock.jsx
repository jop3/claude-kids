import React, { useState, useEffect } from 'react';
import { Deck } from '../../lib/cardEngine.js';

const DEAL_OPTIONS = [1, 2, 3, 4, 5];

function DeckStack({ count, faceUp, color = '#2c3e50', isShuffling }) {
  const maxVisible = Math.min(count, 6);
  return (
    <div style={{ position: 'relative', width: 80, height: 120, margin: '0 auto' }}>
      {Array.from({ length: maxVisible }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 80, height: 110,
          borderRadius: 8,
          background: faceUp ? '#3498db' : color,
          border: '2px solid rgba(255,255,255,0.2)',
          top: (maxVisible - 1 - i) * 2,
          left: (maxVisible - 1 - i) * 2,
          transition: isShuffling ? `transform 0.3s ease ${i * 30}ms` : 'none',
          transform: isShuffling ? `rotate(${(Math.random() - 0.5) * 20}deg) translateY(-10px)` : 'none',
        }} />
      ))}
      {count === 0 && (
        <div style={{
          width: 80, height: 110, borderRadius: 8,
          border: '2px dashed #30363d', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: '#8b949e', fontSize: '0.7rem',
        }}>
          Tom
        </div>
      )}
    </div>
  );
}

export default function CardDeckBlock({ config = {}, onConfigChange }) {
  const cards = config.cards || [];
  const dealCount = config.dealCount || 1;
  const faceUp = config.faceUp || false;
  const deckColor = config.deckColor || '#2c3e50';

  const [deckSize, setDeckSize] = useState(cards.length || 20);
  const [dealtCards, setDealtCards] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    setDeckSize(cards.length || 20);
  }, [cards.length]);

  function handleShuffle() {
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 500);
  }

  function handleDeal() {
    if (deckSize <= 0) return;
    const n = Math.min(dealCount, deckSize);
    setDeckSize(s => s - n);
    setDealtCards(prev => [...prev, ...Array.from({ length: n }, (_, i) => ({ id: Date.now() + i }))]);
  }

  function handleReset() {
    setDeckSize(cards.length || 20);
    setDealtCards([]);
  }

  const label = { color: '#8b949e', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4, marginTop: 8 };

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>Kortlek</div>

      <DeckStack count={deckSize} faceUp={faceUp} color={deckColor} isShuffling={isShuffling} />
      <div style={{ textAlign: 'center', color: '#8b949e', fontSize: '0.85rem', marginTop: 4, marginBottom: 12 }}>
        {deckSize} kort kvar
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={handleShuffle}
          style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#6e40c9', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
          Blanda
        </button>
        <button onClick={handleDeal} disabled={deckSize <= 0}
          style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: deckSize > 0 ? '#238636' : '#21262d', color: deckSize > 0 ? '#fff' : '#6e7681', fontWeight: 700, cursor: deckSize > 0 ? 'pointer' : 'not-allowed', fontSize: '0.85rem' }}>
          Dela ut
        </button>
        <button onClick={handleReset}
          style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#21262d', color: '#e6edf3', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
          Aterstall
        </button>
      </div>

      {dealtCards.length > 0 && (
        <div style={{ background: '#21262d', borderRadius: 8, padding: 10, marginBottom: 8 }}>
          <div style={{ fontSize: '0.78rem', color: '#8b949e', marginBottom: 6 }}>Utdelade kort: {dealtCards.length}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {dealtCards.slice(-10).map(c => (
              <div key={c.id} style={{ width: 28, height: 40, borderRadius: 4, background: faceUp ? '#3498db' : deckColor, border: '1px solid rgba(255,255,255,0.2)' }} />
            ))}
            {dealtCards.length > 10 && <span style={{ color: '#8b949e', fontSize: '0.75rem', alignSelf: 'center' }}>+{dealtCards.length - 10}</span>}
          </div>
        </div>
      )}

      <div style={{ background: '#21262d', borderRadius: 8, padding: '10px 12px' }}>
        <div style={label}>Antal att dela ut</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {DEAL_OPTIONS.map(n => (
            <button key={n} onClick={() => onConfigChange({ dealCount: n })}
              style={{ flex: 1, padding: '6px', borderRadius: 6, border: dealCount === n ? '2px solid #58a6ff' : '1px solid #30363d', background: dealCount === n ? '#0d2744' : '#0d1117', color: '#e6edf3', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
              {n}
            </button>
          ))}
        </div>

        <div style={label}>Korten visas</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ v: false, l: 'Nedatt' }, { v: true, l: 'Uppatt' }].map(({ v, l }) => (
            <button key={l} onClick={() => onConfigChange({ faceUp: v })}
              style={{ flex: 1, padding: '8px', borderRadius: 6, border: faceUp === v ? '2px solid #58a6ff' : '1px solid #30363d', background: faceUp === v ? '#0d2744' : '#0d1117', color: '#e6edf3', fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem' }}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
