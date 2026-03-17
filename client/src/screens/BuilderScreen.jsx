import React, { useState, useEffect, useRef } from 'react';
import { getProject, saveProject, exportProject } from '../lib/projectStore.js';

const CATEGORY_EMOJI = {
  musik: '🎵',
  spel: '🎮',
  konst: '🎨',
  animation: '✨',
  berattelse: '📖',
};

const DUMMY_BLOCKS = [
  { id: 'color', name: 'Färg', emoji: '🎨' },
  { id: 'text', name: 'Text', emoji: '📝' },
  { id: 'shape', name: 'Form', emoji: '🔷' },
];

function useIsLandscape() {
  const [isLandscape, setIsLandscape] = useState(window.innerWidth > 768);
  useEffect(() => {
    function handleResize() {
      setIsLandscape(window.innerWidth > 768);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isLandscape;
}

export default function BuilderScreen({ navigate, category, projectId: initialProjectId }) {
  const isLandscape = useIsLandscape();
  const [projectName, setProjectName] = useState('Mitt projekt');
  const [addedBlocks, setAddedBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(initialProjectId || null);
  const [toast, setToast] = useState(null);
  const nameRef = useRef(null);
  const toastTimerRef = useRef(null);

  const cat = category || 'musik';
  const catEmoji = CATEGORY_EMOJI[cat] || '🎵';

  useEffect(() => {
    if (initialProjectId) {
      const proj = getProject(initialProjectId);
      if (proj) {
        setProjectName(proj.name || 'Mitt projekt');
        setCurrentProjectId(proj.id);
        if (Array.isArray(proj.blocks)) {
          const mapped = proj.blocks.map(b =>
            DUMMY_BLOCKS.find(d => d.id === b.id) || b
          );
          setAddedBlocks(mapped);
        }
      }
    }
  }, [initialProjectId]);

  function showToast(msg) {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  }

  function buildProject(name, id) {
    const now = new Date().toISOString();
    const existing = id ? getProject(id) : null;
    return {
      id: id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)),
      version: '1.0',
      type: cat,
      name,
      theme: 'default',
      colorPalette: [],
      thumbnail: null,
      created: existing?.created || now,
      modified: now,
      blocks: addedBlocks.map(b => ({ id: b.id, name: b.name, emoji: b.emoji })),
      playgroundState: {},
    };
  }

  function handleSave() {
    const name = nameRef.current ? nameRef.current.innerText.trim() : projectName;
    const project = buildProject(name, currentProjectId);
    saveProject(project);
    setCurrentProjectId(project.id);
    showToast('✅ Sparat!');
    return project;
  }

  function handleDela() {
    if (!currentProjectId) {
      showToast('Spara först!');
      return;
    }
    exportProject(currentProjectId);
  }

  function handleSpela() {
    const project = handleSave();
    navigate('play', { projectId: project.id });
  }

  function handleBlockChipClick(block) {
    if (!addedBlocks.find(b => b.id === block.id)) {
      setAddedBlocks(prev => [...prev, block]);
    }
    setSelectedBlock(block);
  }

  const topBar = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      height: 56,
      background: '#161b22',
      borderBottom: '1px solid #30363d',
      flexShrink: 0,
      gap: 12,
    }}>
      <button
        onClick={() => navigate('home')}
        style={{
          background: 'none',
          border: 'none',
          color: '#c9d1d9',
          fontSize: '1.4rem',
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: 8,
          minWidth: 48,
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ←
      </button>
      <span
        ref={nameRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => setProjectName(e.currentTarget.innerText.trim())}
        style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '1rem',
          fontWeight: 700,
          color: '#e6edf3',
          outline: 'none',
          borderBottom: '1px dashed #444',
          padding: '2px 4px',
          cursor: 'text',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {projectName}
      </span>
      <button
        onClick={handleSave}
        style={{
          background: '#238636',
          border: 'none',
          color: '#fff',
          fontSize: '0.9rem',
          fontWeight: 700,
          cursor: 'pointer',
          padding: '8px 16px',
          borderRadius: 8,
          minHeight: 40,
          whiteSpace: 'nowrap',
        }}
      >
        💾 Spara
      </button>
    </div>
  );

  const previewArea = (
    <div style={{
      flex: 1,
      background: '#0d1117',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      minHeight: 0,
    }}>
      <div style={{ fontSize: '4rem' }}>{catEmoji}</div>
      <div style={{ color: '#8b949e', fontSize: '1rem', letterSpacing: 1 }}>Förhandsgranskning</div>
    </div>
  );

  const sidePanel = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#161b22',
      borderLeft: isLandscape ? '1px solid #30363d' : 'none',
      borderTop: isLandscape ? 'none' : '1px solid #30363d',
      overflow: 'hidden',
      flexShrink: 0,
      width: isLandscape ? '40%' : '100%',
      height: isLandscape ? '100%' : '55%',
    }}>
      {/* Block tray */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #30363d',
        flexShrink: 0,
      }}>
        <div style={{ color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>
          Lägg till block +
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
        }}>
          {DUMMY_BLOCKS.map(block => (
            <button
              key={block.id}
              onClick={() => handleBlockChipClick(block)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 999,
                border: selectedBlock?.id === block.id ? '2px solid #58a6ff' : '2px solid #30363d',
                background: selectedBlock?.id === block.id ? '#0d2744' : '#21262d',
                color: '#e6edf3',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                minHeight: 40,
              }}
            >
              <span>{block.emoji}</span>
              <span>{block.name}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Config panel */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}>
        {selectedBlock ? (
          <>
            <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
              {selectedBlock.emoji} {selectedBlock.name}
            </div>
            <div style={{ color: '#8b949e', fontSize: '0.85rem' }}>
              Inget att konfigurera ännu
            </div>
          </>
        ) : (
          <div style={{ color: '#8b949e', fontSize: '0.9rem', marginTop: 8 }}>
            Välj ett block
          </div>
        )}
      </div>
    </div>
  );

  const bottomBar = (
    <div style={{
      display: 'flex',
      gap: 12,
      padding: '12px 16px',
      background: '#161b22',
      borderTop: '1px solid #30363d',
      flexShrink: 0,
    }}>
      <button
        onClick={handleSpela}
        style={{
          flex: 1,
          padding: '14px',
          fontSize: '1rem',
          fontWeight: 700,
          borderRadius: 12,
          border: 'none',
          background: '#1f6feb',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        ▶ Spela
      </button>
      <button
        onClick={handleDela}
        style={{
          flex: 1,
          padding: '14px',
          fontSize: '1rem',
          fontWeight: 700,
          borderRadius: 12,
          border: 'none',
          background: currentProjectId ? '#388bfd' : '#30363d',
          color: currentProjectId ? '#fff' : '#6e7681',
          cursor: 'pointer',
        }}
      >
        📤 Dela
      </button>
    </div>
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#0d1117',
      position: 'relative',
    }}>
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#238636',
          color: '#fff',
          padding: '10px 24px',
          borderRadius: 24,
          fontWeight: 700,
          fontSize: '1rem',
          zIndex: 9999,
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}
      {topBar}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: isLandscape ? 'row' : 'column',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: isLandscape ? '100%' : '45%',
          flexShrink: isLandscape ? 1 : 0,
        }}>
          {previewArea}
        </div>
        {sidePanel}
      </div>
      {bottomBar}
    </div>
  );
}
