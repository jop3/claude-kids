import React from 'react';

function contrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a2e' : '#ffffff';
}

export default function ColorPickerPreview({ config }) {
  const color = config?.color || '#6c3bbd';
  const textColor = contrastColor(color);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: color,
      transition: 'background 300ms ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <span style={{
        color: textColor,
        fontSize: '1.2rem',
        fontWeight: 700,
        fontFamily: 'monospace',
        letterSpacing: 2,
        opacity: 0.8,
      }}>
        {color.toUpperCase()}
      </span>
    </div>
  );
}
