import React, { useRef, useEffect, useState, useCallback } from 'react';

const PALETTE = ['#e94560','#2e86de','#27ae60','#f39c12','#9b59b6','#1abc9c','#e67e22','#16a085'];

function drawWheel(canvas, segments, rotation, resultIdx) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const r  = Math.min(cx, cy) - 6;
  ctx.clearRect(0, 0, W, H);

  const n = segments.length;
  const sliceAngle = (Math.PI * 2) / n;

  segments.forEach((seg, i) => {
    const startAngle = rotation + i * sliceAngle;
    const endAngle   = startAngle + sliceAngle;
    const isResult   = i === resultIdx;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = isResult ? lighten(seg.color) : seg.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Label
    const midAngle = startAngle + sliceAngle / 2;
    const labelR   = r * 0.65;
    const lx = cx + Math.cos(midAngle) * labelR;
    const ly = cy + Math.sin(midAngle) * labelR;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(midAngle + Math.PI / 2);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(9, Math.min(14, 80 / n))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = seg.label || `${i + 1}`;
    ctx.fillText(text.slice(0, 8), 0, 0);
    ctx.restore();
  });

  // Center cap
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Arrow pointer at top
  ctx.save();
  ctx.translate(cx, cy - r - 2);
  ctx.fillStyle = '#ffe066';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(-9, -6);
  ctx.lineTo(9, -6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function lighten(hex) {
  if (!hex) return '#ffffff';
  const clean = hex.replace('#', '');
  const r = Math.min(255, parseInt(clean.slice(0,2), 16) + 60);
  const g = Math.min(255, parseInt(clean.slice(2,4), 16) + 60);
  const b = Math.min(255, parseInt(clean.slice(4,6), 16) + 60);
  return `rgb(${r},${g},${b})`;
}

function defaultSegments(n) {
  return Array.from({ length: n }, (_, i) => ({
    label: `${i + 1}`,
    color: PALETTE[i % PALETTE.length],
  }));
}

export default function SpinnerBlock({ config = {}, onConfigChange }) {
  const segCount  = config.segCount  || 4;
  const segments  = config.segments  || defaultSegments(segCount);

  const canvasRef     = useRef(null);
  const rotRef        = useRef(-Math.PI / 2);
  const animRef       = useRef(null);
  const [spinning, setSpinning]    = useState(false);
  const [resultIdx, setResultIdx]  = useState(null);

  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawWheel(canvas, segments, rotRef.current, resultIdx);
  }, [segments, resultIdx]);

  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setResultIdx(null);

    const totalRotation = (2 + Math.random() * 2) * Math.PI * 2;
    const duration = 2200 + Math.random() * 800;
    const startRot = rotRef.current;
    const startTime = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      rotRef.current = startTime ? startRot + totalRotation * easeOut(progress) : startRot;

      const canvas = canvasRef.current;
      if (canvas) drawWheel(canvas, segments, rotRef.current, null);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        // Determine result: which segment is at top (pointing arrow at -PI/2)
        const n = segments.length;
        const sliceAngle = (Math.PI * 2) / n;
        const normalizedRot = ((rotRef.current % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const topAngle = (Math.PI * 1.5 - normalizedRot + Math.PI * 2) % (Math.PI * 2);
        const idx = Math.floor(topAngle / sliceAngle) % n;
        setResultIdx(idx);
        setSpinning(false);
      }
    }

    animRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  function handleSegCountChange(n) {
    onConfigChange({ segCount: n, segments: defaultSegments(n) });
  }

  function handleLabelChange(i, val) {
    const next = segments.map((s, idx) => idx === i ? { ...s, label: val } : s);
    onConfigChange({ segments: next });
  }

  function handleColorChange(i, color) {
    const next = segments.map((s, idx) => idx === i ? { ...s, color } : s);
    onConfigChange({ segments: next });
  }

  const label = { color: '#8b949e', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4, marginTop: 10 };

  return (
    <div style={{ color: '#e6edf3' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>Snurra</div>

      <canvas
        ref={canvasRef}
        width={170}
        height={170}
        style={{ display: 'block', margin: '0 auto', borderRadius: '50%', border: '2px solid #30363d' }}
      />

      {resultIdx !== null && (
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: '1.1rem', fontWeight: 900, color: segments[resultIdx]?.color || '#ffe066' }}>
          {segments[resultIdx]?.label || `${resultIdx + 1}`}
        </div>
      )}

      <button onClick={spin} disabled={spinning}
        style={{ width: '100%', padding: '12px', fontSize: '1.1rem', fontWeight: 900, borderRadius: 10, border: 'none', background: spinning ? '#3a3a5a' : '#6c3bbd', color: '#fff', cursor: spinning ? 'not-allowed' : 'pointer', marginTop: 10, marginBottom: 8 }}>
        {spinning ? '...' : '\ud83c\udf00 Snurra!'}
      </button>

      <div style={{ background: '#21262d', borderRadius: 8, padding: '10px 12px' }}>
        <div style={label}>Antal segment</div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[2, 3, 4, 5, 6, 7, 8].map(n => (
            <button key={n} onClick={() => handleSegCountChange(n)}
              style={{ flex: 1, padding: '5px 2px', borderRadius: 6, border: segCount === n ? '2px solid #58a6ff' : '1px solid #30363d', background: segCount === n ? '#0d2744' : '#0d1117', color: '#e6edf3', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
              {n}
            </button>
          ))}
        </div>

        <div style={label}>Segment</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: seg.color, flexShrink: 0, border: '1px solid #fff3' }} />
              <input
                value={seg.label}
                onChange={e => handleLabelChange(i, e.target.value)}
                maxLength={10}
                style={{ flex: 1, background: '#0d1117', border: '1px solid #30363d', color: '#e6edf3', borderRadius: 5, padding: '3px 7px', fontSize: '0.85rem', minWidth: 0 }}
              />
              <div style={{ display: 'flex', gap: 3 }}>
                {PALETTE.slice(0, 5).map(c => (
                  <button key={c} onClick={() => handleColorChange(i, c)}
                    style={{ width: 16, height: 16, borderRadius: '50%', background: c, border: seg.color === c ? '2px solid #fff' : '1px solid transparent', cursor: 'pointer', padding: 0 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
