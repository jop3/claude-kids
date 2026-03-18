import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BACKGROUNDS } from '../../lib/backgrounds.js';
import { SPRITES } from '../../lib/sprites.js';
import { TRANSITIONS, TRANSITION_LIST } from '../../lib/panelTransitions.js';

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

const MINI_BGS = BACKGROUNDS.slice(0, 6);
const MINI_SPRITES = SPRITES.slice(0, 12);

const BUBBLE_STYLES = [
  { id: 'round',   label: 'Pratbubbla' },
  { id: 'thought', label: 'Tankebubbla' },
  { id: 'shout',   label: 'Rop' },
];

function makePanel(id) {
  return {
    id,
    background: null,
    characters: [],
    speech: null,
    drawData: null,
    transition: 'cut',
  };
}

// Renders a single comic panel to a canvas 200x150
function PanelCanvas({ panel, width = 200, height = 150 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    const bg = BACKGROUNDS.find(b => b.id === panel.background);
    if (bg) {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      // Parse gradient stops from CSS string (simple approach: use accent/ground colors)
      ctx.fillStyle = bg.groundColor || '#222';
      ctx.fillRect(0, 0, width, height);
      const g2 = ctx.createLinearGradient(0, 0, 0, height * 0.7);
      g2.addColorStop(0, bg.gradient.includes('#') ? bg.gradient.match(/#[0-9a-fA-F]{6}/g)?.[0] || '#111' : '#111');
      g2.addColorStop(1, bg.gradient.includes('#') ? bg.gradient.match(/#[0-9a-fA-F]{6}/g)?.[1] || '#333' : '#333');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height * 0.7);
    } else {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#2d2d5a';
      ctx.fillRect(0, 0, width, height * 0.7);
    }

    // Characters
    const positions = { left: width * 0.2, center: width * 0.5, right: width * 0.8 };
    (panel.characters || []).forEach(ch => {
      const sprite = SPRITES.find(s => s.id === ch.spriteId);
      if (!sprite) return;
      const img = new Image();
      img.onload = () => {
        const scale = (ch.scale || 1.0);
        const sw = Math.round(60 * scale);
        const sh = Math.round(60 * scale);
        const cx = positions[ch.slot] || width * 0.5;
        const sy = height * 0.55;
        ctx.save();
        if (ch.flip) {
          ctx.translate(cx + sw / 2, sy);
          ctx.scale(-1, 1);
          ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
        } else {
          ctx.drawImage(img, cx - sw / 2, sy - sh / 2, sw, sh);
        }
        ctx.restore();
        // Re-draw speech after image loads
        drawSpeech(ctx, panel, width, height);
      };
      img.src = sprite.dataUrl;
    });

    // Speech bubble (drawn immediately for text layout)
    drawSpeech(ctx, panel, width, height);

    // Panel border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel]);

  return <canvas ref={ref} style={{ display: 'block', borderRadius: 4, overflow: 'hidden' }} />;
}

function drawSpeech(ctx, panel, width, height) {
  const sp = panel.speech;
  if (!sp || !sp.text) return;
  const bx = 16, by = sp.position === 'bottom' ? height * 0.6 : 8;
  const bw = width - 32, bh = 36;
  ctx.save();
  ctx.fillStyle = sp.style === 'shout' ? '#fff3cd' : sp.style === 'thought' ? '#e8f4ff' : '#fff';
  ctx.strokeStyle = sp.style === 'shout' ? '#ffd700' : sp.style === 'thought' ? '#58a6ff' : '#333';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#111';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((sp.text || '').slice(0, 40), bx + bw / 2, by + bh / 2);
  ctx.restore();
}

// Thumbnail (80x60)
function Thumbnail({ panel, active, onClick, onDelete }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        onClick={onClick}
        style={{
          width: 80, height: 60, borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
          border: active ? '2px solid #58a6ff' : '2px solid #30363d',
          background: '#21262d',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <PanelCanvas panel={panel} width={80} height={60} />
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        style={{
          position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%',
          background: '#da3633', border: 'none', color: '#fff', fontSize: '0.7rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1, padding: 0,
        }}
      >x</button>
    </div>
  );
}

// Full-screen story player
function StoryPlayer({ panels, onClose }) {
  const [current, setCurrent] = useState(0);
  const [transProgress, setTransProgress] = useState(1);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const mainRef = useRef(null);
  const timerRef = useRef(null);

  const advance = useCallback(() => {
    if (current < panels.length - 1) {
      setCurrent(c => c + 1);
      setTransProgress(0);
    } else {
      onClose();
    }
  }, [current, panels.length, onClose]);

  // Auto-advance every 3s
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(advance, 3000);
    return () => clearTimeout(timerRef.current);
  }, [current, advance]);

  // Animate transition
  useEffect(() => {
    if (transProgress >= 1) return;
    let raf;
    const start = performance.now();
    const dur = 600;
    function step(now) {
      const p = Math.min(1, (now - start) / dur);
      setTransProgress(p);
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [current, transProgress]);

  // Draw composite transition on main canvas
  useEffect(() => {
    const mc = mainRef.current;
    if (!mc) return;
    const ctx = mc.getContext('2d');
    const W = mc.width, H = mc.height;
    const from = fromRef.current;
    const to = toRef.current;
    if (!from || !to) return;

    const transId = panels[current]?.transition || 'cut';
    const fn = TRANSITIONS[transId] || TRANSITIONS.cut;
    ctx.clearRect(0, 0, W, H);
    fn(ctx, from, to, transProgress, W, H);
  }, [transProgress, current, panels]);

  const W = 640, H = 480;
  const prev = panels[current - 1] || panels[current];
  const cur = panels[current];

  return (
    <div
      onClick={advance}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {/* Hidden offscreen renders */}
      <div style={{ position: 'absolute', left: -9999, top: -9999 }}>
        <PanelCanvas panel={prev} width={W} height={H} key={`from-${current}`} />
        <PanelCanvas panel={cur} width={W} height={H} key={`to-${current}`} />
      </div>
      {/* We render panels directly on the main canvas via an effect — simplify: just show PanelCanvas */}
      <div style={{ position: 'relative', width: W, height: H, maxWidth: '90vw', maxHeight: '80vh' }}>
        <PanelCanvas panel={cur} width={W} height={H} />
        <div style={{
          position: 'absolute', bottom: 16, right: 16,
          color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem',
        }}>
          {current + 1} / {panels.length} — tryck for att ga vidare
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onClose(); }}
        style={{
          marginTop: 16, background: '#21262d', border: '1px solid #30363d',
          color: '#e6edf3', padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
          fontSize: '0.9rem', fontWeight: 700,
        }}
      >
        Stang
      </button>
    </div>
  );
}

export default function FilmstudioBlock({ config, onConfigChange }) {
  const cfg = {
    panels: [makePanel('p1')],
    activePanel: 0,
    ...config,
  };

  const panels = cfg.panels.length > 0 ? cfg.panels : [makePanel('p1')];
  const activeIdx = Math.min(cfg.activePanel || 0, panels.length - 1);
  const panel = panels[activeIdx];

  const [showTransPicker, setShowTransPicker] = useState(null); // index between panels
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showSpritePicker, setShowSpritePicker] = useState(null); // slot name
  const [showSpeechEditor, setShowSpeechEditor] = useState(false);
  const [playing, setPlaying] = useState(false);

  function update(updates) {
    const newPanels = panels.map((p, i) => i === activeIdx ? { ...p, ...updates } : p);
    onConfigChange({ panels: newPanels, activePanel: activeIdx });
  }

  function addPanel() {
    if (panels.length >= 8) return;
    const id = 'p' + Date.now();
    const newPanels = [...panels, makePanel(id)];
    onConfigChange({ panels: newPanels, activePanel: newPanels.length - 1 });
  }

  function deletePanel(idx) {
    if (panels.length <= 1) return;
    const newPanels = panels.filter((_, i) => i !== idx);
    const newActive = Math.min(activeIdx, newPanels.length - 1);
    onConfigChange({ panels: newPanels, activePanel: newActive });
  }

  function movePanel(idx, dir) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= panels.length) return;
    const newPanels = [...panels];
    [newPanels[idx], newPanels[newIdx]] = [newPanels[newIdx], newPanels[idx]];
    onConfigChange({ panels: newPanels, activePanel: newIdx });
  }

  function selectBg(bgId) {
    update({ background: bgId });
    setShowBgPicker(false);
  }

  function addCharacter(slot, spriteId) {
    const existing = panel.characters.filter(c => c.slot !== slot);
    const newChars = [...existing, { slot, spriteId, flip: false, scale: 1.0 }];
    update({ characters: newChars });
    setShowSpritePicker(null);
  }

  function removeCharacter(slot) {
    update({ characters: panel.characters.filter(c => c.slot !== slot) });
  }

  function flipCharacter(slot) {
    const newChars = panel.characters.map(c =>
      c.slot === slot ? { ...c, flip: !c.flip } : c
    );
    update({ characters: newChars });
  }

  function scaleCharacter(slot, scale) {
    const newChars = panel.characters.map(c =>
      c.slot === slot ? { ...c, scale } : c
    );
    update({ characters: newChars });
  }

  function setTransition(idx, transId) {
    const newPanels = panels.map((p, i) => i === idx ? { ...p, transition: transId } : p);
    onConfigChange({ panels: newPanels, activePanel: activeIdx });
    setShowTransPicker(null);
  }

  const SLOTS = ['left', 'center', 'right'];
  const slotLabels = { left: 'Vanster', center: 'Mitten', right: 'Hoger' };

  const bg = BACKGROUNDS.find(b => b.id === panel.background);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Filmstudio</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>Skapa seriepaneler och beraettelser</div>

      {/* Panel strip */}
      <div style={label}>PANELER</div>
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, alignItems: 'center',
        paddingTop: 4,
      }}>
        {panels.map((p, i) => (
          <React.Fragment key={p.id}>
            <Thumbnail
              panel={p}
              active={i === activeIdx}
              onClick={() => onConfigChange({ panels, activePanel: i })}
              onDelete={() => deletePanel(i)}
            />
            {i < panels.length - 1 && (
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setShowTransPicker(showTransPicker === i ? null : i)}
                  title="Overgaang"
                  style={{
                    background: '#21262d', border: '1px solid #30363d', color: '#8b949e',
                    borderRadius: 6, width: 28, height: 28, cursor: 'pointer',
                    fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {TRANSITION_LIST.find(t => t.id === (panels[i + 1]?.transition || 'cut'))?.emoji || '\u2702'}
                </button>
                {showTransPicker === i && (
                  <div style={{
                    position: 'absolute', top: 32, left: -60, background: '#161b22',
                    border: '1px solid #30363d', borderRadius: 8, padding: 8, zIndex: 100,
                    display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140,
                  }}>
                    {TRANSITION_LIST.map(tr => (
                      <button
                        key={tr.id}
                        onClick={() => setTransition(i + 1, tr.id)}
                        style={{
                          background: (panels[i + 1]?.transition || 'cut') === tr.id ? '#0d2744' : 'none',
                          border: 'none', color: '#e6edf3', cursor: 'pointer', borderRadius: 6,
                          padding: '6px 10px', textAlign: 'left', fontSize: '0.85rem',
                          display: 'flex', gap: 8, alignItems: 'center',
                        }}
                      >
                        <span>{tr.emoji}</span><span>{tr.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
        {panels.length < 8 && (
          <button
            onClick={addPanel}
            style={{
              flexShrink: 0, width: 80, height: 60, borderRadius: 4,
              border: '2px dashed #30363d', background: 'none', color: '#58a6ff',
              cursor: 'pointer', fontSize: '1.5rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >+</button>
        )}
      </div>

      {/* Reorder */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <button onClick={() => movePanel(activeIdx, -1)} disabled={activeIdx === 0}
          style={{ flex: 1, padding: '6px', borderRadius: 8, border: '1px solid #30363d', background: '#21262d', color: '#e6edf3', cursor: 'pointer', fontSize: '0.85rem' }}>
          Flytta vänster
        </button>
        <button onClick={() => movePanel(activeIdx, 1)} disabled={activeIdx === panels.length - 1}
          style={{ flex: 1, padding: '6px', borderRadius: 8, border: '1px solid #30363d', background: '#21262d', color: '#e6edf3', cursor: 'pointer', fontSize: '0.85rem' }}>
          Flytta höger
        </button>
      </div>

      {/* Panel editor */}
      <div style={{ background: '#0d1117', borderRadius: 8, padding: 12, border: '1px solid #30363d' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          {/* Preview */}
          <div style={{ flexShrink: 0 }}>
            <PanelCanvas panel={panel} width={200} height={150} />
          </div>
          {/* Controls */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Background */}
            <button
              onClick={() => setShowBgPicker(!showBgPicker)}
              style={{
                background: '#21262d', border: '1px solid #30363d', color: '#e6edf3',
                padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem',
                textAlign: 'left', fontWeight: 600,
              }}
            >
              {bg ? `${bg.emoji} ${bg.name}` : 'Valj bakgrund'}
            </button>

            {showBgPicker && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {MINI_BGS.map(b => (
                  <button key={b.id} onClick={() => selectBg(b.id)}
                    style={{
                      padding: '6px 10px', borderRadius: 8, border: panel.background === b.id ? '2px solid #58a6ff' : '1px solid #30363d',
                      background: panel.background === b.id ? '#0d2744' : '#21262d',
                      color: '#e6edf3', cursor: 'pointer', fontSize: '0.8rem',
                    }}>
                    {b.emoji} {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Character slots */}
        <div style={{ ...label, marginTop: 12 }}>FIGURER</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SLOTS.map(slot => {
            const ch = panel.characters.find(c => c.slot === slot);
            const sp = ch ? SPRITES.find(s => s.id === ch.spriteId) : null;
            return (
              <div key={slot} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ color: '#8b949e', fontSize: '0.75rem', textAlign: 'center' }}>{slotLabels[slot]}</div>
                {sp ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                    <img src={sp.dataUrl} alt={sp.name} style={{ width: 40, height: 40 }} />
                    <div style={{ fontSize: '0.7rem', color: '#e6edf3', textAlign: 'center' }}>{sp.name}</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => flipCharacter(slot)}
                        style={{ padding: '3px 7px', borderRadius: 6, border: '1px solid #30363d', background: '#21262d', color: '#e6edf3', cursor: 'pointer', fontSize: '0.75rem' }}>
                        Spegla
                      </button>
                      <button onClick={() => removeCharacter(slot)}
                        style={{ padding: '3px 7px', borderRadius: 6, border: 'none', background: '#da3633', color: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}>
                        Ta bort
                      </button>
                    </div>
                    <input
                      type="range" min={50} max={150} value={Math.round((ch.scale || 1) * 100)}
                      onChange={e => scaleCharacter(slot, e.target.value / 100)}
                      style={{ width: '100%' }}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSpritePicker(showSpritePicker === slot ? null : slot)}
                    style={{
                      padding: '8px 4px', borderRadius: 8, border: '1px dashed #30363d',
                      background: 'none', color: '#58a6ff', cursor: 'pointer', fontSize: '0.8rem',
                    }}
                  >+ Lagg till</button>
                )}
              </div>
            );
          })}
        </div>

        {showSpritePicker && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {MINI_SPRITES.map(s => (
              <button key={s.id} onClick={() => addCharacter(showSpritePicker, s.id)}
                style={{
                  padding: '4px 8px', borderRadius: 8, border: '1px solid #30363d',
                  background: '#21262d', color: '#e6edf3', cursor: 'pointer', fontSize: '0.75rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                <img src={s.dataUrl} alt={s.name} style={{ width: 28, height: 28 }} />
                <span>{s.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Speech bubble */}
        <div style={{ ...label, marginTop: 12 }}>PRATBUBBLA</div>
        {panel.speech ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={e => update({ speech: { ...panel.speech, text: e.currentTarget.innerText.trim() || panel.speech.text } })}
              style={{
                background: '#21262d', border: '1px solid #30363d', borderRadius: 8,
                padding: '8px 12px', color: '#e6edf3', fontSize: '0.9rem', outline: 'none',
                minHeight: 36,
              }}
            >
              {panel.speech.text}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {BUBBLE_STYLES.map(s => (
                <button key={s.id} onClick={() => update({ speech: { ...panel.speech, style: s.id } })}
                  style={{
                    flex: 1, padding: '6px 4px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: (panel.speech?.style || 'round') === s.id ? '#0d2744' : '#21262d',
                    color: (panel.speech?.style || 'round') === s.id ? '#58a6ff' : '#8b949e',
                    outline: (panel.speech?.style || 'round') === s.id ? '2px solid #58a6ff' : '2px solid #30363d',
                    fontSize: '0.75rem', fontWeight: 700,
                  }}>
                  {s.label}
                </button>
              ))}
              <button onClick={() => update({ speech: { ...panel.speech, position: panel.speech.position === 'top' ? 'bottom' : 'top' } })}
                style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #30363d', background: '#21262d', color: '#e6edf3', cursor: 'pointer', fontSize: '0.8rem' }}>
                {panel.speech.position === 'top' ? 'Uppe' : 'Nere'}
              </button>
              <button onClick={() => update({ speech: null })}
                style={{ padding: '6px 8px', borderRadius: 8, border: 'none', background: '#da3633', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>
                Ta bort
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => update({ speech: { text: 'Hej!', style: 'round', position: 'top' } })}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px dashed #30363d',
              background: 'none', color: '#58a6ff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            }}
          >
            + Lagg till bubbla
          </button>
        )}
      </div>

      {/* Play button */}
      <button
        onClick={() => setPlaying(true)}
        style={{
          marginTop: 12, padding: '12px', borderRadius: 12, border: 'none',
          background: '#1f6feb', color: '#fff', cursor: 'pointer',
          fontSize: '1rem', fontWeight: 700,
        }}
      >
        Spela berattelse
      </button>

      {playing && (
        <StoryPlayer panels={panels} onClose={() => setPlaying(false)} />
      )}
    </div>
  );
}
