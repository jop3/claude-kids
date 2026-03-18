import React, { useState, useEffect, useRef } from 'react';

const PLAYER_COLORS = ['#e94560', '#2e86de', '#27ae60', '#f39c12'];

const ORDER_MODES = [
  { id: 'sequential', label: 'I ordning' },
  { id: 'random',     label: 'Slumpmassig' },
  { id: 'reverse',    label: 'Baklanges' },
];

const TIMER_OPTIONS = [
  { id: 'off', label: 'Av' },
  { id: '30',  label: '30s' },
  { id: '60',  label: '60s' },
];

export default function TurnManagerBlock({ config = {}, onConfigChange }) {
  const playerCount  = config.playerCount  || 2;
  const players      = config.players      || Array.from({ length: playerCount }, (_, i) => ({ name: `Spelare ${i + 1}`, color: PLAYER_COLORS[i] }));
  const orderMode    = config.orderMode    || 'sequential';
  const timerOption  = config.timerOption  || 'off';

  const [currentTurn, setCurrentTurn] = useState(0);
  const [round, setRound]             = useState(1);
  const [timeLeft, setTimeLeft]       = useState(null);
  const [turnOrder, setTurnOrder]     = useState(() => Array.from({ length: playerCount }, (_, i) => i));

  const timerRef = useRef(null);

  // Rebuild turn order when playerCount or orderMode changes
  useEffect(() => {
    const base = Array.from({ length: playerCount }, (_, i) => i);
    let order;
    if (orderMode === 'random') {
      order = [...base].sort(() => Math.random() - 0.5);
    } else if (orderMode === 'reverse') {
      order = [...base].reverse();
    } else {
      order = base;
    }
    setTurnOrder(order);
    setCurrentTurn(0);
    setRound(1);
  }, [playerCount, orderMode]);

  // Timer
  useEffect(() => {
    if (timerOption === 'off') {
      setTimeLeft(null);
      clearInterval(timerRef.current);
      return;
    }
    const secs = Number(timerOption);
    setTimeLeft(secs);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn, timerOption]);

  function nextTurn() {
    clearInterval(timerRef.current);
    setCurrentTurn(prev => {
      const next = (prev + 1) % turnOrder.length;
      if (next === 0) setRound(r => r + 1);
      return next;
    });
  }

  function handlePlayerNameChange(i, name) {
    const next = players.map((p, idx) => idx === i ? { ...p, name } : p);
    onConfigChange({ players: next });
  }

  function handlePlayerCountChange(n) {
    const next = Array.from({ length: n }, (_, i) => players[i] || { name: `Spelare ${i + 1}`, color: PLAYER_COLORS[i] });
    onConfigChange({ playerCount: n, players: next });
  }

  const activePlayerIdx = turnOrder[currentTurn] ?? 0;
  const activePlayer    = players[activePlayerIdx] || { name: 'Spelare 1', color: PLAYER_COLORS[0] };

  const label = { color: '#8b949e', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4, marginTop: 10 };

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>Turordning</div>

      {/* Round counter */}
      <div style={{ textAlign: 'center', color: '#8b949e', fontSize: '0.85rem', marginBottom: 6 }}>Runda {round}</div>

      {/* Active turn spotlight */}
      <div style={{
        background: `${activePlayer.color}22`,
        border: `2px solid ${activePlayer.color}`,
        borderRadius: 12,
        padding: '14px 16px',
        textAlign: 'center',
        marginBottom: 10,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Arrow */}
        <div style={{ fontSize: '1.6rem', marginBottom: 4, animation: 'pulse 1s ease-in-out infinite', color: activePlayer.color }}>
          &#9654;
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: activePlayer.color }}>{activePlayer.name}</div>
        <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: 2 }}>Din tur!</div>
        {timeLeft !== null && (
          <div style={{ marginTop: 6, fontSize: '1.4rem', fontWeight: 900, color: timeLeft <= 5 ? '#e94560' : '#ffe066' }}>
            {timeLeft}s
          </div>
        )}
      </div>

      {/* Player name tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {players.slice(0, playerCount).map((p, i) => (
          <div key={i} style={{
            flex: '1 1 45%',
            background: turnOrder[currentTurn] === i ? `${p.color}33` : '#21262d',
            border: `2px solid ${turnOrder[currentTurn] === i ? p.color : '#30363d'}`,
            borderRadius: 8,
            padding: '6px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: turnOrder[currentTurn] === i ? 800 : 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
          </div>
        ))}
      </div>

      <button onClick={nextTurn}
        style={{ width: '100%', padding: '13px', fontSize: '1rem', fontWeight: 900, borderRadius: 10, border: 'none', background: '#238636', color: '#fff', cursor: 'pointer', marginBottom: 8 }}>
        Nasta tur &#8594;
      </button>

      <div style={{ background: '#21262d', borderRadius: 8, padding: '10px 12px' }}>
        <div style={label}>Antal spelare</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[2, 3, 4].map(n => (
            <button key={n} onClick={() => handlePlayerCountChange(n)}
              style={{ flex: 1, padding: '6px', borderRadius: 6, border: playerCount === n ? '2px solid #58a6ff' : '1px solid #30363d', background: playerCount === n ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontWeight: 700 }}>
              {n}
            </button>
          ))}
        </div>

        <div style={label}>Spelarnamn</div>
        {players.slice(0, playerCount).map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <input
              value={p.name}
              onChange={e => handlePlayerNameChange(i, e.target.value)}
              maxLength={20}
              style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', color: '#e6edf3', borderRadius: 5, padding: '4px 8px', fontSize: '0.85rem' }}
            />
          </div>
        ))}

        <div style={label}>Turordning</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {ORDER_MODES.map(m => (
            <button key={m.id} onClick={() => onConfigChange({ orderMode: m.id })}
              style={{ flex: 1, padding: '5px 3px', borderRadius: 6, border: orderMode === m.id ? '2px solid #58a6ff' : '1px solid #30363d', background: orderMode === m.id ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
              {m.label}
            </button>
          ))}
        </div>

        <div style={label}>Tid per tur</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {TIMER_OPTIONS.map(t => (
            <button key={t.id} onClick={() => onConfigChange({ timerOption: t.id })}
              style={{ flex: 1, padding: '6px', borderRadius: 6, border: timerOption === t.id ? '2px solid #58a6ff' : '1px solid #30363d', background: timerOption === t.id ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
