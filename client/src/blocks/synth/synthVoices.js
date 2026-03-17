import * as Tone from 'tone';

export function createSynthVoice(instrument) {
  switch (instrument) {
    case 'piano': {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 },
      });
      synth.toDestination();
      return synth;
    }
    case 'gitarr': {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.3 },
      });
      synth.toDestination();
      return synth;
    }
    case 'bas': {
      const synth = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        filter: { type: 'lowpass', frequency: 400, rolloff: -24 },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.5 },
        filterEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.5, baseFrequency: 200, octaves: 2 },
      });
      synth.toDestination();
      return synth;
    }
    case 'synth': {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square', detune: 8 },
        envelope: { attack: 0.03, decay: 0.2, sustain: 0.5, release: 0.8 },
      });
      synth.toDestination();
      return synth;
    }
    case 'orgel': {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.1, sustain: 0.9, release: 1.8 },
      });
      synth.toDestination();
      return synth;
    }
    case 'strakar': {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.4, decay: 0.1, sustain: 0.8, release: 1.5 },
      });
      synth.toDestination();
      return synth;
    }
    case 'blasare': {
      const synth = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        filter: { type: 'lowpass', frequency: 2000 },
        envelope: { attack: 0.15, decay: 0.1, sustain: 0.7, release: 0.4 },
        filterEnvelope: { attack: 0.1, decay: 0.1, sustain: 0.6, release: 0.4, baseFrequency: 800, octaves: 2 },
      });
      synth.toDestination();
      return synth;
    }
    default: {
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 },
      });
      synth.toDestination();
      return synth;
    }
  }
}

export function disposeSynthVoice(voice) {
  if (voice) {
    try { voice.dispose(); } catch (_) {}
  }
}
