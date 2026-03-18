export class Scene {
  constructor(name) {
    this.name = name;
  }
  onEnter(_engine) {}
  onExit(_engine) {}
  update(_dt, _engine) {}
  draw(_ctx, _engine) {}
}

export class GameEngine {
  constructor(canvas) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._rafId = null;
    this._lastTime = null;
    this._running = false;
    this._paused = false;
    this._scene = null;
    this._fps = 0;
    this._deltaTime = 0;
    this._fpsAccum = 0;
    this._fpsFrames = 0;
    this._fpsTimer = 0;
  }

  get fps() { return this._fps; }
  get deltaTime() { return this._deltaTime; }
  get canvas() { return this._canvas; }
  get ctx() { return this._ctx; }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = null;
    this._rafId = requestAnimationFrame(this._loop.bind(this));
  }

  stop() {
    this._running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  pause() {
    this._paused = true;
  }

  resume() {
    if (this._paused) {
      this._paused = false;
      this._lastTime = null;
    }
  }

  setScene(scene) {
    if (this._scene) {
      this._scene.onExit(this);
    }
    this._scene = scene;
    if (scene) {
      scene.onEnter(this);
    }
  }

  _loop(timestamp) {
    if (!this._running) return;
    this._rafId = requestAnimationFrame(this._loop.bind(this));

    if (this._paused) return;

    if (this._lastTime === null) {
      this._lastTime = timestamp;
      return;
    }

    const raw = timestamp - this._lastTime;
    this._lastTime = timestamp;
    this._deltaTime = Math.min(raw, 50);

    // FPS counter
    this._fpsFrames++;
    this._fpsTimer += raw;
    if (this._fpsTimer >= 500) {
      this._fps = Math.round((this._fpsFrames * 1000) / this._fpsTimer);
      this._fpsFrames = 0;
      this._fpsTimer = 0;
    }

    if (this._scene) {
      this._scene.update(this._deltaTime, this);
      this._scene.draw(this._ctx, this);
    }
  }
}

export function createEngine(canvas) {
  return new GameEngine(canvas);
}
