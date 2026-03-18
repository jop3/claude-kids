import React, { useState } from 'react';
import { SPRITES } from '../../lib/sprites.js';

const CARD_COLORS = ['#e74c3c','#3498db','#27ae60','#f39c12','#9b59b6','#1abc9c','#e67e22','#2c3e50'];
const BACK_COLORS = ['#2c3e50','#8e44ad','#16a085','#c0392b','#2980b9','#27ae60','#e67e22','#34495e'];
const PATTERNS = [
  { id: 'solid', label: 'Solid', render: (color) => ({ background: color }) },
  { id: 'dots', label: 'Prickar', render: (color) => ({ background: `radial-gradient(circle, rgba(255,255,255,0.3) 2px, transparent 2px) 0 0 / 10px 10px, ${color}` }) },
  { id: 'stripes', label: 'Ränder', render: (color) => ({ background: `repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 8px), ${color}` }) },
  { id: 'diamonds', label: 'Diamanter', render: (color) => ({ background: `repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 50%), repeating-linear-gradient(-45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 50%), ${color}`, backgroundSize: '12px 12px, 12px 12px' }) },
  { id: 'stars', label: 'Stjarnor', render: (color) => ({ background: color, position: 'relative' }) },
  { id: 'waves', label: 'Vagor', render: (color) => ({ background: `repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(255,255,255,0.12) 6px, rgba(255,255,255,0.12) 8px), ${color}` }) },
];

const DEFAULT_CARD = () => ({
  id: Date.now().toString(36) + Math.random().toString(36).slice(2),
  frontContent: { title: 'Nytt kort', emoji: '⭐', category: 'Styrka', categoryValues: { Styrka: 50 } },
  backContent: { color: '#2c3e50', pattern: 'dots' },
  value: 50,
  color: '#e74c3c',
  image: null,
});

