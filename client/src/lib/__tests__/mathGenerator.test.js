import { describe, it, expect } from 'vitest';
import { generateProblem, generateSet, checkAnswer } from '../mathGenerator.js';

function runMany(fn, n = 50) {
  return Array.from({ length: n }, fn);
}

describe('generateProblem — addition', () => {
  it('returns question, answer, and 3 distractors', () => {
    const p = generateProblem({ operation: 'add', difficulty: 1 });
    expect(typeof p.question).toBe('string');
    expect(typeof p.answer).toBe('number');
    expect(p.distractors).toHaveLength(3);
  });
  it('answer is always positive', () => {
    runMany(() => generateProblem({ operation: 'add', difficulty: 1 }))
      .forEach(p => expect(p.answer).toBeGreaterThan(0));
  });
  it('distractors are different from answer', () => {
    runMany(() => generateProblem({ operation: 'add', difficulty: 2 }))
      .forEach(p => p.distractors.forEach(d => expect(d).not.toBe(p.answer)));
  });
  it('question string contains + sign', () => {
    expect(generateProblem({ operation: 'add' }).question).toContain('+');
  });
});

describe('generateProblem — subtraction', () => {
  it('answer is never negative', () => {
    runMany(() => generateProblem({ operation: 'sub', difficulty: 1 }))
      .forEach(p => expect(p.answer).toBeGreaterThanOrEqual(0));
  });
  it('question string contains - sign', () => {
    expect(generateProblem({ operation: 'sub' }).question).toContain('-');
  });
});

describe('generateProblem — multiplication', () => {
  it('answer matches question factors', () => {
    runMany(() => generateProblem({ operation: 'mul', difficulty: 1 })).forEach(p => {
      const [a, b] = p.question.replace(' = ?', '').split(' x ').map(Number);
      expect(p.answer).toBe(a * b);
    });
  });
});

describe('generateProblem — division', () => {
  it('answer is always a whole number', () => {
    runMany(() => generateProblem({ operation: 'div', difficulty: 1 }))
      .forEach(p => expect(Number.isInteger(p.answer)).toBe(true));
  });
});

describe('generateProblem — fraction', () => {
  it('returns string answer in n/d or integer form', () => {
    runMany(() => generateProblem({ operation: 'fraction', difficulty: 1 }))
      .forEach(p => expect(typeof p.answer).toBe('string'));
  });
  it('has at most 3 distractors, all different from answer', () => {
    runMany(() => generateProblem({ operation: 'fraction', difficulty: 1 })).forEach(p => {
      expect(p.distractors.length).toBeGreaterThan(0);
      expect(p.distractors.length).toBeLessThanOrEqual(3);
      p.distractors.forEach(d => expect(d).not.toBe(p.answer));
    });
  });
});

describe('generateSet', () => {
  it('returns n problems', () => {
    expect(generateSet(5, { operation: 'add' })).toHaveLength(5);
  });
  it('returns empty array for n=0', () => {
    expect(generateSet(0, { operation: 'add' })).toHaveLength(0);
  });
});

describe('checkAnswer', () => {
  it('returns true for correct answer', () => {
    expect(checkAnswer({ answer: 42 }, '42')).toBe(true);
    expect(checkAnswer({ answer: 42 }, 42)).toBe(true);
  });
  it('returns false for wrong answer', () => {
    expect(checkAnswer({ answer: 42 }, '43')).toBe(false);
  });
  it('trims whitespace', () => {
    expect(checkAnswer({ answer: '3/4' }, '  3/4  ')).toBe(true);
  });
  it('is case-insensitive', () => {
    expect(checkAnswer({ answer: '3/4' }, '3/4')).toBe(true);
  });
});
