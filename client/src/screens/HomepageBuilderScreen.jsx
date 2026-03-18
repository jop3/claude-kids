import React, { useState, useRef, useEffect } from 'react';
import { saveProject, getProject } from '../lib/projectStore.js';
import { exportHomepage } from '../lib/homepageExport.js';
import { SPRITES } from '../lib/sprites.js';
import OmMigBlock, { AVATAR_SPRITES, ADJECTIVES, NOUNS } from '../blocks/hemsida/OmMigBlock.jsx';
import FotoRitBlock from '../blocks/hemsida/FotoRitBlock.jsx';
import FavoriterBlock from '../blocks/hemsida/FavoriterBlock.jsx';
import MusikPlayerBlock from '../blocks/hemsida/MusikPlayerBlock.jsx';
import Playground from '../components/Playground.jsx';

// --- Theme definitions ---
const THEMES = [
  { id: 'pastel-pink',   label: 'Rosa',    '--hem-bg': '#2a1a2a', '--hem-accent': '#e879a0', '--hem-text': '#ffe4f0' },
  { id: 'ocean-blue',    label: 'Havet',   '--hem-bg': '#0a1628', '--hem-accent': '#3b82f6', '--hem-text': '#e0f2fe' },
  { id: 'forest-green',  label: 'Skogen',  '--hem-bg': '#0a1f0a', '--hem-accent': '#22c55e', '--hem-text': '#dcfce7' },
  { id: 'sunny-yellow',  label: 'Sol',     '--hem-bg': '#1c1400', '--hem-accent': '#fbbf24', '--hem-text': '#fef9c3' },
  { id: 'cosmic-purple', label: 'Rymd',    '--hem-bg': '#0d0a1e', '--hem-accent': '#a855f7', '--hem-text': '#ede9fe' },
  { id: 'candy-red',     label: 'Godis',   '--hem-bg': '#1f0a0a', '--hem-accent': '#ef4444', '--hem-text': '#fee2e2' },
  { id: 'mint',          label: 'Mynt',    '--hem-bg': '#0a1e1e', '--hem-accent': '#14b8a6', '--hem-text': '#ccfbf1' },
  { id: 'sunset-orange', label: 'Solnedg', '--hem-bg': '#1e0e00', '--hem-accent': '#f97316', '--hem-text': '#ffedd5' },
];

// --- Block type definitions ---
const BLOCK_TYPES = [
  { type: 'om-mig',       name: 'Om Mig',        emoji: '🙋',  desc: 'Avatar och namn' },
  { type: 'foto-rit',     name: 'Rita / Bild',   emoji: '🎨',  desc: 'Teckning eller bild' },
  { type: 'favoriter',    name: 'Favoriter',     emoji: '⭐',  desc: 'Dina favoritgrejer' },
  { type: 'musik-player', name: 'Musik',         emoji: '🎵',  desc: 'Länka musikprojekt' },
];

function genId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// --- Mini live preview renderer ---
function HomepagePreview({ sections, theme }) {
  const bg = theme['--hem-bg'] || '#1a1a2e';
  const accent = theme['--hem-accent'] || '#6c3bbd';
  const text = theme['--hem-text'] || '#ffffff';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: bg,
      overflowY: 'auto',
      padding: '12px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Header */}
      <div style={{
        background: `${accent}22`,
        border: `1px solid ${accent}44`,
        borderRadius: 14,
        padding: '12px 14px',
        textAlign: 'center',
      }}>
        <div style={{ color: text, fontWeight: 900, fontSize: '1rem' }}>Min Hemsida 🏠</div>
        <div style={{ color: accent, fontSize: '0.7rem', marginTop: 2 }}>ClaudeKids</div>
      </div>

      {sections.length === 0 && (
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', textAlign: 'center', padding: '20px 0' }}>
          Tryck + för att lägga till block
        </div>
      )}

      {sections.map(sec => (
        <PreviewSection key={sec.id} sec={sec} accent={accent} text={text} />
      ))}
    </div>
  );
}

