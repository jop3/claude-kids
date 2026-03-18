export class ScoreTracker {
  constructor(initial = 0) {
    this._value = initial;
    this._initial = initial;
    this._highScore = initial;
  }

  add(pts) {
    this._value += pts;
    if (this._value > this._highScore) this._highScore = this._value;
  }

  reset() {
    this._value = this._initial;
  }

  get value() { return this._value; }
  get highScore() { return this._highScore; }
}

export class HealthSystem {
  constructor(maxLives = 3, useBar = false) {
    this._maxLives = maxLives;
    this._lives = maxLives;
    this._useBar = useBar;
    this._maxHp = 100;
    this._hp = 100;
    this._invincibleFor = 0;
  }

  damage(amt = 1) {
    if (this._invincibleFor > 0) return;
    if (this._useBar) {
      this._hp = Math.max(0, this._hp - amt);
      if (this._hp === 0) this._lives = Math.max(0, this._lives - 1);
    } else {
      this._lives = Math.max(0, this._lives - amt);
    }
  }

  heal(amt = 1) {
    if (this._useBar) {
      this._hp = Math.min(this._maxHp, this._hp + amt);
    } else {
      this._lives = Math.min(this._maxLives, this._lives + amt);
    }
  }

  setInvincible(ms) {
    this._invincibleFor = ms;
  }

  update(dt) {
    if (this._invincibleFor > 0) {
      this._invincibleFor = Math.max(0, this._invincibleFor - dt);
    }
  }

  reset() {
    this._lives = this._maxLives;
    this._hp = this._maxHp;
    this._invincibleFor = 0;
  }

  get lives() { return this._lives; }
  get hp() { return this._hp; }
  get maxHp() { return this._maxHp; }
  get maxLives() { return this._maxLives; }
  get useBar() { return this._useBar; }
  get isDead() { return this._lives <= 0; }
  get isInvincible() { return this._invincibleFor > 0; }
}

export class GameTimer {
  constructor(mode = 'stopwatch', duration = 60000) {
    this._mode = mode; // 'stopwatch' | 'countdown'
    this._duration = duration;
    this._elapsed = 0;
    this._running = false;
  }

  start() { this._running = true; }
  stop() { this._running = false; }

  reset() {
    this._elapsed = 0;
    this._running = false;
  }

  update(dt) {
    if (!this._running) return;
    this._elapsed += dt;
    if (this._mode === 'countdown' && this._elapsed >= this._duration) {
      this._elapsed = this._duration;
      this._running = false;
    }
  }

  get elapsed() { return this._elapsed; }
  get remaining() { return Math.max(0, this._duration - this._elapsed); }
  get isExpired() { return this._mode === 'countdown' && this._elapsed >= this._duration; }
  get mode() { return this._mode; }
  get running() { return this._running; }
}
