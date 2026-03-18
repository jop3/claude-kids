import React, { useState } from 'react';

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

const DEFAULT_SCENES = [
  { id: 'scen-1', name: 'Scen 1', blockCount: 0 },
];

export default function SceneSystemBlock({ config, onConfigChange }) {
  const [confirmDelete, setConfirmDelete] = useState(null);

  const cfg = {
    scenes: DEFAULT_SCENES,
    currentSceneId: 'scen-1',
    ...config,
  };

  function addScene() {
    const idx = cfg.scenes.length + 1;
    const id = `scen-${Date.now()}`;
    const newScene = { id, name: `Scen ${idx}`, blockCount: 0 };
    onConfigChange({ scenes: [...cfg.scenes, newScene] });
  }

  function updateSceneName(id, name) {
    onConfigChange({
      scenes: cfg.scenes.map(s => s.id === id ? { ...s, name } : s),
    });
  }

  function deleteScene(id) {
    if (cfg.scenes.length <= 1) return;
    const next = cfg.scenes.filter(s => s.id !== id);
    const nextCurrentId = cfg.currentSceneId === id ? next[0].id : cfg.currentSceneId;
    onConfigChange({ scenes: next, currentSceneId: nextCurrentId });
    setConfirmDelete(null);
  }

  function moveUp(index) {
    if (index === 0) return;
    const next = [...cfg.scenes];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onConfigChange({ scenes: next });
  }

  function moveDown(index) {
    if (index === cfg.scenes.length - 1) return;
    const next = [...cfg.scenes];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onConfigChange({ scenes: next });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Scensystem</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Hantera alla scener i din historia</div>

      <div style={label}>SCENER</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cfg.scenes.map((scene, i) => (
          <div key={scene.id} style={{
            background: cfg.currentSceneId === scene.id ? '#0d2744' : '#21262d',
            border: cfg.currentSceneId === scene.id ? '2px solid #58a6ff' : '1px solid #30363d',
            borderRadius: 10, padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ color: '#58a6ff', fontWeight: 700, fontSize: '0.8rem', minWidth: 22 }}>
              {i + 1}
            </span>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={e => updateSceneName(scene.id, e.currentTarget.innerText.trim() || scene.name)}
              onClick={() => onConfigChange({ currentSceneId: scene.id })}
              style={{
                flex: 1, color: '#e6edf3', fontSize: '0.9rem', fontWeight: 600,
                outline: 'none', cursor: 'text',
              }}
            >
              {scene.name}
            </div>
            <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>
              {scene.blockCount > 0 ? `${scene.blockCount} block` : ''}
            </span>
            {cfg.currentSceneId === scene.id && (
              <span style={{ color: '#58a6ff', fontSize: '0.7rem', fontWeight: 700 }}>AKTIV</span>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button onClick={() => moveUp(i)}
                style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.7rem', padding: '1px 4px' }}>
                ▲
              </button>
              <button onClick={() => moveDown(i)}
                style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.7rem', padding: '1px 4px' }}>
                ▼
              </button>
            </div>
            {confirmDelete === scene.id ? (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => deleteScene(scene.id)}
                  style={{ background: '#da3633', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 6, padding: '3px 8px', fontSize: '0.75rem' }}>
                  Ta bort
                </button>
                <button onClick={() => setConfirmDelete(null)}
                  style={{ background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', cursor: 'pointer', borderRadius: 6, padding: '3px 8px', fontSize: '0.75rem' }}>
                  Avbryt
                </button>
              </div>
            ) : (
              cfg.scenes.length > 1 && (
                <button onClick={() => setConfirmDelete(scene.id)}
                  style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '1rem', padding: '2px 6px' }}>
                  x
                </button>
              )
            )}
          </div>
        ))}
      </div>

      <button onClick={addScene}
        style={{
          marginTop: 10, padding: '12px', borderRadius: 10, border: '2px dashed #30363d',
          background: 'transparent', color: '#58a6ff', cursor: 'pointer',
          fontWeight: 700, fontSize: '0.9rem',
        }}>
        + Ny scen
      </button>

      <div style={{
        marginTop: 16, background: '#21262d', border: '1px solid #30363d', borderRadius: 8,
        padding: '10px 12px', fontSize: '0.8rem', color: '#8b949e',
      }}>
        Totalt: <span style={{ color: '#e6edf3', fontWeight: 700 }}>{cfg.scenes.length} scener</span>
      </div>
    </div>
  );
}
