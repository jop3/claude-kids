import * as Tone from 'tone';

/**
 * Encodes an AudioBuffer to a WAV Blob (16-bit PCM, stereo or mono).
 */
export function encodeWav(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numFrames = audioBuffer.length;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // RIFF chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);          // sub-chunk size
  view.setUint16(20, 1, true);           // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);          // bits per sample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write interleaved PCM samples
  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = audioBuffer.getChannelData(ch)[i];
      // Clamp and convert float32 to int16
      const clamped = Math.max(-1, Math.min(1, sample));
      const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Export the project to a WAV file and trigger a browser download.
 * Uses Tone.Offline() to render audio without real-time playback.
 */
export async function exportToWav(project, durationSeconds = 8) {
  const blocks = project?.blocks || [];
  const drumsBlock = blocks.find(b => b.type === 'drums');
  const bpm = drumsBlock?.config?.bpm || 120;

  // Render audio offline using Tone.Offline
  const audioBuffer = await Tone.Offline(({ transport }) => {
    transport.bpm.value = bpm;

    // Render drums if present
    if (drumsBlock) {
      const config = drumsBlock.config || {};
      const kit = config.kit || 'rock';
      const pattern = config.pattern || makeDefaultPattern();

      const synths = createOfflineDrumSynths(kit);

      let step = 0;
      const seq = new Tone.Sequence(
        (time) => {
          if (pattern.kick?.[step])  synths.kick.triggerAttackRelease('C1', '8n', time);
          if (pattern.snare?.[step]) synths.snare.triggerAttackRelease('8n', time);
          if (pattern.hihat?.[step]) synths.hihat.triggerAttackRelease('16n', time);
          if (pattern.clap?.[step])  synths.clap.triggerAttackRelease('16n', time);
          step = (step + 1) % 16;
        },
        Array.from({ length: 16 }, (_, i) => i),
        '16n'
      );
      seq.start(0);
    }

    // Render synth blocks if present
    const synthBlocks = blocks.filter(b => b.type === 'synth');
    for (const synthBlock of synthBlocks) {
      const config = synthBlock.config || {};
      const notes = config.notes || [];
      const waveform = config.waveform || 'triangle';
      const octave = config.octave || 4;

      if (notes.length > 0) {
        const synth = new Tone.Synth({
          oscillator: { type: waveform },
          envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.5 },
        }).toDestination();

        // Schedule notes evenly across duration
        const noteDuration = durationSeconds / notes.length;
        notes.forEach((note, i) => {
          const noteWithOctave = note.includes(String(octave)) ? note : note + octave;
          synth.triggerAttackRelease(noteWithOctave, '8n', i * noteDuration);
        });
      }
    }

    // Render voice blocks if present
    const voiceBlocks = blocks.filter(b => b.type === 'voice');
    for (const voiceBlock of voiceBlocks) {
      const config = voiceBlock.config || {};
      if (config.audioData) {
        try {
          // Decode base64 to ArrayBuffer
          const binaryStr = atob(config.audioData.split(',')[1] || config.audioData);
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          const player = new Tone.Player().toDestination();
          // Load from buffer — schedule start at 0
          const ctx = Tone.getContext().rawContext;
          ctx.decodeAudioData(bytes.buffer).then(decoded => {
            const toneBuffer = new Tone.ToneAudioBuffer(decoded);
            player.buffer = toneBuffer;
            player.start(0);
          }).catch(() => {});
        } catch (_) {
          // skip if decoding fails
        }
      }
    }

    transport.start(0);
  }, durationSeconds);

  // Encode to WAV
  const wavBlob = encodeWav(audioBuffer);

  // Trigger download
  const url = URL.createObjectURL(wavBlob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (project?.name || 'musik').replace(/[^a-zA-Z0-9_\-åäöÅÄÖ ]/g, '').trim() || 'musik';
  a.download = safeName + '.wav';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function makeDefaultPattern() {
  return {
    kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    clap:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
  };
}

function createOfflineDrumSynths(kit) {
  let kick, snare, hihat, clap;

  if (kit === 'electro') {
    kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 8, envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.25 } }).toDestination();
    snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 } }).toDestination();
    hihat = new Tone.MetalSynth({ frequency: 800, envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, harmonicity: 8, modulationIndex: 40, resonance: 6000, octaves: 2 }).toDestination();
    clap = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 } }).toDestination();
  } else if (kit === 'latin') {
    kick = new Tone.MembraneSynth({ pitchDecay: 0.06, octaves: 5, envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.35 } }).toDestination();
    snare = new Tone.NoiseSynth({ noise: { type: 'brown' }, envelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.12 } }).toDestination();
    hihat = new Tone.MetalSynth({ frequency: 300, envelope: { attack: 0.001, decay: 0.12, release: 0.02 }, harmonicity: 3.1, modulationIndex: 20, resonance: 3000, octaves: 1.2 }).toDestination();
    clap = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 } }).toDestination();
  } else if (kit === 'jazz') {
    kick = new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 4, envelope: { attack: 0.002, decay: 0.5, sustain: 0, release: 0.5 } }).toDestination();
    snare = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.003, decay: 0.25, sustain: 0, release: 0.15 } }).toDestination();
    hihat = new Tone.MetalSynth({ frequency: 250, envelope: { attack: 0.002, decay: 0.15, release: 0.03 }, harmonicity: 2.5, modulationIndex: 15, resonance: 2500, octaves: 1.0 }).toDestination();
    clap = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.008, decay: 0.2, sustain: 0, release: 0.12 } }).toDestination();
  } else {
    // rock (default)
    kick = new Tone.MembraneSynth({ pitchDecay: 0.08, octaves: 6, envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 } }).toDestination();
    snare = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.1 } }).toDestination();
    hihat = new Tone.MetalSynth({ frequency: 400, envelope: { attack: 0.001, decay: 0.08, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).toDestination();
    clap = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.08 } }).toDestination();
  }

  return { kick, snare, hihat, clap };
}
