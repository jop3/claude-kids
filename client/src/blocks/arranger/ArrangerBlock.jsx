import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tone, startAudio, isAudioReady } from '../../lib/audio.js';

const BAR_WIDTH = 60;
const LABEL_WIDTH = 80;

const TRACK_COLORS = {
  drums: '#3fb950',
  synth:  '#d2a8ff',
  voice:  '#ffa657',
  default: '#58a6ff',
};

const TRACK_META = {
  drums: { emoji: '🥁', label: 'Trummor' },
  synth:  { emoji: '🎹', label: 'Synth' },
  voice:  { emoji: '🎤', label: 'Röst' },
};

function getTrackMeta(block) {
  return TRACK_META[block.type] || { emoji: block.emoji || '🎵', label: block.name || block.id };
}

function getTrackColor(block) {
  return TRACK_COLORS[block.type] || TRACK_COLORS.default;
}

export default function ArrangerBlock({ addedBlocks = [], config, onConfigChange }) {
  const audioTracks = (addedBlocks || [])
    .filter(b => b.type !== 'mixer' && b.type !== 'color-picker' && b.type !== 'arranger');

  const totalBars = config?.totalBars ?? 8;
  const clips = config?.clips ?? {};

  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [playheadBar, setPlayheadBar] = useState(0);
  const rafRef = useRef(null);
  const scheduleRef = useRef(null);

  function getClips(blockId) {
    const arr = clips[blockId];
    if (Array.isArray(arr) && arr.length === totalBars) return arr;
    return Array(totalBars).fill(0);
  }

  function toggleClip(blockId, barIndex) {
    const current = getClips(blockId);
    const updated = [...current];
    updated[barIndex] = updated[barIndex] ? 0 : 1;
    onConfigChange({
      ...config,
      clips: { ...clips, [blockId]: updated },
    });
  }

  function setTotalBars(n) {
    const newClips = {};
    audioTracks.forEach(b => {
      const cur = getClips(b.id);
      if (n > cur.length) {
        newClips[b.id] = [...cur, ...Array(n - cur.length).fill(0)];
      } else {
        newClips[b.id] = cur.slice(0, n);
      }
    });
    onConfigChange({ ...config, totalBars: n, clips: newClips });
  }

  // Animate playhead using Tone.Transport position
  const animatePlayhead = useCallback(() => {
    const transport = Tone.getTransport();
    if (transport.state === 'started') {
      const pos = transport.position; // "bars:beats:sixteenths"
      const parts = String(pos).split(':');
      const bar = parseInt(parts[0], 10) || 0;
      setPlayheadBar(Math.min(bar, totalBars));
      rafRef.current = requestAnimationFrame(animatePlayhead);
    } else {
      setPlayheadBar(0);
      rafRef.current = null;
    }
  }, [totalBars]);

  async function handlePlay() {
    if (!isAudioReady()) {
      await startAudio();
    }
    const transport = Tone.getTransport();
    if (transport.state === 'started') return;

    transport.stop();
    transport.position = 0;

    if (loopEnabled) {
      transport.loop = true;
      transport.loopStart = '0:0:0';
      transport.loopEnd = `${totalBars}:0:0`;
    } else {
      transport.loop = false;
    }

    // Clear previous scheduled events
    if (scheduleRef.current) {
      transport.clear(scheduleRef.current);
    }
    transport.cancel();

    // Schedule stop at end if not looping
    if (!loopEnabled) {
      scheduleRef.current = transport.schedule(() => {
        transport.stop();
        setIsPlaying(false);
        setPlayheadBar(0);
      }, `${totalBars}:0:0`);
    }

    transport.start();
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(animatePlayhead);
  }

  function handleStop() {
    const transport = Tone.getTransport();
    transport.stop();
    transport.position = 0;
    transport.loop = false;
    setIsPlaying(false);
    setPlayheadBar(0);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Drag state for moving clips
  const dragRef = useRef(null);

  function handleClipPointerDown(e, blockId, barIndex) {
    if (!getClips(blockId)[barIndex]) return; // only drag existing clips
    e.preventDefault();
    dragRef.current = { blockId, fromBar: barIndex, startX: e.clientX };
  }

  function handleTimelinePointerMove(e) {
    if (!dragRef.current) return;
    const { blockId, fromBar, startX } = dragRef.current;
    const deltaX = e.clientX - startX;
    const deltaBars = Math.round(deltaX / BAR_WIDTH);
    if (deltaBars === 0) return;
    const toBar = Math.max(0, Math.min(totalBars - 1, fromBar + deltaBars));
    if (toBar === fromBar) return;
    const current = getClips(blockId);
    if (current[toBar]) return; // occupied
    const updated = [...current];
    updated[fromBar] = 0;
    updated[toBar] = 1;
    dragRef.current = { blockId, fromBar: toBar, startX: e.clientX };
    onConfigChange({ ...config, clips: { ...clips, [blockId]: updated } });
  }

  function handleTimelinePointerUp() {
    dragRef.current = null;
  }

  const timelineWidth = LABEL_WIDTH + totalBars * BAR_WIDTH;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        🎼 Arranger
      </div>

      {/* Transport controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={isPlaying ? handleStop : handlePlay}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            background: isPlaying ? '#da3633' : '#238636',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            minHeight: 40,
          }}
        >
          {isPlaying ? '⏹ Stop' : '▶ Spela'}
        </button>

        <button
          onClick={() => setLoopEnabled(v => !v)}
          title="Loop"
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: `2px solid ${loopEnabled ? '#58a6ff' : '#30363d'}`,
            background: loopEnabled ? '#0d2744' : '#21262d',
            color: loopEnabled ? '#58a6ff' : '#8b949e',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            minHeight: 40,
          }}
        >
          🔁
        </button>

        {/* Total bars selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <span style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700 }}>TAKTER</span>
          {[4, 8, 16].map(n => (
            <button
              key={n}
              onClick={() => setTotalBars(n)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: `2px solid ${totalBars === n ? '#58a6ff' : '#30363d'}`,
                background: totalBars === n ? '#0d2744' : '#21262d',
                color: totalBars === n ? '#58a6ff' : '#c9d1d9',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                minHeight: 36,
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ overflowX: 'auto', position: 'relative', borderRadius: 10, border: '1px solid #30363d', background: '#0d1117' }}>
        <div
          style={{ minWidth: timelineWidth, position: 'relative', userSelect: 'none' }}
          onPointerMove={handleTimelinePointerMove}
          onPointerUp={handleTimelinePointerUp}
          onPointerLeave={handleTimelinePointerUp}
        >
          {/* Bar number header */}
          <div style={{ display: 'flex', height: 28, borderBottom: '1px solid #30363d', background: '#161b22' }}>
            <div style={{ width: LABEL_WIDTH, flexShrink: 0 }} />
            {Array.from({ length: totalBars }, (_, i) => (
              <div
                key={i}
                style={{
                  width: BAR_WIDTH,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8b949e',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderLeft: '1px solid #21262d',
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Track rows */}
          {audioTracks.length === 0 && (
            <div style={{ padding: '20px 16px', color: '#8b949e', fontSize: '0.85rem' }}>
              Lagg till Trummor, Synth eller Rost for att se spår här.
            </div>
          )}

          {audioTracks.map((block, trackIdx) => {
            const meta = getTrackMeta(block);
            const color = getTrackColor(block);
            const trackClips = getClips(block.id);
            const isEven = trackIdx % 2 === 0;
            return (
              <div
                key={block.id}
                style={{
                  display: 'flex',
                  height: 44,
                  borderBottom: '1px solid #21262d',
                  background: isEven ? '#0d1117' : '#111618',
                }}
              >
                {/* Track label */}
                <div style={{
                  width: LABEL_WIDTH,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  paddingLeft: 10,
                  borderRight: '1px solid #30363d',
                }}>
                  <span style={{ fontSize: '1rem' }}>{meta.emoji}</span>
                  <span style={{ color: '#c9d1d9', fontSize: '0.7rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {meta.label}
                  </span>
                </div>

                {/* Bar slots */}
                {Array.from({ length: totalBars }, (_, barIdx) => {
                  const active = !!trackClips[barIdx];
                  return (
                    <div
                      key={barIdx}
                      onClick={() => toggleClip(block.id, barIdx)}
                      onPointerDown={e => handleClipPointerDown(e, block.id, barIdx)}
                      style={{
                        width: BAR_WIDTH,
                        flexShrink: 0,
                        height: '100%',
                        boxSizing: 'border-box',
                        borderLeft: '1px solid #21262d',
                        cursor: 'pointer',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {active && (
                        <div style={{
                          position: 'absolute',
                          inset: '4px 3px',
                          borderRadius: 5,
                          background: color,
                          opacity: 0.85,
                          boxShadow: `0 0 6px ${color}55`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <div style={{
                            width: '60%',
                            height: 2,
                            background: 'rgba(255,255,255,0.4)',
                            borderRadius: 1,
                          }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Playhead */}
          {isPlaying && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: LABEL_WIDTH + playheadBar * BAR_WIDTH,
                width: 2,
                background: '#f85149',
                pointerEvents: 'none',
                zIndex: 10,
                boxShadow: '0 0 6px #f85149',
                transition: 'left 0.05s linear',
              }}
            />
          )}
        </div>
      </div>

      {audioTracks.length > 0 && (
        <div style={{ color: '#6e7681', fontSize: '0.75rem' }}>
          Tryck på ett fält för att lägga till eller ta bort ett klipp. Dra klipp för att flytta dem.
        </div>
      )}
    </div>
  );
}
