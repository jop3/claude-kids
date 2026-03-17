/**
 * Voice effects using native Web Audio API (no Tone.js).
 */

/**
 * Generate a synthetic reverb impulse response (2s exponential decay).
 */
function generateImpulseResponse(audioCtx, duration = 2.0, decay = 3.0) {
  const sampleRate = audioCtx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const impulse = audioCtx.createBuffer(2, length, sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

/**
 * Apply an effect to an AudioBuffer and return a new AudioBuffer with the
 * effect baked in (offline rendering).
 *
 * @param {AudioBuffer} audioBuffer
 * @param {string} effectName
 * @param {AudioContext} _audioCtx  (used only for sampleRate reference)
 * @returns {Promise<AudioBuffer>}
 */
export async function applyEffect(audioBuffer, effectName, _audioCtx) {
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;

  // Reverb needs a longer render window; eko adds 2s tail
  const renderDuration = effectName === 'reverb'
    ? duration + 2.5
    : effectName === 'eko'
      ? duration + 2.0
      : duration;

  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    Math.ceil(sampleRate * renderDuration),
    sampleRate
  );

  const src = offlineCtx.createBufferSource();

  // Chipmunk / Monster: adjust playback rate on a copy
  if (effectName === 'ekorre') {
    src.playbackRate.value = 1.7;
  } else if (effectName === 'monster') {
    src.playbackRate.value = 0.55;
  } else {
    src.playbackRate.value = 1.0;
  }

  src.buffer = audioBuffer;

  if (effectName === 'normal' || effectName === 'ekorre' || effectName === 'monster') {
    src.connect(offlineCtx.destination);
  } else if (effectName === 'robot') {
    // Ring modulator: multiply signal by a 100Hz sine oscillator
    const osc = offlineCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 100;

    const gain = offlineCtx.createGain();
    gain.gain.value = 0; // will be modulated by oscillator

    const ringGain = offlineCtx.createGain();
    ringGain.gain.value = 1.0;

    // src -> ringGain, osc modulates ringGain.gain
    src.connect(ringGain);
    osc.connect(gain);
    gain.connect(ringGain.gain);
    ringGain.connect(offlineCtx.destination);
    osc.start(0);
  } else if (effectName === 'eko') {
    const delay = offlineCtx.createDelay(2.0);
    delay.delayTime.value = 0.3;

    const feedback = offlineCtx.createGain();
    feedback.gain.value = 0.4;

    const dryGain = offlineCtx.createGain();
    dryGain.gain.value = 1.0;

    const wetGain = offlineCtx.createGain();
    wetGain.gain.value = 0.6;

    src.connect(dryGain);
    dryGain.connect(offlineCtx.destination);

    src.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wetGain);
    wetGain.connect(offlineCtx.destination);
  } else if (effectName === 'reverb') {
    const convolver = offlineCtx.createConvolver();
    convolver.buffer = generateImpulseResponse(offlineCtx, 2.0, 3.0);

    const dry = offlineCtx.createGain();
    dry.gain.value = 0.7;
    const wet = offlineCtx.createGain();
    wet.gain.value = 0.5;

    src.connect(dry);
    dry.connect(offlineCtx.destination);
    src.connect(convolver);
    convolver.connect(wet);
    wet.connect(offlineCtx.destination);
  } else {
    src.connect(offlineCtx.destination);
  }

  src.start(0);
  return offlineCtx.startRendering();
}

/**
 * Wire real-time effect nodes from a sourceNode to audioCtx.destination.
 * Returns a cleanup function that disconnects everything.
 *
 * @param {string} effectName
 * @param {AudioContext} audioCtx
 * @param {AudioBufferSourceNode} sourceNode  (already has buffer set + playbackRate adjusted)
 * @returns {{ connect: () => void, cleanup: () => void }}
 */
export function createEffectChain(effectName, audioCtx, sourceNode) {
  let nodes = [];

  function cleanup() {
    nodes.forEach(n => {
      try { n.disconnect(); } catch (_) { /* ignore */ }
    });
    nodes = [];
  }

  function connect() {
    if (effectName === 'normal' || effectName === 'ekorre' || effectName === 'monster') {
      sourceNode.connect(audioCtx.destination);
      nodes.push(sourceNode);
    } else if (effectName === 'robot') {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 100;

      const gain = audioCtx.createGain();
      gain.gain.value = 0;

      const ringGain = audioCtx.createGain();
      ringGain.gain.value = 1.0;

      sourceNode.connect(ringGain);
      osc.connect(gain);
      gain.connect(ringGain.gain);
      ringGain.connect(audioCtx.destination);
      osc.start();
      nodes.push(osc, gain, ringGain);
    } else if (effectName === 'eko') {
      const delay = audioCtx.createDelay(2.0);
      delay.delayTime.value = 0.3;
      const feedback = audioCtx.createGain();
      feedback.gain.value = 0.4;
      const dryGain = audioCtx.createGain();
      dryGain.gain.value = 1.0;
      const wetGain = audioCtx.createGain();
      wetGain.gain.value = 0.6;

      sourceNode.connect(dryGain);
      dryGain.connect(audioCtx.destination);
      sourceNode.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wetGain);
      wetGain.connect(audioCtx.destination);
      nodes.push(dryGain, wetGain, delay, feedback);
    } else if (effectName === 'reverb') {
      const convolver = audioCtx.createConvolver();
      convolver.buffer = generateImpulseResponse(audioCtx, 2.0, 3.0);
      const dry = audioCtx.createGain();
      dry.gain.value = 0.7;
      const wet = audioCtx.createGain();
      wet.gain.value = 0.5;

      sourceNode.connect(dry);
      dry.connect(audioCtx.destination);
      sourceNode.connect(convolver);
      convolver.connect(wet);
      wet.connect(audioCtx.destination);
      nodes.push(convolver, dry, wet);
    } else {
      sourceNode.connect(audioCtx.destination);
      nodes.push(sourceNode);
    }
  }

  return { connect, cleanup };
}
