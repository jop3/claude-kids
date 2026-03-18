import React, { useState, useRef } from 'react';
import { createProject, saveProject } from '../lib/projectStore.js';

const ADJECTIVES = [
  'Röda', 'Blå', 'Galna', 'Snabba', 'Magiska', 'Mörka', 'Ljusa', 'Stjärniga',
  'Hemliga', 'Coola', 'Vilda', 'Glada', 'Stora', 'Lilla', 'Mystiska',
  'Elektriska', 'Gyllene', 'Silveriga', 'Regnbågiga', 'Himlska',
];

const NOUNS = [
  'Äventyret', 'Resan', 'Draken', 'Rymdskeppet', 'Skatten', 'Musiken',
  'Dansen', 'Mysteriet', 'Monstern', 'Hjälten', 'Roboten', 'Drömmen',
  'Katten', 'Hajen', 'Vulkanen', 'Riddaren', 'Sagan', 'Planeten',
  'Dimman', 'Stjärnan',
];

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #f06, #a0f)',
  'linear-gradient(135deg, #0af, #0f9)',
  'linear-gradient(135deg, #f90, #f06)',
  'linear-gradient(135deg, #0f9, #0af)',
  'linear-gradient(135deg, #a0f, #f90)',
  'linear-gradient(135deg, #f06, #0af)',
  'linear-gradient(135deg, #ff6b35, #f7c59f)',
  'linear-gradient(135deg, #6c63ff, #48cae4)',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickGradient() {
  return pickRandom(CARD_GRADIENTS);
}

export default function NamePickerScreen({ navigate, params }) {
  const [adjIdx, setAdjIdx] = useState(() => Math.floor(Math.random() * ADJECTIVES.length));
  const [nounIdx, setNounIdx] = useState(() => Math.floor(Math.random() * NOUNS.length));
  const [adjGrad, setAdjGrad] = useState(pickGradient);
  const [nounGrad, setNounGrad] = useState(pickGradient);
  const [adjFlipping, setAdjFlipping] = useState(false);
  const [nounFlipping, setNounFlipping] = useState(false);
  const adjTimer = useRef(null);
  const nounTimer = useRef(null);

  function spinAdj() {
    if (adjFlipping) return;
    setAdjFlipping(true);
    clearTimeout(adjTimer.current);
    adjTimer.current = setTimeout(() => {
      setAdjIdx(i => {
        let next = i;
        while (next === i) next = Math.floor(Math.random() * ADJECTIVES.length);
        return next;
      });
      setAdjGrad(pickGradient());
      setAdjFlipping(false);
    }, 200);
  }

  function spinNoun() {
    if (nounFlipping) return;
    setNounFlipping(true);
    clearTimeout(nounTimer.current);
    nounTimer.current = setTimeout(() => {
      setNounIdx(i => {
        let next = i;
        while (next === i) next = Math.floor(Math.random() * NOUNS.length);
        return next;
      });
      setNounGrad(pickGradient());
      setNounFlipping(false);
    }, 200);
  }

  function spinBoth() {
    spinAdj();
    spinNoun();
  }

  function handleConfirm() {
    const fullName = `${ADJECTIVES[adjIdx]} ${NOUNS[nounIdx]}`;
    if (params && typeof params.onConfirm === 'function') {
      params.onConfirm(fullName);
    } else {
      const { category, answers, file } = params || {};
      const project = createProject(category, answers, file, fullName);
      saveProject(project);
      navigate('myStuff');
    }
  }

  const cardStyle = (gradient, flipping) => ({
    flex: 1,
    minWidth: 0,
    height: 160,
    background: gradient,
    borderRadius: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    transition: 'transform 0.2s, opacity 0.2s',
    transform: flipping ? 'rotateY(90deg) scale(0.92)' : 'rotateY(0deg) scale(1)',
    opacity: flipping ? 0.3 : 1,
    perspective: 600,
  });

  const wordStyle = {
    fontSize: '2.2rem',
    fontWeight: 900,
    color: '#fff',
    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
    textAlign: 'center',
    padding: '0 12px',
    lineHeight: 1.1,
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 32,
      padding: '32px 24px',
      minHeight: '100vh',
      width: '100%',
      maxWidth: 600,
      boxSizing: 'border-box',
    }}>
      <h1 style={{ fontSize: '2rem', margin: 0, textAlign: 'center', color: '#fff' }}>
        Vad ska det heta?
      </h1>
      <p style={{ margin: 0, color: '#8b949e', fontSize: '1rem', textAlign: 'center' }}>
        Tryck på korten för att byta ord!
      </p>

      {/* Word cards */}
      <div style={{ display: 'flex', gap: 16, width: '100%' }}>
        <div
          style={cardStyle(adjGrad, adjFlipping)}
          onClick={spinAdj}
          role="button"
          aria-label="Byt adjektiv"
        >
          <span style={wordStyle}>{ADJECTIVES[adjIdx]}</span>
        </div>
        <div
          style={cardStyle(nounGrad, nounFlipping)}
          onClick={spinNoun}
          role="button"
          aria-label="Byt substantiv"
        >
          <span style={wordStyle}>{NOUNS[nounIdx]}</span>
        </div>
      </div>

      {/* Combined name preview */}
      <div style={{
        fontSize: '1.2rem',
        color: '#e6edf3',
        fontWeight: 700,
        letterSpacing: 0.5,
        opacity: 0.85,
      }}>
        {ADJECTIVES[adjIdx]} {NOUNS[nounIdx]}
      </div>

      {/* Shuffle button */}
      <button
        onClick={spinBoth}
        style={{
          padding: '14px 36px',
          fontSize: '1.1rem',
          fontWeight: 700,
          borderRadius: 16,
          border: '2px solid #444',
          background: '#21262d',
          color: '#e6edf3',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#30363d'}
        onMouseLeave={e => e.currentTarget.style.background = '#21262d'}
      >
        Ny kombination
      </button>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        style={{
          padding: '18px 48px',
          fontSize: '1.3rem',
          fontWeight: 900,
          borderRadius: 20,
          border: 'none',
          background: 'linear-gradient(135deg, #238636, #2ea043)',
          color: '#fff',
          cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(35,134,54,0.4)',
          transition: 'transform 0.1s',
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Det ar det!
      </button>

      {/* Back */}
      <button
        onClick={() => navigate('home')}
        style={{
          background: 'none',
          border: 'none',
          color: '#6e7681',
          fontSize: '0.95rem',
          cursor: 'pointer',
          padding: '8px',
        }}
      >
        Avbryt
      </button>
    </div>
  );
}
