import React, { useState } from 'react';

const SUBJECTS = ['Matte', 'Svenska', 'Engelska', 'NO', 'SO', 'Ovrigt'];

const LABEL_STYLE = {
  color: '#8b949e',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: 1,
  marginBottom: 4,
};

const INPUT_STYLE = {
  background: '#21262d',
  border: '1px solid #30363d',
  borderRadius: 6,
  color: '#e6edf3',
  padding: '6px 10px',
  fontSize: '0.85rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const DEFAULT_PAIRS = [
  { left: 'Hund', right: 'Skaller' },
  { left: 'Katt', right: 'Jamar' },
  { left: 'Ko', right: 'Rar' },
  { left: 'Gris', right: 'Grymt' },
];

export default function QuestionDragBlock({ config = {}, onConfigChange }) {
  const [showPreview, setShowPreview] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [drops, setDrops] = useState({});

  const pairs = config.pairs || DEFAULT_PAIRS;
  const subject = config.subject || 'Svenska';
  const difficulty = config.difficulty || 1;

  function update(patch) {
    onConfigChange({ ...config, ...patch });
  }

  function updatePair(idx, field, val) {
    const next = pairs.map((p, i) => i === idx ? { ...p, [field]: val } : p);
    update({ pairs: next });
  }

  const shuffledRights = [...pairs.map((p, i) => ({ text: p.right, idx: i }))].sort(() => Math.random() - 0.5);

  function handleDrop(targetIdx) {
    if (dragging === null) return;
    setDrops(prev => ({ ...prev, [targetIdx]: dragging }));
    setDragging(null);
  }

  function resetPreview() {
    setDrops({});
    setDragging(null);
  }

  const allPlaced = Object.keys(drops).length === pairs.length;
  const score = allPlaced ? Object.entries(drops).filter(([ti, chip]) => chip.idx === Number(ti)).length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        Dra-och-slapp-fraga
      </div>

      <div>
        <div style={LABEL_STYLE}>PAR (vanster = fraga, hoger = svar)</div>
        {pairs.map((pair, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updatePair(idx, 'left', e.currentTarget.innerText)}
              style={{ ...INPUT_STYLE, flex: 1 }}
            >
              {pair.left}
            </div>
            <span style={{ color: '#8b949e' }}>→</span>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updatePair(idx, 'right', e.currentTarget.innerText)}
              style={{ ...INPUT_STYLE, flex: 1 }}
            >
              {pair.right}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={LABEL_STYLE}>AMNE</div>
          <select
            value={subject}
            onChange={e => update({ subject: e.target.value })}
            style={{ ...INPUT_STYLE, cursor: 'pointer' }}
          >
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <div style={LABEL_STYLE}>SVARIGHETSGRAD</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3].map(d => (
              <button
                key={d}
                onClick={() => update({ difficulty: d })}
                style={{
                  background: difficulty === d ? '#1f6feb' : '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: 6,
                  color: '#e6edf3',
                  padding: '6px 8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                {'⭐'.repeat(d)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => { setShowPreview(p => !p); resetPreview(); }}
        style={{
          background: showPreview ? '#21262d' : '#1f6feb',
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          padding: '10px',
          cursor: 'pointer',
          fontWeight: 700,
        }}
      >
        {showPreview ? 'Stang forhandsgranskning' : 'Forhandsgranska'}
      </button>

      {showPreview && (
        <div style={{
          background: '#f0f4ff',
          borderRadius: 12,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ color: '#1a1a2e', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>
            Dra svaren till ratt plats!
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {shuffledRights.map(chip => {
              const placed = Object.values(drops).some(d => d.idx === chip.idx);
              return (
                <div
                  key={chip.idx}
                  draggable={!placed}
                  onDragStart={() => setDragging(chip)}
                  style={{
                    background: placed ? '#ccc' : dragging?.idx === chip.idx ? '#1f6feb' : '#fff',
                    border: '2px solid #aab',
                    borderRadius: 20,
                    padding: '6px 12px',
                    cursor: placed ? 'default' : 'grab',
                    fontWeight: 600,
                    color: '#1a1a2e',
                    opacity: placed ? 0.4 : 1,
                    userSelect: 'none',
                  }}
                >
                  {chip.text}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pairs.map((pair, idx) => {
              const placed = drops[idx];
              const correct = placed && placed.idx === idx;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    flex: 1,
                    background: '#fff',
                    border: '1px solid #dde',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontWeight: 600,
                    color: '#1a1a2e',
                    fontSize: '0.9rem',
                  }}>
                    {pair.left}
                  </div>
                  <span style={{ color: '#888' }}>→</span>
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => handleDrop(idx)}
                    style={{
                      flex: 1,
                      minHeight: 36,
                      background: placed ? (correct ? '#c8f7d8' : '#fde') : '#eef',
                      border: `2px dashed ${placed ? (correct ? '#3bb273' : '#e94560') : '#aab'}`,
                      borderRadius: 8,
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#1a1a2e',
                    }}
                  >
                    {placed ? placed.text : '(slapp har)'}
                  </div>
                </div>
              );
            })}
          </div>
          {allPlaced && (
            <div style={{ textAlign: 'center', fontWeight: 700, color: score === pairs.length ? '#3bb273' : '#e94560', fontSize: '1rem' }}>
              {score}/{pairs.length} ratt!
              <button onClick={resetPreview} style={{ marginLeft: 8, background: '#1f6feb', border: 'none', borderRadius: 6, color: '#fff', padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}>
                Forsok igen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
