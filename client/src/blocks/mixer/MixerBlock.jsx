import React, { useState, useEffect, useRef } from 'react';
import {
  getChannel,
  getMasterChannel,
  setVolume,
  setMasterVolume,
  setPan,
  setMute,
  setSolo,
  setMasterReverb,
} from './mixerEngine.js';

const TRACK_META = {
  drums: { emoji: '🥁', label: 'Trummor' },
  synth:  { emoji: '🎹', label: 'Synth' },
  voice:  { emoji: '🎤', label: 'Röst' },
  mixer:  { emoji: '🎚️', label: 'Mixer' },
};

function getTrackMeta(block) {
  return TRACK_META[block.type] || { emoji: block.emoji || '🎵', label: block.name || block.id };
}

// Animated fake level meter — 3 bars pulsing via CSS
const METER_STYLE = `
@keyframes meter-pulse-1 { 0%,100%{height:30%} 50%{height:80%} }
@keyframes meter-pulse-2 { 0%,100%{height:60%} 33%{height:20%} 66%{height:90%} }
@keyframes meter-pulse-3 { 0%,100%{height:90%} 40%{height:40%} 80%{height:70%} }
`;

function LevelMeter({ muted }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 2,
      height: 32,
      justifyContent: 'center',
      opacity: muted ? 0.2 : 1,
      transition: 'opacity 0.2s',
    }}>
      <style>{METER_STYLE}</style>
      <div style={{ width: 5, background: '#3fb950', borderRadius: 2, animation: muted ? 'none' : 'meter-pulse-1 0.7s infinite' }} />
      <div style={{ width: 5, background: '#d29922', borderRadius: 2, animation: muted ? 'none' : 'meter-pulse-2 0.9s infinite' }} />
      <div style={{ width: 5, background: '#f85149', borderRadius: 2, animation: muted ? 'none' : 'meter-pulse-3 0.6s infinite' }} />
    </div>
  );
}

function panLabel(val) {
  if (val < -15) return 'L';
  if (val > 15) return 'R';
  return 'C';
}

