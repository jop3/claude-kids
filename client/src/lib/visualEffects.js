// Visual effects library — canvas-based animations using requestAnimationFrame

/**
 * playShake(canvas, intensity, loop, onComplete)
 * Oscillates the canvas container via CSS transform
 */
export function playShake(canvas, intensity = 3, loop = false, onComplete) {
  const amp = intensity * 2; // pixels
  const duration = 300;
  const start = performance.now();
  let rafId;

  function frame(now) {
    const elapsed = now - start;
    const t = elapsed / duration;

    if (t >= 1) {
      canvas.style.transform = 'translate(0, 0)';
      if (loop) {
        playShake(canvas, intensity, loop, onComplete);
      } else {
        if (onComplete) onComplete();
      }
      return;
    }

    const damping = 1 - t;
    const freq = 8 + intensity * 2;
    const dx = Math.sin(t * Math.PI * freq) * amp * damping;
    const dy = Math.cos(t * Math.PI * freq * 0.7) * amp * 0.5 * damping;
    canvas.style.transform = `translate(${dx}px, ${dy}px)`;
    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(rafId); canvas.style.transform = ''; };
}

/**
 * playFlash(canvas, color, intensity, loop, onComplete)
 * White/color flash overlay drawn on top of canvas
 */
export function playFlash(canvas, color = '#ffffff', intensity = 3, loop = false, onComplete) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const duration = 80 + intensity * 20;
  const start = performance.now();
  let rafId;

  function frame(now) {
    const elapsed = now - start;
    const t = elapsed / duration;

    if (t >= 1) {
      ctx.clearRect(0, 0, W, H);
      if (loop) {
        setTimeout(() => playFlash(canvas, color, intensity, loop, onComplete), 300);
      } else {
        if (onComplete) onComplete();
      }
      return;
    }

    // Triangle wave: 0→1→0
    const alpha = t < 0.5 ? t * 2 : (1 - t) * 2;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = alpha * Math.min(1, intensity / 3);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(rafId); ctx.clearRect(0, 0, W, H); };
}

/**
 * playGlow(canvas, color, intensity, loop, onComplete)
 * Draws a colored glow ring around canvas center
 */
export function playGlow(canvas, color = '#00e5ff', intensity = 3, loop = false, onComplete) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const duration = 600;
  const start = performance.now();
  const cx = W / 2;
  const cy = H / 2;
  const radius = Math.min(W, H) * 0.35;
  const glowWidth = intensity * 4;
  let rafId;

  function frame(now) {
    const elapsed = now - start;
    const t = (elapsed % duration) / duration;

    if (!loop && elapsed >= duration) {
      ctx.clearRect(0, 0, W, H);
      if (onComplete) onComplete();
      return;
    }

    // Pulse: sin wave
    const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = 0.3 + pulse * 0.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = glowWidth * (1 + pulse);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 + pulse * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(rafId); ctx.clearRect(0, 0, W, H); };
}

/**
 * playTrail(canvas, positions, intensity, onComplete)
 * Draws fading ghost copies along a path
 * positions: array of {x, y}
 */
export function playTrail(canvas, positions, intensity = 3, onComplete) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const trailLen = Math.max(3, intensity + 2);
  const size = 16 + intensity * 3;

  ctx.clearRect(0, 0, W, H);

  if (!positions || positions.length === 0) {
    if (onComplete) onComplete();
    return;
  }

  const pts = positions.slice(-trailLen);
  pts.forEach((pt, i) => {
    const alpha = ((i + 1) / pts.length) * 0.7;
    const s = size * ((i + 1) / pts.length);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#58a6ff';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, s / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  if (onComplete) onComplete();
}

/**
 * playExplosion(canvas, x, y, intensity, onComplete)
 * Circular burst of colored circles radiating outward
 */
export function playExplosion(canvas, x, y, intensity = 3, onComplete) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  const cx = x !== undefined ? x : W / 2;
  const cy = y !== undefined ? y : H / 2;
  const particleCount = 8 + intensity * 4;
  const duration = 400 + intensity * 60;
  const maxRadius = 20 + intensity * 10;
  const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bcb', '#c77dff', '#ff9f1c', '#ffffff'];
  const start = performance.now();

  const particles = Array.from({ length: particleCount }, (_, i) => {
    const angle = (i / particleCount) * Math.PI * 2;
    const speed = (2 + Math.random() * 2) * intensity * 0.5;
    return {
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: colors[i % colors.length],
      size: 3 + Math.random() * 4,
    };
  });

  let rafId;

  function frame(now) {
    const elapsed = now - start;
    const t = elapsed / duration;

    if (t >= 1) {
      ctx.clearRect(0, 0, W, H);
      if (onComplete) onComplete();
      return;
    }

    ctx.clearRect(0, 0, W, H);
    const alpha = 1 - t;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - t * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Core flash
    if (t < 0.2) {
      ctx.save();
      ctx.globalAlpha = (0.2 - t) / 0.2 * 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * t * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(rafId); ctx.clearRect(0, 0, W, H); };
}

/**
 * playRainbow(canvas, intensity, loop, onComplete)
 * Color cycle animation across the canvas
 */
export function playRainbow(canvas, intensity = 3, loop = false, onComplete) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const duration = 1200 / Math.max(1, intensity * 0.5);
  const start = performance.now();
  let rafId;

  function frame(now) {
    const elapsed = now - start;
    const t = (elapsed % duration) / duration;

    if (!loop && elapsed >= duration) {
      ctx.clearRect(0, 0, W, H);
      if (onComplete) onComplete();
      return;
    }

    ctx.clearRect(0, 0, W, H);

    // Draw rainbow bands
    const bands = 7;
    const hueShift = t * 360;
    for (let i = 0; i < bands; i++) {
      const hue = (hueShift + (i / bands) * 360) % 360;
      const y0 = (i / bands) * H;
      const y1 = ((i + 1) / bands) * H;
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
      ctx.fillRect(0, y0, W, y1 - y0);
    }
    ctx.globalAlpha = 1;

    // Sparkle overlay
    const sparkCount = Math.floor(intensity * 2);
    for (let i = 0; i < sparkCount; i++) {
      const sx = Math.random() * W;
      const sy = Math.random() * H;
      const sr = 1 + Math.random() * 3;
      ctx.globalAlpha = Math.random() * 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(rafId); ctx.clearRect(0, 0, W, H); };
}