function CardPreview({ card, face = 'front', small = false }) {
  const w = small ? 56 : 80;
  const h = small ? 78 : 110;
  const pat = PATTERNS.find(p => p.id === (card.backContent?.pattern || 'solid')) || PATTERNS[0];
  const backStyle = pat.render(card.backContent?.color || '#2c3e50');

  if (face === 'back') {
    return (
      <div style={{ width: w, height: h, borderRadius: 8, border: '2px solid #444', flexShrink: 0, ...backStyle }} />
    );
  }
  return (
    <div style={{
      width: w, height: h, borderRadius: 8, border: '2px solid #444',
      background: card.color || '#e74c3c', flexShrink: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between', padding: small ? '4px 2px' : '6px 4px',
      overflow: 'hidden',
    }}>
      <span style={{ fontSize: small ? 8 : 11, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {card.frontContent?.title || 'Kort'}
      </span>
      <span style={{ fontSize: small ? 18 : 28 }}>{card.frontContent?.emoji || '⭐'}</span>
      <div style={{ width: '100%' }}>
        <div style={{ fontSize: small ? 7 : 9, color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
          {card.frontContent?.category || 'Styrka'}
        </div>
        <div style={{ fontSize: small ? 9 : 13, fontWeight: 700, color: '#fff', textAlign: 'center' }}>
          {card.value}
        </div>
      </div>
    </div>
  );
}

export default function CardCreatorBlock({ config = {}, onConfigChange }) {
  const cards = config.cards || [DEFAULT_CARD()];
  const [editIdx, setEditIdx] = useState(0);
  const [showSpritePicker, setShowSpritePicker] = useState(false);

  const card = cards[editIdx] || cards[0];

  function updateCard(updates) {
    const next = cards.map((c, i) => i === editIdx ? { ...c, ...updates } : c);
    onConfigChange({ cards: next });
  }

  function updateFront(updates) {
    updateCard({ frontContent: { ...card.frontContent, ...updates } });
  }

  function updateBack(updates) {
    updateCard({ backContent: { ...card.backContent, ...updates } });
  }

  function addCard() {
    if (cards.length >= 20) return;
    const next = [...cards, DEFAULT_CARD()];
    onConfigChange({ cards: next });
    setEditIdx(next.length - 1);
  }

  function removeCard(idx) {
    if (cards.length <= 1) return;
    const next = cards.filter((_, i) => i !== idx);
    onConfigChange({ cards: next });
    setEditIdx(Math.min(idx, next.length - 1));
  }

  const label = { color: '#8b949e', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4, marginTop: 8 };
  const section = { background: '#21262d', borderRadius: 8, padding: '10px 12px', marginBottom: 8 };

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>Kortdesign</div>

      {/* Preview row */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#8b949e', marginBottom: 4 }}>Framsida</div>
          <CardPreview card={card} face="front" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#8b949e', marginBottom: 4 }}>Baksida</div>
          <CardPreview card={card} face="back" />
        </div>
      </div>

      {/* Front editor */}
      <div style={section}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: '#58a6ff' }}>Framsida</div>

        <div style={label}>Titel</div>
        <input
          value={card.frontContent?.title || ''}
          onChange={e => updateFront({ title: e.target.value })}
          style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '6px 8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />

        <div style={label}>Kortfärg</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CARD_COLORS.map(c => (
            <button key={c} onClick={() => updateCard({ color: c })}
              style={{ width: 28, height: 28, borderRadius: 6, background: c, border: card.color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
          ))}
        </div>

        <div style={label}>Figur</div>
        <button onClick={() => setShowSpritePicker(!showSpritePicker)}
          style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '6px 12px', cursor: 'pointer', fontSize: '1.2rem' }}>
          {card.frontContent?.emoji || '⭐'} Byt figur
        </button>

        {showSpritePicker && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, marginTop: 8, maxHeight: 120, overflowY: 'auto', background: '#0d1117', borderRadius: 8, padding: 6 }}>
            {['⭐','🔥','💎','🌟','⚡','🎯','🏆','🎪','🌈','🦁','🐉','🚀','🎮','🎲','🃏','♟️','🌙','☀️','❤️','💪'].map(em => (
              <button key={em} onClick={() => { updateFront({ emoji: em }); setShowSpritePicker(false); }}
                style={{ fontSize: '1.4rem', background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4 }}>
                {em}
              </button>
            ))}
          </div>
        )}

        <div style={label}>Kategori</div>
        <input
          value={card.frontContent?.category || ''}
          onChange={e => updateFront({ category: e.target.value })}
          placeholder="t.ex. Styrka"
          style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '6px 8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
        />

        <div style={label}>Vardet (1–100)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="range" min={1} max={100} value={card.value}
            onChange={e => updateCard({ value: Number(e.target.value) })}
            style={{ flex: 1 }} />
          <span style={{ color: '#58a6ff', fontWeight: 700, minWidth: 28 }}>{card.value}</span>
        </div>
      </div>

      {/* Back editor */}
      <div style={section}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: '#58a6ff' }}>Baksida</div>
        <div style={label}>Baksidafarg</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {BACK_COLORS.map(c => (
            <button key={c} onClick={() => updateBack({ color: c })}
              style={{ width: 28, height: 28, borderRadius: 6, background: c, border: (card.backContent?.color || '#2c3e50') === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
          ))}
        </div>
        <div style={label}>Monster</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PATTERNS.map(p => (
            <button key={p.id} onClick={() => updateBack({ pattern: p.id })}
              style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', border: (card.backContent?.pattern || 'dots') === p.id ? '2px solid #58a6ff' : '1px solid #30363d', background: '#0d1117', color: '#e6edf3', cursor: 'pointer' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card list */}
      <div style={label}>Alla kort ({cards.length}/20)</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {cards.map((c, i) => (
          <div key={c.id} onClick={() => setEditIdx(i)}
            style={{ position: 'relative', cursor: 'pointer', opacity: i === editIdx ? 1 : 0.6, border: i === editIdx ? '2px solid #58a6ff' : '2px solid transparent', borderRadius: 8 }}>
            <CardPreview card={c} face="front" small />
            {cards.length > 1 && (
              <button onClick={e => { e.stopPropagation(); removeCard(i); }}
                style={{ position: 'absolute', top: -6, right: -6, background: '#e74c3c', border: 'none', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                x
              </button>
            )}
          </div>
        ))}
      </div>

      <button onClick={addCard} disabled={cards.length >= 20}
        style={{ width: '100%', padding: '10px', borderRadius: 8, border: '2px dashed #30363d', background: 'none', color: cards.length >= 20 ? '#444' : '#58a6ff', cursor: cards.length >= 20 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
        + Nytt kort
      </button>
    </div>
  );
}
