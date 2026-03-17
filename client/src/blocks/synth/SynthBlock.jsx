import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { startAudio } from '../../lib/audio.js';
import { createSynthVoice, disposeSynthVoice } from './synthVoices.js';

const INSTRUMENTS = [
  { id: 'piano',   label: 'Piano',   emoji: '🎹' },
  { id: 'gitarr',  label: 'Gitarr',  emoji: '🎸' },
  { id: 'bas',     label: 'Bas',     emoji: '🎵' },
  { id: 'synth',   label: 'Synth',   emoji: '🔊' },
  { id: 'orgel',   label: 'Orgel',   emoji: '🎹' },
  { id: 'strakar', label: 'Strakar', emoji: '🎻' },
  { id: 'blasare', label: 'Blasare', emoji: '🎺' },
];

const BASE_NOTES = ['C', 'E', 'G', 'B'];

// Chord preset patterns: 4 rows × 16 steps
const CHORD_PRESETS = {
  Do: [
    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
  ],
  Re: [
    [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0],
    [0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,1,0],
    [0,0,1,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
  ],
  Sol: [
    [1,0,1,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    [0,0,0,0, 1,0,1,0, 0,0,1,0, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,1,0],
    [0,1,0,0, 0,0,0,1, 0,1,0,0, 0,0,0,0],
  ],
  Fri: [
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
  ],
};

function makeDefaultPattern() {
  return [
    Array(16).fill(false),
    Array(16).fill(false),
    Array(16).fill(false),
    Array(16).fill(false),
  ];
}

function noteForRow(rowIndex, octave) {
  return BASE_NOTES[rowIndex] + octave;
}

export default function SynthBlock({ config, onConfigChange }) {
  const instrument = config?.instrument || 'piano';
  const pattern    = config?.pattern   || makeDefaultPattern();
  const octave     = config?.octave    ?? 4;

  const [playing, setPlaying]       = useState(false);
  const [activeStep, setActiveStep] = useState(-1);

  const voiceRef    = useRef(null);
  const sequenceRef = useRef(null);
  const patternRef  = useRef(pattern);
  const octaveRef   = useRef(octave);
  const instrRef    = useRef(instrument);

  useEffect(() => { patternRef.current = pattern; }, [pattern]);
  useEffect(() => { octaveRef.current  = octave;   }, [octave]);
  useEffect(() => { instrRef.current   = instrument; }, [instrument]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopSequencer(); };
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
    disposeSynthVoice(voiceRef.current);
    voiceRef.current = null;
    setActiveStep(-1);
  }

  async function handlePlayStop() {
    if (playing) {
      stopSequencer();
      setPlaying(false);
      return;
    }

    await startAudio();

    voiceRef.current = createSynthVoice(instrRef.current);

    let step = 0;
    sequenceRef.current = new Tone.Sequence(
      (time) => {
        const p  = patternRef.current;
        const oc = octaveRef.current;
        const v  = voiceRef.current;
        if (!v) return;

        const notesToPlay = [];
        for (let row = 0; row < 4; row++) {
          if (p[row]?.[step]) {
            notesToPlay.push(noteForRow(row, oc));
          }
        }

        if (notesToPlay.length > 0) {
          try {
            v.triggerAttackRelease(notesToPlay, '8n', time);
          } catch (_) {}
        }

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

  function handleInstrumentChange(id) {
    onConfigChange({ ...config, instrument: id });
    if (playing && voiceRef.current) {
      disposeSynthVoice(voiceRef.current);
      voiceRef.current = createSynthVoice(id);
    }
  }

  function handleStepToggle(rowIndex, stepIndex) {
    const newPattern = pattern.map((row, r) =>
      r === rowIndex
        ? row.map((v, s) => (s === stepIndex ? !v : v))
        : [...row]
    );
    onConfigChange({ ...config, pattern: newPattern });

    // Preview note on tap
    previewNote(rowIndex);
  }

  async function previewNote(rowIndex) {
    await startAudio();
    const preview = createSynthVoice(instrument);
    const note = noteForRow(rowIndex, octave);
    try {
      preview.triggerAttackRelease(note, '8n');
      setTimeout(() => disposeSynthVoice(preview), 1500);
    } catch (_) {
      disposeSynthVoice(preview);
    }
  }

  function handlePreset(presetName) {
    const preset = CHORD_PRESETS[presetName];
    if (!preset) return;
    const newPattern = preset.map(row => row.map(v => !!v));
    onConfigChange({ ...config, pattern: newPattern });
  }

  function handleOctaveChange(delta) {
    const newOctave = Math.min(6, Math.max(3, octave + delta));
    onConfigChange({ ...config, octave: newOctave });
  }

  const NOTE_COLORS = ['#f85149', '#3fb950', '#58a6ff', '#d2a8ff'];

  function stepBg(rowIndex, stepIndex, on) {
    if (stepIndex === activeStep && playing) return on ? '#ffd700' : 'rgba(255,215,0,0.25)';
    if (on) return NOTE_COLORS[rowIndex];
    return '#21262d';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title */}
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        🎹 Synth
      </div>

      {/* Instrument picker */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          INSTRUMENT
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {INSTRUMENTS.map(inst => (
            <button
              key={inst.id}
              onClick={() => handleInstrumentChange(inst.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '8px 10px',
                borderRadius: 10,
                border: instrument === inst.id ? '2px solid #58a6ff' : '2px solid #30363d',
                background: instrument === inst.id ? '#0d2744' : '#21262d',
                color: '#e6edf3',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                minWidth: 52,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{inst.emoji}</span>
              <span>{inst.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Octave selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>OKTAV</span>
        <button
          onClick={() => handleOctaveChange(-1)}
          disabled={octave <= 3}
          style={{
            padding: '4px 12px',
            borderRadius: 8,
            border: '1px solid #30363d',
            background: '#21262d',
            color: octave <= 3 ? '#444' : '#e6edf3',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: octave <= 3 ? 'default' : 'pointer',
          }}
        >
          −
        </button>
        <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', minWidth: 20, textAlign: 'center' }}>
          {octave}
        </span>
        <button
          onClick={() => handleOctaveChange(1)}
          disabled={octave >= 6}
          style={{
            padding: '4px 12px',
            borderRadius: 8,
            border: '1px solid #30363d',
            background: '#21262d',
            color: octave >= 6 ? '#444' : '#e6edf3',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: octave >= 6 ? 'default' : 'pointer',
          }}
        >
          +
        </button>
      </div>

      {/* Note grid */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          NOTE GRID
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {BASE_NOTES.map((note, rowIndex) => (
            <div key={note} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28,
                fontSize: '0.7rem',
                fontWeight: 700,
                color: NOTE_COLORS[rowIndex],
                flexShrink: 0,
                textAlign: 'right',
              }}>
                {note}{octave}
              </div>
              <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                {Array.from({ length: 16 }, (_, stepIndex) => {
                  const on = !!(pattern[rowIndex]?.[stepIndex]);
                  const isBar = stepIndex % 4 === 0;
                  return (
                    <button
                      key={stepIndex}
                      onClick={() => handleStepToggle(rowIndex, stepIndex)}
                      style={{
                        flex: 1,
                        height: 26,
                        borderRadius: 4,
                        border: isBar ? '1px solid #444' : '1px solid #30363d',
                        background: stepBg(rowIndex, stepIndex, on),
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

      {/* Chord presets */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          ACKORD PRESET
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.keys(CHORD_PRESETS).map(name => (
            <button
              key={name}
              onClick={() => handlePreset(name)}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 10,
                border: '2px solid #30363d',
                background: '#21262d',
                color: '#e6edf3',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {name}
            </button>
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
