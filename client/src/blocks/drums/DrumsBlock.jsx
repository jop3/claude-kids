import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { startAudio } from '../../lib/audio.js';
import { createDrumSynths, disposeDrumSynths } from './drumSynths.js';

const KITS = [
  { id: 'rock', label: 'Rock', emoji: '🥁' },
  { id: 'electro', label: 'Electro', emoji: '⚡' },
  { id: 'latin', label: 'Latin', emoji: '🎺' },
  { id: 'jazz', label: 'Jazz', emoji: '🎷' },
];

const ROWS = [
  { id: 'kick', label: 'Kick' },
  { id: 'snare', label: 'Snare' },
  { id: 'hihat', label: 'Hi-hat' },
  { id: 'clap', label: 'Clap' },
];

function makeDefaultPattern() {
  return {
    kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
  };
}

export default function DrumsBlock({ config, onConfigChange }) {
  const kit = config?.kit || 'rock';
  const bpm = config?.bpm ?? 120;
  const pattern = config?.pattern || makeDefaultPattern();

  const [playing, setPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);

  const synthsRef = useRef(null);
  const sequenceRef = useRef(null);
  const kitRef = useRef(kit);
  const patternRef = useRef(pattern);

  // Keep refs in sync
  useEffect(() => { kitRef.current = kit; }, [kit]);
  useEffect(() => { patternRef.current = pattern; }, [pattern]);

  // Sync BPM to transport whenever it changes
  useEffect(() => {
    Tone.getTransport().bpm.value = bpm;
  }, [bpm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSequencer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopSequencer() {
    if (sequenceRef.current) {
      sequenceRef.current.stop();
      sequenceRef.current.dispose();
      sequenceRef.current = null;
    }
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    disposeDrumSynths(synthsRef.current);
    synthsRef.current = null;
    setActiveStep(-1);
  }

  async function handlePlayStop() {
    if (playing) {
      stopSequencer();
      setPlaying(false);
      return;
    }

    await startAudio();
    Tone.getTransport().bpm.value = bpm;

    synthsRef.current = createDrumSynths(kitRef.current);

    let step = 0;
    sequenceRef.current = new Tone.Sequence(
      (time) => {
        const p = patternRef.current;
        const s = synthsRef.current;
        if (!s) return;

        if (p.kick[step])  s.kick.triggerAttackRelease('C1', '8n', time);
        if (p.snare[step]) s.snare.triggerAttackRelease('8n', time);
        if (p.hihat[step]) s.hihat.triggerAttackRelease('16n', time);
        if (p.clap[step])  s.clap.triggerAttackRelease('16n', time);

        const capturedStep = step;
        Tone.getDraw().schedule(() => {
          setActiveStep(capturedStep);
        }, time);

        step = (step + 1) % 16;
      },
      Array.from({ length: 16 }, (_, i) => i),
      '16n'
    );

    sequenceRef.current.start(0);
    Tone.getTransport().start();
    setPlaying(true);
  }

  function handleKitChange(newKit) {
    onConfigChange({ ...config, kit: newKit });
    // If playing, rebuild synths for new kit immediately
    if (playing && synthsRef.current) {
      disposeDrumSynths(synthsRef.current);
      synthsRef.current = createDrumSynths(newKit);
    }
  }

  function handleBpmChange(e) {
    const val = Number(e.target.value);
    onConfigChange({ ...config, bpm: val });
  }

  function handleStepToggle(rowId, stepIndex) {
    const newRow = [...(pattern[rowId] || Array(16).fill(0))];
    newRow[stepIndex] = newRow[stepIndex] ? 0 : 1;
    onConfigChange({ ...config, pattern: { ...pattern, [rowId]: newRow } });
  }

  const stepColor = (rowId, i, on) => {
    if (i === activeStep && playing) return on ? '#ffd700' : 'rgba(255,215,0,0.25)';
    if (on) {
      if (rowId === 'kick')  return '#f85149';
      if (rowId === 'snare') return '#3fb950';
      if (rowId === 'hihat') return '#58a6ff';
      return '#d2a8ff';
    }
    return '#21262d';
  };

  const rowLabelColor = {
    kick: '#f85149',
    snare: '#3fb950',
    hihat: '#58a6ff',
    clap: '#d2a8ff',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title */}
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        🥁 Trummor
      </div>

      {/* Kit picker */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          KIT
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {KITS.map(k => (
            <button
              key={k.id}
              onClick={() => handleKitChange(k.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                border: kit === k.id ? '2px solid #58a6ff' : '2px solid #30363d',
                background: kit === k.id ? '#0d2744' : '#21262d',
                color: '#e6edf3',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>{k.emoji}</span>
              <span>{k.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* BPM slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>TEMPO</span>
          <span style={{ color: '#e6edf3', fontSize: '0.95rem', fontWeight: 700 }}>{bpm} BPM</span>
        </div>
        <input
          type="range"
          min={60}
          max={180}
          value={bpm}
          onChange={handleBpmChange}
          style={{ width: '100%', accentColor: '#58a6ff', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6e7681', fontSize: '0.7rem', marginTop: 2 }}>
          <span>60</span>
          <span>180</span>
        </div>
      </div>

      {/* Beat grid */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          BEAT GRID
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ROWS.map(row => (
            <div key={row.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 44,
                fontSize: '0.72rem',
                fontWeight: 700,
                color: rowLabelColor[row.id],
                flexShrink: 0,
                textAlign: 'right',
              }}>
                {row.label}
              </div>
              <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                {Array.from({ length: 16 }, (_, i) => {
                  const on = !!(pattern[row.id]?.[i]);
                  const isBar = i % 4 === 0;
                  return (
                    <button
                      key={i}
                      onClick={() => handleStepToggle(row.id, i)}
                      style={{
                        flex: 1,
                        height: 28,
                        borderRadius: 4,
                        border: isBar ? '1px solid #444' : '1px solid #30363d',
                        background: stepColor(row.id, i, on),
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'background 80ms',
                        outline: 'none',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Play/Stop button */}
      <button
        onClick={handlePlayStop}
        style={{
          padding: '14px',
          fontSize: '1.1rem',
          fontWeight: 700,
          borderRadius: 12,
          border: 'none',
          background: playing ? '#da3633' : '#238636',
          color: '#fff',
          cursor: 'pointer',
          marginTop: 4,
        }}
      >
        {playing ? '⏹ Stopp' : '▶ Spela'}
      </button>
    </div>
  );
}
