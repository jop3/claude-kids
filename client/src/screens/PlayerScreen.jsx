import React from 'react';

export default function PlayerScreen({ file, projectId, navigate }) {
  const backScreen = projectId ? 'myStuff' : 'home';
  const backLabel = projectId ? '← Mina Saker' : '← Hem';

  if (!file) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#1a1a2e', color: '#fff', gap: 16, padding: 24,
      }}>
        <div style={{ fontSize: 72 }}>😕</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, textAlign: 'center' }}>
          Filen hittades inte!
        </div>
        <button
          onClick={() => navigate(backScreen)}
          style={{
            padding: '14px 32px', borderRadius: 14,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontSize: '1rem', cursor: 'pointer',
          }}
        >
          {backLabel}
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <iframe
        src={`/preview/${file}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Ditt skapelse"
      />
      <button
        onClick={() => navigate(backScreen)}
        style={{
          position: 'fixed', top: 12, left: 12,
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: 12, padding: '8px 16px',
          fontSize: '0.9rem', cursor: 'pointer',
          backdropFilter: 'blur(4px)',
        }}
      >
        {backLabel}
      </button>
    </div>
  );
}
