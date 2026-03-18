import { describe, it, expect } from 'vitest';
import { Card, Deck, Hand } from '../cardEngine.js';

function makeCards(n) {
  return Array.from({ length: n }, (_, i) =>
    new Card({ id: `c${i}`, value: i + 1 })
  );
}

describe('Card', () => {
  it('stores properties', () => {
    const c = new Card({ id: 'x', value: 7, color: '#fff' });
    expect(c.id).toBe('x');
    expect(c.value).toBe(7);
    expect(c.color).toBe('#fff');
  });
  it('defaults value to 1', () => {
    const c = new Card({ id: 'y' });
    expect(c.value).toBe(1);
  });
});

describe('Deck', () => {
  it('reports correct size', () => {
    const d = new Deck(makeCards(5));
    expect(d.size).toBe(5);
  });
  it('isEmpty for empty deck', () => {
    expect(new Deck([]).isEmpty).toBe(true);
    expect(new Deck(makeCards(1)).isEmpty).toBe(false);
  });
  it('draw removes cards from top', () => {
    const d = new Deck(makeCards(5));
    const drawn = d.draw(2);
    expect(drawn).toHaveLength(2);
    expect(d.size).toBe(3);
  });
  it('draw does not exceed deck size', () => {
    const d = new Deck(makeCards(3));
    const drawn = d.draw(10);
    expect(drawn).toHaveLength(3);
    expect(d.isEmpty).toBe(true);
  });
  it('peek does not remove cards', () => {
    const d = new Deck(makeCards(4));
    d.peek(2);
    expect(d.size).toBe(4);
  });
  it('addToBottom appends cards', () => {
    const d = new Deck(makeCards(3));
    d.addToBottom(new Card({ id: 'new', value: 99 }));
    expect(d.size).toBe(4);
    expect(d.cards[3].id).toBe('new');
  });
  it('shuffle changes order (with high probability)', () => {
    const cards = makeCards(10);
    const d = new Deck(cards);
    const before = d.cards.map(c => c.id).join(',');
    // Shuffle multiple times to avoid flaky false positives
    let shuffled = false;
    for (let i = 0; i < 10; i++) {
      d.shuffle();
      if (d.cards.map(c => c.id).join(',') !== before) { shuffled = true; break; }
    }
    expect(shuffled).toBe(true);
  });
  it('cards getter returns a copy', () => {
    const d = new Deck(makeCards(3));
    const copy = d.cards;
    copy.pop();
    expect(d.size).toBe(3);
  });
});

describe('Hand', () => {
  it('adds cards up to maxCards', () => {
    const h = new Hand(3);
    expect(h.addCard(new Card({ id: 'a' }))).toBe(true);
    expect(h.addCard(new Card({ id: 'b' }))).toBe(true);
    expect(h.addCard(new Card({ id: 'c' }))).toBe(true);
    expect(h.addCard(new Card({ id: 'd' }))).toBe(false); // full
    expect(h.size).toBe(3);
  });
  it('removeCard returns and removes the card', () => {
    const h = new Hand(5);
    h.addCard(new Card({ id: 'x', value: 10 }));
    const removed = h.removeCard('x');
    expect(removed.id).toBe('x');
    expect(h.size).toBe(0);
  });
  it('removeCard returns null for unknown id', () => {
    const h = new Hand(5);
    expect(h.removeCard('nope')).toBeNull();
  });
  it('sort by value orders ascending', () => {
    const h = new Hand(5);
    h.addCard(new Card({ id: 'b', value: 3 }));
    h.addCard(new Card({ id: 'a', value: 1 }));
    h.addCard(new Card({ id: 'c', value: 2 }));
    h.sort(true);
    expect(h.cards.map(c => c.value)).toEqual([1, 2, 3]);
  });
});
