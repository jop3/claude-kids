import React from 'react';

const TRIGGER_EVENTS = [
  { id: 'enter', label: 'Vid inträde',  emoji: '➡️' },
  { id: 'exit',  label: 'Vid utträde',  emoji: '⬅️' },
  { id: 'stay',  label: 'Stannar i',    emoji: '⏸️' },
];

const ACTIONS = [
  { id: 'next-level',    label: 'Nästa bana',    emoji: '🚪' },
  { id: 'show-message',  label: 'Visa meddelande', emoji: '💬' },
  { id: 'spawn-enemy',   label: 'Skapa fiende',   emoji: '👾' },
  { id: 'play-sound',    label: 'Spela ljud',      emoji: '🔊' },
  { id: 'win-game',      label: 'Vinn spelet',     emoji: '🏆' },
];

const ZONE_COLORS = [
  '#58a6ff40',
  '#4caf5040',
  '#ffd70040',
  '#ff444440',
  '#9c27b040',
];

const label = { color: '#8b949e', fontSize: '0.8rem', fontWeight: 700, letterSpacing: 1, marginBottom: 6, marginTop: 14 };

function SliderRow({ lbl, min, max, value, onChange }) {
  return (
    <div>
      <div style={{ ...label, display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
        <span>{lbl}</span>
        <span style={{ color: '#58a6ff' }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#58a6ff' }} />
    </div>
  );
}

function ZonePreview({ zoneW, zoneH, zoneX, zoneY, event: triggerEvent, action, color }) {
  const scale = 0.25;
  const previewW = 200;
  const previewH = 120;

  const scaledX = (zoneX / 800) * previewW;
  const scaledY = (zoneY / 600) * previewH;
  const scaledW = Math.max(20, (zoneW / 800) * previewW);
  const scaledH = Math.max(12, (zoneH / 600) * previewH);

  const actionObj = ACTIONS.find(a => a.id === action) || ACTIONS[0];
  const eventObj = TRIGGER_EVENTS.find(e => e.id === triggerEvent) || TRIGGER_EVENTS[0];

  return (
    <div style={{
      width: previewW, height: previewH, background: '#0d1117',
      border: '1px solid #30363d', borderRadius: 8, position: 'relative', overflow: 'hidden',
    }}>
      {/* Ground */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, background: '#3d4f6b' }} />

      {/* Zone */}
      <div style={{
        position: 'absolute',
        left: Math.min(scaledX, previewW - scaledW),
        top: Math.min(scaledY, previewH - scaledH - 20),
        width: scaledW,
        height: scaledH,
        background: color || '#58a6ff40',
        border: `2px dashed ${(color || '#58a6ff40').replace('40', 'cc')}`,
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
      }}>
        {actionObj.emoji}
      </div>

      {/* Label */}
      <div style={{
        position: 'absolute', top: 4, left: 6,
        color: '#8b949e', fontSize: '9px', fontWeight: 700,
      }}>
        {eventObj.emoji} {eventObj.label}
      </div>
    </div>
  );
}

export default function TriggerZoneBlock({ config, onConfigChange }) {
  const cfg = {
    zoneW: 100,
    zoneH: 80,
    zoneX: 300,
    zoneY: 200,
    event: 'enter',
    action: 'next-level',
    color: ZONE_COLORS[0],
    ...config,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>Triggerzion</div>
      <div style={{ color: '#8b949e', fontSize: '0.82rem', marginBottom: 12 }}>En zon som utlöser en händelse</div>

      <div style={label}>STORLEK</div>
      <SliderRow lbl="BREDD" min={20} max={400} value={cfg.zoneW}
        onChange={v => onConfigChange({ zoneW: v })} />
      <SliderRow lbl="HÖJD" min={20} max={300} value={cfg.zoneH}
        onChange={v => onConfigChange({ zoneH: v })} />

      <div style={{ marginTop: 8 }}>
        <SliderRow lbl="X-POSITION" min={0} max={800} value={cfg.zoneX}
          onChange={v => onConfigChange({ zoneX: v })} />
        <SliderRow lbl="Y-POSITION" min={0} max={600} value={cfg.zoneY}
          onChange={v => onConfigChange({ zoneY: v })} />
      </div>

      <div style={label}>UTLÖSARE</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {TRIGGER_EVENTS.map(e => (
          <button key={e.id} onClick={() => onConfigChange({ event: e.id })}
            style={{
              padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.event === e.id ? '#0d2744' : '#21262d',
              color: cfg.event === e.id ? '#58a6ff' : '#8b949e',
              outline: cfg.event === e.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
            <span style={{ fontSize: '1.1rem' }}>{e.emoji}</span>
            <span>{e.label}</span>
          </button>
        ))}
      </div>

      <div style={label}>HANDLING</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {ACTIONS.map(a => (
          <button key={a.id} onClick={() => onConfigChange({ action: a.id })}
            style={{
              padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: cfg.action === a.id ? '#0d2744' : '#21262d',
              color: cfg.action === a.id ? '#58a6ff' : '#8b949e',
              outline: cfg.action === a.id ? '2px solid #58a6ff' : '2px solid #30363d',
              fontWeight: 700, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
            <span style={{ fontSize: '1.1rem' }}>{a.emoji}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      <div style={label}>FARG</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {ZONE_COLORS.map(c => (
          <button key={c} onClick={() => onConfigChange({ color: c })}
            style={{
              width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: c.replace('40', 'cc'),
              outline: cfg.color === c ? '3px solid #58a6ff' : '2px solid #30363d',
              outlineOffset: 2,
            }} />
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ ...label, marginTop: 0 }}>FORHANDSVISNING</div>
        <ZonePreview
          zoneW={cfg.zoneW} zoneH={cfg.zoneH}
          zoneX={cfg.zoneX} zoneY={cfg.zoneY}
          event={cfg.event} action={cfg.action} color={cfg.color}
        />
      </div>
    </div>
  );
}
