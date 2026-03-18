import React, { useState, useRef, useEffect } from 'react';

function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate  = buffer.sampleRate;
  const numFrames   = buffer.length;
  const bytesPerSample = 2;
  const blockAlign  = numChannels * bytesPerSample;
  const byteRate    = sampleRate * blockAlign;
  const dataSize    = numFrames * blockAlign;
  const ab  = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  function writeStr(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }
  writeStr(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE'); writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); writeStr(36, 'data');
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const s = buffer.getChannelData(ch)[i];
      const c = Math.max(-1, Math.min(1, s));
      view.setInt16(offset, c < 0 ? c * 0x8000 : c * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}

export default function LoopRecorderBlock({ config, onConfigChange, addedBlocks = [] }) {
  const bars = config?.bars ?? 4;
  const audioDataB64 = config?.audioData ?? null;

  // Infer BPM from drums block if added
  const drumsBlock = addedBlocks.find(b => b.type === 'drums');
  const bpm = drumsBlock ? 120 : (config?.bpm ?? 120);

  const [recording, setRecording]     = useState(false);
  const [progress, setProgress]       = useState(0); // 0-1
  const [audioUrl, setAudioUrl]       = useState(null);
  const [playing, setPlaying]         = useState(false);
  const [permDenied, setPermDenied]   = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const ringCanvasRef    = useRef(null);
  const waveCanvasRef    = useRef(null);
  const progressRafRef   = useRef(null);
  const audioElemRef     = useRef(null);
  const recordStartRef   = useRef(null);

  // Restore saved audio
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

  const secPerBar = (60 / bpm) * 4;
  const loopDuration = bars * secPerBar;

  // Draw circular progress ring
  useEffect(() => {
    const canvas = ringCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 8;

    ctx.clearRect(0, 0, W, H);
    // Background ring
    ctx.strokeStyle = '#21262d';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    // Progress arc
    if (progress > 0) {
      ctx.strokeStyle = recording ? '#e94560' : '#4ecdc4';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.stroke();
    }
    // Center text
    ctx.fillStyle = recording ? '#e94560' : (audioUrl ? '#4ecdc4' : '#8b949e');
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(recording ? `${bars} takt` : (audioUrl ? '✓' : `${bars}T`), cx, cy);
  }, [progress, recording, bars, audioUrl]);

  // Draw static waveform of loop
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas || !audioUrl) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    (async () => {
      try {
        const actx = new AudioContext();
        const resp = await fetch(audioUrl);
        const ab = await resp.arrayBuffer();
        const buffer = await actx.decodeAudioData(ab);
        await actx.close();
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
          ctx.fillStyle = '#6c3bbd';
          ctx.fillRect(x, yTop, 1, Math.max(1, yBottom - yTop));
        }
      } catch (_) {}
    })();
  }, [audioUrl]);

  async function startLoop() {
    setPermDenied(false);
    setProgress(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        cancelAnimationFrame(progressRafRef.current);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setProgress(1);
        setRecording(false);
        const reader = new FileReader();
        reader.onload = () => {
          onConfigChange({ ...config, audioData: btoa(reader.result) });
        };
        reader.readAsBinaryString(blob);
      };
      mr.start();
      recordStartRef.current = performance.now();
      setRecording(true);

      // Auto-stop after loopDuration
      const stopAt = performance.now() + loopDuration * 1000;

      function tickProgress() {
        const elapsed = (performance.now() - recordStartRef.current) / 1000;
        const p = Math.min(elapsed / loopDuration, 1);
        setProgress(p);
        if (performance.now() < stopAt) {
          progressRafRef.current = requestAnimationFrame(tickProgress);
        } else {
          if (mr.state !== 'inactive') mr.stop();
        }
      }
      progressRafRef.current = requestAnimationFrame(tickProgress);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermDenied(true);
      }
    }
  }

  function handlePlay() {
    if (!audioUrl) return;
    if (playing) {
      if (audioElemRef.current) audioElemRef.current.pause();
      setPlaying(false);
    } else {
      const el = new Audio(audioUrl);
      el.loop = true;
      el.play();
      el.onpause = () => setPlaying(false);
      audioElemRef.current = el;
      setPlaying(true);
    }
  }

  function handleReRecord() {
    if (audioElemRef.current) audioElemRef.current.pause();
    setAudioUrl(null);
    setPlaying(false);
    setProgress(0);
    onConfigChange({ ...config, audioData: null });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>🔄 Loop Recorder</div>

      {permDenied && (
        <div style={{ background: '#3d1f1f', border: '1px solid #f85149', borderRadius: 10, padding: '10px 14px', color: '#f85149', fontSize: '0.85rem' }}>
          Behöver mikrofontillstånd — tillåt i webbläsaren och prova igen.
        </div>
      )}

      {/* BPM + bars selector */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ color: '#58a6ff', fontSize: '0.9rem', fontWeight: 700 }}>
          {bpm} BPM
          {drumsBlock && <span style={{ color: '#8b949e', fontSize: '0.75rem', marginLeft: 4 }}>(synkat)</span>}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ color: '#8b949e', fontSize: '0.8rem', fontWeight: 700 }}>TAKTER</div>
        {[2, 4, 8].map(b => (
          <button
            key={b}
            onClick={() => onConfigChange({ ...config, bars: b })}
            style={{
              padding: '6px 12px', borderRadius: 8,
              border: bars === b ? '2px solid #58a6ff' : '2px solid #30363d',
              background: bars === b ? '#0d2744' : '#21262d',
              color: '#e6edf3', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Ring + controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px', background: '#0d1117', borderRadius: 14 }}>
        <canvas ref={ringCanvasRef} width={100} height={100} style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <div style={{ color: '#8b949e', fontSize: '0.8rem' }}>
            Loop: {loopDuration.toFixed(1)}s ({bars} takter @ {bpm} BPM)
          </div>
          {!recording && !audioUrl && (
            <button
              onClick={startLoop}
              style={{
                padding: '12px', borderRadius: 10, border: 'none',
                background: '#e94560', color: '#fff', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              ⏺ Spela in loop
            </button>
          )}
          {recording && (
            <div style={{ color: '#e94560', fontWeight: 700, fontSize: '0.9rem' }}>
              Spelar in... ({Math.round(progress * loopDuration)}s / {loopDuration.toFixed(0)}s)
            </div>
          )}
          {audioUrl && !recording && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handlePlay}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                  background: playing ? '#6e40c9' : '#238636', color: '#fff',
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                {playing ? '⏹ Stopp' : '▶ Spela loop'}
              </button>
              <button
                onClick={handleReRecord}
                style={{
                  padding: '10px 14px', borderRadius: 10,
                  border: '2px solid #30363d', background: '#21262d',
                  color: '#e6edf3', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                🔄 Igen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Waveform of recorded loop */}
      {audioUrl && (
        <div style={{ borderRadius: 8, overflow: 'hidden' }}>
          <canvas ref={waveCanvasRef} width={400} height={48}
            style={{ display: 'block', width: '100%', height: 48, background: '#0d1117' }} />
        </div>
      )}
    </div>
  );
}
