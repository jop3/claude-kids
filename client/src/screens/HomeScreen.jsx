import React from 'react';

const btn = {
  minHeight: 48,
  padding: '12px 32px',
  fontSize: '1.2rem',
  border: 'none',
  borderRadius: 12,
  cursor: 'pointer',
  background: '#4f46e5',
  color: '#fff',
  width: 220,
};

export default function HomeScreen({ navigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <h1 style={{ fontSize: '3rem', margin: '0 0 24px' }}>ClaudeKids</h1>
      <button style={btn} onClick={() => navigate('builder')}>Musik</button>
      <button style={btn} onClick={() => navigate('myStuff')}>My Stuff</button>
      <button style={btn} onClick={() => navigate('builder')}>Builder</button>
    </div>
  );
}
