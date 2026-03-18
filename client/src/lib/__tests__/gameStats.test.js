import { describe, it, expect } from 'vitest';
import { ScoreTracker, HealthSystem, GameTimer } from '../gameStats.js';

describe('ScoreTracker', () => {
  it('starts at initial value', () => {
    expect(new ScoreTracker(0).value).toBe(0);
    expect(new ScoreTracker(100).value).toBe(100);
  });
  it('adds points correctly', () => {
    const s = new ScoreTracker(0);
    s.add(10);
    s.add(5);
    expect(s.value).toBe(15);
  });
  it('tracks high score', () => {
    const s = new ScoreTracker(0);
    s.add(50);
    s.reset();
    expect(s.highScore).toBe(50);
    expect(s.value).toBe(0);
  });
  it('reset returns to initial value', () => {
    const s = new ScoreTracker(5);
    s.add(100);
    s.reset();
    expect(s.value).toBe(5);
  });
});

describe('HealthSystem (lives mode)', () => {
  it('starts with maxLives', () => {
    const h = new HealthSystem(3);
    expect(h.lives).toBe(3);
    expect(h.isDead).toBe(false);
  });
  it('damage reduces lives', () => {
    const h = new HealthSystem(3);
    h.damage(1);
    expect(h.lives).toBe(2);
  });
  it('isDead when lives reach 0', () => {
    const h = new HealthSystem(1);
    h.damage(1);
    expect(h.isDead).toBe(true);
  });
  it('lives do not go below 0', () => {
    const h = new HealthSystem(1);
    h.damage(5);
    expect(h.lives).toBe(0);
  });
  it('heal restores lives up to max', () => {
    const h = new HealthSystem(3);
    h.damage(2);
    h.heal(10);
    expect(h.lives).toBe(3);
  });
  it('invincibility blocks damage', () => {
    const h = new HealthSystem(3);
    h.setInvincible(1000);
    h.damage(1);
    expect(h.lives).toBe(3);
  });
  it('invincibility expires after update', () => {
    const h = new HealthSystem(3);
    h.setInvincible(100);
    h.update(200);
    expect(h.isInvincible).toBe(false);
    h.damage(1);
    expect(h.lives).toBe(2);
  });
  it('reset restores full health', () => {
    const h = new HealthSystem(3);
    h.damage(2);
    h.reset();
    expect(h.lives).toBe(3);
  });
});

describe('HealthSystem (hp bar mode)', () => {
  it('damage reduces hp', () => {
    const h = new HealthSystem(3, true);
    h.damage(30);
    expect(h.hp).toBe(70);
  });
  it('losing all hp removes a life', () => {
    const h = new HealthSystem(3, true);
    h.damage(100);
    expect(h.lives).toBe(2);
    expect(h.hp).toBe(0);
  });
});

describe('GameTimer', () => {
  it('stopwatch accumulates elapsed', () => {
    const t = new GameTimer('stopwatch');
    t.start();
    t.update(500);
    t.update(300);
    expect(t.elapsed).toBe(800);
  });
  it('does not advance when stopped', () => {
    const t = new GameTimer('stopwatch');
    t.update(1000);
    expect(t.elapsed).toBe(0);
  });
  it('countdown expires at duration', () => {
    const t = new GameTimer('countdown', 1000);
    t.start();
    t.update(1500);
    expect(t.isExpired).toBe(true);
    expect(t.remaining).toBe(0);
    expect(t.running).toBe(false);
  });
  it('countdown remaining decrements', () => {
    const t = new GameTimer('countdown', 1000);
    t.start();
    t.update(400);
    expect(t.remaining).toBeCloseTo(600);
  });
  it('reset clears elapsed and stops', () => {
    const t = new GameTimer('stopwatch');
    t.start();
    t.update(999);
    t.reset();
    expect(t.elapsed).toBe(0);
    expect(t.running).toBe(false);
  });
});
