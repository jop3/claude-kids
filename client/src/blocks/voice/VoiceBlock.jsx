import React, { useState, useRef, useEffect } from 'react';
import { applyEffect } from './voiceEffects.js';

const EFFECTS = [
  { id: 'normal',  label: 'Normal',  emoji: '🔊' },
  { id: 'robot',   label: 'Robot',   emoji: '🤖' },
  { id: 'ekorre',  label: 'Ekorre',  emoji: '🐭' },
  { id: 'monster', label: 'Monster', emoji: '👾' },
  { id: 'eko',     label: 'Eko',     emoji: '🔁' },
  { id: 'reverb',  label: 'Reverb',  emoji: '🌊' },
];

export default function VoiceBlock({ config, onConfigChange }) {
  const effect   = config?.effect ?? 'normal';
  const loop     = config?.loop   ?? true;
  const bars     = config?.bars   ?? 4;
  // audioData stored as base64 in config for save/load
  const audioDataB64 = config?.audioData ?? null;

  const [recording, setRecording]         = useState(false);
  const [audioUrl, setAudioUrl]           = useState(null);
  const [renderedUrl, setRenderedUrl]     = useState(null);
  const [permDenied, setPermDenied]       = useState(false);
  const [applyingEffect, setApplyingEffect] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const audioCtxRef      = useRef(null);
  const rawBufferRef     = useRef(null); // decoded AudioBuffer of raw recording
  const playbackRef      = useRef(null);

  // On mount: if saved audioData exists, restore as blob URL
  useEffect(() => {
    if (audioDataB64 && !audioUrl) {
      try {
        const bytes = atob(audioDataB64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      } catch (_) { /* ignore corrupt data */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever raw audioUrl or effect changes, render the effect
  useEffect(() => {
    if (!audioUrl) {
      setRenderedUrl(null);
      return;
    }
    if (effect === 'normal') {
      setRenderedUrl(audioUrl);
      return;
    }
    let cancelled = false;
    setApplyingEffect(true);
    (async () => {
      try {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioContext();
        }
        let buffer = rawBufferRef.current;
        if (!buffer) {
          const resp = await fetch(audioUrl);
          const arrayBuf = await resp.arrayBuffer();
          buffer = await audioCtxRef.current.decodeAudioData(arrayBuf);
          rawBufferRef.current = buffer;
        }
        const rendered = await applyEffect(buffer, effect, audioCtxRef.current);
        if (cancelled) return;
        // Encode rendered buffer to WAV and create object URL
        const wavBlob = audioBufferToWav(rendered);
        const url = URL.createObjectURL(wavBlob);
        setRenderedUrl(url);
      } catch (err) {
        console.error('Effect render error:', err);
        if (!cancelled) setRenderedUrl(audioUrl);
      } finally {
        if (!cancelled) setApplyingEffect(false);
      }
    })();
    return () => { cancelled = true; };
  }, [audioUrl, effect]);

  async function startRecording() {
    setPermDenied(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      rawBufferRef.current = null;
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        // Save as base64 for persistence
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = btoa(reader.result);
          onConfigChange({ ...config, audioData: b64 });
        };
        reader.readAsBinaryString(blob);
      };
      mr.start();
      setRecording(true);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermDenied(true);
      }
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  function handleReRecord() {
    setAudioUrl(null);
    setRenderedUrl(null);
    rawBufferRef.current = null;
    onConfigChange({ ...config, audioData: null });
  }

  function handleEffectChange(eff) {
    onConfigChange({ ...config, effect: eff });
  }

  function handleBarsToggle(b) {
    onConfigChange({ ...config, bars: b });
  }

  function handleLoopToggle() {
    onConfigChange({ ...config, loop: !loop });
  }

  const recordBtnStyle = {
    width: '100%',
    padding: '18px',
    fontSize: '1.1rem',
    fontWeight: 700,
    borderRadius: 14,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 200ms',
    ...(recording
      ? { background: '#da3633', color: '#fff', animation: 'pulse 1s infinite' }
      : { background: '#238636', color: '#fff' }),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        @keyframes pulse {
          0%   { opacity: 1; }
          50%  { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* Title */}
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        🎤 Röst
      </div>

      {/* Permission denied message */}
      {permDenied && (
        <div style={{
          background: '#3d1f1f',
          border: '1px solid #f85149',
          borderRadius: 10,
          padding: '12px 16px',
          color: '#f85149',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}>
          Behöver mikrofontillstånd — tillåt i webbläsaren och prova igen.
        </div>
      )}

      {/* Record button */}
      {!audioUrl && (
        <button
          style={recordBtnStyle}
          onPointerDown={startRecording}
          onPointerUp={stopRecording}
          onPointerLeave={recording ? stopRecording : undefined}
        >
          {recording ? '⏺ Spelar in...' : '🎤 Håll inne för att spela in'}
        </button>
      )}

      {/* Playback + re-record */}
      {audioUrl && (
        <>
          <div style={{
            background: '#21262d',
            border: '1px solid #30363d',
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>
              SPELA UPP
            </div>
            {applyingEffect ? (
              <div style={{ color: '#8b949e', fontSize: '0.85rem', textAlign: 'center', padding: '8px 0' }}>
                Applicerar effekt...
              </div>
            ) : renderedUrl ? (
              <audio
                key={renderedUrl}
                controls
                loop={loop}
                src={renderedUrl}
                style={{ width: '100%', borderRadius: 8 }}
              />
            ) : null}
          </div>

          {/* Re-record button */}
          <button
            onClick={handleReRecord}
            style={{
              padding: '10px 16px',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: 10,
              border: '2px solid #30363d',
              background: '#21262d',
              color: '#e6edf3',
              cursor: 'pointer',
            }}
          >
            🔄 Spela in igen
          </button>
        </>
      )}

      {/* Effect picker */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          EFFEKT
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EFFECTS.map(eff => (
            <button
              key={eff.id}
              onClick={() => handleEffectChange(eff.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 12px',
                borderRadius: 10,
                border: effect === eff.id ? '2px solid #58a6ff' : '2px solid #30363d',
                background: effect === eff.id ? '#0d2744' : '#21262d',
                color: '#e6edf3',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                minWidth: 60,
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{eff.emoji}</span>
              <span>{eff.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loop toggle */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          LOOPA
        </div>
        <button
          onClick={handleLoopToggle}
          style={{
            padding: '8px 20px',
            borderRadius: 10,
            border: loop ? '2px solid #58a6ff' : '2px solid #30363d',
            background: loop ? '#0d2744' : '#21262d',
            color: '#e6edf3',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {loop ? '🔂 Loopa: På' : '➡ Loopa: Av'}
        </button>
      </div>

      {/* Bar length selector */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          LÄNGD
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[4, 8].map(b => (
            <button
              key={b}
              onClick={() => handleBarsToggle(b)}
              style={{
                padding: '8px 20px',
                borderRadius: 10,
                border: bars === b ? '2px solid #58a6ff' : '2px solid #30363d',
                background: bars === b ? '#0d2744' : '#21262d',
                color: '#e6edf3',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {b} takter
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Minimal WAV encoder ----
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate  = buffer.sampleRate;
  const numFrames   = buffer.length;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign  = numChannels * bytesPerSample;
  const byteRate    = sampleRate * blockAlign;
  const dataSize    = numFrames * blockAlign;
  const bufSize     = 44 + dataSize;

  const ab  = new ArrayBuffer(bufSize);
  const view = new DataView(ab);

  function writeStr(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeStr(0, 'RIFF');
  view.setUint32(4,  36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1,            true); // PCM
  view.setUint16(22, numChannels,  true);
  view.setUint32(24, sampleRate,   true);
  view.setUint32(28, byteRate,     true);
  view.setUint16(32, blockAlign,   true);
  view.setUint16(34, 16,           true); // bits per sample
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = buffer.getChannelData(ch)[i];
      const clamped = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([ab], { type: 'audio/wav' });
}
