import React from 'react';

export default function ResultScreen({ navigate }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', background:'#1a1a2e', color:'#fff' }}>
      <div style={{ fontSize: 64 }}>🎉</div>
      <div style={{ fontSize: '2rem', fontWeight:'bold', margin: '16px 0' }}>Klart!</div>
      <button onClick={() => navigate('home')}
        style={{ padding: '12px 32px', borderRadius: 12, background: '#e94560',
          border: 'none', color: '#fff', fontSize: '1rem', cursor: 'pointer' }}>
        ← Hem
      </button>
    </div>
  );
}
