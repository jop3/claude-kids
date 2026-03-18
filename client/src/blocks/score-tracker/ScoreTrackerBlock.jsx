import React, { useState, useEffect, useRef } from 'react';

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
  fontSize: '0.85rem',
};

function Confetti({ active }) {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const rafId = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = 300;
    const H = canvas.height = 120;
    const COLORS = ['#ffe066','#f472b6','#a78bfa','#4ecdc4','#f18f01','#e94560'];
    particles.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: -10,
      vy: 2 + Math.random() * 3,
      vx: (Math.random() - 0.5) * 3,
      r: 3 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 1,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.current = particles.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.012;
        if (p.alpha <= 0 || p.y > H) return false;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;
      if (particles.current.length > 0) rafId.current = requestAnimationFrame(draw);
    }
    rafId.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId.current);
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} style={{ width: '100%', height: 120, display: 'block', borderRadius: 8 }} />;
}

const LS_KEY = 'claudekids_quiz_highscore';

export default function ScoreTrackerBlock({ config = {}, onConfigChange }) {
  const displayStyle = config.displayStyle || 'fraction';
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(5);
  const [quizDone, setQuizDone] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try { return Number(localStorage.getItem(LS_KEY) || 0); } catch { return 0; }
  });

  function update(patch) { onConfigChange({ ...config, ...patch }); }

  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  const stars = pct >= 90 ? 5 : pct >= 70 ? 4 : pct >= 50 ? 3 : pct >= 30 ? 2 : 1;
  const emoji = pct >= 80 ? '' : pct >= 50 ? '' : '';
  const isPerfect = correct === total && total > 0;

  function handleEnd() {
    setQuizDone(true);
    if (correct > highScore) {
      setHighScore(correct);
      try { localStorage.setItem(LS_KEY, String(correct)); } catch {}
    }
  }

  function handleReset() {
    setCorrect(0);
    setQuizDone(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        Poangrakare
      </div>

      <div>
        <div style={LABEL_STYLE}>VISNINGSSTIL</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { key: 'fraction', label: 'X/Y' },
            { key: 'percent', label: 'Procent' },
            { key: 'stars', label: 'Stjarnor' },
            { key: 'bar', label: 'Bar' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => update({ displayStyle: opt.key })}
              style={{ ...BTN_BASE, background: displayStyle === opt.key ? '#1f6feb' : '#21262d' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={LABEL_STYLE}>DEMO: ANTAL FRAGER</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[3, 5, 10].map(n => (
            <button key={n} onClick={() => { setTotal(n); setCorrect(0); setQuizDone(false); }}
              style={{ ...BTN_BASE, flex: 1, background: total === n ? '#1f6feb' : '#21262d' }}>{n}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setCorrect(c => Math.min(c + 1, total))}
          style={{ ...BTN_BASE, flex: 1, background: '#238636', border: 'none', color: '#fff' }}>
          + Ratt svar
        </button>
        <button onClick={() => setCorrect(c => Math.max(c - 1, 0))}
          style={{ ...BTN_BASE, flex: 1, background: '#21262d' }}>
          - Fel svar
        </button>
        <button onClick={handleEnd}
          style={{ ...BTN_BASE, flex: 1, background: '#6e40c9', border: 'none', color: '#fff' }}>
          Avsluta
        </button>
      </div>

      <div style={{
        background: '#f0f4ff',
        borderRadius: 12,
        padding: 16,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {displayStyle === 'fraction' && (
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a2e' }}>{correct}/{total}</div>
        )}
        {displayStyle === 'percent' && (
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1a1a2e' }}>{pct}%</div>
        )}
        {displayStyle === 'stars' && (
          <div style={{ fontSize: '1.6rem' }}>
            {'⭐'.repeat(stars)}{'☆'.repeat(5 - stars)}
          </div>
        )}
        {displayStyle === 'bar' && (
          <div style={{ background: '#dde', borderRadius: 20, height: 20, overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`,
              height: '100%',
              background: pct >= 80 ? '#3bb273' : pct >= 50 ? '#f18f01' : '#e94560',
              borderRadius: 20,
              transition: 'width 0.4s',
            }} />
          </div>
        )}
        <div style={{ fontSize: '0.8rem', color: '#666' }}>
          Rekord: {highScore} ratt
        </div>
      </div>

      {quizDone && (
        <div style={{
          background: isPerfect ? '#ffe8f0' : '#f0f4ff',
          borderRadius: 12,
          padding: 16,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <Confetti active={isPerfect} />
          <div style={{ fontSize: '2rem' }}>{emoji}</div>
          <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1.2rem' }}>
            {correct}/{total} ratt! ({pct}%)
          </div>
          {isPerfect && <div style={{ color: '#e94560', fontWeight: 700 }}>Perfekt! KLOCKRENT!</div>}
          <button onClick={handleReset} style={{
            background: '#1f6feb', border: 'none', borderRadius: 8,
            color: '#fff', padding: '10px', cursor: 'pointer', fontWeight: 700,
          }}>
            Forsok igen
          </button>
        </div>
      )}
    </div>
  );
}
