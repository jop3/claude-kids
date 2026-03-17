import React from 'react';

const backBtn = {
  minHeight: 48,
  padding: '12px 32px',
  fontSize: '1rem',
  border: 'none',
  borderRadius: 12,
  cursor: 'pointer',
  background: '#374151',
  color: '#fff',
};

export default function NamePickerScreen({ navigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Välj ett namn</h1>
      <button style={backBtn} onClick={() => navigate('home')}>&larr; Tillbaka</button>
    </div>
  );
}
