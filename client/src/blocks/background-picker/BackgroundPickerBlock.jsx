import React from 'react';
import { BACKGROUNDS } from '../../lib/backgrounds.js';

export default function BackgroundPickerBlock({ config = {}, onConfigChange }) {
  const selectedId = config.backgroundId || null;

  return (
    <div>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>
        Välj bakgrund
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 10,
      }}>
        {BACKGROUNDS.map(bg => {
          const isSelected = selectedId === bg.id;
          return (
            <button
              key={bg.id}
              onClick={() => onConfigChange({ backgroundId: bg.id })}
              title={bg.description}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: 0,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: 80,
                height: 60,
                borderRadius: 8,
                background: bg.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                border: isSelected ? '3px solid #ffffff' : '3px solid transparent',
                boxShadow: isSelected ? '0 0 0 2px #58a6ff' : 'none',
                transition: 'border 0.15s, box-shadow 0.15s',
                flexShrink: 0,
              }}>
                {bg.emoji}
              </div>
              <span style={{
                color: isSelected ? '#e6edf3' : '#8b949e',
                fontSize: '0.7rem',
                fontWeight: isSelected ? 700 : 400,
                textAlign: 'center',
                lineHeight: 1.2,
                maxWidth: 80,
              }}>
                {bg.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
