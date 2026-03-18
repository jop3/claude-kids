export class Enemy {
  constructor(x, y, config = {}) {
    this._startX = x;
    this._startY = y;
    this._x = x;
    this._y = y;
    this._behavior = config.behavior || 'patrol';
    this._speed = config.speed ?? 100;
    this._range = config.range ?? 150;
    this._w = config.width ?? 24;
    this._h = config.height ?? 24;
    this._color = config.color || '#e05252';
    this._dir = 1;
    this._vx = 0;
    this._vy = 0;
    this._sineT = 0;
    this._dead = false;
    this._patrolLeft = config.patrolLeft ?? (x - 80);
    this._patrolRight = config.patrolRight ?? (x + 80);
  }

  get x() { return this._x; }
  get y() { return this._y; }
  get isDead() { return this._dead; }

  get bounds() {
    return { x: this._x, y: this._y, w: this._w, h: this._h };
  }

  kill() {
    this._dead = true;
  }

  update(dt, playerX, playerY, platforms = [], canvasBounds = null) {
    if (this._dead) return;
    const dtSec = dt / 1000;
    const bounds = canvasBounds || { x: 0, y: 0, w: 800, h: 600 };

    const dx = (playerX + 12) - (this._x + this._w / 2);
    const dy = (playerY + 16) - (this._y + this._h / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);

    switch (this._behavior) {
      case 'patrol': {
        this._x += this._dir * this._speed * dtSec;
        if (this._x <= this._patrolLeft) {
          this._x = this._patrolLeft;
          this._dir = 1;
        } else if (this._x + this._w >= this._patrolRight) {
          this._x = this._patrolRight - this._w;
          this._dir = -1;
        }
        // Flip at platform edges
        for (const p of platforms) {
          const onPlatformX = this._x + this._w > p.x && this._x < p.x + p.w;
          const atBottom = this._y + this._h >= p.y && this._y + this._h <= p.y + p.h + 2;
          if (atBottom && onPlatformX) {
            if (this._dir === 1 && this._x + this._w >= p.x + p.w - 2) this._dir = -1;
            if (this._dir === -1 && this._x <= p.x + 2) this._dir = 1;
          }
        }
        break;
      }
      case 'chase': {
        if (dist < this._range && dist > 1) {
          this._x += (dx / dist) * this._speed * dtSec;
          this._y += (dy / dist) * this._speed * dtSec;
        }
        break;
      }
      case 'fly': {
        this._sineT += dtSec * 2;
        if (dist < this._range && dist > 1) {
          this._x += (dx / dist) * this._speed * 0.6 * dtSec;
        }
        this._y = this._startY + Math.sin(this._sineT) * 30;
        break;
      }
      case 'flee': {
        if (dist < this._range && dist > 1) {
          this._x -= (dx / dist) * this._speed * dtSec;
          this._y -= (dy / dist) * this._speed * dtSec;
        }
        break;
      }
    }

    // Clamp to bounds
    if (canvasBounds) {
      this._x = Math.max(bounds.x, Math.min(bounds.x + bounds.w - this._w, this._x));
      this._y = Math.max(bounds.y, Math.min(bounds.y + bounds.h - this._h, this._y));
    }
  }

  draw(ctx) {
    if (this._dead) return;
    const x = Math.round(this._x);
    const y = Math.round(this._y);

    // Body
    ctx.fillStyle = this._color;
    ctx.beginPath();
    ctx.roundRect(x, y, this._w, this._h, 4);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    const eyeY = y + Math.floor(this._h * 0.25);
    const eyeSize = Math.max(3, Math.floor(this._w * 0.18));
    ctx.fillRect(x + Math.floor(this._w * 0.2), eyeY, eyeSize, eyeSize);
    ctx.fillRect(x + Math.floor(this._w * 0.6), eyeY, eyeSize, eyeSize);

    // Pupils
    ctx.fillStyle = '#000';
    ctx.fillRect(x + Math.floor(this._w * 0.22), eyeY + 1, Math.max(2, eyeSize - 1), Math.max(2, eyeSize - 1));
    ctx.fillRect(x + Math.floor(this._w * 0.62), eyeY + 1, Math.max(2, eyeSize - 1), Math.max(2, eyeSize - 1));

    // Behavior indicator
    if (this._behavior === 'fly') {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.ellipse(x - 4, y + this._h / 2, 6, 10, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + this._w + 4, y + this._h / 2, 6, 10, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function createEnemies(count, config, canvasW, canvasH) {
  const enemies = [];
  for (let i = 0; i < count; i++) {
    const x = 40 + (i / Math.max(1, count - 1)) * (canvasW - 80);
    const y = config.behavior === 'fly' ? canvasH * 0.3 : canvasH * 0.6;
    const patrolSpan = (canvasW - 80) / count;
    const patrolLeft = 40 + i * patrolSpan;
    const patrolRight = patrolLeft + patrolSpan - 10;
    enemies.push(new Enemy(x, y, { ...config, patrolLeft, patrolRight }));
  }
  return enemies;
}
