import React, { useState, useRef, useEffect } from 'react';
import { getChannel } from '../mixer/mixerEngine.js';

const EFFECTS_MINI = [
  { id: 'normal',  label: 'Normal',  emoji: '🔊' },
  { id: 'robot',   label: 'Robot',   emoji: '🤖' },
  { id: 'ekorre',  label: 'Ekorre',  emoji: '🐭' },
  { id: 'monster', label: 'Monster', emoji: '👾' },
  { id: 'eko',     label: 'Eko',     emoji: '🔁' },
  { id: 'reverb',  label: 'Reverb',  emoji: '🌊' },
];

const TRACK_COLORS = ['#e94560', '#58a6ff', '#4ecdc4', '#f59e0b'];

let trackIdCounter = 1;
function newTrack() {
  return { id: `vlt-${trackIdCounter++}`, effect: 'normal', volume: 80, muted: false, solo: false, audioData: null };
}

function MiniWave({ audioData, color }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);
    if (!audioData) {
      ctx.strokeStyle = '#30363d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      return;
    }
    (async () => {
      try {
        const bytes = atob(audioData);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const actx = new AudioContext();
        const resp = await fetch(url);
        const ab = await resp.arrayBuffer();
        const buffer = await actx.decodeAudioData(ab);
        await actx.close();
        URL.revokeObjectURL(url);
        const data = buffer.getChannelData(0);
        const step = Math.max(1, Math.floor(data.length / W));
        for (let x = 0; x < W; x++) {
          let min = 1, max = -1;
          for (let j = 0; j < step; j++) {
            const s = data[x * step + j] || 0;
            if (s < min) min = s;
            if (s > max) max = s;
          }
          const yTop    = H / 2 - max * (H / 2) * 0.9;
          const yBottom = H / 2 - min * (H / 2) * 0.9;
          ctx.fillStyle = color;
          ctx.fillRect(x, yTop, 1, Math.max(1, yBottom - yTop));
        }
      } catch (_) {}
    })();
  }, [audioData, color]);
  return (
    <canvas ref={canvasRef} width={200} height={36}
      style={{ display: 'block', width: '100%', height: 36, background: '#0d1117', borderRadius: 4 }} />
  );
}

