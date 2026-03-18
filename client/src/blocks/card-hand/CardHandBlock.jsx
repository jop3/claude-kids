import React, { useState } from 'react';

const MAX_OPTIONS = [3, 5, 7];
const DEFAULT_CARDS = [
  { id: 'c1', color: '#e74c3c', emoji: '⭐', title: 'Kort 1', value: 75 },
  { id: 'c2', color: '#3498db', emoji: '🔥', title: 'Kort 2', value: 42 },
  { id: 'c3', color: '#27ae60', emoji: '💎', title: 'Kort 3', value: 88 },
];

function FanCard({ card, index, total, selected, onClick }) {
  const spread = 20;
  const startAngle = -(spread * (total - 1)) / 2;
  const angle = startAngle + index * spread;
  const lift = selected ? -24 : 0;
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        width: 70, height: 98,
        borderRadius: 8,
        background: card.color || '#3498db',
        border: selected ? '3px solid #f1c40f' : '2px solid rgba(255,255,255,0.25)',
        cursor: 'pointer',
        transform: `rotate(${angle}deg) translateY(${lift}px)`,
        transformOrigin: 'bottom center',
        bottom: 0,
        left: '50%',
        marginLeft: -35,
        transition: 'transform 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 4px',
        boxShadow: selected ? '0 8px 20px rgba(241,196,15,0.4)' : '0 2px 8px rgba(0,0,0,0.4)',
        zIndex: selected ? total + 1 : index + 1,
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', textAlign: 'center' }}>{card.title}</span>
      <span style={{ fontSize: 24 }}>{card.emoji}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{card.value}</span>
    </div>
  );
}

export default function CardHandBlock({ config = {}, onConfigChange }) {
  const maxCards = config.maxCards || 5;
  const playerName = config.playerName || 'Spelare 1';
  const sourceCards = config.cards || DEFAULT_CARDS;
  const handCards = sourceCards.slice(0, maxCards);

  const [selectedId, setSelectedId] = useState(null);
  const [playedIds, setPlayedIds] = useState([]);
  const visibleCards = handCards.filter(c => !playedIds.includes(c.id));

  function handleCardClick(id) {
    setSelectedId(prev => prev === id ? null : id);
  }

  function handlePlay() {
    if (!selectedId) return;
    setPlayedIds(prev => [...prev, selectedId]);
    setSelectedId(null);
  }

  function handleReset() {
    setPlayedIds([]);
    setSelectedId(null);
  }

  const fanHeight = 140;

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>Hand</div>

      {/* Player name */}
      <div style={{ background: '#21262d', borderRadius: 8, padding: '6px 12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1rem' }}>👤</span>
        <input
          value={playerName}
          onChange={e => onConfigChange({ playerName: e.target.value })}
          style={{ flex: 1, background: 'none', border: 'none', color: '#e6edf3', fontWeight: 700, fontSize: '0.9rem', outline: 'none' }}
        />
        <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>{visibleCards.length} kort</span>
      </div>

      {/* Fan display */}
      <div style={{ position: 'relative', height: fanHeight + 20, marginBottom: 12 }}>
        {visibleCards.length > 0 ? (
          visibleCards.map((card, i) => (
            <FanCard
              key={card.id}
              card={card}
              index={i}
              total={visibleCards.length}
              selected={selectedId === card.id}
              onClick={() => handleCardClick(card.id)}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#8b949e', paddingTop: 40 }}>Inga kort kvar</div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={handlePlay} disabled={!selectedId}
          style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: selectedId ? '#238636' : '#21262d', color: selectedId ? '#fff' : '#6e7681', fontWeight: 700, cursor: selectedId ? 'pointer' : 'not-allowed', fontSize: '0.85rem' }}>
          Spela kort
        </button>
        <button onClick={handleReset}
          style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#21262d', color: '#e6edf3', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
          Aterstall
        </button>
      </div>

      {/* Config */}
      <div style={{ background: '#21262d', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ color: '#8b949e', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>Max kort i hand</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {MAX_OPTIONS.map(n => (
            <button key={n} onClick={() => onConfigChange({ maxCards: n })}
              style={{ flex: 1, padding: '6px', borderRadius: 6, border: maxCards === n ? '2px solid #58a6ff' : '1px solid #30363d', background: maxCards === n ? '#0d2744' : '#0d1117', color: '#e6edf3', fontWeight: 700, cursor: 'pointer' }}>
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
