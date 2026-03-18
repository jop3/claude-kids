import { describe, it, expect } from 'vitest';
import {
  linear,
  easeInQuad,
  easeOutQuad,
  easeOutBounce,
  easeOutElastic,
  interpolate,
  getStateAtTime,
  Tween,
} from '../animationEngine.js';

describe('easing functions', () => {
  it('linear maps 0→0, 0.5→0.5, 1→1', () => {
    expect(linear(0)).toBe(0);
    expect(linear(0.5)).toBe(0.5);
    expect(linear(1)).toBe(1);
  });
  it('easeInQuad starts slow, ends fast', () => {
    expect(easeInQuad(0)).toBe(0);
    expect(easeInQuad(1)).toBe(1);
    expect(easeInQuad(0.5)).toBeLessThan(0.5);
  });
  it('easeOutQuad starts fast, ends slow', () => {
    expect(easeOutQuad(0)).toBe(0);
    expect(easeOutQuad(1)).toBe(1);
    expect(easeOutQuad(0.5)).toBeGreaterThan(0.5);
  });
  it('easeOutBounce starts and ends at 0 and 1', () => {
    expect(easeOutBounce(0)).toBeCloseTo(0);
    expect(easeOutBounce(1)).toBeCloseTo(1);
  });
  it('easeOutElastic boundary values', () => {
    expect(easeOutElastic(0)).toBe(0);
    expect(easeOutElastic(1)).toBe(1);
  });
});

describe('interpolate', () => {
  const kfA = { time: 0, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1 };
  const kfB = { time: 1000, x: 100, y: 200, scaleX: 2, scaleY: 2, rotation: 90, opacity: 0 };

  it('at t=0 returns kfA values', () => {
    const s = interpolate(kfA, kfB, 0);
    expect(s.x).toBeCloseTo(0);
    expect(s.y).toBeCloseTo(0);
    expect(s.opacity).toBeCloseTo(1);
  });
  it('at t=1 returns kfB values', () => {
    const s = interpolate(kfA, kfB, 1);
    expect(s.x).toBeCloseTo(100);
    expect(s.y).toBeCloseTo(200);
    expect(s.opacity).toBeCloseTo(0);
  });
  it('at t=0.5 returns midpoint', () => {
    const s = interpolate(kfA, kfB, 0.5);
    expect(s.x).toBeCloseTo(50);
    expect(s.rotation).toBeCloseTo(45);
  });
  it('applies named easing', () => {
    const s = interpolate(kfA, kfB, 0.5, 'easeInQuad');
    expect(s.x).toBeCloseTo(25); // easeInQuad(0.5)=0.25 → 0+100*0.25
  });
});

describe('getStateAtTime', () => {
  const keyframes = [
    { time: 0, x: 0, y: 0 },
    { time: 500, x: 50, y: 0 },
    { time: 1000, x: 100, y: 100 },
  ];

  it('returns first keyframe state when time <= first', () => {
    const s = getStateAtTime(keyframes, 0);
    expect(s.x).toBe(0);
  });
  it('returns last keyframe state when time >= last', () => {
    const s = getStateAtTime(keyframes, 2000);
    expect(s.x).toBe(100);
    expect(s.y).toBe(100);
  });
  it('interpolates between keyframes', () => {
    const s = getStateAtTime(keyframes, 250);
    expect(s.x).toBeCloseTo(25);
  });
  it('returns default state for empty keyframes', () => {
    const s = getStateAtTime([], 500);
    expect(s.x).toBe(0);
    expect(s.opacity).toBe(1);
  });
});

describe('Tween', () => {
  it('moves target toward goal over duration', () => {
    const target = { x: 0, y: 0 };
    const tween = new Tween(target, { x: 100 }, 1000, 'linear');
    tween.update(500);
    expect(target.x).toBeCloseTo(50);
  });
  it('clamps at destination after full duration', () => {
    const target = { x: 0 };
    const tween = new Tween(target, { x: 100 }, 1000, 'linear');
    tween.update(1500);
    expect(target.x).toBeCloseTo(100);
  });
  it('calls onComplete when finished', () => {
    let done = false;
    const target = { x: 0 };
    const tween = new Tween(target, { x: 10 }, 100, 'linear', () => { done = true; });
    tween.update(200);
    expect(done).toBe(true);
  });
  it('stop() prevents further updates', () => {
    const target = { x: 0 };
    const tween = new Tween(target, { x: 100 }, 1000, 'linear');
    tween.stop();
    tween.update(500);
    expect(target.x).toBe(0);
  });
  it('reset() restores initial values', () => {
    const target = { x: 0 };
    const tween = new Tween(target, { x: 100 }, 1000, 'linear');
    tween.update(500);
    tween.reset();
    expect(target.x).toBe(0);
  });
});
