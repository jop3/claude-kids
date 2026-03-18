import React from 'react';

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

const VAR_TYPES = [
  { id: 'number',  label: 'Siffra',  emoji: '🔢' },
  { id: 'text',    label: 'Text',    emoji: '🔤' },
  { id: 'boolean', label: 'Ja/Nej',  emoji: '✅' },
];

const OPERATIONS = [
  { id: 'set',    label: 'Satt till' },
  { id: 'add',    label: 'Lagg till' },
  { id: 'toggle', label: 'Vaxla' },
];

const TRIGGERS = [
  { id: 'enter',     label: 'Nar scen borjar' },
  { id: 'choice',    label: 'Nar val gors' },
  { id: 'condition', label: 'Nar villkor uppfylls' },
];

export default function VariableBlock({ config, onConfigChange }) {
  const cfg = {
    name: 'minVariabel',
    varType: 'number',
    defaultValue: '0',
    operation: 'set',
    trigger: 'enter',
    ...config,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Variabel</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Kom ihag saker - poang, val, namn</div>

      <div style={label}>VARIABELNAMN</div>
      <input
        value={cfg.name}
        onChange={e => onConfigChange({ name: e.target.value })}
        style={{
          background: '#21262d', border: '1px solid #30363d', borderRadius: 8,
          padding: '10px 12px', color: '#e6edf3', fontSize: '0.9rem', outline: 'none',
        }}
      />

      <div style={label}>TYP</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {VAR_TYPES.map(t => (
          <button key={t.id} onClick={() => onConfigChange({ varType: t.id })}
            style={{
              flex: 1, padding: '10px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.varType === t.id ? '#0d2744' : '#21262d',
              color: cfg.varType === t.id ? '#58a6ff' : '#8b949e',
              outline: cfg.varType === t.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.75rem', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2,
            }}>
            <span style={{ fontSize: '1.1rem' }}>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div style={label}>STANDARDVARDE</div>
      {cfg.varType === 'boolean' ? (
        <div style={{ display: 'flex', gap: 8 }}>
          {['true', 'false'].map(v => (
            <button key={v} onClick={() => onConfigChange({ defaultValue: v })}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: cfg.defaultValue === v ? '#0d2744' : '#21262d',
                color: cfg.defaultValue === v ? '#58a6ff' : '#8b949e',
                outline: cfg.defaultValue === v ? '2px solid #58a6ff' : '2px solid #30363d',
                fontWeight: 700, fontSize: '0.85rem',
              }}>
              {v === 'true' ? 'Ja' : 'Nej'}
            </button>
          ))}
        </div>
      ) : (
        <input
          value={cfg.defaultValue}
          type={cfg.varType === 'number' ? 'number' : 'text'}
          onChange={e => onConfigChange({ defaultValue: e.target.value })}
          style={{
            background: '#21262d', border: '1px solid #30363d', borderRadius: 8,
            padding: '10px 12px', color: '#e6edf3', fontSize: '0.9rem', outline: 'none',
          }}
        />
      )}

      <div style={label}>OPERATION</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {OPERATIONS.map(op => (
          <button key={op.id} onClick={() => onConfigChange({ operation: op.id })}
            style={{
              padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.operation === op.id ? '#0d2744' : '#21262d',
              color: cfg.operation === op.id ? '#58a6ff' : '#8b949e',
              outline: cfg.operation === op.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.85rem', textAlign: 'left',
            }}>
            {op.label}
          </button>
        ))}
      </div>

      <div style={label}>NAR SKA DET HANDA?</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {TRIGGERS.map(tr => (
          <button key={tr.id} onClick={() => onConfigChange({ trigger: tr.id })}
            style={{
              padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.trigger === tr.id ? '#0d2744' : '#21262d',
              color: cfg.trigger === tr.id ? '#58a6ff' : '#8b949e',
              outline: cfg.trigger === tr.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.85rem', textAlign: 'left',
            }}>
            {tr.label}
          </button>
        ))}
      </div>

      <div style={{
        marginTop: 16, background: '#21262d', border: '1px solid #30363d', borderRadius: 8,
        padding: '12px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ color: '#8b949e', fontSize: '0.8rem', fontWeight: 700 }}>AKTUELLT VARDE:</span>
        <span style={{ color: '#58a6ff', fontSize: '1rem', fontWeight: 700 }}>
          {cfg.defaultValue || (cfg.varType === 'number' ? '0' : cfg.varType === 'boolean' ? 'false' : '')}
        </span>
      </div>
    </div>
  );
}
