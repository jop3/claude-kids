import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getStateAtTime, EASING_FUNCTIONS } from '../../lib/animationEngine.js';
import { TWEEN_PRESETS } from '../../lib/tweenPresets.js';

// ─── Constants ──────────────────────────────────────────────────────────────
const LABEL_WIDTH = 120; // px — object list column
const MS_PER_PX = 10;    // 1px = 10ms → 500ms = 50px, 5000ms = 500px
const LANE_HEIGHT = 40;
const RULER_HEIGHT = 28;
const PREVIEW_SIZE = 200;

const DURATION_OPTIONS = [2000, 5000, 10000];

const EASING_OPTIONS = [
  'linear',
  'easeInQuad',
  'easeOutQuad',
  'easeInOutQuad',
  'easeInCubic',
  'easeOutCubic',
  'easeInOutCubic',
  'easeInBack',
  'easeOutBack',
  'easeOutBounce',
  'easeOutElastic',
];

const ANIMATABLE_BLOCK_TYPES = new Set(['character-builder', 'background-picker', 'particle-fx', 'sprite-picker', 'canvas-draw', 'pixel-editor']);

function defaultKeyframe(time) {
  return { id: crypto.randomUUID(), time, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'linear' };
}

function getObjectsFromBlocks(addedBlocks) {
  return (addedBlocks || [])
    .filter(b => ANIMATABLE_BLOCK_TYPES.has(b.type))
    .map(b => ({ id: b.id, name: b.name, emoji: b.emoji || '🎭' }));
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Slider({ label, value, min, max, step = 0.01, onChange, formatVal }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#8b949e', fontSize: '0.7rem', fontWeight: 700 }}>{label}</span>
        <span style={{ color: '#c9d1d9', fontSize: '0.7rem' }}>{formatVal ? formatVal(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: '#58a6ff' }}
      />
    </div>
  );
}

// ─── Easing curve thumbnail ──────────────────────────────────────────────────

