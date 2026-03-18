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
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

export default function QuestionTFBlock({ config = {}, onConfigChange }) {
  const [showPreview, setShowPreview] = useState(false);
  const [answered, setAnswered] = useState(null);

  const questionText = config.questionText || 'Skriv din fraga har...';
  const correctAnswer = config.correctAnswer ?? true; // true = Sant
  const explanation = config.explanation || '';
  const subject = config.subject || 'Matte';
  const difficulty = config.difficulty || 1;

  function update(patch) {
    onConfigChange({ ...config, ...patch });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        Sant/Falskt-fraga
      </div>

      <div>
        <div style={LABEL_STYLE}>FRAGA</div>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={e => update({ questionText: e.currentTarget.innerText })}
          style={{ ...INPUT_STYLE, minHeight: 48, whiteSpace: 'pre-wrap' }}
        >
          {questionText}
        </div>
      </div>

      <div>
        <div style={LABEL_STYLE}>RATT SVAR</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => update({ correctAnswer: true })}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 8,
              border: 'none',
              background: correctAnswer === true ? '#3bb273' : '#21262d',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Sant
          </button>
          <button
            onClick={() => update({ correctAnswer: false })}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 8,
              border: 'none',
              background: correctAnswer === false ? '#e94560' : '#21262d',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Falskt
          </button>
        </div>
      </div>

      <div>
        <div style={LABEL_STYLE}>FORKLARING (visas efter svar, valfri)</div>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={e => update({ explanation: e.currentTarget.innerText })}
          style={{ ...INPUT_STYLE, minHeight: 36, whiteSpace: 'pre-wrap', color: '#8b949e' }}
        >
          {explanation || 'Forklaring...'}
        </div>
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
        onClick={() => { setShowPreview(p => !p); setAnswered(null); }}
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
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ color: '#1a1a2e', fontWeight: 700, fontSize: '1rem', textAlign: 'center' }}>
            {questionText}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[true, false].map(val => {
              const isCorrect = val === correctAnswer;
              const wasChosen = answered === val;
              let bg = '#fff';
              if (wasChosen) bg = isCorrect ? '#3bb273' : '#e94560';
              else if (!wasChosen && answered !== null && isCorrect) bg = '#3bb273';
              return (
                <button
                  key={String(val)}
                  onClick={() => setAnswered(val)}
                  style={{
                    flex: 1,
                    padding: '18px',
                    borderRadius: 10,
                    border: '2px solid #dde',
                    background: bg,
                    color: '#1a1a2e',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                  }}
                >
                  {val ? 'Sant' : 'Falskt'}
                </button>
              );
            })}
          </div>
          {answered !== null && explanation && (
            <div style={{
              background: '#e8f4e8',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#1a4a1a',
              fontSize: '0.85rem',
            }}>
              {explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
