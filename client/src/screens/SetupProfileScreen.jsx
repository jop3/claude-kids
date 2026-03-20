import React, { useState } from 'react';
import { saveProfile } from '../lib/creatorProfile.js';

const AVATARS = [
  '🥷','🤖','🦕','🦄','👽','🏴‍☠️','🧙‍♀️','⚔️','👨‍🚀','🐉',
  '🐼','🦸','🧌','🧛','🐺','🦊','🐱','🐸','🦋','🌟',
];

const NAME_WORDS = [
  ['Super','Ultra','Mega','Turbo','Hyper','Pro','Max','Topp','Mäster','Konung'],
  ['Ninja','Robot','Pirat','Rymd','Drak','Magi','Pixel','Koden','Spel','Musik'],
  ['Stjärna','Hjälten','Maken','Geni','Legenden','Champion','Experten'],
];

export default function SetupProfileScreen({ navigate }) {
  const [step, setStep] = useState(0); // 0=avatar, 1=name
  const [avatar, setAvatar] = useState('🥷');
  const [nameParts, setNameParts] = useState([0, 0, 0]);

  const buildName = (parts) =>
    NAME_WORDS[0][parts[0]] + NAME_WORDS[1][parts[1]] + ' ' + NAME_WORDS[2][parts[2]];

  const displayName = buildName(nameParts);

  function handleDone() {
    saveProfile({ name: displayName, avatar });
    navigate('home');
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #1a1a2e, #0d0d1e)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 20px',
      color: '#fff',
      boxSizing: 'border-box',
    }}>
      {step === 0 && (
        <>
          <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8, textAlign: 'center' }}>
            Valj din avatar!
          </div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: 24, textAlign: 'center' }}>
            Vem ar du?
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 12,
            maxWidth: 340,
            marginBottom: 32,
          }}>
            {AVATARS.map(av => (
              <button
                key={av}
                onClick={() => setAvatar(av)}
                style={{
                  width: 56, height: 56,
                  fontSize: '1.8rem',
                  background: avatar === av ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.08)',
                  border: avatar === av ? '2px solid #ffd700' : '2px solid transparent',
                  borderRadius: 14,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  transform: avatar === av ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                {av}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>{avatar}</div>
          <button
            onClick={() => setStep(1)}
            style={{
              padding: '16px 48px', borderRadius: 16,
              background: '#ffd700', border: 'none',
              color: '#000', fontSize: '1.1rem', fontWeight: 900,
              cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,215,0,0.4)',
            }}
          >
            Nasta →
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <div style={{ fontSize: '2rem', fontWeight: 900, marginBottom: 8, textAlign: 'center' }}>
            Vad heter du?
          </div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
            Tryck pa orden for att byta!
          </div>
          <div style={{ fontSize: '4rem', marginBottom: 24 }}>{avatar}</div>
          <div style={{
            fontSize: 'clamp(1.2rem, 5vw, 1.8rem)',
            fontWeight: 900,
            color: '#ffd700',
            textShadow: '0 0 20px rgba(255,215,0,0.5)',
            marginBottom: 28,
            textAlign: 'center',
          }}>
            {displayName}
          </div>

          {/* Name word pickers */}
          {NAME_WORDS.map((words, rowIdx) => (
            <div key={rowIdx} style={{
              display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center',
              marginBottom: 14, maxWidth: 380,
            }}>
              {words.map((word, wIdx) => (
                <button
                  key={word}
                  onClick={() => setNameParts(prev => {
                    const next = [...prev];
                    next[rowIdx] = wIdx;
                    return next;
                  })}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: nameParts[rowIdx] === wIdx ? '2px solid #ffd700' : '2px solid rgba(255,255,255,0.2)',
                    background: nameParts[rowIdx] === wIdx ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.08)',
                    color: nameParts[rowIdx] === wIdx ? '#ffd700' : '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button
              onClick={() => setStep(0)}
              style={{
                padding: '14px 28px', borderRadius: 14,
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              ← Tillbaka
            </button>
            <button
              onClick={handleDone}
              style={{
                padding: '14px 36px', borderRadius: 14,
                background: '#ffd700', border: 'none',
                color: '#000', fontSize: '1rem', fontWeight: 900,
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,215,0,0.4)',
              }}
            >
              Klar! →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
