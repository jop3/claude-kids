export class TypewriterEffect {
  constructor(text, speed = 30) {
    this._text = text || '';
    this._speed = speed; // chars per second
    this._elapsed = 0;
    this._revealed = 0;
    this._done = false;
  }

  update(dt) {
    if (this._done) return;
    this._elapsed += dt;
    const target = Math.floor(this._elapsed * this._speed);
    const prev = this._revealed;
    this._revealed = Math.min(target, this._text.length);
    if (this._revealed >= this._text.length) {
      this._revealed = this._text.length;
      this._done = true;
    }
    // Returns number of new chars revealed this frame (for sound)
    return this._revealed - prev;
  }

  get visibleText() {
    return this._text.slice(0, this._revealed);
  }

  get isDone() {
    return this._done;
  }

  reset() {
    this._elapsed = 0;
    this._revealed = 0;
    this._done = false;
  }

  skip() {
    this._revealed = this._text.length;
    this._done = true;
  }

  setText(text) {
    this._text = text || '';
    this.reset();
  }

  setSpeed(speed) {
    this._speed = speed;
  }
}
