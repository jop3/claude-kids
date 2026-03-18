export class TopdownController {
  constructor(config = {}) {
    this._speed = config.speed ?? 200;
    this._diagonal = config.diagonal ?? true;
    this._cameraFollow = config.cameraFollow ?? false;

    this._x = config.startX ?? 80;
    this._y = config.startY ?? 60;
    this._direction = 'down';

    this._w = 20;
    this._h = 20;
  }

  get x() { return this._x; }
  get y() { return this._y; }
  get direction() { return this._direction; }

  set x(val) { this._x = val; }
  set y(val) { this._y = val; }

  update(dt, input, obstacles = []) {
    const dtSec = dt / 1000;

    let dx = 0;
    let dy = 0;

    if (input.left)  dx -= 1;
    if (input.right) dx += 1;
    if (input.up)    dy -= 1;
    if (input.down)  dy += 1;

    // Diagonal speed normalization
    if (dx !== 0 && dy !== 0 && this._diagonal) {
      dx *= 0.707;
      dy *= 0.707;
    } else if (dx !== 0 && dy !== 0 && !this._diagonal) {
      dy = 0; // prefer horizontal if diagonal disabled
    }

    // Update direction
    if (dy < 0) this._direction = 'up';
    else if (dy > 0) this._direction = 'down';
    else if (dx < 0) this._direction = 'left';
    else if (dx > 0) this._direction = 'right';

    // Move X with collision
    const newX = this._x + dx * this._speed * dtSec;
    const savedX = this._x;
    this._x = newX;
    if (this._collidesAny(obstacles)) {
      this._x = savedX;
    }

    // Move Y with collision
    const newY = this._y + dy * this._speed * dtSec;
    const savedY = this._y;
    this._y = newY;
    if (this._collidesAny(obstacles)) {
      this._y = savedY;
    }
  }

  _collidesAny(obstacles) {
    for (const o of obstacles) {
      if (
        this._x < o.x + o.w &&
        this._x + this._w > o.x &&
        this._y < o.y + o.h &&
        this._y + this._h > o.y
      ) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    const x = Math.round(this._x);
    const y = Math.round(this._y);

    // Body
    ctx.fillStyle = '#3fb950';
    ctx.fillRect(x, y, this._w, this._h);

    // Direction arrow
    ctx.fillStyle = '#fff';
    ctx.save();
    ctx.translate(x + this._w / 2, y + this._h / 2);

    const arrowLen = 7;
    const arrowHead = 4;
    let ax = 0, ay = 0;
    switch (this._direction) {
      case 'up':    ay = -1; break;
      case 'down':  ay =  1; break;
      case 'left':  ax = -1; break;
      case 'right': ax =  1; break;
    }

    ctx.beginPath();
    ctx.moveTo(ax * arrowLen, ay * arrowLen);
    // arrowhead
    const perpX = ay * arrowHead;
    const perpY = ax * arrowHead;
    ctx.lineTo(ax * (arrowLen - arrowHead) + perpX, ay * (arrowLen - arrowHead) + perpY);
    ctx.lineTo(ax * (arrowLen - arrowHead) - perpX, ay * (arrowLen - arrowHead) - perpY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  setConfig(config) {
    if (config.speed !== undefined) this._speed = config.speed;
    if (config.diagonal !== undefined) this._diagonal = config.diagonal;
    if (config.cameraFollow !== undefined) this._cameraFollow = config.cameraFollow;
  }
}
