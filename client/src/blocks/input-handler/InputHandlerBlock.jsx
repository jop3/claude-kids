import React from 'react';

const DPAD_STYLES = [
  { id: 'classic',  label: 'Classic', icon: '🎮' },
  { id: 'wasd',     label: 'WASD',    icon: '⌨️' },
  { id: 'touch',    label: 'Touch',   icon: '👆' },
  { id: 'gamepad',  label: 'Gamepad', icon: '🕹️', disabled: true },
];
const BTN_SIZES = ['Liten', 'Mellan', 'Stor'];
const ACTION_LABELS = ['A', 'B', 'Z', 'X'];

export default function InputHandlerBlock({ config, onConfigChange }) {
  const cfg = {
    dpadStyle: 'classic',
    buttonSize: 'Mellan',
    dpadPosition: 'bottom-left',
    actionLabel: 'A',
    ...config,
  };

  const sectionLabel = {
    color: '#8b949e', fontSize: '0.8rem', fontWeight: 700,
    letterSpacing: 1, marginBottom: 8, marginTop: 16,
  };

  const chip = (selected, disabled = false) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 999, cursor: disabled ? 'not-allowed' : 'pointer',
    border: selected ? '2px solid #58a6ff' : '2px solid #30363d',
    background: selected ? '#0d2744' : '#21262d',
    color: disabled ? '#555' : selected ? '#58a6ff' : '#c9d1d9',
    fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap',
    opacity: disabled ? 0.5 : 1,
  });

  const posBtn = (val) => ({
    flex: 1, padding: '10px', borderRadius: 8, fontSize: '0.85rem',
    fontWeight: 700, cursor: 'pointer',
    border: cfg.dpadPosition === val ? '2px solid #58a6ff' : '2px solid #30363d',
    background: cfg.dpadPosition === val ? '#0d2744' : '#21262d',
    color: cfg.dpadPosition === val ? '#58a6ff' : '#c9d1d9',
  });

  function cycleActionLabel() {
    const idx = ACTION_LABELS.indexOf(cfg.actionLabel);
    const next = ACTION_LABELS[(idx + 1) % ACTION_LABELS.length];
    onConfigChange({ actionLabel: next });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
        Kontroller
      </div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>
        Tangentbord och touch-styrning
      </div>

      {/* D-pad style */}
      <div style={sectionLabel}>STYRTYP</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {DPAD_STYLES.map(s => (
          <button
            key={s.id}
            disabled={s.disabled}
            onClick={() => !s.disabled && onConfigChange({ dpadStyle: s.id })}
            style={chip(cfg.dpadStyle === s.id, s.disabled)}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
            {s.disabled && <span style={{ fontSize: '0.7rem' }}>(snart)</span>}
          </button>
        ))}
      </div>

      {/* Button size */}
      <div style={sectionLabel}>KNAPPSTORLEK</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {BTN_SIZES.map(s => (
          <button
            key={s}
            onClick={() => onConfigChange({ buttonSize: s })}
            style={{
              flex: 1, padding: '10px', borderRadius: 8, fontSize: '0.85rem',
              fontWeight: 700, cursor: 'pointer',
              border: cfg.buttonSize === s ? '2px solid #58a6ff' : '2px solid #30363d',
              background: cfg.buttonSize === s ? '#0d2744' : '#21262d',
              color: cfg.buttonSize === s ? '#58a6ff' : '#c9d1d9',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* D-pad position */}
      <div style={sectionLabel}>POSITION</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={posBtn('bottom-left')}  onClick={() => onConfigChange({ dpadPosition: 'bottom-left' })}>
          Nere vänster
        </button>
        <button style={posBtn('bottom-right')} onClick={() => onConfigChange({ dpadPosition: 'bottom-right' })}>
          Nere höger
        </button>
      </div>

      {/* Action button label */}
      <div style={sectionLabel}>AKTIONSKNAPP</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          onClick={cycleActionLabel}
          style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(88,166,255,0.2)', border: '2px solid rgba(88,166,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', fontWeight: 700, color: '#58a6ff',
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          {cfg.actionLabel}
        </div>
        <span style={{ color: '#8b949e', fontSize: '0.82rem' }}>
          Tryck for att byta symbol
        </span>
      </div>

      {/* Preview */}
      <div style={{
        marginTop: 20, padding: 16, borderRadius: 10, background: '#0d1117',
        border: '1px solid #30363d',
      }}>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: 10, fontWeight: 700, letterSpacing: 1 }}>
          FORHANDSGRANSKNING
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          {/* Mini d-pad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,28px)', gridTemplateRows: 'repeat(3,28px)', gap: 2 }}>
            {[
              [1,2,'▲'], [2,1,'◀'], [2,3,'▶'], [3,2,'▼']
            ].map(([r,c,lbl]) => {
              const cells = [];
              for (let row = 1; row <= 3; row++) {
                for (let col = 1; col <= 3; col++) {
                  const match = r === row && c === col;
                  cells.push({ row, col, lbl: match ? lbl : '', key: `${row}-${col}` });
                }
              }
              return null;
            })}
            {(() => {
              const cells = [];
              const defs = { '1-2': '▲', '2-1': '◀', '2-3': '▶', '3-2': '▼' };
              for (let r = 1; r <= 3; r++) {
                for (let c = 1; c <= 3; c++) {
                  const key = `${r}-${c}`;
                  const lbl = defs[key];
                  cells.push(
                    <div key={key} style={{
                      width: 28, height: 28, borderRadius: 5,
                      background: lbl ? 'rgba(255,255,255,0.12)' : 'transparent',
                      border: lbl ? '1px solid rgba(255,255,255,0.2)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: 'rgba(255,255,255,0.7)',
                    }}>
                      {lbl || ''}
                    </div>
                  );
                }
              }
              return cells;
            })()}
          </div>
          {/* Action button */}
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(88,166,255,0.2)', border: '2px solid rgba(88,166,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700, color: 'rgba(88,166,255,0.9)',
          }}>
            {cfg.actionLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
