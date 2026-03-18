/**
 * Animation engine — keyframe interpolation helpers.
 *
 * Keyframe shape:
 *   { time: number (ms), x, y, scaleX, scaleY, rotation, opacity }
 */

export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Linear interpolation between two keyframes at t (0–1).
 * Optionally applies an easing function to t before interpolating.
 */
export function interpolate(kfA, kfB, t, easing = null) {
  const et = easing ? easing(t) : t;
  function lerp(a, b) {
    return a + (b - a) * et;
  }
  return {
    time: lerp(kfA.time, kfB.time, t),
    x: lerp(kfA.x ?? 0, kfB.x ?? 0),
    y: lerp(kfA.y ?? 0, kfB.y ?? 0),
    scaleX: lerp(kfA.scaleX ?? 1, kfB.scaleX ?? 1),
    scaleY: lerp(kfA.scaleY ?? 1, kfB.scaleY ?? 1),
    rotation: lerp(kfA.rotation ?? 0, kfB.rotation ?? 0),
    opacity: lerp(kfA.opacity ?? 1, kfB.opacity ?? 1),
  };
}

const DEFAULT_STATE = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 };

/**
 * Returns the interpolated transform state for a set of keyframes at a given time (ms).
 * keyframes must be sorted by time ascending.
 */
export function getStateAtTime(keyframes, time) {
  if (!keyframes || keyframes.length === 0) return { ...DEFAULT_STATE, time };

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  // Before first keyframe
  if (time <= sorted[0].time) return { ...DEFAULT_STATE, ...sorted[0], time: sorted[0].time };

  // After last keyframe
  if (time >= sorted[sorted.length - 1].time) {
    const last = sorted[sorted.length - 1];
    return { ...DEFAULT_STATE, ...last, time: last.time };
  }

  // Find surrounding keyframes
  let idxB = sorted.findIndex(kf => kf.time > time);
  const kfA = sorted[idxB - 1];
  const kfB = sorted[idxB];

  const span = kfB.time - kfA.time;
  const t = span === 0 ? 0 : (time - kfA.time) / span;

  // Pick easing based on kfA's easing setting
  let easingFn = null;
  if (kfA.easing === 'easeInOut') easingFn = easeInOut;
  else if (kfA.easing === 'easeIn') easingFn = t2 => t2 * t2;
  else if (kfA.easing === 'easeOut') easingFn = t2 => t2 * (2 - t2);

  return interpolate({ ...DEFAULT_STATE, ...kfA }, { ...DEFAULT_STATE, ...kfB }, t, easingFn);
}