function PreviewSection({ sec, accent, text }) {
  const { type, config = {} } = sec;

  const titleStyle = {
    fontSize: '0.6rem',
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: accent,
    marginBottom: 6,
  };

  const wrapStyle = {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: '10px 12px',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  if (type === 'om-mig') {
    const allAvatars = SPRITES.filter(s => s.category === 'Människor' || s.category === 'Monster');
    const sprite = allAvatars[(config.spriteIdx ?? 0) % allAvatars.length];
    const adj = ADJECTIVES[config.adjIdx ?? 0] || '';
    const noun = NOUNS[config.nounIdx ?? 0] || '';
    return (
      <div style={wrapStyle}>
        <div style={titleStyle}>Om Mig</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 44,
            background: `linear-gradient(135deg, ${accent}, #2d7dd2)`,
            borderRadius: 10,
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src={sprite.dataUrl} alt="" style={{ width: 38, height: 38 }} />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>{adj}</div>
            <div style={{ color: text, fontWeight: 700, fontSize: '0.75rem', opacity: 0.8 }}>{noun}</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'foto-rit') {
    const mode = config.mode || 'rita';
    const hasContent = (mode === 'rita' && config.canvasData) || (mode === 'bild' && config.sprite);
    return (
      <div style={wrapStyle}>
        <div style={titleStyle}>Foto / Ritning</div>
        {mode === 'rita' && config.canvasData && (
          <img src={config.canvasData} alt="ritning" style={{ width: '100%', borderRadius: 6, maxHeight: 80, objectFit: 'contain' }} />
        )}
        {mode === 'bild' && config.sprite && (() => {
          const sp = SPRITES.find(s => s.id === config.sprite);
          return sp ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={sp.dataUrl} alt={sp.name} style={{ width: 48, height: 48 }} />
            </div>
          ) : null;
        })()}
        {!hasContent && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>Inget valt än</div>
        )}
      </div>
    );
  }

  if (type === 'favoriter') {
    const picks = config.picks || [];
    return (
      <div style={wrapStyle}>
        <div style={titleStyle}>Favoriter</div>
        {picks.length === 0
          ? <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>Inga valda</div>
          : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {picks.map((e, i) => (
                <span key={i} style={{ fontSize: '1.2rem' }}>{e}</span>
              ))}
            </div>
        }
      </div>
    );
  }

  if (type === 'musik-player') {
    return (
      <div style={wrapStyle}>
        <div style={titleStyle}>Musik</div>
        {config.projektNamn
          ? <div style={{ color: text, fontWeight: 700, fontSize: '0.8rem' }}>🎵 {config.projektNamn}</div>
          : <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>Inget valt</div>
        }
      </div>
    );
  }

  return null;
}

// --- Block picker modal ---
function BlockPickerModal({ onPick, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: 20,
          padding: 20,
          width: '100%',
          maxWidth: 360,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontWeight: 700, color: '#e6edf3', fontSize: '1.1rem', marginBottom: 16, textAlign: 'center' }}>
          Välj block
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {BLOCK_TYPES.map(bt => (
            <button
              key={bt.type}
              onClick={() => onPick(bt)}
              style={{
                background: '#21262d',
                border: '2px solid #30363d',
                borderRadius: 14,
                padding: '16px 10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                minHeight: 80,
              }}
            >
              <span style={{ fontSize: '2rem' }}>{bt.emoji}</span>
              <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: '0.85rem' }}>{bt.name}</span>
              <span style={{ color: '#6e7681', fontSize: '0.7rem' }}>{bt.desc}</span>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '12px',
            borderRadius: 12,
            border: 'none',
            background: '#21262d',
            color: '#8b949e',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}

