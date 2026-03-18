// Card Engine — core data structures for card games

export class Card {
  constructor({ id, frontContent = {}, backContent = {}, value = 1, color = '#e74c3c', image = null }) {
    this.id = id;
    this.frontContent = frontContent; // { title, emoji, category, categoryValue }
    this.backContent = backContent;   // { color, pattern }
    this.value = value;
    this.color = color;
    this.image = image;
  }
}

export class Deck {
  constructor(cards = []) {
    this._cards = [...cards];
  }

  shuffle() {
    const a = [...this._cards];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    this._cards = a;
  }

  draw(n = 1) {
    return this._cards.splice(0, Math.min(n, this._cards.length));
  }

  peek(n = 1) {
    return this._cards.slice(0, Math.min(n, this._cards.length));
  }

  addToBottom(cards) {
    this._cards.push(...(Array.isArray(cards) ? cards : [cards]));
  }

  get size() {
    return this._cards.length;
  }

  get isEmpty() {
    return this._cards.length === 0;
  }

  get cards() {
    return [...this._cards];
  }
}

export class Hand {
  constructor(maxCards = 7) {
    this.maxCards = maxCards;
    this._cards = [];
  }

  addCard(card) {
    if (this._cards.length < this.maxCards) {
      this._cards.push(card);
      return true;
    }
    return false;
  }

  removeCard(id) {
    const idx = this._cards.findIndex(c => c.id === id);
    if (idx !== -1) {
      const [removed] = this._cards.splice(idx, 1);
      return removed;
    }
    return null;
  }

  sort(byValue = true) {
    if (byValue) {
      this._cards.sort((a, b) => a.value - b.value);
    } else {
      this._cards.sort((a, b) => (a.frontContent?.title || '').localeCompare(b.frontContent?.title || ''));
    }
  }

  get cards() {
    return [...this._cards];
  }

  get size() {
    return this._cards.length;
  }
}
