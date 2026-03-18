import React, { useState } from 'react';
import { generateSet, checkAnswer } from '../../lib/mathGenerator.js';

const LABEL_STYLE = {
  color: '#8b949e',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: 1,
  marginBottom: 4,
};

const BTN_BASE = {
  border: '1px solid #30363d',
  borderRadius: 8,
  color: '#e6edf3',
  padding: '8px 14px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.9rem',
};

const OPERATIONS = [
  { key: 'add', label: 'Addition', emoji: '+' },
  { key: 'sub', label: 'Subtraktion', emoji: '-' },
  { key: 'mul', label: 'Multiplikation', emoji: 'x' },
  { key: 'div', label: 'Division', emoji: '/' },
  { key: 'fraction', label: 'Brak', emoji: '1/2' },
];

const DIFFICULTIES = [
  { level: 1, label: 'Latt (1-10)' },
  { level: 2, label: 'Medel (10-100)' },
  { level: 3, label: 'Svar (stora tal)' },
];

const COUNTS = [5, 10, 20];

export default function MathGeneratorBlock({ config = {}, onConfigChange }) {
  const [problems, setProblems] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const operation = config.operation || 'add';
  const difficulty = config.difficulty || 1;
  const count = config.count || 10;

  function update(patch) {
    onConfigChange({ ...config, ...patch });
    setProblems([]);
    setCurrentIdx(0);
    setUserAnswer('');
    setFeedback(null);
    setScore(0);
    setDone(false);
  }

  function generate() {
    const set = generateSet(count, { operation, difficulty });
    setProblems(set);
    setCurrentIdx(0);
    setUserAnswer('');
    setFeedback(null);
    setScore(0);
    setDone(false);
  }

  function handleSubmit() {
    if (!userAnswer.trim()) return;
    const problem = problems[currentIdx];
    const correct = checkAnswer(problem, userAnswer);
    setFeedback(correct ? 'ratt' : 'fel');
    if (correct) setScore(s => s + 1);

    setTimeout(() => {
      setFeedback(null);
      setUserAnswer('');
      if (currentIdx + 1 >= problems.length) {
        setDone(true);
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 800);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  const problem = problems[currentIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        Mattegenerator
      </div>

      <div>
        <div style={LABEL_STYLE}>RAKNESATT</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {OPERATIONS.map(op => (
            <button
              key={op.key}
              onClick={() => update({ operation: op.key })}
              style={{
                ...BTN_BASE,
                background: operation === op.key ? '#1f6feb' : '#21262d',
              }}
            >
              {op.emoji} {op.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={LABEL_STYLE}>SVARIGHETSGRAD</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {DIFFICULTIES.map(d => (
            <button
              key={d.level}
              onClick={() => update({ difficulty: d.level })}
              style={{
                ...BTN_BASE,
                background: difficulty === d.level ? '#1f6feb' : '#21262d',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={LABEL_STYLE}>ANTAL UPPGIFTER</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {COUNTS.map(c => (
            <button
              key={c}
              onClick={() => update({ count: c })}
              style={{
                ...BTN_BASE,
                background: count === c ? '#1f6feb' : '#21262d',
                flex: 1,
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        style={{
          background: '#238636',
          border: 'none',
          borderRadius: 10,
          color: '#fff',
          padding: '12px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '1rem',
        }}
      >
        Generera fragor!
      </button>

      {problems.length > 0 && !done && problem && (
        <div style={{
          background: '#f0f4ff',
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'center',
        }}>
          <div style={{ color: '#8b949e', fontSize: '0.8rem' }}>
            {currentIdx + 1} av {problems.length}
          </div>
          <div style={{
            fontSize: '1.8rem',
            fontWeight: 700,
            color: '#1a1a2e',
            fontFamily: 'monospace',
          }}>
            {problem.question}
          </div>
          <input
            type="text"
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Svar..."
            autoFocus
            style={{
              border: `2px solid ${feedback === 'ratt' ? '#3bb273' : feedback === 'fel' ? '#e94560' : '#aab'}`,
              borderRadius: 8,
              padding: '10px 16px',
              fontSize: '1.2rem',
              textAlign: 'center',
              width: 140,
              background: '#fff',
              color: '#1a1a2e',
              outline: 'none',
            }}
          />
          {feedback && (
            <div style={{
              fontWeight: 700,
              fontSize: '1.2rem',
              color: feedback === 'ratt' ? '#3bb273' : '#e94560',
            }}>
              {feedback === 'ratt' ? 'Ratt!' : `Fel! Svar: ${problem.answer}`}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={!!feedback}
            style={{
              background: '#1f6feb',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              padding: '10px 24px',
              cursor: feedback ? 'default' : 'pointer',
              fontWeight: 700,
              opacity: feedback ? 0.6 : 1,
            }}
          >
            Nasta
          </button>
        </div>
      )}

      {done && (
        <div style={{
          background: '#f0f4ff',
          borderRadius: 12,
          padding: 16,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <div style={{ fontSize: '2rem' }}>
            {score === count ? '' : score >= count * 0.7 ? '' : ''}
          </div>
          <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.2rem' }}>
            {score} av {count} ratt!
          </div>
          <button onClick={generate} style={{
            background: '#1f6feb', border: 'none', borderRadius: 8,
            color: '#fff', padding: '10px', cursor: 'pointer', fontWeight: 700,
          }}>
            Forsok igen!
          </button>
        </div>
      )}

      {problems.length === 0 && (
        <div style={{ color: '#8b949e', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
          Exempeluppgift: 7 + 5 = ?
        </div>
      )}
    </div>
  );
}
