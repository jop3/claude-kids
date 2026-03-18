import React, { useState, useEffect } from 'react';

const LABEL_STYLE = {
  color: '#8b949e',
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: 1,
  marginBottom: 4,
};

const BTN_BASE = {
  border: '1px solid #30363d',
  borderRadius: 8,
  color: '#e6edf3',
  padding: '8px 14px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.85rem',
};

const INPUT_STYLE = {
  background: '#21262d',
  border: '1px solid #30363d',
  borderRadius: 6,
  color: '#e6edf3',
  padding: '8px 10px',
  fontSize: '0.9rem',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const ANIMATIONS = ['bounce', 'slide', 'fade', 'pop'];
const DURATIONS = [1, 2, 3];

function getAnimStyle(anim, visible, duration) {
  if (!visible) return { opacity: 0, transform: 'scale(0)', transition: 'none' };
  const ms = `${duration * 0.3}s`;
  if (anim === 'bounce') return {
    animation: `bounce-in ${ms} cubic-bezier(0.36, 0.07, 0.19, 0.97) both`,
    opacity: 1,
  };
  if (anim === 'slide') return {
    animation: `slide-in ${ms} ease both`,
    opacity: 1,
  };
  if (anim === 'fade') return {
    animation: `fade-in ${ms} ease both`,
    opacity: 1,
  };
  if (anim === 'pop') return {
    animation: `pop-in ${ms} cubic-bezier(0.175, 0.885, 0.32, 1.275) both`,
    opacity: 1,
  };
  return { opacity: 1 };
}

function playBlip(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'correct' ? 880 : 220;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

export default function FeedbackMsgBlock({ config = {}, onConfigChange }) {
  const [visible, setVisible] = useState(false);
  const [msgType, setMsgType] = useState(null);

  const correctMsg = config.correctMsg || 'Ratt!';
  const wrongMsg = config.wrongMsg || 'Fel, forsok igen!';
  const animation = config.animation || 'bounce';
  const sound = config.sound !== false;
  const duration = config.duration || 2;

  function update(patch) { onConfigChange({ ...config, ...patch }); }

  function show(type) {
    setMsgType(type);
    setVisible(true);
    if (sound) playBlip(type);
    setTimeout(() => setVisible(false), duration * 1000);
  }

  const msg = msgType === 'correct' ? correctMsg : wrongMsg;
  const color = msgType === 'correct' ? '#3bb273' : '#e94560';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        Aterkopling
      </div>

      <div>
        <div style={LABEL_STYLE}>RATT SVAR-MEDDELANDE</div>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={e => update({ correctMsg: e.currentTarget.innerText })}
          style={INPUT_STYLE}
        >
          {correctMsg}
        </div>
      </div>

      <div>
        <div style={LABEL_STYLE}>FEL SVAR-MEDDELANDE</div>
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={e => update({ wrongMsg: e.currentTarget.innerText })}
          style={INPUT_STYLE}
        >
          {wrongMsg}
        </div>
      </div>

      <div>
        <div style={LABEL_STYLE}>ANIMATION</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ANIMATIONS.map(a => (
            <button key={a} onClick={() => update({ animation: a })}
              style={{ ...BTN_BASE, background: animation === a ? '#1f6feb' : '#21262d', textTransform: 'capitalize' }}>
              {a}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div>
          <div style={LABEL_STYLE}>VARAKTIGHET</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {DURATIONS.map(d => (
              <button key={d} onClick={() => update({ duration: d })}
                style={{ ...BTN_BASE, background: duration === d ? '#1f6feb' : '#21262d' }}>
                {d}s
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={LABEL_STYLE}>LJUD</div>
          <button onClick={() => update({ sound: !sound })}
            style={{ ...BTN_BASE, background: sound ? '#238636' : '#21262d', border: 'none', color: '#fff' }}>
            {sound ? 'Pa' : 'Av'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => show('correct')}
          style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#3bb273', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
          Ratt!
        </button>
        <button onClick={() => show('wrong')}
          style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#e94560', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
          Fel!
        </button>
      </div>

      <style>{`
        @keyframes bounce-in { 0%{transform:scale(0.3);opacity:0} 50%{transform:scale(1.15)} 70%{transform:scale(0.95)} 100%{transform:scale(1);opacity:1} }
        @keyframes slide-in { 0%{transform:translateY(-30px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes fade-in { 0%{opacity:0} 100%{opacity:1} }
        @keyframes pop-in { 0%{transform:scale(0);opacity:0} 80%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
      `}</style>

      <div style={{ minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {visible && (
          <div style={{
            background: color,
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.3rem',
            padding: '12px 24px',
            borderRadius: 16,
            ...getAnimStyle(animation, visible, duration),
          }}>
            {msg}
          </div>
        )}
        {!visible && (
          <div style={{ color: '#8b949e', fontSize: '0.85rem' }}>Tryck Ratt! eller Fel! for att testa</div>
        )}
      </div>
    </div>
  );
}
