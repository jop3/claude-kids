import React, { useState, useEffect, useRef } from 'react';
import { getProjects, deleteProject } from '../lib/projectStore.js';

const CAT_COLORS = {
  musik: '#6c3bbd',
  spel: '#2d7dd2',
  ritprogram: '#e84855',
  animation: '#f18f01',
  hemsida: '#3bb273',
  filmstudio: '#c33c54',
  kortspel: '#5c6bc0',
  bradspel: '#8d6748',
  larospel: '#00897b',
  rostlab: '#e53935',
};

const CAT_EMOJIS = {
  musik: '🎵',
  spel: '🎮',
  ritprogram: '🎨',
  animation: '🎬',
  hemsida: '🌐',
  filmstudio: '🎥',
  kortspel: '🃏',
  bradspel: '🎲',
  larospel: '📚',
  rostlab: '🎤',
};

function formatSwedishDate(isoString) {
  const months = ['jan', 'feb', 'mars', 'apr', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'];
  const d = new Date(isoString);
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function ProjectCard({ project, navigate, onDeleted }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef(null);
  const color = CAT_COLORS[project.category] || '#374151';
  const emoji = CAT_EMOJIS[project.category] || '🎨';

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  function handleMenuToggle(e) {
    e.stopPropagation();
    setMenuOpen(v => !v);
  }

  function handleEdit(e) {
    e.stopPropagation();
    setMenuOpen(false);
    navigate('wizard', { category: project.category, answers: project.answers });
  }

  function handleDelete(e) {
    e.stopPropagation();
    setMenuOpen(false);
    setConfirmDelete(true);
  }

  function handleConfirmDelete(e) {
    e.stopPropagation();
    deleteProject(project.id);
    onDeleted();
  }

  function handleCancelDelete(e) {
    e.stopPropagation();
    setConfirmDelete(false);
  }

  return (
    <div
      onClick={() => navigate('player', { file: project.file, projectId: project.id })}
      style={{
        background: color,
        borderRadius: 20,
        overflow: 'visible',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        transition: 'transform 0.15s',
        position: 'relative',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 12px 14px',
        gap: 8,
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* Inline delete confirmation overlay */}
      {confirmDelete && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', inset: 0, borderRadius: 20,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 10, zIndex: 10, padding: 12,
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#fff', textAlign: 'center', fontWeight: 700 }}>
            Ta bort?
          </div>
          <button
            onClick={handleConfirmDelete}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 12,
              background: '#e53935', border: 'none',
              color: '#fff', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer',
            }}
          >
            🗑️ Ja, ta bort
          </button>
          <button
            onClick={handleCancelDelete}
            style={{
              width: '100%', padding: '8px 0', borderRadius: 12,
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Avbryt
          </button>
        </div>
      )}

      {/* Thumbnail or emoji */}
      {project.thumb ? (
        <img
          src={project.thumb}
          alt=""
          style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 12, marginBottom: 4 }}
        />
      ) : (
        <div style={{ fontSize: 40, lineHeight: 1 }}>{emoji}</div>
      )}

      {/* Project name */}
      <div style={{
        fontWeight: 800,
        fontSize: '1rem',
        color: '#fff',
        textAlign: 'center',
        width: '100%',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        textOverflow: 'ellipsis',
        lineHeight: 1.25,
        minHeight: '2.5em',
      }}>
        {project.name}
      </div>

      {/* Bottom row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 4,
      }}>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>
          {project.category || 'skapelse'}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>
          {project.date ? formatSwedishDate(project.date) : ''}
        </span>
      </div>

      {/* Menu button */}
      <button
        onClick={handleMenuToggle}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'rgba(0,0,0,0.35)',
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          fontSize: '1rem',
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          lineHeight: 1,
          padding: 0,
        }}
        title="Alternativ"
      >
        ⋮
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: 42,
            right: 8,
            background: '#1a1a2e',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            overflow: 'hidden',
            zIndex: 100,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            minWidth: 140,
          }}
        >
          <button
            onClick={handleEdit}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            ✏️ Ändra
          </button>
          <button
            onClick={handleDelete}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              color: '#ff6b6b',
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            🗑️ Ta bort
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyStuffScreen({ navigate }) {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  function refresh() {
    setProjects(getProjects());
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px 16px',
      }}>
        <button
          onClick={() => navigate('home')}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 12,
            color: '#fff',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          ← Hem
        </button>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
          Mina Saker 📁
        </h1>
        {/* Spacer to center title */}
        <div style={{ width: 100 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '0 24px 32px', boxSizing: 'border-box' }}>
        {projects.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            paddingTop: 80,
          }}>
            <div style={{ fontSize: 72 }}>📭</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', textAlign: 'center' }}>
              Du har inte sparat något än!
            </div>
            <button
              onClick={() => navigate('home')}
              style={{
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #6c3bbd, #ab47bc)',
                border: 'none',
                borderRadius: 16,
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(108,59,189,0.4)',
              }}
            >
              Skapa något!
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
          }}
            className="my-stuff-grid"
          >
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                navigate={navigate}
                onDeleted={refresh}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 600px) {
          .my-stuff-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
