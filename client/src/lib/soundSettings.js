const KEY = 'kompisen_sound_muted';

export function isMuted() {
  return localStorage.getItem(KEY) === 'true';
}

export function setMuted(val) {
  localStorage.setItem(KEY, val ? 'true' : 'false');
}

export function toggleMuted() {
  const next = !isMuted();
  setMuted(next);
  return next;
}
