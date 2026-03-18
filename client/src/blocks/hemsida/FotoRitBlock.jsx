import React, { useRef, useEffect, useState } from 'react';
import { SPRITES } from '../../lib/sprites.js';

const PALETTE = ['#e94560', '#f18f01', '#3bb273', '#2d7dd2', '#6c3bbd', '#000000', '#ffffff', '#f59e0b'];
const PICK_SPRITES = SPRITES.slice(0, 24);

export default function FotoRitBlock({ config = {}, onConfigChange }) {
  const mode = config.mode || 'rita';
  const canvasData = config.canvasData || null;
  const selectedSprite = config.sprite || null;
  const canvasRef = useRef(null);
  const [drawColor, setDrawColor] = useState('#e94560');
  const [tool, setTool] = useState('pencil');
  const isDrawing = useRef(false);
  const lastPos = useRef(null);

  useEffect(() => {
    if (mode !== 'rita' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (canvasData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = canvasData;
    } else {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [mode]);

  function saveCanvas() {
    if (!canvasRef.current) return;
    onConfigChange({ canvasData: canvasRef.current.toDataURL() });
  }

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function startDraw(e) {
    isDrawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
    e.preventDefault();
  }

  function draw(e) {
    if (!isDrawing.current || !canvasRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : drawColor;
    ctx.lineWidth = tool === 'eraser' ? 20 : 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
  }

  function endDraw() {
    if (isDrawing.current) {
      isDrawing.current = false;
      saveCanvas();
    }
  }

  function clearCanvas() {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onConfigChange({ canvasData: null });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1 }}>
        Foto / Ritning
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { id: 'rita', label: '✏️ Rita' },
          { id: 'bild', label: '🖼️ Välj bild' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => onConfigChange({ mode: m.id })}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: 12,
              border: 'none',
              background: mode === m.id ? '#2d7dd2' : '#21262d',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'rita' && (
        <>
          {/* Color palette */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PALETTE.map(c => (
              <button
                key={c}
                onClick={() => { setDrawColor(c); setTool('pencil'); }}
                style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  background: c,
                  border: drawColor === c && tool === 'pencil' ? '3px solid #fff' : '2px solid #444',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
            ))}
            <button
              onClick={() => setTool('eraser')}
              style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: tool === 'eraser' ? '#58a6ff' : '#21262d',
                border: tool === 'eraser' ? '3px solid #fff' : '2px solid #444',
                cursor: 'pointer',
                fontSize: '1.1rem',
                flexShrink: 0,
              }}
              title="Suddgummi"
            >
              🧹
            </button>
          </div>

          {/* Drawing canvas */}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid #30363d' }}>
            <canvas
              ref={canvasRef}
              width={300}
              height={200}
              style={{ display: 'block', width: '100%', touchAction: 'none', cursor: 'crosshair', background: '#fff' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>

          <button
            onClick={clearCanvas}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#21262d',
              color: '#e6edf3',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            🗑️ Rensa
          </button>
        </>
      )}

      {mode === 'bild' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 6,
        }}>
          {PICK_SPRITES.map(sp => (
            <button
              key={sp.id}
              onClick={() => onConfigChange({ sprite: sp.id })}
              style={{
                background: selectedSprite === sp.id ? '#0d2744' : '#21262d',
                border: selectedSprite === sp.id ? '2px solid #58a6ff' : '2px solid #30363d',
                borderRadius: 10,
                padding: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1',
              }}
            >
              <img src={sp.dataUrl} alt={sp.name} style={{ width: '100%', height: '100%' }} />
            </button>
          ))}
        </div>
      )}

      {mode === 'bild' && selectedSprite && (
        <div style={{ color: '#58a6ff', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>
          Vald: {SPRITES.find(s => s.id === selectedSprite)?.name}
        </div>
      )}
    </div>
  );
}
