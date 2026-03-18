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

export default function QuestionMCBlock({ config = {}, onConfigChange }) {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questionText = config.questionText || 'Skriv din fraga har...';
  const answers = config.answers || ['Svar A', 'Svar B', 'Svar C', 'Svar D'];
  const correctIndex = config.correctIndex ?? 0;
  const subject = config.subject || 'Matte';
  const difficulty = config.difficulty || 1;

  function update(patch) {
    onConfigChange({ ...config, ...patch });
  }

  function updateAnswer(idx, val) {
    const next = [...answers];
    next[idx] = val;
    update({ answers: next });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        Flervalsfraga
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
        <div style={LABEL_STYLE}>SVAR (tryck for att markera ratt svar)</div>
        {answers.map((ans, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updateAnswer(idx, e.currentTarget.innerText)}
              style={{
                ...INPUT_STYLE,
                flex: 1,
                border: correctIndex === idx ? '1px solid #3bb273' : '1px solid #30363d',
                background: correctIndex === idx ? '#0d2a1a' : '#21262d',
              }}
            >
              {ans}
            </div>
            <button
              onClick={() => update({ correctIndex: idx })}
              style={{
                background: correctIndex === idx ? '#3bb273' : '#21262d',
                border: '1px solid #30363d',
                borderRadius: 6,
                color: correctIndex === idx ? '#fff' : '#8b949e',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {correctIndex === idx ? 'RATT' : 'Markera'}
            </button>
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
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                {'⭐'.repeat(d)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => { setShowPreview(p => !p); setSelectedAnswer(null); }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {answers.map((ans, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswer(idx)}
                style={{
                  background: selectedAnswer === null
                    ? '#fff'
                    : selectedAnswer === idx
                      ? (idx === correctIndex ? '#3bb273' : '#e94560')
                      : idx === correctIndex && selectedAnswer !== null
                        ? '#3bb273'
                        : '#fff',
                  border: '2px solid',
                  borderColor: selectedAnswer === idx ? 'transparent' : '#dde',
                  borderRadius: 8,
                  color: '#1a1a2e',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textAlign: 'left',
                  fontSize: '0.9rem',
                }}
              >
                {ans}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
