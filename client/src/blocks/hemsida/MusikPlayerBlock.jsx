import React, { useState, useEffect } from 'react';
import { getProjects } from '../../lib/projectStore.js';

export default function MusikPlayerBlock({ config = {}, onConfigChange }) {
  const [musikProjects, setMusikProjects] = useState([]);
  const selectedName = config.projektNamn || null;

  useEffect(() => {
    const all = getProjects();
    setMusikProjects(all.filter(p => p.type === 'musik'));
  }, []);

  function select(name) {
    onConfigChange({ projektNamn: selectedName === name ? null : name });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1 }}>
        Musikspelare
      </div>

      {musikProjects.length === 0 && (
        <div style={{
          background: '#21262d',
          borderRadius: 12,
          padding: 16,
          color: '#6e7681',
          textAlign: 'center',
          fontSize: '0.9rem',
          lineHeight: 1.5,
        }}>
          🎵 Inga musikprojekt sparade ännu!
          <br />
          Skapa något i Musik Studio först.
        </div>
      )}

      {musikProjects.map(proj => (
        <div
          key={proj.id}
          onClick={() => select(proj.name)}
          style={{
            background: selectedName === proj.name ? '#0d2744' : '#21262d',
            border: selectedName === proj.name ? '2px solid #58a6ff' : '2px solid #30363d',
            borderRadius: 14,
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>{selectedName === proj.name ? '▶️' : '🎵'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '0.95rem' }}>{proj.name}</div>
            <div style={{ color: '#6e7681', fontSize: '0.75rem' }}>
              {new Date(proj.modified || proj.created).toLocaleDateString('sv-SE')}
            </div>
          </div>
          {selectedName === proj.name && (
            <span style={{
              background: '#2d7dd2',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 999,
            }}>
              VALD
            </span>
          )}
        </div>
      ))}

      {selectedName && (
        <div style={{
          background: 'linear-gradient(135deg, #6c3bbd33, #2d7dd233)',
          border: '1px solid #6c3bbd55',
          borderRadius: 12,
          padding: '10px 14px',
          color: '#a78bfa',
          fontSize: '0.85rem',
          fontWeight: 600,
          textAlign: 'center',
        }}>
          🎧 Din hemsida spelar: {selectedName}
        </div>
      )}
    </div>
  );
}
