import React, { useState, useEffect, useRef } from 'react';
import { tap } from '../lib/haptics.js';
import { playTap } from '../lib/sfx.js';
import { getProjects } from '../lib/projectStore.js';
import { getUnlocked, ACHIEVEMENTS } from '../lib/achievements.js';
import { getProfile } from '../lib/creatorProfile.js';
import { isMuted, toggleMuted } from '../lib/soundSettings.js';
import { isClassroomMode, toggleClassroomMode } from '../lib/classroomMode.js';

function CategoryCanvas({ catId, bg }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.03;

      if (catId === 'spel') {
        // Scrolling platforms + character
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        [[10,32,50,8],[68,20,45,8],[32,44,40,8]].forEach(([x,y,w,h]) => {
          const ox = ((x - t * 25) % (W+60) + W+60) % (W+60) - 60;
          ctx.beginPath(); ctx.roundRect(ox, y, w, h, 4); ctx.fill();
        });
        ctx.font = '18px serif'; ctx.textAlign = 'center';
        ctx.fillText('🥷', W/2 + Math.sin(t)*8, 30 - Math.abs(Math.sin(t*2))*8);
      } else if (catId === 'kortspel') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 4; i++) {
          const x = 8 + (i % 2) * 42, y = 6 + Math.floor(i/2) * 28;
          const flipped = Math.sin(t + i) > 0;
          const scaleX = Math.abs(Math.cos(t + i));
          ctx.save(); ctx.translate(x + 16, y + 11); ctx.scale(scaleX, 1);
          ctx.fillStyle = flipped ? '#fff' : 'rgba(255,255,255,0.4)';
          ctx.beginPath(); ctx.roundRect(-16,-11,32,22,4); ctx.fill();
          if (flipped) { ctx.font = '14px serif'; ctx.textAlign = 'center'; ctx.fillText(['🐱','🐶','🦊','🐸'][i], 0, 5); }
          ctx.restore();
        }
      } else if (catId === 'musik') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 7; i++) {
          const h = 10 + Math.abs(Math.sin(t + i * 0.8)) * 30;
          ctx.fillStyle = `hsla(${280 + i*10},80%,70%,0.9)`;
          ctx.beginPath(); ctx.roundRect(8 + i * 12, H - h - 4, 8, h, 3); ctx.fill();
        }
      } else if (catId === 'animation') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        ctx.font = '24px serif'; ctx.textAlign = 'center';
        const bounce = Math.abs(Math.sin(t * 1.5)) * 12;
        ctx.fillText('🦄', W/2, H - 8 - bounce);
        // sparkles
        for (let i = 0; i < 4; i++) {
          const age = (t * 0.5 + i * 0.25) % 1;
          ctx.fillStyle = `rgba(255,200,0,${1-age})`;
          ctx.beginPath();
          ctx.arc(W/2 + Math.cos(i*1.57+t)*18, H/2 - Math.sin(i*1.57+t)*10, 2, 0, Math.PI*2);
          ctx.fill();
        }
      } else if (catId === 'hemsida') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        // Browser-like mockup
        ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.roundRect(4,4,W-8,8,2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.roundRect(4,16,W-8,H-20,3); ctx.fill();
        ctx.font = '20px serif'; ctx.textAlign = 'center';
        ctx.fillText('🌐', W/2, H/2 + 6);
      } else if (catId === 'filmstudio') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        // Film strip
        for (let i = 0; i < 4; i++) {
          const x = 4 + i * 22;
          ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.roundRect(x, 8, 18, 46, 3); ctx.fill();
          ctx.font = '14px serif'; ctx.textAlign = 'center';
          ctx.fillText(['🥷','🐉','🧙','🤖'][i], x+9, H/2 + 5);
        }
      } else if (catId === 'bradspel') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        // Board squares path
        const sq = [[4,4],[20,4],[36,4],[52,4],[68,4],[68,16],[68,28],[68,40],[52,40],[36,40],[20,40],[4,40],[4,28],[4,16]];
        sq.forEach(([x,y], i) => {
          ctx.fillStyle = i % 3 === 0 ? 'rgba(255,200,0,0.4)' : 'rgba(255,255,255,0.15)';
          ctx.beginPath(); ctx.roundRect(x,y,14,10,2); ctx.fill();
        });
        // Die
        const dieX = 32, dieY = 16;
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(dieX, dieY, 18, 18, 3); ctx.fill();
        const face = Math.floor(t * 0.5) % 6 + 1;
        ctx.fillStyle = '#333';
        if (face >= 1) { ctx.beginPath(); ctx.arc(dieX+9, dieY+9, 2, 0, Math.PI*2); ctx.fill(); }
        if (face >= 4) {
          ctx.beginPath(); ctx.arc(dieX+5, dieY+5, 1.5, 0, Math.PI*2); ctx.fill();
          ctx.beginPath(); ctx.arc(dieX+13, dieY+13, 1.5, 0, Math.PI*2); ctx.fill();
        }
      } else if (catId === 'larospel') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        ctx.font = '14px sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
        ctx.fillText('2 + 2 = ?', 6, 18);
        const opts = ['3','4','5','6'];
        opts.forEach((o, i) => {
          const active = i === 1;
          ctx.fillStyle = active ? 'rgba(0,230,82,0.5)' : 'rgba(255,255,255,0.12)';
          ctx.beginPath(); ctx.roundRect(4 + (i%2)*42, 24 + Math.floor(i/2)*18, 38, 14, 3); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(o, 4 + (i%2)*42 + 19, 34 + Math.floor(i/2)*18);
        });
      } else if (catId === 'rostlab') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        // Waveform
        ctx.strokeStyle = 'rgba(255,80,80,0.9)'; ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const y = H/2 + Math.sin(x * 0.15 + t) * Math.sin(x * 0.05) * 14;
          x === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.stroke();
        ctx.font = '22px serif'; ctx.textAlign = 'center';
        ctx.fillText('🎤', W/2, H - 8);
      } else if (catId === 'berattelse') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        ctx.font = '28px serif'; ctx.textAlign = 'center';
        ctx.fillText('📖', W/2, H/2 + 8);
        // Page turn hint
        ctx.fillStyle = `rgba(255,255,255,${0.4 + Math.sin(t)*0.3})`;
        ctx.beginPath(); ctx.moveTo(W/2+8,H/2-8); ctx.lineTo(W/2+18,H/2); ctx.lineTo(W/2+8,H/2+8); ctx.fill();
      } else if (catId === 'pixelart') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        // Mini pixel grid
        const PALETTE = ['#ff6b6b','#ffd700','#00e5ff','#69f0ae','#ab47bc','#ff9800'];
        for (let row = 0; row < 5; row++) for (let col = 0; col < 8; col++) {
          const filled = (row + col + Math.floor(t * 2)) % 7 < 4;
          if (!filled) continue;
          ctx.fillStyle = PALETTE[(row * 8 + col) % PALETTE.length];
          ctx.fillRect(4 + col * 10, 6 + row * 10, 9, 9);
        }
      } else if (catId === 'quiz') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        ctx.font = '14px sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
        ctx.fillText('Vad äter en björn?', W/2, 14);
        ['Fisk 🐟','Gräs 🌿','Godis 🍬','Stenar 🪨'].forEach((a, i) => {
          const highlight = i === 0 && Math.sin(t) > 0;
          ctx.fillStyle = highlight ? 'rgba(255,200,0,0.5)' : 'rgba(255,255,255,0.12)';
          ctx.beginPath(); ctx.roundRect(4 + (i%2)*44, 20 + Math.floor(i/2)*18, 40, 14, 3); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
          ctx.fillText(a, 4 + (i%2)*44 + 20, 30 + Math.floor(i/2)*18);
        });
      } else if (catId === 'ritprogram') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        // Drawing tool animation
        const colors = ['#ff6b6b','#ffd700','#69f0ae','#4ecdc4','#ab47bc'];
        colors.forEach((c, i) => {
          const angle = (i / colors.length) * Math.PI * 2 + t * 0.3;
          const r = 18, cx2 = W/2 + Math.cos(angle) * r, cy2 = H/2 + Math.sin(angle) * r;
          ctx.beginPath(); ctx.arc(cx2, cy2, 4, 0, Math.PI*2);
          ctx.fillStyle = c; ctx.fill();
        });
        ctx.font = '20px serif'; ctx.textAlign = 'center';
        ctx.fillText('🖌️', W/2, H/2 + 6);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [catId, bg]);

  return <canvas ref={canvasRef} width={96} height={60} style={{ borderRadius: 10, display: 'block' }} />;
}

