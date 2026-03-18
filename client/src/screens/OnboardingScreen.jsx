import React, { useState, useEffect, useRef } from 'react';

const SLIDES = [
  {
    id: 'tap',
    render: ({ phase }) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Category card */}
          <div style={{
            width: 140,
            height: 100,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #6c3bbd, #2d7dd2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: phase > 0.5 ? '0 0 0 6px rgba(255,255,255,0.4)' : '0 4px 16px rgba(0,0,0,0.4)',
            transform: `scale(${phase > 0.5 ? 0.95 : 1})`,
            transition: 'box-shadow 0.15s, transform 0.15s',
          }}>
            <span style={{ fontSize: 40 }}>🎵</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Musik Studio</span>
          </div>
          {/* Hand pointer */}
          <div style={{
            position: 'absolute',
            bottom: 10,
            right: 20,
            fontSize: 48,
            transform: `translateY(${phase > 0.5 ? 8 : 0}px) rotate(-20deg)`,
            transition: 'transform 0.2s',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
          }}>
            👆
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 600 }}>
          Tryck för att välja
        </div>
      </div>
    ),
  },
  {
    id: 'blocks',
    render: ({ phase }) => {
      const blocks = [
        { emoji: '🥁', name: 'Trummor', color: '#6c3bbd' },
        { emoji: '🎹', name: 'Synth',   color: '#2d7dd2' },
        { emoji: '🎤', name: 'Röst',    color: '#e84855' },
      ];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          {/* Blocks sliding in */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {blocks.map((b, i) => {
              const delay = i / blocks.length;
              const appeared = phase > delay;
              return (
                <div key={b.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  borderRadius: 999,
                  background: b.color,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  opacity: appeared ? 1 : 0,
                  transform: `translateY(${appeared ? 0 : 20}px)`,
                  transition: 'opacity 0.4s, transform 0.4s',
                }}>
                  <span>{b.emoji}</span>
                  <span>{b.name}</span>
                </div>
              );
            })}
          </div>
          {/* Mini playground preview */}
          <div style={{
            width: 200,
            height: 120,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #0a0a1a, #1a0a30)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Stars */}
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                position: 'absolute',
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: '#fff',
                left: `${15 + i * 13}%`,
                top: `${10 + (i % 3) * 15}%`,
                opacity: phase > 0.3 ? 0.8 : 0,
                transition: 'opacity 0.3s',
              }} />
            ))}
            {/* Character */}
            <div style={{
              fontSize: 40,
              filter: 'drop-shadow(0 0 8px rgba(255,224,102,0.6))',
              transform: `translateY(${Math.sin(Date.now() / 500) * 4}px)`,
              opacity: phase > 0.5 ? 1 : 0,
              transition: 'opacity 0.4s',
            }}>
              😊
            </div>
            {/* Notes floating */}
            {phase > 0.6 && ['♪', '♫', '♬'].map((n, i) => (
              <div key={n} style={{
                position: 'absolute',
                fontSize: 18,
                color: ['#a78bfa', '#f472b6', '#4ecdc4'][i],
                left: `${25 + i * 20}%`,
                top: `${15 + i * 10}%`,
                opacity: 0.9,
              }}>{n}</div>
            ))}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 600 }}>
            Block byggs till saker!
          </div>
        </div>
      );
    },
  },
  {
    id: 'save',
    render: ({ phase }) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {/* Save icon pulsing */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#238636',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          boxShadow: `0 0 0 ${phase * 20}px rgba(35,134,54,0.2)`,
          transition: 'box-shadow 0.3s',
        }}>
          💾
        </div>
        {/* Project card appearing */}
        <div style={{
          width: 200,
          borderRadius: 16,
          background: '#161b22',
          border: '1px solid #30363d',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          opacity: phase > 0.4 ? 1 : 0,
          transform: `scale(${phase > 0.4 ? 1 : 0.8})`,
          transition: 'opacity 0.4s, transform 0.4s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>🎵</span>
            <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: '0.95rem' }}>Mitt spel</span>
          </div>
          <div style={{ color: '#8b949e', fontSize: '0.8rem' }}>Sparat!</div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 600 }}>
          Spara och fortsatt senare
        </div>
      </div>
    ),
  },
  {
    id: 'share',
    render: ({ phase }) => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {/* Phone mockup */}
        <div style={{
          width: 120,
          height: 200,
          borderRadius: 20,
          background: '#1a1a2e',
          border: '4px solid #e94560',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(233,69,96,0.3)',
          transform: `rotate(${phase > 0.5 ? 0 : 5}deg)`,
          transition: 'transform 0.4s',
        }}>
          {/* Phone screen */}
          <div style={{
            width: '80%',
            height: '70%',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #6c3bbd, #2d7dd2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
          }}>
            🏠
          </div>
          {/* Home button */}
          <div style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.3)',
            marginTop: 8,
          }} />
        </div>
        {/* Share icon */}
        <div style={{
          fontSize: 40,
          opacity: phase > 0.5 ? 1 : 0,
          transition: 'opacity 0.4s',
        }}>
          📤
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 600 }}>
          Dela med kompisen!
        </div>
      </div>
    ),
  },
];