export default function VoiceLayersBlock({ config, onConfigChange, addedBlocks = [] }) {
  const tracks = config?.tracks ?? [newTrack()];
  const hasMixer = addedBlocks.some(b => b.type === 'mixer');

  const [recordingId, setRecordingId] = useState(null);
  const [playingAll, setPlayingAll]   = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const playbacksRef     = useRef([]);

  function updateTrack(id, patch) {
    const next = tracks.map(t => t.id === id ? { ...t, ...patch } : t);
    onConfigChange({ ...config, tracks: next });
  }

  async function startRecord(trackId) {
    setRecordingId(trackId);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        setRecordingId(null);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          updateTrack(trackId, { audioData: btoa(reader.result) });
        };
        reader.readAsBinaryString(blob);
      };
      mr.start();
    } catch (_) {
      setRecordingId(null);
    }
  }

  function stopRecord() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }

  async function playAll() {
    if (playingAll) {
      playbacksRef.current.forEach(el => el.pause());
      playbacksRef.current = [];
      setPlayingAll(false);
      return;
    }
    const activeTracks = tracks.filter(t => !t.muted && t.audioData);
    const soloTracks = activeTracks.filter(t => t.solo);
    const toPlay = soloTracks.length > 0 ? soloTracks : activeTracks;
    if (toPlay.length === 0) return;

    setPlayingAll(true);
    const elements = toPlay.map(track => {
      const bytes = atob(track.audioData);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      const blob = new Blob([arr], { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      const el = new Audio(url);
      el.volume = track.volume / 100;
      return el;
    });
    playbacksRef.current = elements;
    elements.forEach(el => el.play());
    const maxDuration = Math.max(...elements.map(el => el.duration || 10));
    setTimeout(() => {
      elements.forEach(el => el.pause());
      playbacksRef.current = [];
      setPlayingAll(false);
    }, maxDuration * 1000 + 500);
  }

  function sendToMixer(trackId) {
    if (!hasMixer) return;
    try { getChannel(trackId); } catch (_) {}
  }

  function addTrack() {
    if (tracks.length >= 4) return;
    onConfigChange({ ...config, tracks: [...tracks, newTrack()] });
  }

  function removeTrack(id) {
    onConfigChange({ ...config, tracks: tracks.filter(t => t.id !== id) });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>🎚️ Röst-spår</div>

      {tracks.map((track, idx) => {
        const isRec = recordingId === track.id;
        const color = TRACK_COLORS[idx % TRACK_COLORS.length];
        return (
          <div key={track.id} style={{
            background: '#161b22', border: `1px solid ${track.solo ? '#f59e0b' : '#30363d'}`,
            borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
            opacity: track.muted ? 0.5 : 1,
          }}>
            {/* Track header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ color: '#e6edf3', fontWeight: 700, fontSize: '0.9rem', flex: 1 }}>Spår {idx + 1}</span>
              <button onClick={() => updateTrack(track.id, { muted: !track.muted })}
                style={{ background: track.muted ? '#3d1f1f' : '#21262d', border: '1px solid #30363d', borderRadius: 6, color: track.muted ? '#f85149' : '#8b949e', padding: '3px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>
                {track.muted ? 'MUTED' : 'M'}
              </button>
              <button onClick={() => updateTrack(track.id, { solo: !track.solo })}
                style={{ background: track.solo ? '#2a1f00' : '#21262d', border: '1px solid #30363d', borderRadius: 6, color: track.solo ? '#f59e0b' : '#8b949e', padding: '3px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>
                S
              </button>
              {tracks.length > 1 && (
                <button onClick={() => removeTrack(track.id)}
                  style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}>
                  ×
                </button>
              )}
            </div>

            {/* Mini waveform */}
            <MiniWave audioData={track.audioData} color={color} />

            {/* Record button */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onPointerDown={() => startRecord(track.id)}
                onPointerUp={isRec ? stopRecord : undefined}
                onPointerLeave={isRec ? stopRecord : undefined}
                style={{
                  padding: '7px 14px', borderRadius: 8, border: 'none',
                  background: isRec ? '#e94560' : '#21262d',
                  color: isRec ? '#fff' : '#e6edf3',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  animation: isRec ? 'none' : undefined,
                }}
              >
                {isRec ? '⏺ Spelar in...' : (track.audioData ? '🔄 Spela in igen' : '🎤 Spela in')}
              </button>
              {hasMixer && track.audioData && (
                <button onClick={() => sendToMixer(track.id)}
                  style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #30363d', background: '#21262d', color: '#58a6ff', fontSize: '0.8rem', cursor: 'pointer' }}>
                  📤 Mixer
                </button>
              )}
            </div>

            {/* Effect mini dropdown */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {EFFECTS_MINI.map(eff => (
                <button key={eff.id}
                  onClick={() => updateTrack(track.id, { effect: eff.id })}
                  style={{
                    padding: '3px 7px', borderRadius: 6, cursor: 'pointer',
                    border: track.effect === eff.id ? `2px solid ${color}` : '2px solid #30363d',
                    background: track.effect === eff.id ? '#0d1117' : '#21262d',
                    color: '#e6edf3', fontSize: '0.75rem',
                  }}
                  title={eff.label}
                >
                  {eff.emoji}
                </button>
              ))}
            </div>

            {/* Volume slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#8b949e', fontSize: '0.75rem', width: 20 }}>🔈</span>
              <input type="range" min={0} max={100} value={track.volume}
                onChange={e => updateTrack(track.id, { volume: Number(e.target.value) })}
                style={{ flex: 1, accentColor: color }} />
              <span style={{ color: '#8b949e', fontSize: '0.75rem', width: 28 }}>{track.volume}%</span>
            </div>
          </div>
        );
      })}

      {/* Add track */}
      {tracks.length < 4 && (
        <button onClick={addTrack}
          style={{
            padding: '10px', borderRadius: 10, border: '2px dashed #30363d',
            background: 'transparent', color: '#8b949e', fontSize: '0.9rem',
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          + Lägg till spår ({tracks.length}/4)
        </button>
      )}

      {/* Play all */}
      <button onClick={playAll}
        disabled={!tracks.some(t => t.audioData)}
        style={{
          padding: '12px', borderRadius: 10, border: 'none',
          background: playingAll ? '#6e40c9' : '#238636',
          color: '#fff', fontSize: '1rem', fontWeight: 700,
          cursor: tracks.some(t => t.audioData) ? 'pointer' : 'not-allowed',
          opacity: tracks.some(t => t.audioData) ? 1 : 0.5,
        }}
      >
        {playingAll ? '⏹ Stopp' : '▶ Spela alla'}
      </button>
    </div>
  );
}
