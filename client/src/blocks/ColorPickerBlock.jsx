import React from 'react';

const SWATCHES = [
  '#e94560', '#6c3bbd', '#2d7dd2', '#f18f01',
  '#3bb273', '#e84855', '#ff6b6b', '#4ecdc4',
  '#ffe66d', '#a8e6cf', '#ffffff', '#1a1a2e',
];

export default function ColorPickerBlock({ config, onConfigChange }) {
  const selectedColor = config?.color || '#6c3bbd';

  return (
    <div>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>
        Bakgrundsfarg
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
      }}>
        {SWATCHES.map(hex => (
          <button
            key={hex}
            onClick={() => onConfigChange({ color: hex })}
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: hex,
              border: selectedColor === hex ? '3px solid #ffffff' : '3px solid transparent',
              boxShadow: selectedColor === hex
                ? '0 0 0 2px #58a6ff'
                : '0 0 0 1px rgba(255,255,255,0.15)',
              cursor: 'pointer',
              padding: 0,
              transition: 'box-shadow 150ms',
            }}
            aria-label={hex}
          />
        ))}
      </div>
    </div>
  );
}
