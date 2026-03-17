// Particle engine - 6 particle types with distinct physics and appearance

const CONFETTI_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bcb', '#c77dff'];

export class ParticleEngine {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.particles = [];
    this.emitters = [];
  }

  spawn(type, config = {}) {
    const {
      count = 50,
      speed = 5,
      size = 6,
      continuous = false,
      x,
      y,
      tint = null,
    } = config;

    const W = this.canvas.width || 200;
    const H = this.canvas.height || 200;

    if (continuous) {
      this.emitters.push({ type, config, active: true, accum: 0 });
    } else {
      // burst
      for (let i = 0; i < count; i++) {
        this.particles.push(this._makeParticle(type, { speed, size, tint, W, H, x, y }));
      }
    }
  }

  _makeParticle(type, opts) {
    const { speed, size, tint, W = 200, H = 200, x, y } = opts;
    const spd = speed || 5;
    const sz = size || 6;

    const px = x !== undefined ? x : Math.random() * W;
    const py = y !== undefined ? y : Math.random() * H;

    switch (type) {
      case 'fire': {
        const hue = 10 + Math.random() * 40; // orange-red-yellow
        const lightness = 50 + Math.random() * 30;
        return {
          type,
          x: px + (Math.random() - 0.5) * 40,
          y: py !== undefined ? py : H * 0.8 + Math.random() * 20,
          vx: (Math.random() - 0.5) * spd * 0.5,
          vy: -(spd * 0.8 + Math.random() * spd),
          life: 1,
          maxLife: 1,
          size: sz * (0.5 + Math.random()),
          color: `hsl(${hue}, 100%, ${lightness}%)`,
          rotation: 0,
          rotationSpeed: 0,
        };
      }
      case 'snow': {
        return {
          type,
          x: Math.random() * W,
          y: -sz,
          vx: (Math.random() - 0.5) * spd * 0.4,
          vy: spd * 0.3 + Math.random() * spd * 0.4,
          life: 1,
          maxLife: 1,
          size: sz * (0.5 + Math.random() * 0.5),
          color: Math.random() > 0.5 ? '#ffffff' : '#b0d8f5',
          rotation: 0,
          rotationSpeed: 0,
        };
      }
      case 'confetti': {
        const color = tint || CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        return {
          type,
          x: px + (Math.random() - 0.5) * W * 0.8,
          y: py !== undefined ? py : -10,
          vx: (Math.random() - 0.5) * spd * 1.5,
          vy: spd * 0.5 + Math.random() * spd * 0.8,
          life: 1,
          maxLife: 1,
          size: sz * (0.6 + Math.random() * 0.8),
          color,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
        };
      }
      case 'sparkles': {
        const sparkColors = tint ? [tint] : ['#ffd700', '#ffffff', '#00e5ff', '#ffec80'];
        return {
          type,
          x: Math.random() * W,
          y: Math.random() * H,
          vx: 0,
          vy: 0,
          life: Math.random(), // start at random phase
          maxLife: 0.8 + Math.random() * 0.4,
          size: sz * (0.5 + Math.random()),
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.05,
        };
      }
      case 'rain': {
        return {
          type,
          x: Math.random() * W,
          y: -20,
          vx: (Math.random() - 0.5) * spd * 0.1,
          vy: spd * 2 + Math.random() * spd,
          life: 1,
          maxLife: 1,
          size: sz * 0.3,
          color: `rgba(174, 214, 241, ${0.6 + Math.random() * 0.4})`,
          rotation: 0,
          rotationSpeed: 0,
        };
      }
      case 'bubbles': {
        return {
          type,
          x: Math.random() * W,
          y: H + sz,
          vx: (Math.random() - 0.5) * spd * 0.3,
          vy: -(spd * 0.3 + Math.random() * spd * 0.4),
          life: 1,
          maxLife: 1,
          size: sz * (0.6 + Math.random()),
          color: `hsla(${180 + Math.random() * 60}, 80%, 70%, 0.8)`,
          rotation: 0,
          rotationSpeed: 0,
          popping: false,
          popScale: 1,
        };
      }
      default:
        return null;
    }
  }

  update(dt) {
    const W = this.canvas.width || 200;
    const H = this.canvas.height || 200;
    const dtSec = dt / 1000;

    // Update emitters
    this.emitters.forEach(emitter => {
      if (!emitter.active) return;
      emitter.accum += dtSec;
      const rate = 0.05; // spawn every 50ms
      while (emitter.accum >= rate) {
        emitter.accum -= rate;
        const cfg = emitter.config;
        const p = this._makeParticle(emitter.type, {
          speed: cfg.speed || 5,
          size: cfg.size || 6,
          tint: cfg.tint || null,
          W,
          H,
        });
        if (p) this.particles.push(p);
      }
    });

    // Update particles
    this.particles = this.particles.filter(p => {
      if (!p) return false;
      this._updateParticle(p, dtSec, W, H);
      return p.life > 0;
    });
  }

  _updateParticle(p, dt, W, H) {
    const decay = dt / p.maxLife;

    switch (p.type) {
      case 'fire': {
        p.x += p.vx + (Math.random() - 0.5) * 1.5;
        p.y += p.vy;
        p.vy -= 0.1; // slight upward acceleration
        p.life -= decay * 0.9;
        p.size *= 0.98;
        if (p.size < 0.5) p.life = 0;
        break;
      }
      case 'snow': {
        p.x += p.vx + Math.sin(Date.now() / 1000 + p.y) * 0.3;
        p.y += p.vy;
        if (p.y > H) p.life = 0;
        else p.life -= decay * 0.1;
        break;
      }
      case 'confetti': {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        if (p.y > H + 20) p.life = 0;
        else p.life -= decay * 0.2;
        break;
      }
      case 'sparkles': {
        p.life -= decay * 1.5;
        if (p.life <= 0) {
          // respawn at new random position
          p.x = Math.random() * W;
          p.y = Math.random() * H;
          p.life = 1;
        }
        break;
      }
      case 'rain': {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y > H) p.life = 0;
        break;
      }
      case 'bubbles': {
        if (p.popping) {
          p.popScale += dt * 5;
          p.life -= dt * 8;
        } else {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -p.size) {
            p.popping = true;
          }
          p.life -= decay * 0.15;
        }
        break;
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const W = this.canvas.width || 200;
    const H = this.canvas.height || 200;

    this.particles.forEach(p => {
      if (!p || p.life <= 0) return;
      ctx.save();

      switch (p.type) {
        case 'fire': {
          const alpha = Math.max(0, p.life);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'snow': {
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'confetti': {
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size, -p.size * 0.5, p.size * 2, p.size);
          break;
        }
        case 'sparkles': {
          // twinkle in/out using a sine of life
          const alpha = Math.max(0, Math.abs(Math.sin(p.life * Math.PI)));
          ctx.globalAlpha = alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          this._drawStar(ctx, 0, 0, 5, p.size, p.size * 0.4);
          ctx.fillStyle = p.color;
          ctx.fill();
          break;
        }
        case 'rain': {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx, p.y + 10);
          ctx.stroke();
          break;
        }
        case 'bubbles': {
          const alpha = Math.max(0, Math.min(1, p.life));
          ctx.globalAlpha = alpha;
          const scale = p.popping ? p.popScale : 1;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
          ctx.stroke();
          // Highlight
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }

      ctx.restore();
    });
  }

  _drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
  }

  clear() {
    this.particles = [];
  }

  stop() {
    this.emitters.forEach(e => (e.active = false));
    this.emitters = [];
  }
}