const CATEGORIES = [
  { id: 'musik',      name: 'Musik Studio',  emoji: '🎵', bg: '#6c3bbd' },
  { id: 'spel',       name: 'Spel',          emoji: '🎮', bg: '#2d7dd2' },
  { id: 'ritprogram', name: 'Ritprogram',    emoji: '🎨', bg: '#e84855' },
  { id: 'animation',  name: 'Animation',     emoji: '🌀', bg: '#f18f01' },
  { id: 'hemsida',    name: 'Min Hemsida',   emoji: '🌐', bg: '#3bb273' },
  { id: 'filmstudio', name: 'Filmstudio',    emoji: '🎬', bg: '#c33c54' },
  { id: 'kortspel',   name: 'Kortspel',      emoji: '🃏', bg: '#5c6bc0' },
  { id: 'bradspel',   name: 'Brädspel',      emoji: '🎲', bg: '#8d6748' },
  { id: 'larospel',   name: 'Lärospel',      emoji: '🧠', bg: '#00897b' },
  { id: 'rostlab',    name: 'Röstlab',       emoji: '🎤', bg: '#e53935' },
  { id: 'berattelse', name: 'Berattelse',    emoji: '📖', bg: '#c0392b' },
  { id: 'pixelart',   name: 'Pixel Art',     emoji: '🎨', bg: '#8e44ad' },
  { id: 'quiz',       name: 'Quiz-skaparen', emoji: '🧠', bg: '#e67e22' },
];

