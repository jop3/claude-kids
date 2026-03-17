import React, { useState, useEffect, useRef } from 'react';
import { getProjects, deleteProject } from '../lib/projectStore.js';

const CATEGORY_EMOJIS = {
  spel: '🎮',
  animation: '🎬',
  konst: '🎨',
  musik: '🎵',
  story: '📖',
};

const CATEGORY_COLORS = {
  spel: '#7c3aed',
  animation: '#db2777',
  konst: '#d97706',
  musik: '#059669',
  story: '#2563eb',
};

function formatSwedishDate(isoString) {
  const months = ['jan', 'feb', 'mars', 'apr', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const d = new Date(isoString);
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export default function MyStuffScreen({ navigate }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  function handleDelete(e, id) {
    e.stopPropagation();
    if (window.confirm('Ta bort det här projektet?')) {
      deleteProject(id);
      setProjects(getProjects());
    }
  }

  function ProjectCard({ project }) {
    const longPressTimer = useRef(null);
    const emoji = CATEGORY_EMOJIS[project.type] || '🎨';
    const color = CATEGORY_COLORS[project.type] || '#374151';

    function startLongPress() {
      longPressTimer.current = setTimeout(() => {
        if (window.confirm('Ta bort det här projektet?')) {
          deleteProject(project.id);
          setProjects(getProjects());
        }
      }, 500);
    }

    function cancelLongPress() {
      clearTimeout(longPressTimer.current);
    }

    return (
      <div
        onClick={() => navigate('builder', { projectId: project.id })}
        onMouseDown={startLongPress}
        onMouseUp={cancelLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        style={{
          background: '#16213e',
          borderRadius: 16,
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          transition: 'transform 0.15s',
          position: 'relative',
          userSelect: 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; cancelLongPress(e); }}
      >
        {/* Thumbnail */}
        <div style={{ width: '100%', aspectRatio: '16/9', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {project.thumbnail
            ? <img src={project.thumbnail} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '3rem' }}>{emoji}</span>
          }
        </div>

        {/* Info */}
        <div style={{ padding: '10px 12px 12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {project.name}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{emoji} {project.type || 'skapelse'}</span>
            <span>{project.modified ? formatSwedishDate(project.modified) : formatSwedishDate(project.created)}</span>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={e => handleDelete(e, project.id)}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: '0.75rem',
            padding: '4px 7px',
            cursor: 'pointer',
            lineHeight: 1,
          }}
          title="Ta bort"
        >
          🗑
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 900, padding: '24px 20px', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <button
          onClick={() => navigate('home')}
          style={{ minHeight: 48, padding: '12px 24px', fontSize: '1rem', border: 'none', borderRadius: 12, cursor: 'pointer', background: '#374151', color: '#fff' }}
        >
          ← Tillbaka
        </button>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Mina saker</h1>
        <button
          onClick={() => navigate('home')}
          style={{ minHeight: 48, padding: '12px 24px', fontSize: '1rem', border: 'none', borderRadius: 12, cursor: 'pointer', background: '#7c3aed', color: '#fff', fontWeight: 'bold' }}
        >
          + Ny skapelse
        </button>
      </div>

      {/* Content */}
      {projects.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginTop: 80 }}>
          <span style={{ fontSize: '5rem' }}>🎨</span>
          <p style={{ fontSize: '1.4rem', color: '#9ca3af', margin: 0 }}>Ingen saker ännu!</p>
          <button
            onClick={() => navigate('home')}
            style={{ minHeight: 56, padding: '14px 40px', fontSize: '1.2rem', border: 'none', borderRadius: 16, cursor: 'pointer', background: '#7c3aed', color: '#fff', fontWeight: 'bold', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}
          >
            Skapa något!
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
