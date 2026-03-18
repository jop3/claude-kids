export class PlatformerController {
  constructor(config = {}) {
    this._speed = config.speed ?? 150;
    this._jumpForce = -(config.jumpForce ?? 400);
    this._gravity = config.gravity ?? 800;
    this._maxFallSpeed = config.maxFallSpeed ?? 500;
    this._doubleJump = config.doubleJump ?? false;
    this._wallJump = config.wallJump ?? false;

    this._x = config.startX ?? 80;
    this._y = config.startY ?? 80;
    this._vx = 0;
    this._vy = 0;
    this._onGround = false;
    this._facingRight = true;
    this._jumpsLeft = this._doubleJump ? 2 : 1;
    this._touchingWall = 0; // -1 left, 1 right, 0 none

    this._w = 24;
    this._h = 32;
  }

  get x() { return this._x; }
  get y() { return this._y; }
  get vx() { return this._vx; }
  get vy() { return this._vy; }
  get onGround() { return this._onGround; }
  get facingRight() { return this._facingRight; }

  set x(val) { this._x = val; }
  set y(val) { this._y = val; }

  update(dt, input, platforms = []) {
    const dtSec = dt / 1000;

    // Horizontal movement
    let moveX = 0;
    if (input.left) { moveX = -1; this._facingRight = false; }
    if (input.right) { moveX = 1; this._facingRight = true; }
    this._vx = moveX * this._speed;

    // Jump
    const jumpPressed = input.jump || input.up;
    if (jumpPressed && this._jumpsLeft > 0) {
      // Wall jump
      if (this._wallJump && !this._onGround && this._touchingWall !== 0 && this._jumpsLeft <= (this._doubleJump ? 1 : 0)) {
        this._vy = this._jumpForce;
        this._vx = -this._touchingWall * this._speed * 1.2;
        this._jumpsLeft = Math.max(0, this._jumpsLeft - 1);
      } else if (this._onGround || this._jumpsLeft > 0) {
        this._vy = this._jumpForce;
        this._jumpsLeft = Math.max(0, this._jumpsLeft - 1);
      }
      // Prevent repeated jump on hold — caller must pass a "just pressed" signal
      // We rely on input being false the next frame; simpler: set jumpsLeft=0 if held
    }

    // Gravity
    this._vy += this._gravity * dtSec;
    if (this._vy > this._maxFallSpeed) this._vy = this._maxFallSpeed;

    // Move X
    this._x += this._vx * dtSec;
    this._touchingWall = 0;
    this._resolveCollisionsX(platforms);

    // Move Y
    this._y += this._vy * dtSec;
    this._onGround = false;
    this._resolveCollisionsY(platforms);

    if (this._onGround) {
      this._jumpsLeft = this._doubleJump ? 2 : 1;
    }
  }

  _resolveCollisionsX(platforms) {
    for (const p of platforms) {
      if (this._overlaps(p)) {
        const overlapLeft  = (this._x + this._w) - p.x;
        const overlapRight = (p.x + p.w) - this._x;
        if (overlapLeft < overlapRight) {
          this._x = p.x - this._w;
          this._touchingWall = 1;
        } else {
          this._x = p.x + p.w;
          this._touchingWall = -1;
        }
        this._vx = 0;
      }
    }
  }

  _resolveCollisionsY(platforms) {
    for (const p of platforms) {
      if (this._overlaps(p)) {
        const overlapTop    = (this._y + this._h) - p.y;
        const overlapBottom = (p.y + p.h) - this._y;
        if (overlapTop < overlapBottom) {
          this._y = p.y - this._h;
          this._vy = 0;
          this._onGround = true;
        } else {
          this._y = p.y + p.h;
          this._vy = Math.max(0, this._vy);
        }
      }
    }
  }

  _overlaps(r) {
    return (
      this._x < r.x + r.w &&
      this._x + this._w > r.x &&
      this._y < r.y + r.h &&
      this._y + this._h > r.y
    );
  }

  draw(ctx) {
    const x = Math.round(this._x);
    const y = Math.round(this._y);

    // Body
    ctx.fillStyle = this._onGround ? '#58a6ff' : '#f0883e';
    ctx.fillRect(x, y, this._w, this._h);

    // Eyes
    ctx.fillStyle = '#fff';
    const eyeY = y + 8;
    const eyeOff = this._facingRight ? 14 : 4;
    ctx.fillRect(x + eyeOff, eyeY, 5, 5);

    // Pupil
    ctx.fillStyle = '#000';
    ctx.fillRect(x + eyeOff + (this._facingRight ? 2 : 1), eyeY + 1, 2, 3);

    // Feet indicator when airborne
    if (!this._onGround) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(x + 4, y + this._h, this._w - 8, 2);
    }
  }

  setConfig(config) {
    if (config.speed !== undefined) this._speed = config.speed;
    if (config.jumpForce !== undefined) this._jumpForce = -(config.jumpForce);
    if (config.gravity !== undefined) this._gravity = config.gravity;
    if (config.doubleJump !== undefined) this._doubleJump = config.doubleJump;
    if (config.wallJump !== undefined) this._wallJump = config.wallJump;
  }
}
