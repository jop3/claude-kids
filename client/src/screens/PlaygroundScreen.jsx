import React from 'react';

export default function PlaygroundScreen({ category, answers, navigate }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', background:'#1a1a2e', color:'#fff' }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>⚙️</div>
      <div style={{ fontSize: '1.8rem', fontWeight:'bold', marginBottom: 8 }}>Bygger...</div>
      <div style={{ opacity: 0.6 }}>{category} — {JSON.stringify(answers)}</div>
      <button onClick={() => navigate('home')}
        style={{ marginTop: 40, padding: '12px 32px', borderRadius: 12,
          background: '#e94560', border: 'none', color: '#fff',
          fontSize: '1rem', cursor: 'pointer' }}>
        ← Tillbaka
      </button>
    </div>
  );
}
