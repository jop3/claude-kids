/**
 * Animation engine — keyframe interpolation helpers + tweening system.
 *
 * Keyframe shape:
 *   { time: number (ms), x, y, scaleX, scaleY, rotation, opacity }
 */

// ─── Easing functions (t: 0–1 → 0–1) ────────────────────────────────────────

export function linear(t) { return t; }
export function easeInQuad(t) { return t * t; }
export function easeOutQuad(t) { return t * (2 - t); }
export function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
export function easeInCubic(t) { return t * t * t; }
export function easeOutCubic(t) { const u = 1 - t; return 1 - u * u * u; }
export function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
export function easeInBack(t) { const c1 = 1.70158; return t * t * ((c1 + 1) * t - c1); }
export function easeOutBack(t) { const c1 = 1.70158; const u = t - 1; return u * u * ((c1 + 1) * u + c1) + 1; }
export function easeOutBounce(t) {
  const n1 = 7.5625, d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) { t -= 1.5 / d1; return n1 * t * t + 0.75; }
  if (t < 2.5 / d1) { t -= 2.25 / d1; return n1 * t * t + 0.9375; }
  t -= 2.625 / d1; return n1 * t * t + 0.984375;
}
export function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
}

// Legacy alias kept for backward compat
export function easeInOut(t) { return easeInOutQuad(t); }

export const EASING_FUNCTIONS = {
  linear,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInBack,
  easeOutBack,
  easeOutBounce,
  easeOutElastic,
  // Legacy names still supported
  Linear: linear,
  EaseIn: easeInQuad,
  EaseOut: easeOutQuad,
  EaseInOut: easeInOutQuad,
};

// ─── Interpolation ────────────────────────────────────────────────────────────

/**
 * Linear interpolation between two keyframes at t (0–1).
 * easing: string key from EASING_FUNCTIONS, or a function, or null.
 */
export function interpolate(kfA, kfB, t, easing = null) {
  let easingFn = null;
  if (typeof easing === 'function') easingFn = easing;
  else if (typeof easing === 'string' && EASING_FUNCTIONS[easing]) easingFn = EASING_FUNCTIONS[easing];

  const et = easingFn ? easingFn(t) : t;
  function lerp(a, b) { return a + (b - a) * et; }
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

  if (time <= sorted[0].time) return { ...DEFAULT_STATE, ...sorted[0], time: sorted[0].time };
  if (time >= sorted[sorted.length - 1].time) {
    const last = sorted[sorted.length - 1];
    return { ...DEFAULT_STATE, ...last, time: last.time };
  }

  let idxB = sorted.findIndex(kf => kf.time > time);
  const kfA = sorted[idxB - 1];
  const kfB = sorted[idxB];

  const span = kfB.time - kfA.time;
  const t = span === 0 ? 0 : (time - kfA.time) / span;

  // Pick easing based on kfA's easing setting
  const easingKey = kfA.easing || null;

  return interpolate({ ...DEFAULT_STATE, ...kfA }, { ...DEFAULT_STATE, ...kfB }, t, easingKey);
}

// ─── Tween class ──────────────────────────────────────────────────────────────

export class Tween {
  /**
   * @param {object} target - object whose properties will be mutated
   * @param {object} to - destination values
   * @param {number} duration - duration in ms
   * @param {string|function} easing - easing name or function
   * @param {function} [onComplete] - called when tween finishes
   */
  constructor(target, to, duration, easing = 'linear', onComplete = null) {
    this._target = target;
    this._to = { ...to };
    this._from = {};
    for (const key of Object.keys(to)) {
      this._from[key] = target[key] ?? 0;
    }
    this._duration = duration;
    this._easing = easing;
    this._onComplete = onComplete;
    this._elapsed = 0;
    this._done = false;
    this._stopped = false;
  }

  get progress() {
    return this._duration === 0 ? 1 : Math.min(1, this._elapsed / this._duration);
  }

  /**
   * Advance tween by dt milliseconds.
   * Applies interpolated values to target.
   */
  update(dt) {
    if (this._done || this._stopped) return;
    this._elapsed = Math.min(this._elapsed + dt, this._duration);

    const t = this.progress;
    const easingFn = typeof this._easing === 'function'
      ? this._easing
      : (EASING_FUNCTIONS[this._easing] || linear);
    const et = easingFn(t);

    for (const key of Object.keys(this._to)) {
      this._target[key] = this._from[key] + (this._to[key] - this._from[key]) * et;
    }

    if (t >= 1) {
      this._done = true;
      if (this._onComplete) this._onComplete();
    }
  }

  stop() {
    this._stopped = true;
  }

  reset() {
    this._elapsed = 0;
    this._done = false;
    this._stopped = false;
    for (const key of Object.keys(this._from)) {
      this._target[key] = this._from[key];
    }
  }
}

/**
 * Factory: create a Tween instance.
 * @param {object} target
 * @param {object} to
 * @param {number} durationMs
 * @param {string|function} easing
 * @param {function} [onComplete]
 */
export function createTween(target, to, durationMs, easing = 'linear', onComplete = null) {
  return new Tween(target, to, durationMs, easing, onComplete);
}
