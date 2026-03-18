import { Scene } from './gameEngine.js';

const FADE_DURATION = 200;

export class SceneManager {
  constructor(engine) {
    this._engine = engine;
    this._fadeAlpha = 0;
    this._fadingOut = false;
    this._fadingIn = false;
    this._fadeTimer = 0;
    this._pendingScene = null;
    this._active = false;
  }

  transitionTo(scene) {
    this._pendingScene = scene;
    this._fadingOut = true;
    this._fadingIn = false;
    this._fadeTimer = 0;
    this._fadeAlpha = 0;
  }

  // Call each frame from the active scene's update if using transition overlay
  updateFade(dt) {
    if (this._fadingOut) {
      this._fadeTimer += dt;
      this._fadeAlpha = Math.min(1, this._fadeTimer / FADE_DURATION);
      if (this._fadeTimer >= FADE_DURATION) {
        this._fadingOut = false;
        this._fadingIn = true;
        this._fadeTimer = 0;
        this._engine.setScene(this._pendingScene);
        this._pendingScene = null;
      }
    } else if (this._fadingIn) {
      this._fadeTimer += dt;
      this._fadeAlpha = Math.max(0, 1 - this._fadeTimer / FADE_DURATION);
      if (this._fadeTimer >= FADE_DURATION) {
        this._fadingIn = false;
        this._fadeAlpha = 0;
      }
    }
  }

  drawFade(ctx, w, h) {
    if (this._fadeAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this._fadeAlpha;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }

  get isFading() {
    return this._fadingOut || this._fadingIn;
  }
}

export class TitleScene extends Scene {
  constructor(config = {}) {
    super('title');
    this._config = config;
    this._bounceT = 0;
    this._onStart = config.onStart || null;
    this._manager = config.manager || null;
    this._nextScene = config.nextScene || null;
  }

  onEnter(_engine) {
    this._bounceT = 0;
  }

  update(dt, engine) {
    this._bounceT += dt / 1000;
    if (this._manager) this._manager.updateFade(dt);
    // tap/click to start
    if (!this._clickBound) {
      this._clickHandler = () => {
        if (this._manager && this._nextScene) {
          this._manager.transitionTo(this._nextScene);
        } else if (this._onStart) {
          this._onStart(engine);
        }
      };
      engine.canvas.addEventListener('pointerdown', this._clickHandler);
      this._clickBound = true;
    }
  }

  onExit(engine) {
    if (this._clickHandler) {
      engine.canvas.removeEventListener('pointerdown', this._clickHandler);
      this._clickBound = false;
    }
  }

  draw(ctx, engine) {
    const W = engine.canvas.width;
    const H = engine.canvas.height;
    const bg = this._config.backgroundColor || '#1a1a2e';

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Title
    const title = this._config.gameTitle || 'Mitt Spel';
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(W * 0.1)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, W / 2, H * 0.3);
    ctx.restore();

    // Bouncing character
    const bounce = Math.abs(Math.sin(this._bounceT * 3)) * 20;
    ctx.save();
    ctx.font = `${Math.round(W * 0.14)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this._config.characterEmoji || '🏃', W / 2, H * 0.55 - bounce);
    ctx.restore();

    // Prompt
    const alpha = 0.5 + 0.5 * Math.sin(this._bounceT * 2);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#aaaaff';
    ctx.font = `bold ${Math.round(W * 0.06)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tryck for att starta!', W / 2, H * 0.8);
    ctx.restore();

    if (this._manager) this._manager.drawFade(ctx, W, H);
  }
}

export class GameScene extends Scene {
  constructor(name = 'game', config = {}) {
    super(name);
    this._config = config;
    this._manager = config.manager || null;
    this._score = 0;
  }

  get score() { return this._score; }
  set score(v) { this._score = v; }

  onEnter(_engine) {}
  onExit(_engine) {}

  update(dt, _engine) {
    if (this._manager) this._manager.updateFade(dt);
  }