// --- Main screen ---
export default function HomepageBuilderScreen({ navigate, category, projectId: initProjectId, name: initName }) {
  const [sections, setSections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [themeId, setThemeId] = useState('cosmic-purple');
  const [showPicker, setShowPicker] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [projectId, setProjectId] = useState(initProjectId || null);
  const [projectName, setProjectName] = useState(initName || 'Min Hemsida');
  const [toast, setToast] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const toastRef = useRef(null);
  const nameRef = useRef(null);

  const theme = THEMES.find(t => t.id === themeId) || THEMES[4];

  // Load existing project
  useEffect(() => {
    if (initProjectId) {
      const proj = getProject(initProjectId);
      if (proj) {
        setProjectName(proj.name || 'Min Hemsida');
        setProjectId(proj.id);
        if (Array.isArray(proj.sections)) setSections(proj.sections);
        if (proj.themeId) setThemeId(proj.themeId);
      }
    }
  }, [initProjectId]);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2000);
  }

  function addBlock(bt) {
    const sec = { id: genId(), type: bt.type, config: {} };
    setSections(prev => [...prev, sec]);
    setSelectedId(sec.id);
    setShowPicker(false);
  }

  function removeSection(id) {
    setSections(prev => prev.filter(s => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function updateConfig(id, newCfg) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, config: { ...s.config, ...newCfg } } : s));
  }

  function handleSave() {
    const name = nameRef.current ? nameRef.current.innerText.trim() : projectName;
    const now = new Date().toISOString();
    const id = projectId || genId();
    const proj = {
      id,
      version: '1.0',
      type: 'hemsida',
      name,
      theme: 'default',
      colorPalette: [],
      thumbnail: null,
      created: now,
      modified: now,
      blocks: sections.map(s => ({ id: s.id, name: s.type, emoji: BLOCK_TYPES.find(b => b.type === s.type)?.emoji || '🏠', type: s.type, config: s.config })),
      sections,
      themeId,
      playgroundState: {},
    };
    saveProject(proj);
    setProjectId(id);
    setProjectName(name);
    showToast('Sparat!');
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 2000);
  }

  function handleExport() {
    exportHomepage(sections, theme);
    showToast('Nedladdat!');
  }

  // Drag reorder
  function onDragStart(idx) {
    setDragIdx(idx);
  }

  function onDragEnter(idx) {
    if (dragIdx === null || dragIdx === idx) return;
    setDragOverIdx(idx);
  }

  function onDragEnd() {
    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      setSections(prev => {
        const next = [...prev];
        const [moved] = next.splice(dragIdx, 1);
        next.splice(dragOverIdx, 0, moved);
        return next;
      });
    }
    setDragIdx(null);
    setDragOverIdx(null);
  }

  const selectedSection = sections.find(s => s.id === selectedId);
  const accent = theme['--hem-accent'];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      width: '100vw', height: '100vh',
      overflow: 'hidden', background: '#0d1117', position: 'relative',
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#238636', color: '#fff', padding: '10px 24px',
          borderRadius: 24, fontWeight: 700, fontSize: '1rem',
          zIndex: 9999, pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px', height: 56,
        background: '#161b22', borderBottom: '1px solid #30363d',
        flexShrink: 0, gap: 8,
      }}>
        <button
          onClick={() => navigate('home')}
          style={{
            background: 'none', border: 'none', color: '#c9d1d9',
            fontSize: '1.4rem', cursor: 'pointer',
            padding: '8px 12px', borderRadius: 8,
            minWidth: 48, minHeight: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
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
            flex: 1, textAlign: 'center', fontSize: '1rem', fontWeight: 700,
            color: '#e6edf3', outline: 'none', borderBottom: '1px dashed #444',
            padding: '2px 4px', cursor: 'text', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {projectName}
        </span>
        <button
          onClick={handleSave}
          style={{
            background: '#238636', border: 'none', color: '#fff',
            fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            padding: '8px 14px', borderRadius: 8, minHeight: 40, whiteSpace: 'nowrap',
          }}
        >
          💾 Spara
        </button>
      </div>

      {/* Main area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: window.innerWidth > 768 ? 'row' : 'column',
        overflow: 'hidden', minHeight: 0,
      }}>
        {/* Left: section list + config */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          background: '#161b22',
          width: window.innerWidth > 768 ? '55%' : '100%',
          height: window.innerWidth > 768 ? '100%' : '55%',
          flexShrink: 0,
          overflow: 'hidden',
          borderRight: window.innerWidth > 768 ? '1px solid #30363d' : 'none',
          borderBottom: window.innerWidth <= 768 ? '1px solid #30363d' : 'none',
        }}>
          {/* Theme strip */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #30363d', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' }}>
                TEMA
              </span>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', flex: 1, paddingBottom: 2 }}>
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    style={{
                      width: 28, height: 28,
                      borderRadius: '50%',
                      background: t['--hem-accent'],
                      border: themeId === t.id ? '3px solid #fff' : '2px solid #30363d',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'transform 0.1s',
                      transform: themeId === t.id ? 'scale(1.2)' : 'scale(1)',
                    }}
                    title={t.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sections list */}
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sections.length === 0 && (
              <div style={{ color: '#6e7681', textAlign: 'center', padding: '20px 0', fontSize: '0.85rem' }}>
                Tryck på + för att lägga till block!
              </div>
            )}
            {sections.map((sec, idx) => {
              const bt = BLOCK_TYPES.find(b => b.type === sec.type) || { emoji: '?', name: sec.type };
              const isDragging = dragIdx === idx;
              const isDragOver = dragOverIdx === idx;
              return (
                <div
                  key={sec.id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragEnter={() => onDragEnter(idx)}
                  onDragEnd={onDragEnd}
                  onClick={() => setSelectedId(selectedId === sec.id ? null : sec.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', borderRadius: 10,
                    background: selectedId === sec.id ? '#0d2744' : '#21262d',
                    border: isDragOver ? `2px solid ${accent}` : (selectedId === sec.id ? `2px solid ${accent}` : '2px solid #30363d'),
                    cursor: 'pointer',
                    opacity: isDragging ? 0.4 : 1,
                    transition: 'opacity 0.1s',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ color: '#6e7681', fontSize: '0.9rem', cursor: 'grab', flexShrink: 0, paddingRight: 4 }}>☰</span>
                  <span style={{ fontSize: '1.3rem' }}>{bt.emoji}</span>
                  <span style={{ flex: 1, color: '#e6edf3', fontWeight: 600, fontSize: '0.9rem' }}>{bt.name}</span>
                  <button
                    onClick={e => { e.stopPropagation(); removeSection(sec.id); }}
                    style={{
                      background: 'none', border: 'none', color: '#6e7681',
                      fontSize: '1.1rem', cursor: 'pointer', padding: '2px 6px',
                      borderRadius: 4, lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* Config panel for selected */}
          {selectedSection && (
            <div style={{
              borderTop: '1px solid #30363d',
              padding: '12px',
              overflow: 'auto',
              maxHeight: '45%',
              flexShrink: 0,
            }}>
              {selectedSection.type === 'om-mig' && (
                <OmMigBlock config={selectedSection.config} onConfigChange={cfg => updateConfig(selectedSection.id, cfg)} />
              )}
              {selectedSection.type === 'foto-rit' && (
                <FotoRitBlock config={selectedSection.config} onConfigChange={cfg => updateConfig(selectedSection.id, cfg)} />
              )}
              {selectedSection.type === 'favoriter' && (
                <FavoriterBlock config={selectedSection.config} onConfigChange={cfg => updateConfig(selectedSection.id, cfg)} />
              )}
              {selectedSection.type === 'musik-player' && (
                <MusikPlayerBlock config={selectedSection.config} onConfigChange={cfg => updateConfig(selectedSection.id, cfg)} />
              )}
            </div>
          )}

          {/* Bottom action bar */}
          <div style={{
            borderTop: '1px solid #30363d',
            padding: '10px 12px',
            display: 'flex', gap: 8, flexShrink: 0,
          }}>
            <button
              onClick={() => setShowPicker(true)}
              style={{
                flex: 1,
                background: accent,
                border: 'none', color: '#fff',
                fontWeight: 900, fontSize: '1.1rem',
                borderRadius: 14, padding: '14px 8px',
                cursor: 'pointer', minHeight: 52,
              }}
            >
              + Block
            </button>
            <button
              onClick={handleExport}
              style={{
                flex: 1,
                background: '#21262d',
                border: '2px solid #30363d',
                color: '#e6edf3',
                fontWeight: 700, fontSize: '0.9rem',
                borderRadius: 14, padding: '14px 8px',
                cursor: 'pointer', minHeight: 52,
              }}
            >
              ⬇️ Exportera
            </button>
          </div>
        </div>

        {/* Right: preview */}
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', minHeight: 0,
          background: '#0d1117',
        }}>
          {/* Playground scene */}
          <div style={{
            height: '35%', flexShrink: 0, position: 'relative', overflow: 'hidden',
          }}>
            <Playground
              category="hemsida"
              addedBlocks={sections}
              celebrate={celebrate}
            />
          </div>
          {/* Live homepage preview */}
          <div style={{ flex: 1, overflow: 'hidden', borderTop: '1px solid #30363d' }}>
            <HomepagePreview sections={sections} theme={theme} />
          </div>
        </div>
      </div>

      {showPicker && <BlockPickerModal onPick={addBlock} onClose={() => setShowPicker(false)} />}
    </div>
  );
}
