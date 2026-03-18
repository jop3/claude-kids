import React from 'react';

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

const BUTTON_COLORS = [
  { id: 'blue',   bg: '#1f6feb', label: 'Bla' },
  { id: 'green',  bg: '#238636', label: 'Gron' },
  { id: 'purple', bg: '#6e40c9', label: 'Lila' },
  { id: 'orange', bg: '#d6500a', label: 'Orange' },
];

const DEFAULT_CHOICES = [
  { label: 'Val A', targetScene: '', condition: '' },
  { label: 'Val B', targetScene: '', condition: '' },
];

function ChoicePreview({ choices, buttonColor }) {
  const color = BUTTON_COLORS.find(c => c.id === buttonColor) || BUTTON_COLORS[0];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 0' }}>
      {choices.slice(0, 4).map((ch, i) => (
        <div key={i} style={{
          background: color.bg,
          borderRadius: 999,
          padding: '12px 20px',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.9rem',
          textAlign: 'center',
          opacity: 0.85,
        }}>
          {ch.label || `Val ${String.fromCharCode(65 + i)}`}
        </div>
      ))}
    </div>
  );
}

export default function ChoiceButtonBlock({ config, onConfigChange }) {
  const cfg = {
    choices: DEFAULT_CHOICES,
    buttonColor: 'blue',
    ...config,
  };

  function updateChoice(index, field, value) {
    const next = cfg.choices.map((c, i) => i === index ? { ...c, [field]: value } : c);
    onConfigChange({ choices: next });
  }

  function addChoice() {
    if (cfg.choices.length >= 4) return;
    const letter = String.fromCharCode(65 + cfg.choices.length);
    onConfigChange({ choices: [...cfg.choices, { label: `Val ${letter}`, targetScene: '', condition: '' }] });
  }

  function removeChoice(index) {
    if (cfg.choices.length <= 2) return;
    onConfigChange({ choices: cfg.choices.filter((_, i) => i !== index) });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Valknapp</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Latsaren valjer vad som hander harnast</div>

      <div style={label}>VAL (max 4)</div>
      {cfg.choices.map((ch, i) => (
        <div key={i} style={{
          background: '#21262d', border: '1px solid #30363d', borderRadius: 8,
          padding: '10px 12px', marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, minWidth: 20 }}>{String.fromCharCode(65 + i)}</span>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updateChoice(i, 'label', e.currentTarget.innerText.trim() || ch.label)}
              style={{
                flex: 1, background: '#161b22', borderRadius: 6, padding: '6px 10px',
                color: '#e6edf3', fontSize: '0.85rem', outline: 'none',
              }}
            >
              {ch.label}
            </div>
            {cfg.choices.length > 2 && (
              <button onClick={() => removeChoice(i)}
                style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '1rem', padding: '2px 6px' }}>
                x
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#8b949e', fontSize: '0.7rem', minWidth: 50 }}>Scen:</span>
            <input
              value={ch.targetScene || ''}
              onChange={e => updateChoice(i, 'targetScene', e.target.value)}
              placeholder="scen-id"
              style={{
                flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: 6,
                padding: '4px 8px', color: '#e6edf3', fontSize: '0.8rem', outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#8b949e', fontSize: '0.7rem', minWidth: 50 }}>Om:</span>
            <input
              value={ch.condition || ''}
              onChange={e => updateChoice(i, 'condition', e.target.value)}
              placeholder="variabel = varde (valfritt)"
              style={{
                flex: 1, background: '#161b22', border: '1px solid #30363d', borderRadius: 6,
                padding: '4px 8px', color: '#e6edf3', fontSize: '0.8rem', outline: 'none',
              }}
            />
          </div>
        </div>
      ))}

      {cfg.choices.length < 4 && (
        <button onClick={addChoice}
          style={{
            padding: '10px', borderRadius: 10, border: '2px dashed #30363d',
            background: 'transparent', color: '#58a6ff', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.85rem', marginBottom: 8,
          }}>
          + Lagg till val
        </button>
      )}

      <div style={label}>KNAPPARNAS FARG</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {BUTTON_COLORS.map(c => (
          <button key={c.id} onClick={() => onConfigChange({ buttonColor: c.id })}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.buttonColor === c.id ? c.bg : '#21262d',
              color: '#fff',
              outline: cfg.buttonColor === c.id ? `2px solid ${c.bg}` : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.8rem',
            }}>
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...label, marginTop: 0 }}>FORHANDSVISNING</div>
        <ChoicePreview choices={cfg.choices} buttonColor={cfg.buttonColor} />
      </div>
    </div>
  );
}
