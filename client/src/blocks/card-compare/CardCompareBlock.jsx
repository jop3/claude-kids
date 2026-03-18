import React, { useState } from 'react';
import { TopTrumpsGame } from '../../lib/cardGames.js';

const DEFAULT_CARDS = [
  { id: 'c1', frontContent: { title: 'Lejon', emoji: '🦁', category: 'Styrka', categoryValues: { Styrka: 90, Snabbhet: 60, Intelligens: 40 } }, value: 90, color: '#e67e22' },
  { id: 'c2', frontContent: { title: 'Delfin', emoji: '🐬', category: 'Styrka', categoryValues: { Styrka: 50, Snabbhet: 85, Intelligens: 90 } }, value: 75, color: '#3498db' },
  { id: 'c3', frontContent: { title: 'Bjorn', emoji: '🐻', category: 'Styrka', categoryValues: { Styrka: 95, Snabbhet: 40, Intelligens: 50 } }, value: 80, color: '#8e6c3f' },
  { id: 'c4', frontContent: { title: 'Örn', emoji: '🦅', category: 'Styrka', categoryValues: { Styrka: 55, Snabbhet: 95, Intelligens: 65 } }, value: 72, color: '#7f8c8d' },
];

function TopCard({ card, revealed, label, winner }) {
  if (!card) return <div style={{ width: 90, height: 126, borderRadius: 8, background: '#21262d', border: '2px dashed #30363d' }} />;
  return (
    <div style={{
      width: 90, height: 126, borderRadius: 8,
      background: revealed ? (card.color || '#3498db') : '#2c3e50',
      border: winner === true ? '3px solid #f1c40f' : winner === false ? '2px solid #e74c3c' : '2px solid rgba(255,255,255,0.2)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'space-between', padding: '8px 4px',
      transition: 'background 0.3s',
      boxShadow: winner === true ? '0 0 16px rgba(241,196,15,0.5)' : 'none',
    }}>
      {revealed ? (
        <>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', textAlign: 'center' }}>{card.frontContent?.title || 'Kort'}</span>
          <span style={{ fontSize: 32 }}>{card.frontContent?.emoji || '🃏'}</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>{label}</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 9, color: '#8b949e' }}>{label}</span>
          <span style={{ fontSize: 28 }}>🂠</span>
          <span style={{ fontSize: 9, color: '#8b949e' }}>Dold</span>
        </>
      )}
    </div>
  );
}

