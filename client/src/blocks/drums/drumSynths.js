import * as Tone from 'tone';

export function createDrumSynths(kit) {
  let kick, snare, hihat, clap;

  if (kit === 'rock') {
    kick = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 6,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.4 },
    }).toDestination();

    snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.1 },
    }).toDestination();

    hihat = new Tone.MetalSynth({
      frequency: 400,
      envelope: { attack: 0.001, decay: 0.08, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();

    clap = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.08 },
    }).toDestination();

  } else if (kit === 'electro') {
    kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 8,
      envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.25 },
    }).toDestination();

    snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
    }).toDestination();

    hihat = new Tone.MetalSynth({
      frequency: 800,
      envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
      harmonicity: 8,
      modulationIndex: 40,
      resonance: 6000,
      octaves: 2,
    }).toDestination();

    clap = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
    }).toDestination();

  } else if (kit === 'latin') {
    kick = new Tone.MembraneSynth({
      pitchDecay: 0.06,
      octaves: 5,
      envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.35 },
    }).toDestination();

    snare = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.12 },
    }).toDestination();

    hihat = new Tone.MetalSynth({
      frequency: 300,
      envelope: { attack: 0.001, decay: 0.12, release: 0.02 },
      harmonicity: 3.1,
      modulationIndex: 20,
      resonance: 3000,
      octaves: 1.2,
    }).toDestination();

    clap = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 },
    }).toDestination();

  } else {
    // jazz
    kick = new Tone.MembraneSynth({
      pitchDecay: 0.1,
      octaves: 4,
      envelope: { attack: 0.002, decay: 0.5, sustain: 0, release: 0.5 },
    }).toDestination();

    snare = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.003, decay: 0.25, sustain: 0, release: 0.15 },
    }).toDestination();

    hihat = new Tone.MetalSynth({
      frequency: 250,
      envelope: { attack: 0.002, decay: 0.15, release: 0.03 },
      harmonicity: 2.5,
      modulationIndex: 15,
      resonance: 2500,
      octaves: 1.0,
    }).toDestination();

    clap = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.008, decay: 0.2, sustain: 0, release: 0.12 },
    }).toDestination();
  }

  return { kick, snare, hihat, clap };
}

export function disposeDrumSynths(synths) {
  if (!synths) return;
  Object.values(synths).forEach(s => {
    try { s.dispose(); } catch (_) {}
  });
}