export default function HomeScreen({ navigate }) {
  const [highContrast, setHighContrast] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [achCount, setAchCount] = useState(0);
  const [showAchModal, setShowAchModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [muted, setMutedState] = useState(isMuted());
  const [classroomMode, setClassroomModeState] = useState(isClassroomMode());
  const [classroomToast, setClassroomToast] = useState('');
  const longPressRef = useRef(null);

  useEffect(() => {
    setProjectCount(getProjects().length);
    setAchCount(getUnlocked().length);
    setProfile(getProfile());
  }, []);

  function toggleContrast() {
    const next = !highContrast;
    setHighContrast(next);
    if (next) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 900, padding: '24px 16px', boxSizing: 'border-box' }}>
      {/* Achievement modal */}
      {showAchModal && (
        <div
          onClick={() => setShowAchModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a2e',
              border: '2px solid rgba(255,215,0,0.4)',
              borderRadius: 24,
              padding: '24px 20px',
              maxWidth: 360, width: '90%',
              maxHeight: '80vh', overflowY: 'auto',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffd700' }}>🏅 Prestationer</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                {achCount}/{ACHIEVEMENTS.length} upplåsta
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ACHIEVEMENTS.map(ach => {
                const unlocked = getUnlocked().includes(ach.id);
                return (
                  <div key={ach.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: unlocked ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)',
                    border: unlocked ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: '12px 14px',
                    opacity: unlocked ? 1 : 0.45,
                  }}>
                    <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{ach.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{ach.title}</div>
                      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>{ach.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setShowAchModal(false)}
              style={{
                width: '100%', marginTop: 16, padding: '12px 0',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12, color: '#fff', fontSize: '1rem', cursor: 'pointer',
              }}
            >
              Stäng
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 32 }}>
        <h1
          onMouseDown={() => { longPressRef.current = setTimeout(() => {
            const next = toggleClassroomMode();
            setClassroomModeState(next);
            setClassroomToast(next ? 'Klassrumsläge: PÅ 🏫' : 'Klassrumsläge: AV');
            setTimeout(() => setClassroomToast(''), 2500);
          }, 3000); }}
          onMouseUp={() => clearTimeout(longPressRef.current)}
          onMouseLeave={() => clearTimeout(longPressRef.current)}
          onTouchStart={() => { longPressRef.current = setTimeout(() => {
            const next = toggleClassroomMode();
            setClassroomModeState(next);
            setClassroomToast(next ? 'Klassrumsläge: PÅ 🏫' : 'Klassrumsläge: AV');
            setTimeout(() => setClassroomToast(''), 2500);
          }, 3000); }}
          onTouchEnd={() => clearTimeout(longPressRef.current)}
          style={{ fontSize: '2rem', margin: 0, textAlign: 'center', color: '#fff', userSelect: 'none', cursor: 'default' }}
        >
          ClaudeKids ✨{classroomMode && <span style={{ fontSize: '1rem', marginLeft: 8, opacity: 0.7 }}>🏫</span>}
        </h1>
        {classroomToast && (
          <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '12px 24px',
            borderRadius: 12, fontWeight: 700, fontSize: '1rem', zIndex: 999,
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {classroomToast}
          </div>
        )}
        <div style={{ position: 'absolute', left: 0, display: 'flex', gap: 8 }}>
          {profile && (
            <button
              onClick={() => navigate('setupProfile')}
              title="Redigera profil"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(255,255,255,0.25)',
                borderRadius: 12, fontSize: '1.5rem',
                cursor: 'pointer', padding: '4px 10px',
                minWidth: 44, minHeight: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {profile.avatar}
            </button>
          )}
        </div>
        <div style={{ position: 'absolute', right: 0, display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowAchModal(true)}
            title="Prestationer"
            style={{
              background: achCount > 0 ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.08)',
              border: achCount > 0 ? '2px solid rgba(255,215,0,0.5)' : '2px solid rgba(255,255,255,0.2)',
              borderRadius: 12,
              color: '#ffd700',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              padding: '8px 12px',
              minHeight: 44,
              whiteSpace: 'nowrap',
            }}
          >
            🏅 {achCount}
          </button>
          <button
            onClick={() => setMutedState(toggleMuted())}
            title={muted ? 'Ljud av' : 'Ljud på'}
            style={{
              background: muted ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.1)',
              border: muted ? '2px solid rgba(255,80,80,0.5)' : '2px solid rgba(255,255,255,0.3)',
              borderRadius: 12, color: '#fff', fontSize: '1.1rem',
              cursor: 'pointer', padding: '8px 12px',
              minWidth: 44, minHeight: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={toggleContrast}
            title={highContrast ? 'Normal vy' : 'Hogkontrastlage'}
            style={{
              background: highContrast ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: 12,
              color: '#fff',
              fontSize: '1.1rem',
              cursor: 'pointer',
              padding: '8px 12px',
              minWidth: 44,
              minHeight: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            👁
          </button>
          {!classroomMode && (
            <button
              onClick={() => navigate('myStuff')}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: 12,
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                padding: '8px 16px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: 44,
              }}
            >
              Mina Saker 📁{projectCount > 0 && <span style={{ marginLeft: 6, fontSize: '0.8rem', opacity: 0.85 }}>({projectCount} sparade)</span>}
            </button>
          )}
        </div>
      </div>

      {/* Category grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16,
      }}>
        {CATEGORIES.map(cat => (
          <CategoryCard key={cat.id} cat={cat} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ cat, navigate }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={() => { tap(); playTap(); navigate('wizard', { category: cat.id }); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        minHeight: 120,
        background: cat.bg,
        border: 'none',
        borderRadius: 16,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.1s ease',
        padding: '10px 12px',
        overflow: 'hidden',
      }}
    >
      <CategoryCanvas catId={cat.id} bg={cat.bg} />
      <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
        {cat.name}
      </span>
    </button>
  );
}