export default function CardCompareBlock({ config = {}, onConfigChange }) {
  const cards = config.cards?.length >= 2 ? config.cards : DEFAULT_CARDS;
  const activeCategory = config.category || 'Styrka';
  const categories = [...new Set(cards.flatMap(c => Object.keys(c.frontContent?.categoryValues || { Styrka: 0, Snabbhet: 0 })))];

  const [game] = useState(() => new TopTrumpsGame([...cards], activeCategory));
  const [playerCard, setPlayerCard] = useState(null);
  const [cpuCard, setCpuCard] = useState(null);
  const [result, setResult] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [playerDeck, setPlayerDeck] = useState(cards.slice(0, Math.floor(cards.length / 2)));
  const [cpuDeck, setCpuDeck] = useState(cards.slice(Math.floor(cards.length / 2)));
  const [revealed, setRevealed] = useState(false);

  function handleDrawCard() {
    if (playerDeck.length === 0 || cpuDeck.length === 0) return;
    const pCard = playerDeck[0];
    const cCard = cpuDeck[0];
    setPlayerCard(pCard);
    setCpuCard(cCard);
    setRevealed(true);

    const pVal = pCard.frontContent?.categoryValues?.[activeCategory] ?? pCard.value ?? 50;
    const cVal = cCard.frontContent?.categoryValues?.[activeCategory] ?? cCard.value ?? 50;
    const diff = pVal - cVal;

    if (diff > 0) {
      setResult({ winner: 'player', pVal, cVal, diff: Math.abs(diff) });
      setPlayerScore(s => s + 1);
    } else if (diff < 0) {
      setResult({ winner: 'cpu', pVal, cVal, diff: Math.abs(diff) });
      setCpuScore(s => s + 1);
    } else {
      setResult({ winner: 'draw', pVal, cVal, diff: 0 });
    }

    setPlayerDeck(d => d.slice(1));
    setCpuDeck(d => d.slice(1));
  }

  function handleNext() {
    setPlayerCard(null);
    setCpuCard(null);
    setResult(null);
    setRevealed(false);
  }

  function handleReset() {
    const half = Math.floor(cards.length / 2);
    setPlayerDeck(cards.slice(0, half));
    setCpuDeck(cards.slice(half));
    setPlayerCard(null);
    setCpuCard(null);
    setResult(null);
    setRevealed(false);
    setPlayerScore(0);
    setCpuScore(0);
  }

  const gameOver = playerDeck.length === 0 || cpuDeck.length === 0;

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>Top Trumps</div>

      {/* Score */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, background: '#1a3a2a', borderRadius: 8, padding: '8px', textAlign: 'center', border: result?.winner === 'player' ? '2px solid #f1c40f' : '1px solid #30363d' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{playerScore}</div>
          <div style={{ fontSize: '0.75rem', color: '#7bff7b' }}>Du</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', color: '#8b949e', fontWeight: 700 }}>VS</div>
        <div style={{ flex: 1, background: '#3a1a1a', borderRadius: 8, padding: '8px', textAlign: 'center', border: result?.winner === 'cpu' ? '2px solid #f1c40f' : '1px solid #30363d' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{cpuScore}</div>
          <div style={{ fontSize: '0.75rem', color: '#ff7b7b' }}>CPU</div>
        </div>
      </div>

      {/* Deck sizes */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: '0.78rem', color: '#8b949e', textAlign: 'center' }}>
        <div style={{ flex: 1 }}>{playerDeck.length} kort kvar</div>
        <div style={{ flex: 1 }}>{cpuDeck.length} kort kvar</div>
      </div>

      {/* Category selector */}
      <div style={{ background: '#21262d', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
        <div style={{ fontSize: '0.78rem', color: '#8b949e', marginBottom: 6, fontWeight: 700 }}>Jamforekategori</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(categories.length > 0 ? categories : ['Styrka', 'Snabbhet', 'Intelligens']).map(cat => (
            <button key={cat} onClick={() => onConfigChange({ category: cat })}
              style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.8rem', border: activeCategory === cat ? '2px solid #58a6ff' : '1px solid #30363d', background: activeCategory === cat ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontWeight: activeCategory === cat ? 700 : 400 }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards display */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 10 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#7bff7b', marginBottom: 4 }}>Du</div>
          <TopCard card={playerCard} revealed={revealed} label={activeCategory} winner={result?.winner === 'player'} />
          {revealed && playerCard && (
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>
              {playerCard.frontContent?.categoryValues?.[activeCategory] ?? playerCard.value ?? '?'}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: '#ff7b7b', marginBottom: 4 }}>CPU</div>
          <TopCard card={cpuCard} revealed={revealed} label={activeCategory} winner={result?.winner === 'cpu'} />
          {revealed && cpuCard && (
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>
              {cpuCard.frontContent?.categoryValues?.[activeCategory] ?? cpuCard.value ?? '?'}
            </div>
          )}
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div style={{ background: result.winner === 'player' ? '#1a3a2a' : result.winner === 'cpu' ? '#3a1a1a' : '#2a2a1a', border: `2px solid ${result.winner === 'player' ? '#27ae60' : result.winner === 'cpu' ? '#e74c3c' : '#f39c12'}`, borderRadius: 8, padding: '8px', textAlign: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 700 }}>
            {result.winner === 'player' ? 'Du vann!' : result.winner === 'cpu' ? 'CPU vann!' : 'Oavgjort!'}
          </div>
          {result.diff > 0 && <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Skillnad: {result.diff}</div>}
        </div>
      )}

      {gameOver && (
        <div style={{ background: '#1a3a2a', border: '2px solid #27ae60', borderRadius: 8, padding: 10, textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 700 }}>{playerScore > cpuScore ? 'Du vann matchen!' : playerScore < cpuScore ? 'CPU vann matchen!' : 'Oavgjort!'}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        {!revealed && !gameOver && (
          <button onClick={handleDrawCard}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#238636', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Dra ett kort
          </button>
        )}
        {revealed && !gameOver && (
          <button onClick={handleNext}
            style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#1f6feb', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
            Nasta runda
          </button>
        )}
        <button onClick={handleReset}
          style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#21262d', color: '#e6edf3', fontWeight: 700, cursor: 'pointer' }}>
          Borja om
        </button>
      </div>
    </div>
  );
}
