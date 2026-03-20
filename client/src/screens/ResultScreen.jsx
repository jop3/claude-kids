import React, { useEffect, useState } from 'react';
import { WIZARD_CONFIG } from '../lib/wizardConfig.js';

const popIn = `
@keyframes popIn {
  0%   { transform: scale(0); opacity: 0; }
  70%  { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
`;

export default function ResultScreen({ category, answers, file, thumb, error, navigate }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function handleShare() {
    const url = window.location.origin + '/preview/' + file;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const config = WIZARD_CONFIG[category] ?? {};
  const catLabel = config.label ?? category ?? 'skapelse';
  const catEmoji = config.emoji ?? '🎉';

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#1a1a2e', color: '#fff', gap: 16, padding: 24,
      }}>
        <div style={{ fontSize: 80 }}>😅</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center' }}>
          Något gick snett 😅
        </div>
        <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
          Ingen panik — försök igen!
        </div>
        <button
          onClick={() => navigate('playground', { category, answers })}
          style={{
            marginTop: 8, padding: '14px 36px', borderRadius: 16,
            background: '#e94560', border: 'none', color: '#fff',
            fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer',
          }}
        >
          Försök igen
        </button>
        <button
          onClick={() => navigate('home')}
          style={{
            padding: '10px 28px', borderRadius: 12,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff', fontSize: '1rem', cursor: 'pointer',
          }}
        >
          ← Hem
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{popIn}</style>
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff', gap: 20, padding: 24,
      }}>
        <div style={{
          fontSize: 96, lineHeight: 1,
          animation: visible ? 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
        }}>
          {catEmoji}
        </div>

        <div style={{
          fontSize: '1.9rem', fontWeight: 800, textAlign: 'center',
          lineHeight: 1.2, maxWidth: 340,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s',
        }}>
          Ditt {catLabel} är klart! 🎉
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 12,
          width: '100%', maxWidth: 320,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.4s ease 0.35s, transform 0.4s ease 0.35s',
        }}>
          <button
            onClick={() => navigate('player', { file })}
            style={{
              padding: '18px 0', borderRadius: 18,
              background: 'linear-gradient(90deg, #00c853, #69f0ae)',
              border: 'none', color: '#fff',
              fontSize: '1.25rem', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,200,83,0.4)',
              letterSpacing: '0.02em',
            }}
          >
            ▶ Spela / Öppna
          </button>

          <button
            onClick={() => navigate('wizard', { category, answers })}
            style={{
              padding: '14px 0', borderRadius: 16,
              background: 'linear-gradient(90deg, #1565c0, #42a5f5)',
              border: 'none', color: '#fff',
              fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(21,101,192,0.35)',
            }}
          >
            ✏️ Ändra något
          </button>

          <button
            onClick={() => navigate('namePicker', { returnTo: 'saveResult', category, answers, file, thumb })}
            style={{
              padding: '14px 0', borderRadius: 16,
              background: 'linear-gradient(90deg, #6a1b9a, #ab47bc)',
              border: 'none', color: '#fff',
              fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(106,27,154,0.35)',
            }}
          >
            💾 Spara
          </button>

          <button
            onClick={handleShare}
            style={{
              padding: '14px 0', borderRadius: 16,
              background: copied
                ? 'linear-gradient(90deg, #00796b, #26a69a)'
                : 'linear-gradient(90deg, #e65100, #ff9800)',
              border: 'none', color: '#fff',
              fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: copied
                ? '0 4px 16px rgba(0,121,107,0.35)'
                : '0 4px 16px rgba(230,81,0,0.35)',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          >
            {copied ? '✓ Kopierat!' : '🔗 Dela'}
          </button>
        </div>

        <button
          onClick={() => navigate('home')}
          style={{
            marginTop: 8,
            background: 'none', border: 'none',
            color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem',
            cursor: 'pointer', textDecoration: 'underline',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.4s ease 0.5s',
          }}
        >
          ← Hem
        </button>
      </div>
    </>
  );
}
