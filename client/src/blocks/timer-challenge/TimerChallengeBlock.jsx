import React, { useState, useEffect, useRef } from 'react';

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

const TIME_OPTIONS = [
  { val: 5, label: '5s' },
  { val: 10, label: '10s' },
  { val: 15, label: '15s' },
  { val: 30, label: '30s' },
  { val: 0, label: 'Ingen' },
];

const STYLES = ['digital', 'bar', 'circle'];

const PENALTIES = [
  { key: 'none', label: 'Ingen' },
  { key: 'minus1', label: '-1 poang' },
  { key: 'skip', label: 'Hoppa over' },
];

function CircleTimer({ pct, warning }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - pct);
  const color = warning ? '#e94560' : '#1f6feb';
  return (
    <svg width="90" height="90" style={{ display: 'block' }}>
      <circle cx="45" cy="45" r={r} fill="none" stroke="#dde" strokeWidth="8" />
      <circle
        cx="45" cy="45" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        transform="rotate(-90 45 45)"
        style={{ transition: 'stroke-dashoffset 0.1s, stroke 0.3s' }}
      />
      <text
        x="45" y="50"
        textAnchor="middle"
        fontSize="18"
        fontWeight="bold"
        fill={warning ? '#e94560' : '#1a1a2e'}
        style={{ animation: warning ? 'pulse 0.5s infinite alternate' : 'none' }}
      >
        {Math.ceil(pct * 99)}
      </text>
    </svg>
  );
}

export default function TimerChallengeBlock({ config = {}, onConfigChange }) {
  const timePerQ = config.timePerQ ?? 10;
  const displayStyle = config.displayStyle || 'digital';
  const penalty = config.penalty || 'none';

  const [demoTime, setDemoTime] = useState(timePerQ > 0 ? timePerQ : 10);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  function update(patch) { onConfigChange({ ...config, ...patch }); }

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setDemoTime(t => {
        if (t <= 0.1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          return 0;
        }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const maxTime = timePerQ > 0 ? timePerQ : 10;
  const pct = demoTime / maxTime;
  const warning = demoTime <= 3 && demoTime > 0;

  function startDemo() {
    setDemoTime(maxTime);
    setRunning(true);
  }

  function stopDemo() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setDemoTime(maxTime);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        Tidsbegransning
      </div>

      <div>
        <div style={LABEL_STYLE}>TID PER FRAGA</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TIME_OPTIONS.map(opt => (
            <button key={opt.val} onClick={() => { update({ timePerQ: opt.val }); setDemoTime(opt.val > 0 ? opt.val : 10); setRunning(false); }}
              style={{ ...BTN_BASE, background: timePerQ === opt.val ? '#1f6feb' : '#21262d' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={LABEL_STYLE}>VISNINGSSTIL</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {STYLES.map(s => (
            <button key={s} onClick={() => update({ displayStyle: s })}
              style={{ ...BTN_BASE, flex: 1, background: displayStyle === s ? '#1f6feb' : '#21262d', textTransform: 'capitalize' }}>
              {s === 'digital' ? 'Digital' : s === 'bar' ? 'Bar' : 'Cirkel'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={LABEL_STYLE}>VID TIMEOUT</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PENALTIES.map(p => (
            <button key={p.key} onClick={() => update({ penalty: p.key })}
              style={{ ...BTN_BASE, background: penalty === p.key ? '#1f6feb' : '#21262d' }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={running ? stopDemo : startDemo}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 8,
            border: 'none',
            background: running ? '#e94560' : '#238636',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}>
          {running ? 'Stoppa' : 'Demo-start'}
        </button>
      </div>

      <style>{`
        @keyframes pulse { 0%{opacity:1} 100%{opacity:0.5} }
      `}</style>

      <div style={{
        background: '#f0f4ff',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 90,
      }}>
        {displayStyle === 'digital' && (
          <div style={{
            fontSize: '3rem',
            fontWeight: 700,
            fontFamily: 'monospace',
            color: warning ? '#e94560' : '#1a1a2e',
            animation: warning ? 'pulse 0.5s infinite alternate' : 'none',
          }}>
            {Math.ceil(demoTime)}
          </div>
        )}
        {displayStyle === 'bar' && (
          <div style={{ width: '100%' }}>
            <div style={{ background: '#dde', borderRadius: 20, height: 24, overflow: 'hidden' }}>
              <div style={{
                width: `${pct * 100}%`,
                height: '100%',
                background: warning ? '#e94560' : '#1f6feb',
                borderRadius: 20,
                transition: 'width 0.1s, background 0.3s',
                animation: warning ? 'pulse 0.5s infinite alternate' : 'none',
              }} />
            </div>
            <div style={{ textAlign: 'center', marginTop: 6, fontWeight: 700, color: '#1a1a2e' }}>
              {Math.ceil(demoTime)}s
            </div>
          </div>
        )}
        {displayStyle === 'circle' && (
          <CircleTimer pct={pct} warning={warning} />
        )}
      </div>
    </div>
  );
}