function EasingCurve({ name, size = [30, 20] }) {
  const [w, h] = size;
  const fn = EASING_FUNCTIONS[name] || (t => t);
  const steps = 20;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const v = fn(t);
    return `${(t * w).toFixed(1)},${((1 - v) * h).toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block', flexShrink: 0 }}>
      <polyline points={points} fill="none" stroke="#58a6ff" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AnimationTimelineBlock({ addedBlocks = [], config = {}, onConfigChange }) {
  const duration = config.duration ?? 5000;
  const objects = config.objects ?? [];

  // Ensure objects list stays in sync with addedBlocks
  const blockDerivedObjects = getObjectsFromBlocks(addedBlocks);

  // Merge: keep existing object configs, add new ones, keep custom objects
  const mergedObjects = useRef(objects);
  const syncedObjects = (() => {
    const existing = new Map(objects.map(o => [o.id, o]));
    const result = [];
    // Add/keep block-derived objects in order
    for (const bo of blockDerivedObjects) {
      if (existing.has(bo.id)) {
        result.push(existing.get(bo.id));
      } else {
        result.push({ ...bo, keyframes: [], visible: true });
      }
    }
    // Keep custom (non-block) objects
    for (const o of objects) {
      if (!blockDerivedObjects.find(b => b.id === o.id)) {
        result.push(o);
      }
    }
    return result;
  })();

  // ── local UI state ──
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [selectedKfId, setSelectedKfId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const rafRef = useRef(null);
  const startWallRef = useRef(null);
  const startTimeRef = useRef(0);
  const timelineScrollRef = useRef(null);

  // Drag state for keyframes
  const kfDragRef = useRef(null); // { objId, kfId, startX, startTime }

  // ── helpers ──

  function updateObjects(newObjects) {
    onConfigChange({ ...(config || {}), duration, objects: newObjects });
  }

  function getObject(id) {
    return syncedObjects.find(o => o.id === id);
  }

  function getKeyframes(objId) {
    const obj = getObject(objId);
    return obj?.keyframes ?? [];
  }

  function getSelectedKf() {
    if (!selectedObjectId || !selectedKfId) return null;
    return getKeyframes(selectedObjectId).find(k => k.id === selectedKfId) ?? null;
  }

  // ── playback ──

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startWallRef.current) + startTimeRef.current;
    if (elapsed >= duration) {
      setCurrentTime(duration);
      setIsPlaying(false);
      rafRef.current = null;
      return;
    }
    setCurrentTime(elapsed);
    rafRef.current = requestAnimationFrame(tick);
  }, [duration]);

  function handlePlay() {
    startWallRef.current = performance.now();
    startTimeRef.current = currentTime >= duration ? 0 : currentTime;
    setCurrentTime(startTimeRef.current);
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(tick);
  }

  function handlePause() {
    setIsPlaying(false);
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }

  function handleReset() {
    handlePause();
    setCurrentTime(0);
  }

  useEffect(() => {
    if (isPlaying) {
      startWallRef.current = performance.now();
      startTimeRef.current = currentTime;
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, tick]);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  // ── keyframe ops ──

  function addKeyframe(objId, time) {
    const kf = defaultKeyframe(Math.round(time));
    const newObjects = syncedObjects.map(o => {
      if (o.id !== objId) return o;
      return { ...o, keyframes: [...(o.keyframes || []), kf].sort((a, b) => a.time - b.time) };
    });
    updateObjects(newObjects);
    setSelectedObjectId(objId);
    setSelectedKfId(kf.id);
  }

  function updateKeyframe(objId, kfId, changes) {
    const newObjects = syncedObjects.map(o => {
      if (o.id !== objId) return o;
      return {
        ...o,
        keyframes: (o.keyframes || []).map(k => k.id === kfId ? { ...k, ...changes } : k).sort((a, b) => a.time - b.time),
      };
    });
    updateObjects(newObjects);
  }

  function toggleObjectVisibility(objId) {
    const newObjects = syncedObjects.map(o => o.id === objId ? { ...o, visible: !o.visible } : o);
    updateObjects(newObjects);
  }

  function addCustomObject() {
    const name = 'Objekt ' + (syncedObjects.length + 1);
    const newObj = { id: crypto.randomUUID(), name, emoji: '⭐', keyframes: [], visible: true, custom: true };
    updateObjects([...syncedObjects, newObj]);
    setSelectedObjectId(newObj.id);
  }

  function addPreset(preset) {
    if (!selectedObjectId) return;
    const newKfs = preset.keyframes.map(kf => ({ ...kf, id: crypto.randomUUID() }));
    const newObjects = syncedObjects.map(o => {
      if (o.id !== selectedObjectId) return o;
      const merged = [...(o.keyframes || []), ...newKfs].sort((a, b) => a.time - b.time);
      return { ...o, keyframes: merged };
    });
    updateObjects(newObjects);
  }

  // ── duration change ──

  function setDuration(d) {
    onConfigChange({ ...(config || {}), duration: d, objects: syncedObjects });
  }

  // ── scrubber drag ──

  const scrubberRef = useRef(null);
  const scrubbing = useRef(false);

  function scrubFromEvent(e, rect) {
    const x = e.clientX - rect.left - LABEL_WIDTH;
    const t = Math.max(0, Math.min(duration, x * MS_PER_PX));
    if (isPlaying) handlePause();
    setCurrentTime(t);
  }

  function handleRulerPointerDown(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    scrubbing.current = true;
    scrubFromEvent(e, rect);
    const onMove = ev => scrubFromEvent(ev, rect);
    const onUp = () => { scrubbing.current = false; window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  // ── keyframe drag ──

  function handleKfPointerDown(e, objId, kf) {
    e.stopPropagation();
    setSelectedObjectId(objId);
    setSelectedKfId(kf.id);
    kfDragRef.current = { objId, kfId: kf.id, startX: e.clientX, startTime: kf.time };
    if (isPlaying) handlePause();

    const onMove = ev => {
      const { objId: oid, kfId, startX, startTime } = kfDragRef.current;
      const dx = ev.clientX - startX;
      const newTime = Math.max(0, Math.min(duration, startTime + dx * MS_PER_PX));
      updateKeyframe(oid, kfId, { time: Math.round(newTime) });
    };
    const onUp = () => { kfDragRef.current = null; window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  // ── preview canvas ──

  const previewCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

    // Draw each visible object
    for (const obj of syncedObjects) {
      if (!obj.visible || !obj.keyframes || obj.keyframes.length === 0) continue;
      const state = getStateAtTime(obj.keyframes, currentTime);
      const cx = PREVIEW_SIZE / 2 + (state.x ?? 0);
      const cy = PREVIEW_SIZE / 2 + (state.y ?? 0);

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, state.opacity ?? 1));
      ctx.translate(cx, cy);
      ctx.rotate(((state.rotation ?? 0) * Math.PI) / 180);
      ctx.scale(state.scaleX ?? 1, state.scaleY ?? 1);

      // Draw simple circle with label
      const r = 24;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#58a6ff';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obj.emoji || '?', 0, 0);
      ctx.restore();
    }

    // Draw current time indicator
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText((currentTime / 1000).toFixed(2) + 's', 6, 6);
  }, [currentTime, syncedObjects]);

  // ── computed ──

  const timelineWidth = duration / MS_PER_PX;
  const selectedKf = getSelectedKf();
  const selectedObj = selectedObjectId ? getObject(selectedObjectId) : null;

  // ── render ──

  const sectionLabel = { color: '#8b949e', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'sans-serif' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>🎬 Animation</div>

      {/* Preview + controls row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Preview canvas */}
        <div style={{ flexShrink: 0 }}>
          <canvas
            ref={previewCanvasRef}
            width={PREVIEW_SIZE}
            height={PREVIEW_SIZE}
            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE, background: '#1a2332', borderRadius: 10, border: '1px solid #30363d', display: 'block' }}
          />
          {/* Playback controls */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: isPlaying ? '#da3633' : '#238636', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              onClick={handleReset}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', background: '#21262d', color: '#c9d1d9', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
            >
              ↩
            </button>
          </div>
        </div>

        {/* Duration selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={sectionLabel}>Längd</div>
          {DURATION_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: `2px solid ${duration === d ? '#58a6ff' : '#30363d'}`,
                background: duration === d ? '#0d2744' : '#21262d',
                color: duration === d ? '#58a6ff' : '#c9d1d9',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {d / 1000}s
            </button>
          ))}
        </div>
      </div>

      {/* Quick animation presets */}
      <div>
        <div style={sectionLabel}>Snabbanimationer</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TWEEN_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => addPreset(preset)}
              disabled={!selectedObjectId}
              title={selectedObjectId ? `Lagg till "${preset.name}" pa valt objekt` : 'Valj ett objekt forst'}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid #30363d',
                background: selectedObjectId ? '#21262d' : '#161b22',
                color: selectedObjectId ? '#c9d1d9' : '#444',
                cursor: selectedObjectId ? 'pointer' : 'not-allowed',
                fontSize: '0.78rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>{preset.emoji}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Object list + Timeline grid */}
      <div style={{ border: '1px solid #30363d', borderRadius: 10, overflow: 'hidden', background: '#0d1117' }}>
        <div
          style={{ overflowX: 'auto', position: 'relative', userSelect: 'none' }}
          ref={timelineScrollRef}
        >
          <div style={{ minWidth: LABEL_WIDTH + timelineWidth }}>
            {/* Ruler */}
            <div
              style={{ display: 'flex', height: RULER_HEIGHT, background: '#161b22', borderBottom: '1px solid #30363d', cursor: 'col-resize', position: 'relative' }}
              onPointerDown={handleRulerPointerDown}
            >
              <div style={{ width: LABEL_WIDTH, flexShrink: 0, borderRight: '1px solid #30363d' }} />
              <div style={{ position: 'relative', flex: 1 }}>
                {/* Tick marks every 500ms */}
                {Array.from({ length: Math.floor(duration / 500) + 1 }, (_, i) => {
                  const t = i * 500;
                  const x = t / MS_PER_PX;
                  return (
                    <div key={i} style={{ position: 'absolute', left: x, top: 0, bottom: 0, borderLeft: '1px solid #30363d', display: 'flex', alignItems: 'flex-end', paddingBottom: 3 }}>
                      <span style={{ color: '#6e7681', fontSize: '0.62rem', paddingLeft: 3, whiteSpace: 'nowrap' }}>{(t / 1000).toFixed(1)}s</span>
                    </div>
                  );
                })}
                {/* Fine ticks every 100ms */}
                {Array.from({ length: Math.floor(duration / 100) + 1 }, (_, i) => {
                  if (i % 5 === 0) return null;
                  const x = (i * 100) / MS_PER_PX;
                  return <div key={i} style={{ position: 'absolute', left: x, bottom: 0, height: 6, borderLeft: '1px solid #21262d' }} />;
                })}
              </div>
            </div>

            {/* Object lanes */}
            {syncedObjects.length === 0 && (
              <div style={{ padding: '20px 16px', color: '#8b949e', fontSize: '0.85rem' }}>
                Lagg till block ovan for att animera dem har.
              </div>
            )}

            {syncedObjects.map((obj, idx) => {
              const isSelected = obj.id === selectedObjectId;
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={obj.id}
                  style={{ display: 'flex', height: LANE_HEIGHT, borderBottom: '1px solid #21262d', background: isEven ? '#0d1117' : '#111618' }}
                >
                  {/* Object label */}
                  <div
                    onClick={() => setSelectedObjectId(obj.id)}
                    style={{
                      width: LABEL_WIDTH,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      paddingLeft: 8,
                      paddingRight: 6,
                      borderRight: '1px solid #30363d',
                      cursor: 'pointer',
                      background: isSelected ? '#0d2744' : 'transparent',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{obj.emoji}</span>
                    <span style={{ flex: 1, color: isSelected ? '#58a6ff' : '#c9d1d9', fontSize: '0.7rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {obj.name}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); toggleObjectVisibility(obj.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: obj.visible ? '#c9d1d9' : '#444', padding: 0, lineHeight: 1 }}
                      title="Visa/göm"
                    >
                      {obj.visible ? '👁' : '🚫'}
                    </button>
                  </div>

                  {/* Lane — click to add keyframe */}
                  <div
                    style={{ position: 'relative', flex: 1, cursor: 'crosshair' }}
                    onClick={e => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const t = Math.max(0, Math.min(duration, x * MS_PER_PX));
                      // Don't add if clicking an existing keyframe
                      if (e.target.dataset.kfid) return;
                      addKeyframe(obj.id, t);
                    }}
                  >
                    {(obj.keyframes || []).map(kf => {
                      const x = kf.time / MS_PER_PX;
                      const isKfSelected = selectedKfId === kf.id && selectedObjectId === obj.id;
                      return (
                        <div
                          key={kf.id}
                          data-kfid={kf.id}
                          onPointerDown={e => handleKfPointerDown(e, obj.id, kf)}
                          style={{
                            position: 'absolute',
                            left: x,
                            top: '50%',
                            transform: 'translate(-50%, -50%) rotate(45deg)',
                            width: isKfSelected ? 14 : 10,
                            height: isKfSelected ? 14 : 10,
                            background: isKfSelected ? '#f0a500' : '#58a6ff',
                            border: isKfSelected ? '2px solid #fff' : '1.5px solid #1a2332',
                            cursor: 'grab',
                            zIndex: 2,
                            boxShadow: isKfSelected ? '0 0 6px #f0a500' : 'none',
                            pointerEvents: 'all',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Scrubber / playhead */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: LABEL_WIDTH + currentTime / MS_PER_PX,
                width: 2,
                background: '#f85149',
                pointerEvents: 'none',
                zIndex: 10,
                boxShadow: '0 0 6px #f85149',
              }}
            />
          </div>
        </div>
      </div>

      {/* Add custom object */}
      <button
        onClick={addCustomObject}
        style={{ alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 8, border: '1px dashed #444', background: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '0.85rem' }}
      >
        + Lagg till objekt
      </button>

      {/* Keyframe inspector */}
      {selectedKf && selectedObj && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '0.85rem' }}>
            Keyframe — {selectedObj.emoji} {selectedObj.name} @ {(selectedKf.time / 1000).toFixed(2)}s
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Slider label="X" value={selectedKf.x ?? 0} min={-200} max={200} step={1} onChange={v => updateKeyframe(selectedObjectId, selectedKfId, { x: v })} formatVal={v => Math.round(v)} />
            <Slider label="Y" value={selectedKf.y ?? 0} min={-200} max={200} step={1} onChange={v => updateKeyframe(selectedObjectId, selectedKfId, { y: v })} formatVal={v => Math.round(v)} />
            <Slider label="Skala X" value={selectedKf.scaleX ?? 1} min={0.1} max={3} step={0.05} onChange={v => updateKeyframe(selectedObjectId, selectedKfId, { scaleX: v })} formatVal={v => v.toFixed(2)} />
            <Slider label="Skala Y" value={selectedKf.scaleY ?? 1} min={0.1} max={3} step={0.05} onChange={v => updateKeyframe(selectedObjectId, selectedKfId, { scaleY: v })} formatVal={v => v.toFixed(2)} />
            <Slider label="Rotation" value={selectedKf.rotation ?? 0} min={-180} max={180} step={1} onChange={v => updateKeyframe(selectedObjectId, selectedKfId, { rotation: v })} formatVal={v => Math.round(v) + '°'} />
            <Slider label="Opacitet" value={Math.round((selectedKf.opacity ?? 1) * 100)} min={0} max={100} step={1} onChange={v => updateKeyframe(selectedObjectId, selectedKfId, { opacity: v / 100 })} formatVal={v => v + '%'} />
          </div>
          {/* Easing */}
          <div>
            <div style={sectionLabel}>Easing</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EASING_OPTIONS.map(e => {
                const isActive = (selectedKf.easing || 'linear') === e;
                return (
                  <button
                    key={e}
                    onClick={() => updateKeyframe(selectedObjectId, selectedKfId, { easing: e })}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: `2px solid ${isActive ? '#58a6ff' : '#30363d'}`,
                      background: isActive ? '#0d2744' : '#21262d',
                      color: isActive ? '#58a6ff' : '#c9d1d9',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <EasingCurve name={e} />
                    {e}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
