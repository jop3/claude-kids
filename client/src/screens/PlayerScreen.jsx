import React from 'react';

export default function PlayerScreen({ file, navigate }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <iframe
        src={`/preview/${file}`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Ditt skapelse"
      />
      <button
        onClick={() => navigate('home')}
        style={{
          position: 'fixed', top: 12, left: 12,
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: 12, padding: '8px 16px',
          fontSize: '0.9rem', cursor: 'pointer',
          backdropFilter: 'blur(4px)',
        }}
      >
        ← Hem
      </button>
    </div>
  );
}
