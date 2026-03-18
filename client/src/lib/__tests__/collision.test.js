import { describe, it, expect } from 'vitest';
import {
  aabbOverlap,
  aabbIntersect,
  resolveAABB,
  circleOverlap,
  circleAABBOverlap,
  sweepAABB,
} from '../collision.js';

describe('aabbOverlap', () => {
  it('detects overlapping rects', () => {
    expect(aabbOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 })).toBe(true);
  });
  it('returns false for non-overlapping rects', () => {
    expect(aabbOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 20, y: 0, w: 10, h: 10 })).toBe(false);
  });
  it('returns false for touching edges (not overlapping)', () => {
    expect(aabbOverlap({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 0, w: 10, h: 10 })).toBe(false);
  });
});

describe('aabbIntersect', () => {
  it('returns intersection rect when overlapping', () => {
    const ix = aabbIntersect({ x: 0, y: 0, w: 10, h: 10 }, { x: 5, y: 5, w: 10, h: 10 });
    expect(ix).toEqual({ x: 5, y: 5, w: 5, h: 5 });
  });
  it('returns null when not overlapping', () => {
    expect(aabbIntersect({ x: 0, y: 0, w: 5, h: 5 }, { x: 10, y: 10, w: 5, h: 5 })).toBeNull();
  });
});

describe('resolveAABB', () => {
  it('resolves vertical overlap (moving above static)', () => {
    const moving = { x: 0, y: 8, w: 10, h: 10 };
    const stat   = { x: 0, y: 10, w: 10, h: 10 };
    const result = resolveAABB(moving, stat);
    expect(result).not.toBeNull();
    expect(result.side).toBe('bottom');
    expect(result.dy).toBeLessThan(0);
  });
  it('resolves horizontal overlap (moving left of static)', () => {
    const moving = { x: 8, y: 0, w: 10, h: 10 };
    const stat   = { x: 10, y: 0, w: 10, h: 10 };
    const result = resolveAABB(moving, stat);
    expect(result).not.toBeNull();
    expect(result.side).toBe('right');
    expect(result.dx).toBeLessThan(0);
  });
  it('returns null when no overlap', () => {
    expect(resolveAABB({ x: 0, y: 0, w: 5, h: 5 }, { x: 100, y: 100, w: 5, h: 5 })).toBeNull();
  });
});

describe('circleOverlap', () => {
  it('detects overlapping circles', () => {
    expect(circleOverlap({ x: 0, y: 0, r: 5 }, { x: 8, y: 0, r: 5 })).toBe(true);
  });
  it('returns false for non-overlapping circles', () => {
    expect(circleOverlap({ x: 0, y: 0, r: 3 }, { x: 10, y: 0, r: 3 })).toBe(false);
  });
  it('handles exact touching (not overlapping)', () => {
    expect(circleOverlap({ x: 0, y: 0, r: 5 }, { x: 10, y: 0, r: 5 })).toBe(false);
  });
});

describe('circleAABBOverlap', () => {
  it('detects circle overlapping rect', () => {
    expect(circleAABBOverlap({ x: 5, y: 5, r: 3 }, { x: 0, y: 0, w: 10, h: 10 })).toBe(true);
  });
  it('returns false when circle is far from rect', () => {
    expect(circleAABBOverlap({ x: 50, y: 50, r: 3 }, { x: 0, y: 0, w: 10, h: 10 })).toBe(false);
  });
});

describe('sweepAABB', () => {
  it('returns null when moving away from static', () => {
    const moving   = { x: 0, y: 0, w: 5, h: 5 };
    const velocity = { x: -10, y: 0 };
    const stat     = { x: 100, y: 0, w: 10, h: 10 };
    expect(sweepAABB(moving, velocity, stat, 1)).toBeNull();
  });
  it('detects sweep collision', () => {
    const moving   = { x: 0, y: 0, w: 5, h: 5 };
    const velocity = { x: 100, y: 0 };
    const stat     = { x: 20, y: 0, w: 10, h: 10 };
    const t = sweepAABB(moving, velocity, stat, 1);
    expect(t).not.toBeNull();
    expect(t).toBeGreaterThanOrEqual(0);
    expect(t).toBeLessThanOrEqual(1);
  });
  it('returns 0 when already overlapping and stationary', () => {
    const moving   = { x: 0, y: 0, w: 10, h: 10 };
    const velocity = { x: 0, y: 0 };
    const stat     = { x: 5, y: 5, w: 10, h: 10 };
    expect(sweepAABB(moving, velocity, stat, 1)).toBe(0);
  });
});
