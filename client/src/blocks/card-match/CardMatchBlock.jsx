import React, { useState, useEffect, useRef } from 'react';
import { MemoryGame } from '../../lib/cardGames.js';

const GRID_OPTIONS = [
  { id: '2x2', label: '2x2', cols: 2, rows: 2, pairs: 2 },
  { id: '3x4', label: '3x4', cols: 3, rows: 4, pairs: 6 },
  { id: '4x4', label: '4x4', cols: 4, rows: 4, pairs: 8 },
];

const DEFAULT_PAIRS = [
  { id: 'p1', frontContent: { emoji: '🦁' }, color: '#e74c3c', value: 1 },
  { id: 'p2', frontContent: { emoji: '🐬' }, color: '#3498db', value: 2 },
  { id: 'p3', frontContent: { emoji: '🌟' }, color: '#f39c12', value: 3 },
  { id: 'p4', frontContent: { emoji: '🔥' }, color: '#e67e22', value: 4 },
  { id: 'p5', frontContent: { emoji: '🦋' }, color: '#9b59b6', value: 5 },
  { id: 'p6', frontContent: { emoji: '🌈' }, color: '#1abc9c', value: 6 },
  { id: 'p7', frontContent: { emoji: '🐉' }, color: '#27ae60', value: 7 },
  { id: 'p8', frontContent: { emoji: '🚀' }, color: '#2980b9', value: 8 },
];

export default function CardMatchBlock({ config = {}, onConfigChange }) {
  const gridId = config.gridSize || '3x4';
  const grid = GRID_OPTIONS.find(g => g.id === gridId) || GRID_OPTIONS[1];
  const sourceCards = config.cards?.slice(0, grid.pairs) || DEFAULT_PAIRS.slice(0, grid.pairs);

  const [game, setGame] = useState(() => new MemoryGame(sourceCards.slice(0, grid.pairs)));
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    resetGame();
  }, [gridId]);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  function resetGame() {
    clearInterval(timerRef.current);
    const g = new MemoryGame(sourceCards.slice(0, grid.pairs));
    setGame(g);
    setFlippedIds([]);
    setMatchedIds(new Set());
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    setWon(false);
  }

  function handleCardClick(instanceId) {
    if (!running && !won) setRunning(true);
    if (won) return;
    if (matchedIds.has(instanceId)) return;
    if (flippedIds.includes(instanceId)) return;
    if (flippedIds.length >= 2) return;

    const newFlipped = [...flippedIds, instanceId];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped.map(id => game.pairs.find(p => p.instanceId === id));
      if (a && b && a.id === b.id) {
        const newMatched = new Set([...matchedIds, newFlipped[0], newFlipped[1]]);
        setMatchedIds(newMatched);
        setFlippedIds([]);
        if (newMatched.size === game.pairs.length) {
          setWon(true);
          setRunning(false);
        }
      } else {
        setTimeout(() => setFlippedIds([]), 1000);
      }
    }
  }

  const pairs = game.pairs;
  const cardW = grid.cols === 2 ? 64 : grid.cols === 3 ? 58 : 50;
  const cardH = Math.round(cardW * 1.4);

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>Memory</div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, background: '#21262d', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{moves}</div>
          <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>drag</div>
        </div>
        <div style={{ flex: 1, background: '#21262d', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{seconds}s</div>
          <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>tid</div>
        </div>
        <div style={{ flex: 1, background: '#21262d', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{matchedIds.size / 2}/{grid.pairs}</div>
          <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>par</div>
        </div>
      </div>

      {/* Win state */}
      {won && (
        <div style={{ background: '#1a3a2a', border: '2px solid #27ae60', borderRadius: 8, padding: 12, textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>Grattis!</div>
          <div style={{ color: '#7bff7b', fontSize: '0.85rem' }}>{moves} drag · {seconds}s</div>
        </div>
      )}

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${grid.cols}, ${cardW}px)`,
        gap: 4,
        justifyContent: 'center',
        marginBottom: 10,
      }}>
        {pairs.map(card => {
          const isFlipped = flippedIds.includes(card.instanceId) || matchedIds.has(card.instanceId);
          const isMatched = matchedIds.has(card.instanceId);
          return (
            <div
              key={card.instanceId}
              onClick={() => handleCardClick(card.instanceId)}
              style={{
                width: cardW, height: cardH,
                borderRadius: 6,
                background: isFlipped ? (card.color || '#3498db') : '#2c3e50',
                border: isMatched ? '2px solid #27ae60' : isFlipped ? '2px solid rgba(255,255,255,0.3)' : '2px solid #444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isFlipped ? Math.round(cardW * 0.45) : Math.round(cardW * 0.3),
                transition: 'background 0.2s',
                opacity: isMatched ? 0.7 : 1,
                userSelect: 'none',
              }}
            >
              {isFlipped ? (card.frontContent?.emoji || '?') : '❓'}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={resetGame}
          style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#6e40c9', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
          Nytt spel
        </button>
      </div>

      <div style={{ background: '#21262d', borderRadius: 8, padding: '10px 12px' }}>
        <div style={{ color: '#8b949e', fontSize: '0.78rem', fontWeight: 700, marginBottom: 6 }}>Nätets storlek</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {GRID_OPTIONS.map(g => (
            <button key={g.id} onClick={() => onConfigChange({ gridSize: g.id })}
              style={{ flex: 1, padding: '6px', borderRadius: 6, border: gridId === g.id ? '2px solid #58a6ff' : '1px solid #30363d', background: gridId === g.id ? '#0d2744' : '#0d1117', color: '#e6edf3', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
