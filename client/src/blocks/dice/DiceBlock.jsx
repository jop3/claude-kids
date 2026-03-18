import React, { useState, useRef, useEffect } from 'react';

const DICE_TYPES = [
  { id: 'd4',  sides: 4  },
  { id: 'd6',  sides: 6  },
  { id: 'd8',  sides: 8  },
  { id: 'd10', sides: 10 },
  { id: 'd12', sides: 12 },
  { id: 'd20', sides: 20 },
  { id: 'custom', sides: null },
];

const COLORS = ['#e94560', '#2e86de', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c'];

function D6Face({ value, color, size = 54 }) {
  const dots = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
  };
  const positions = dots[Math.min(6, Math.max(1, value))] || dots[1];
  const r = size * 0.08;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="4" y="4" width="92" height="92" rx="16" fill={color} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      {positions.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={r * 100 / size} fill="white" opacity="0.95" />
      ))}
    </svg>
  );
}

export default function DiceBlock({ config = {}, onConfigChange }) {
  const diceTypeId  = config.diceType   || 'd6';
  const customSides = config.customSides || 10;
  const numDice     = config.numDice    || 1;
  const diceColor   = config.diceColor  || COLORS[1];

  const diceObj   = DICE_TYPES.find(d => d.id === diceTypeId) || DICE_TYPES[1];
  const maxSides  = diceTypeId === 'custom' ? customSides : diceObj.sides;

  const [results, setResults]   = useState(null);
  const [rolling, setRolling]   = useState(false);
  const [history, setHistory]   = useState([]);
  const rollIntervalRef = useRef(null);

  function rollDice() {
    if (rolling) return;
    setRolling(true);
    let ticks = 0;
    rollIntervalRef.current = setInterval(() => {
      ticks++;
      setResults(Array.from({ length: numDice }, () => 1 + Math.floor(Math.random() * maxSides)));
      if (ticks >= 8) {
        clearInterval(rollIntervalRef.current);
        const final = Array.from({ length: numDice }, () => 1 + Math.floor(Math.random() * maxSides));
        setResults(final);
        setRolling(false);
        const total = final.reduce((a, b) => a + b, 0);
        setHistory(prev => [total, ...prev].slice(0, 5));
      }
    }, 75);
  }

  useEffect(() => () => clearInterval(rollIntervalRef.current), []);

  const displayResults = results || Array(numDice).fill(null);
  const total = results ? results.reduce((a, b) => a + b, 0) : null;

  const label = { color: '#8b949e', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4, marginTop: 10 };

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>Taring</div>

      {/* Dice display */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', minHeight: 62, alignItems: 'center', marginBottom: 8 }}>
        {displayResults.map((val, i) => (
          diceTypeId === 'd6' ? (
            <div key={i} style={{ transform: rolling ? `rotate(${Math.random() * 30 - 15}deg)` : 'none', transition: 'transform 0.07s' }}>
              <D6Face value={val || 1} color={diceColor} size={54} />
            </div>
          ) : (
            <div key={i} style={{
              width: 54, height: 54, borderRadius: 12,
              background: diceColor,
              border: '2px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: val !== null ? (val > 99 ? '1rem' : '1.4rem') : '1.2rem',
              fontWeight: 900, color: '#fff',
              transform: rolling ? `rotate(${Math.random() * 30 - 15}deg)` : 'none',
              transition: 'transform 0.07s',
            }}>
              {val !== null ? val : '?'}
            </div>
          )
        ))}
      </div>

      {/* Total */}
      {numDice > 1 && total !== null && (
        <div style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#ffe066', marginBottom: 4 }}>
          Totalt: {total}
        </div>
      )}

      {/* Roll button */}
      <button onClick={rollDice} disabled={rolling}
        style={{ width: '100%', padding: '12px', fontSize: '1.1rem', fontWeight: 900, borderRadius: 10, border: 'none', background: rolling ? '#3a3a5a' : '#6c3bbd', color: '#fff', cursor: rolling ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
        {rolling ? '...' : '\ud83c\udfb2 Kasta!'}
      </button>

      {/* History */}
      {history.length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
          {history.map((h, i) => (
            <span key={i} style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 12, padding: '2px 8px', fontSize: '0.8rem', color: '#8b949e' }}>{h}</span>
          ))}
        </div>
      )}

      <div style={{ background: '#21262d', borderRadius: 8, padding: '10px 12px' }}>
        <div style={label}>Taningstyp</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {DICE_TYPES.map(d => (
            <button key={d.id} onClick={() => onConfigChange({ diceType: d.id })}
              style={{ padding: '4px 8px', borderRadius: 6, border: diceTypeId === d.id ? '2px solid #58a6ff' : '1px solid #30363d', background: diceTypeId === d.id ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}>
              {d.id === 'custom' ? 'Eget' : d.id.toUpperCase()}
            </button>
          ))}
        </div>

        {diceTypeId === 'custom' && (
          <>
            <div style={label}>Antal sidor: {customSides}</div>
            <input type="range" min={2} max={100} value={customSides}
              onChange={e => onConfigChange({ customSides: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#58a6ff' }} />
          </>
        )}

        <div style={label}>Antal tarningar</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4].map(n => (
            <button key={n} onClick={() => onConfigChange({ numDice: n })}
              style={{ flex: 1, padding: '6px', borderRadius: 6, border: numDice === n ? '2px solid #58a6ff' : '1px solid #30363d', background: numDice === n ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontWeight: 700 }}>
              {n}
            </button>
          ))}
        </div>

        <div style={label}>Farg</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => onConfigChange({ diceColor: c })}
              style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: diceColor === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
