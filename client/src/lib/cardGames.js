// Card Game Logic — Memory and Top Trumps

export class MemoryGame {
  constructor(cards = []) {
    // Duplicate each card to make pairs
    this._pairs = cards.flatMap(c => [
      { ...c, instanceId: c.id + '_a' },
      { ...c, instanceId: c.id + '_b' },
    ]);
    // Shuffle
    for (let i = this._pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this._pairs[i], this._pairs[j]] = [this._pairs[j], this._pairs[i]];
    }
    this._flipped = [];       // currently face-up (max 2)
    this._matched = new Set();
    this._moves = 0;
    this._locked = false;
  }

  flipCard(instanceId) {
    if (this._locked) return { matched: false, gameOver: false, wait: true };
    if (this._matched.has(instanceId)) return { matched: false, gameOver: false };
    if (this._flipped.includes(instanceId)) return { matched: false, gameOver: false };
    if (this._flipped.length >= 2) return { matched: false, gameOver: false };

    this._flipped.push(instanceId);

    if (this._flipped.length === 2) {
      this._moves++;
      const [a, b] = this._flipped.map(id => this._pairs.find(p => p.instanceId === id));
      const matched = a && b && a.id === b.id;
      if (matched) {
        this._matched.add(this._flipped[0]);
        this._matched.add(this._flipped[1]);
        this._flipped = [];
        const gameOver = this._matched.size === this._pairs.length;
        return { matched: true, gameOver };
      } else {
        this._locked = true;
        setTimeout(() => {
          this._flipped = [];
          this._locked = false;
        }, 1200);
        return { matched: false, gameOver: false };
      }
    }
    return { matched: false, gameOver: false };
  }

  get flippedCards() {
    return [...this._flipped];
  }

  get matchedPairs() {
    return this._matched.size / 2;
  }

  get moves() {
    return this._moves;
  }

  get pairs() {
    return this._pairs;
  }

  reset() {
    for (let i = this._pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this._pairs[i], this._pairs[j]] = [this._pairs[j], this._pairs[i]];
    }
    this._flipped = [];
    this._matched = new Set();
    this._moves = 0;
    this._locked = false;
  }
}

export class TopTrumpsGame {
  constructor(deck = [], category = 'value') {
    const half = Math.floor(deck.length / 2);
    this._playerDeck = deck.slice(0, half);
    this._cpuDeck = deck.slice(half);
    this.category = category;
    this._playerScore = 0;
    this._cpuScore = 0;
  }

  playRound(playerCardId, cpuCardId) {
    const playerCard = this._playerDeck.find(c => c.id === playerCardId);
    const cpuCard = this._cpuDeck.find(c => c.id === cpuCardId);
    if (!playerCard || !cpuCard) return null;

    const pVal = this.category === 'value'
      ? playerCard.value
      : (playerCard.frontContent?.categoryValues?.[this.category] ?? playerCard.value);
    const cVal = this.category === 'value'
      ? cpuCard.value
      : (cpuCard.frontContent?.categoryValues?.[this.category] ?? cpuCard.value);

    const diff = pVal - cVal;
    let winner;
    if (diff > 0) {
      winner = 'player';
      this._playerScore++;
    } else if (diff < 0) {
      winner = 'cpu';
      this._cpuScore++;
    } else {
      winner = 'draw';
    }
    return { winner, diff: Math.abs(diff), playerValue: pVal, cpuValue: cVal, playerCard, cpuCard };
  }

  get playerScore() { return this._playerScore; }
  get cpuScore() { return this._cpuScore; }
  get playerDeck() { return [...this._playerDeck]; }
  get cpuDeck() { return [...this._cpuDeck]; }
}