  draw(ctx, engine) {
    const W = engine.canvas.width;
    const H = engine.canvas.height;
    ctx.fillStyle = this._config.backgroundColor || '#0d1117';
    ctx.fillRect(0, 0, W, H);
    if (this._manager) this._manager.drawFade(ctx, W, H);
  }

  goToGameOver(engine) {
    if (this._manager) {
      const scene = new GameOverScene({
        score: this._score,
        manager: this._manager,
        onRestart: this._config.onRestart,
        backgroundColor: this._config.backgroundColor,
      });
      this._manager.transitionTo(scene);
    }
  }

  goToWin(engine) {
    if (this._manager) {
      const scene = new WinScene({
        score: this._score,
        manager: this._manager,
        onRestart: this._config.onRestart,
        backgroundColor: this._config.backgroundColor,
      });
      this._manager.transitionTo(scene);
    }
  }
}

export class GameOverScene extends Scene {
  constructor(config = {}) {
    super('gameover');
    this._config = config;
    this._t = 0;
    this._manager = config.manager || null;
  }

  onEnter(engine) {
    this._t = 0;
    this._handler = () => {
      if (this._config.onRestart) this._config.onRestart(engine);
    };
    setTimeout(() => {
      engine.canvas.addEventListener('pointerdown', this._handler);
    }, 800);
  }

  onExit(engine) {
    engine.canvas.removeEventListener('pointerdown', this._handler);
  }

  update(dt, _engine) {
    this._t += dt / 1000;
    if (this._manager) this._manager.updateFade(dt);
  }

  draw(ctx, engine) {
    const W = engine.canvas.width;
    const H = engine.canvas.height;
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.fillStyle = '#ff4444';
    ctx.font = `bold ${Math.round(W * 0.12)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', W / 2, H * 0.3);
    ctx.restore();

    if (this._config.score !== undefined) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.round(W * 0.07)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Poang: ' + this._config.score, W / 2, H * 0.5);
      ctx.restore();
    }

    if (this._t > 0.8) {
      const alpha = 0.5 + 0.5 * Math.sin(this._t * 2.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#aaaaff';
      ctx.font = `bold ${Math.round(W * 0.065)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Spela igen?', W / 2, H * 0.72);
      ctx.restore();
    }

    if (this._manager) this._manager.drawFade(ctx, W, H);
  }
}

export class WinScene extends Scene {
  constructor(config = {}) {
    super('win');
    this._config = config;
    this._t = 0;
    this._manager = config.manager || null;
  }

  onEnter(engine) {
    this._t = 0;
    this._handler = () => {
      if (this._config.onRestart) this._config.onRestart(engine);
    };
    setTimeout(() => {
      engine.canvas.addEventListener('pointerdown', this._handler);
    }, 800);
  }

  onExit(engine) {
    engine.canvas.removeEventListener('pointerdown', this._handler);
  }

  update(dt, _engine) {
    this._t += dt / 1000;
    if (this._manager) this._manager.updateFade(dt);
  }

  draw(ctx, engine) {
    const W = engine.canvas.width;
    const H = engine.canvas.height;
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, W, H);

    // Trophy
    ctx.save();
    ctx.font = `${Math.round(W * 0.15)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\uD83C\uDFC6', W / 2, H * 0.25);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#ffd700';
    ctx.font = `bold ${Math.round(W * 0.1)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Du vann!', W / 2, H * 0.48);
    ctx.restore();

    if (this._config.score !== undefined) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.round(W * 0.07)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Poang: ' + this._config.score, W / 2, H * 0.62);
      ctx.restore();
    }

    if (this._t > 0.8) {
      const alpha = 0.5 + 0.5 * Math.sin(this._t * 2.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#aaffaa';
      ctx.font = `bold ${Math.round(W * 0.065)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Spela igen?', W / 2, H * 0.8);
      ctx.restore();
    }

    if (this._manager) this._manager.drawFade(ctx, W, H);
  }
}
