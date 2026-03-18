import React, { useState, useEffect, useRef } from 'react';

const FLIP_SPEEDS = [
  { id: 'slow', label: 'Langsom', ms: 600 },
  { id: 'normal', label: 'Normal', ms: 300 },
  { id: 'fast', label: 'Snabb', ms: 150 },
];
const AUTO_FLIP_OPTIONS = [
  { id: 'never', label: 'Aldrig', ms: 0 },
  { id: '1s', label: '1s', ms: 1000 },
  { id: '3s', label: '3s', ms: 3000 },
  { id: '5s', label: '5s', ms: 5000 },
];

export default function CardFlipBlock({ config = {}, onConfigChange }) {
  const speedId = config.flipSpeed || 'normal';
  const autoFlipId = config.autoFlip || 'never';
  const frontColor = config.frontColor || '#e74c3c';
  const backColor = config.backColor || '#2c3e50';
  const frontEmoji = config.frontEmoji || '🃏';
  const backEmoji = config.backEmoji || '⭐';

  const speed = FLIP_SPEEDS.find(s => s.id === speedId) || FLIP_SPEEDS[1];
  const autoFlip = AUTO_FLIP_OPTIONS.find(a => a.id === autoFlipId) || AUTO_FLIP_OPTIONS[0];

  const [showFront, setShowFront] = useState(true);
  const [flipping, setFlipping] = useState(false);
  const [scaleX, setScaleX] = useState(1);
  const autoTimerRef = useRef(null);

  function doFlip() {
    if (flipping) return;
    setFlipping(true);
    const half = speed.ms / 2;
    let frame1 = requestAnimationFrame(() => {
      setScaleX(0);
    });
    setTimeout(() => {
      setShowFront(f => !f);
      setScaleX(1);
      setFlipping(false);

      // Schedule auto-flip-back
      if (autoFlip.ms > 0) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = setTimeout(() => {
          doFlip();
        }, autoFlip.ms);
      }
    }, half);
  }

  useEffect(() => {
    return () => clearTimeout(autoTimerRef.current);
  }, []);

  const label = { color: '#8b949e', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4, marginTop: 8 };

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>Kortvandning</div>

      {/* Card preview */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div
          onClick={doFlip}
          style={{
            width: 100, height: 140,
            borderRadius: 10,
            background: showFront ? frontColor : backColor,
            border: '3px solid rgba(255,255,255,0.2)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `transform ${speed.ms / 2}ms ease`,
            transform: `scaleX(${scaleX})`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            userSelect: 'none',
          }}
        >
          <span style={{ fontSize: 48 }}>{showFront ? frontEmoji : backEmoji}</span>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
            {showFront ? 'Framsida' : 'Baksida'}
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#8b949e', fontSize: '0.8rem', marginBottom: 12 }}>
        Tryck pa kortet for att vanda!
      </div>

      <div style={{ background: '#21262d', borderRadius: 8, padding: '10px 12px' }}>
        <div style={label}>Framsida emoji</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {['🃏','⭐','🔥','💎','🌟','🎯','♠️','♥️','♦️','♣️'].map(em => (
            <button key={em} onClick={() => onConfigChange({ frontEmoji: em })}
              style={{ fontSize: '1.2rem', background: frontEmoji === em ? '#0d2744' : 'none', border: frontEmoji === em ? '2px solid #58a6ff' : '1px solid #30363d', borderRadius: 6, cursor: 'pointer', padding: 4 }}>
              {em}
            </button>
          ))}
        </div>

        <div style={label}>Baksida emoji</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
          {['⭐','🎭','🌀','✨','🔮','🎪','🌈','🌸','❄️','🎵'].map(em => (
            <button key={em} onClick={() => onConfigChange({ backEmoji: em })}
              style={{ fontSize: '1.2rem', background: backEmoji === em ? '#0d2744' : 'none', border: backEmoji === em ? '2px solid #58a6ff' : '1px solid #30363d', borderRadius: 6, cursor: 'pointer', padding: 4 }}>
              {em}
            </button>
          ))}
        </div>

        <div style={label}>Vandhastighet</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {FLIP_SPEEDS.map(s => (
            <button key={s.id} onClick={() => onConfigChange({ flipSpeed: s.id })}
              style={{ flex: 1, padding: '6px', borderRadius: 6, border: speedId === s.id ? '2px solid #58a6ff' : '1px solid #30363d', background: speedId === s.id ? '#0d2744' : '#0d1117', color: '#e6edf3', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={label}>Auto-vand tillbaka</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {AUTO_FLIP_OPTIONS.map(a => (
            <button key={a.id} onClick={() => onConfigChange({ autoFlip: a.id })}
              style={{ flex: 1, padding: '6px', borderRadius: 6, border: autoFlipId === a.id ? '2px solid #58a6ff' : '1px solid #30363d', background: autoFlipId === a.id ? '#0d2744' : '#0d1117', color: '#e6edf3', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem' }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