export default function MixerBlock({ addedBlocks = [], config, onConfigChange }) {
  const audioTracks = (addedBlocks || []).filter(b => b.type !== 'mixer' && b.type !== 'color-picker').slice(0, 4);

  function getTrackConfig(trackId) {
    return (config?.tracks?.[trackId]) || { volume: 80, pan: 0, muted: false, soloed: false };
  }

  function updateTrack(trackId, patch) {
    const current = getTrackConfig(trackId);
    const updated = { ...current, ...patch };
    onConfigChange({
      ...config,
      tracks: {
        ...(config?.tracks || {}),
        [trackId]: updated,
      },
    });
    return updated;
  }

  const masterVolume = config?.masterVolume ?? 90;
  const masterReverb = config?.masterReverb ?? 20;

  // Sync engine on mount and when config changes
  useEffect(() => {
    audioTracks.forEach(block => {
      const tc = getTrackConfig(block.id);
      getChannel(block.id); // ensure exists
      setVolume(block.id, tc.volume);
      setPan(block.id, tc.pan);
      setMute(block.id, tc.muted);
    });
    getMasterChannel();
    setMasterVolume(masterVolume);
    setMasterReverb(masterReverb);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleVolume(trackId, val) {
    const updated = updateTrack(trackId, { volume: val });
    setVolume(trackId, updated.volume);
  }

  function handlePan(trackId, val) {
    const updated = updateTrack(trackId, { pan: val });
    setPan(trackId, updated.pan);
  }

  function handleMute(trackId) {
    const tc = getTrackConfig(trackId);
    const muted = !tc.muted;
    updateTrack(trackId, { muted, soloed: false });
    setMute(trackId, muted);
  }

  function handleSolo(trackId) {
    const tc = getTrackConfig(trackId);
    const soloed = !tc.soloed;
    // Clear solo on all others
    const newTracks = {};
    audioTracks.forEach(b => {
      const btc = getTrackConfig(b.id);
      newTracks[b.id] = { ...btc, soloed: b.id === trackId ? soloed : false };
    });
    onConfigChange({ ...config, tracks: { ...(config?.tracks || {}), ...newTracks } });
    setSolo(soloed ? trackId : null, soloed);
  }

  function handleMasterVolume(val) {
    onConfigChange({ ...config, masterVolume: val });
    setMasterVolume(val);
  }

  function handleMasterReverb(val) {
    onConfigChange({ ...config, masterReverb: val });
    setMasterReverb(val);
  }

  const sliderStyle = {
    writingMode: 'vertical-lr',
    direction: 'rtl',
    appearance: 'slider-vertical',
    WebkitAppearance: 'slider-vertical',
    width: 28,
    height: 100,
    accentColor: '#58a6ff',
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ color: '#e6edf3', fontWeight: 700, fontSize: '1rem' }}>
        🎚️ Mixer
      </div>

      {audioTracks.length === 0 && (
        <div style={{ color: '#8b949e', fontSize: '0.85rem' }}>
          Lagg till Trummor, Synth eller Rost-block for att se kanalstrippar har.
        </div>
      )}

      {/* Channel strips */}
      {audioTracks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'row', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {audioTracks.map(block => {
            const tc = getTrackConfig(block.id);
            const meta = getTrackMeta(block);
            return (
              <div
                key={block.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  background: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: 12,
                  padding: '12px 10px',
                  minWidth: 72,
                  opacity: tc.muted ? 0.55 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Track name + emoji */}
                <div style={{ fontSize: '1.3rem', lineHeight: 1 }}>{meta.emoji}</div>
                <div style={{
                  color: '#c9d1d9',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  letterSpacing: 0.5,
                  maxWidth: 60,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {meta.label}
                </div>

                {/* Level meter */}
                <LevelMeter muted={tc.muted} />

                {/* Volume fader (vertical) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#8b949e', fontSize: '0.62rem', fontWeight: 700, letterSpacing: 1 }}>VOL</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={tc.volume}
                    onChange={e => handleVolume(block.id, Number(e.target.value))}
                    style={sliderStyle}
                  />
                  <span style={{ color: '#e6edf3', fontSize: '0.65rem', fontWeight: 700 }}>{tc.volume}</span>
                </div>

                {/* Pan slider */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
                  <span style={{ color: '#8b949e', fontSize: '0.62rem', fontWeight: 700, letterSpacing: 1 }}>PAN</span>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={tc.pan}
                    onChange={e => handlePan(block.id, Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#d2a8ff', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#e6edf3', fontSize: '0.65rem', fontWeight: 700 }}>{panLabel(tc.pan)}</span>
                </div>

                {/* Mute button */}
                <button
                  onClick={() => handleMute(block.id)}
                  title="Mute"
                  style={{
                    width: 40,
                    height: 32,
                    borderRadius: 8,
                    border: 'none',
                    background: tc.muted ? '#da3633' : '#30363d',
                    color: '#fff',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  🔇
                </button>

                {/* Solo button */}
                <button
                  onClick={() => handleSolo(block.id)}
                  title="Solo"
                  style={{
                    width: 40,
                    height: 32,
                    borderRadius: 8,
                    border: 'none',
                    background: tc.soloed ? '#d29922' : '#30363d',
                    color: '#fff',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  🎧
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Master section */}
      <div style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}>
        <div style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>MASTER</div>

        {/* Master volume */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700 }}>VOLYM</span>
            <span style={{ color: '#e6edf3', fontSize: '0.8rem', fontWeight: 700 }}>{masterVolume}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={masterVolume}
            onChange={e => handleMasterVolume(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#3fb950', cursor: 'pointer' }}
          />
        </div>

        {/* Master reverb */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 700 }}>REVERB</span>
            <span style={{ color: '#e6edf3', fontSize: '0.8rem', fontWeight: 700 }}>{masterReverb}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={masterReverb}
            onChange={e => handleMasterReverb(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#d2a8ff', cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
}
