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

export default function QuestionFillBlock({ config = {}, onConfigChange }) {
  const [showPreview, setShowPreview] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [checked, setChecked] = useState(false);

  const sentence = config.sentence || 'Sverige har ___ invånare';
  const correctAnswer = config.correctAnswer || '10 miljoner';
  const hint = config.hint || '';
  const subject = config.subject || 'Svenska';
  const difficulty = config.difficulty || 1;

  function update(patch) {
    onConfigChange({ ...config, ...patch });
  }

  function checkPreview() {
    setChecked(true);
  }

  const parts = sentence.split('___');
  const isCorrect = userInput.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        Fyll-i-luckan
      </div>

      <div>
        <div style={LABEL_STYLE}>MENING (skriv ___ dar luckan ska vara)</div>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={e => update({ sentence: e.currentTarget.innerText })}
          style={{ ...INPUT_STYLE, minHeight: 48, whiteSpace: 'pre-wrap' }}
        >
          {sentence}
        </div>
      </div>

      <div>
        <div style={LABEL_STYLE}>RATT SVAR</div>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={e => update({ correctAnswer: e.currentTarget.innerText })}
          style={INPUT_STYLE}
        >
          {correctAnswer}
        </div>
      </div>

      <div>
        <div style={LABEL_STYLE}>LEDTRAD (valfri)</div>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={e => update({ hint: e.currentTarget.innerText })}
          style={{ ...INPUT_STYLE, color: '#8b949e' }}
        >
          {hint || 'Ledtrad...'}
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
        onClick={() => { setShowPreview(p => !p); setUserInput(''); setChecked(false); }}
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
          <div style={{
            color: '#1a1a2e',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 4,
          }}>
            {parts[0]}
            <input
              type="text"
              value={userInput}
              onChange={e => { setUserInput(e.target.value); setChecked(false); }}
              placeholder="..."
              style={{
                border: '2px solid',
                borderColor: checked ? (isCorrect ? '#3bb273' : '#e94560') : '#aab',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: '1rem',
                width: 120,
                textAlign: 'center',
                background: '#fff',
                color: '#1a1a2e',
                outline: 'none',
              }}
            />
            {parts[1] || ''}
          </div>
          {hint && (
            <div style={{ color: '#666', fontSize: '0.8rem' }}>Ledtrad: {hint}</div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={checkPreview}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 8,
                border: 'none',
                background: '#1f6feb',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Kolla svar!
            </button>
          </div>
          {checked && (
            <div style={{
              textAlign: 'center',
              fontWeight: 700,
              color: isCorrect ? '#3bb273' : '#e94560',
              fontSize: '1rem',
            }}>
              {isCorrect ? 'Ratt!' : `Fel! Ratt svar: ${correctAnswer}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
