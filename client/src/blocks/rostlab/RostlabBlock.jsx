import React, { useState, useRef, useEffect, useCallback } from 'react';
import { applyEffect } from '../voice/voiceEffects.js';

const EFFECTS = [
  { id: 'normal',  label: 'Normal',  emoji: '🔊' },
  { id: 'robot',   label: 'Robot',   emoji: '🤖' },
  { id: 'ekorre',  label: 'Ekorre',  emoji: '🐭' },
  { id: 'monster', label: 'Monster', emoji: '👾' },
  { id: 'eko',     label: 'Eko',     emoji: '🔁' },
  { id: 'reverb',  label: 'Reverb',  emoji: '🌊' },
];

function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate  = buffer.sampleRate;
  const numFrames   = buffer.length;
  const bytesPerSample = 2;
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
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
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

export default function RostlabBlock({ config, onConfigChange, addedBlocks = [] }) {
  const effect  = config?.effect  ?? 'normal';
  const loop    = config?.loop    ?? true;
  const audioDataB64 = config?.audioData ?? null;

  const [recording, setRecording]       = useState(false);
  const [audioUrl, setAudioUrl]         = useState(null);
  const [renderedUrl, setRenderedUrl]   = useState(null);
  const [applyingEffect, setApplyingEffect] = useState(false);
  const [permDenied, setPermDenied]     = useState(false);
  const [playing, setPlaying]           = useState(false);
  const [elapsedSec, setElapsedSec]     = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const audioCtxRef      = useRef(null);
  const rawBufferRef     = useRef(null);
  const waveCanvasRef    = useRef(null);
  const analyserRef      = useRef(null);
  const liveRafRef       = useRef(null);
  const timerRef         = useRef(null);
  const audioElemRef     = useRef(null);
  const streamRef        = useRef(null);

  const hasMixer = addedBlocks.some(b => b.type === 'mixer');
  const mixerChannel = hasMixer ? (addedBlocks.findIndex(b => b.type === 'mixer') + 1) : null;

  // Restore from saved base64
  useEffect(() => {
    if (audioDataB64 && !audioUrl) {
      try {
        const bytes = atob(audioDataB64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
      } catch (_) {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply effect whenever audioUrl or effect changes
  useEffect(() => {
    if (!audioUrl) { setRenderedUrl(null); return; }
    if (effect === 'normal') { setRenderedUrl(audioUrl); return; }
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
          const ab = await resp.arrayBuffer();
          buffer = await audioCtxRef.current.decodeAudioData(ab);
          rawBufferRef.current = buffer;
        }
        const rendered = await applyEffect(buffer, effect, audioCtxRef.current);
        if (cancelled) return;
        const wavBlob = audioBufferToWav(rendered);
        setRenderedUrl(URL.createObjectURL(wavBlob));
      } catch (err) {
        console.error('Effect error:', err);
        if (!cancelled) setRenderedUrl(audioUrl);
      } finally {
        if (!cancelled) setApplyingEffect(false);
      }
    })();
    return () => { cancelled = true; };
  }, [audioUrl, effect]);

  // Draw live waveform during recording
  function drawLiveWave() {
    const canvas = waveCanvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx2d = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    ctx2d.fillStyle = '#0d1117';
    ctx2d.fillRect(0, 0, W, H);
    ctx2d.strokeStyle = '#e94560';
    ctx2d.lineWidth = 2;
    ctx2d.beginPath();
    const sliceW = W / data.length;
    let x = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0;
      const y = v * H / 2;
      if (i === 0) ctx2d.moveTo(x, y);
      else ctx2d.lineTo(x, y);
      x += sliceW;
    }
    ctx2d.stroke();
    liveRafRef.current = requestAnimationFrame(drawLiveWave);
  }

  // Draw static waveform after recording
  const drawStaticWave = useCallback(async (url) => {
    const canvas = waveCanvasRef.current;
    if (!canvas || !url) return;
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext();
      }
      let buffer = rawBufferRef.current;
      if (!buffer) {
        const resp = await fetch(url);
        const ab = await resp.arrayBuffer();
        buffer = await audioCtxRef.current.decodeAudioData(ab);
        rawBufferRef.current = buffer;
      }
      const data = buffer.getChannelData(0);
      const W = canvas.width, H = canvas.height;
      const ctx2d = canvas.getContext('2d');
      ctx2d.fillStyle = '#0d1117';
      ctx2d.fillRect(0, 0, W, H);
      const step = Math.max(1, Math.floor(data.length / W));
      for (let x2 = 0; x2 < W; x2++) {
        let min = 1, max = -1;
        for (let j = 0; j < step; j++) {
          const s = data[x2 * step + j] || 0;
          if (s < min) min = s;
          if (s > max) max = s;
        }
        const yTop    = H / 2 - max * (H / 2) * 0.9;
        const yBottom = H / 2 - min * (H / 2) * 0.9;
        ctx2d.fillStyle = '#4ecdc4';
        ctx2d.fillRect(x2, yTop, 1, Math.max(1, yBottom - yTop));
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (audioUrl) drawStaticWave(audioUrl);
  }, [audioUrl, drawStaticWave]);

  async function startRecording() {
    setPermDenied(false);
    setElapsedSec(0);
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext();
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      rawBufferRef.current = null;

      // Wire analyser for live waveform
      const src = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      analyserRef.current = analyser;
      drawLiveWave();

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        cancelAnimationFrame(liveRafRef.current);
        clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = btoa(reader.result);
          onConfigChange({ ...config, audioData: b64 });
        };
        reader.readAsBinaryString(blob);
      };
      mr.start();
      setRecording(true);
      timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000);
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

  function handleDelete() {
    setAudioUrl(null);
    setRenderedUrl(null);
    rawBufferRef.current = null;
    setPlaying(false);
    onConfigChange({ ...config, audioData: null });
  }

  function handlePlay() {
    if (!renderedUrl) return;
    if (playing) {
      if (audioElemRef.current) audioElemRef.current.pause();
      setPlaying(false);
    } else {
      const el = new Audio(renderedUrl);
      el.loop = loop;
      el.play();
      el.onended = () => setPlaying(false);
      audioElemRef.current = el;
      setPlaying(true);
    }
  }

  const timerStr = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <style>{`
        @keyframes recordPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(233,69,96,0.7); } 70% { box-shadow: 0 0 0 14px rgba(233,69,96,0); } }
      `}</style>

      {/* Title */}
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>🎤 Röstlab Studio</div>

      {/* Permission denied */}
      {permDenied && (
        <div style={{ background: '#3d1f1f', border: '1px solid #f85149', borderRadius: 10, padding: '10px 14px', color: '#f85149', fontSize: '0.85rem' }}>
          Behöver mikrofontillstånd — tillåt i webbläsaren och prova igen.
        </div>
      )}

      {/* RECORD SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 0 12px', background: '#0d1117', borderRadius: 14 }}>
        {/* Big circular record button */}
        {!audioUrl && (
          <button
            onPointerDown={startRecording}
            onPointerUp={stopRecording}
            onPointerLeave={recording ? stopRecording : undefined}
            style={{
              width: 80, height: 80,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: recording ? '#e94560' : '#c0392b',
              animation: recording ? 'recordPulse 1.2s ease-out infinite' : 'none',
              fontSize: '2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {recording ? '⏺' : '🎤'}
          </button>
        )}
        <div style={{ color: recording ? '#e94560' : '#8b949e', fontSize: '0.9rem', fontWeight: 600 }}>
          {recording ? `⏺ Spelar in... ${timerStr}` : audioUrl ? '✅ Inspelad!' : '🎤 Håll inne för att spela in'}
        </div>
        {hasMixer && mixerChannel && (
          <div style={{ color: '#58a6ff', fontSize: '0.75rem', fontWeight: 600 }}>Kanal: [{mixerChannel}]</div>
        )}

        {/* Waveform canvas */}
        <div style={{ width: '90%', borderRadius: 8, overflow: 'hidden' }}>
          <canvas ref={waveCanvasRef} width={400} height={60}
            style={{ display: 'block', width: '100%', height: 60, background: '#0d1117' }} />
        </div>
      </div>

      {/* EFFECT SECTION */}
      <div>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>EFFEKT</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {EFFECTS.map(eff => (
            <button
              key={eff.id}
              onClick={() => onConfigChange({ ...config, effect: eff.id })}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '10px 8px', borderRadius: 10,
                border: effect === eff.id ? '2px solid #58a6ff' : '2px solid #30363d',
                background: effect === eff.id ? '#0d2744' : '#21262d',
                color: '#e6edf3', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>{eff.emoji}</span>
              <span>{eff.label}</span>
            </button>
          ))}
        </div>
        {applyingEffect && (
          <div style={{ color: '#8b949e', fontSize: '0.8rem', marginTop: 6, textAlign: 'center' }}>Applicerar effekt...</div>
        )}
      </div>

      {/* PLAYBACK SECTION */}
      {audioUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px', background: '#161b22', borderRadius: 12, border: '1px solid #30363d' }}>
          <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>SPELA UPP</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handlePlay}
              disabled={!renderedUrl || applyingEffect}
              style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                background: playing ? '#6e40c9' : '#238636', color: '#fff',
                fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              {playing ? '⏹ Stopp' : '▶ Spela'}
            </button>
            <button
              onClick={() => onConfigChange({ ...config, loop: !loop })}
              style={{
                padding: '10px 14px', borderRadius: 10,
                border: loop ? '2px solid #58a6ff' : '2px solid #30363d',
                background: loop ? '#0d2744' : '#21262d', color: '#e6edf3',
                fontSize: '1rem', cursor: 'pointer',
              }}
              title="Loopa"
            >
              🔁
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: '10px 14px', borderRadius: 10, border: '2px solid #30363d',
                background: '#21262d', color: '#f85149', fontSize: '1rem', cursor: 'pointer',
              }}
              title="Radera"
            >
              🗑️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
