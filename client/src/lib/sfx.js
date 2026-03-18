let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function playTone(freq, duration, type = 'sine', gainVal = 0.3, startDelay = 0) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime + startDelay);
    gain.gain.setValueAtTime(0, ac.currentTime + startDelay);
    gain.gain.linearRampToValueAtTime(gainVal, ac.currentTime + startDelay + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startDelay + duration);
    osc.start(ac.currentTime + startDelay);
    osc.stop(ac.currentTime + startDelay + duration + 0.01);
  } catch (e) {
    // Ignore audio errors silently
  }
}

export function playTap() {
  playTone(800, 0.08, 'sine', 0.2);
}

export function playSuccess() {
  // C-E-G ascending arpeggio
  playTone(523, 0.15, 'sine', 0.25, 0);
  playTone(659, 0.15, 'sine', 0.25, 0.15);
  playTone(784, 0.2,  'sine', 0.25, 0.3);
}

export function playCelebrate() {
  // 5-note ascending fanfare
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    playTone(freq, 0.18, 'sine', 0.28, i * 0.12);
  });
}

export function playError() {
  playTone(200, 0.2, 'sawtooth', 0.25);
}

export function playBlockAdd() {
  playTone(1000, 0.1, 'sine', 0.22);
  playTone(1200, 0.08, 'sine', 0.15, 0.08);
}