export default function OnboardingScreen({ navigate }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [phase, setPhase] = useState(0);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);
  const phaseRef = useRef(null);
  const SLIDE_DURATION = 2500;

  function advance() {
    if (slideIndex < SLIDES.length - 1) {
      setExiting(true);
      setTimeout(() => {
        setSlideIndex(prev => prev + 1);
        setPhase(0);
        setExiting(false);
      }, 300);
    }
  }

  function finish() {
    localStorage.setItem('kompisen_onboarded', 'true');
    navigate('home');
  }

  // Auto-advance
  useEffect(() => {
    if (slideIndex >= SLIDES.length - 1) return;
    timerRef.current = setTimeout(advance, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [slideIndex]);

  // Phase animation (0 -> 1 over slide duration)
  useEffect(() => {
    setPhase(0);
    let start = null;
    let raf;
    function tick(ts) {
      if (!start) start = ts;
      const elapsed = (ts - start) / SLIDE_DURATION;
      setPhase(Math.min(1, elapsed));
      if (elapsed < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [slideIndex]);

  const slide = SLIDES[slideIndex];
  const isLast = slideIndex === SLIDES.length - 1;

  return (
    <div
      onClick={isLast ? undefined : advance}
      style={{
        width: '100vw',
        height: '100vh',
        background: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        cursor: isLast ? 'default' : 'pointer',
        userSelect: 'none',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* Slide content */}
      <div style={{
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(0.95)' : 'scale(1)',
        transition: 'opacity 0.3s, transform 0.3s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        minHeight: 280,
        justifyContent: 'center',
      }}>
        {slide.render({ phase })}
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', gap: 10 }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{
            width: i === slideIndex ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: i === slideIndex ? '#e94560' : 'rgba(255,255,255,0.3)',
            transition: 'width 0.3s, background 0.3s',
          }} />
        ))}
      </div>

      {/* Last slide: big BORJA button */}
      {isLast && (
        <button
          onClick={finish}
          style={{
            background: 'linear-gradient(135deg, #e94560, #6c3bbd)',
            border: 'none',
            borderRadius: 20,
            color: '#fff',
            fontSize: '1.4rem',
            fontWeight: 900,
            padding: '20px 48px',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(233,69,96,0.5)',
            minHeight: 64,
            minWidth: 200,
            letterSpacing: 1,
          }}
        >
          BORJA!
        </button>
      )}

      {/* Skip button (not on last slide) */}
      {!isLast && (
        <button
          onClick={e => { e.stopPropagation(); finish(); }}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            padding: '8px 16px',
            minHeight: 44,
          }}
        >
          Hoppa over
        </button>
      )}
    </div>
  );
}
