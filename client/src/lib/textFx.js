// Canvas text effect renderers

function measureLetters(ctx, text) {
  return text.split('').map(ch => ctx.measureText(ch).width);
}

export function drawBouncingText(ctx, text, x, y, time, config = {}) {
  const amplitude = (config.intensity || 3) * 3;
  const speed = (config.speed || 3) * 2;
  const font = config.font || 'bold 24px sans-serif';
  ctx.font = font;
  ctx.fillStyle = config.color || '#fff';
  ctx.textBaseline = 'middle';
  let cx = x;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const offsetY = Math.sin(time * speed + i * 0.7) * amplitude;
    ctx.fillText(ch, cx, y + offsetY);
    cx += ctx.measureText(ch).width;
  }
}

export function drawShakingText(ctx, text, x, y, time, config = {}) {
  const amplitude = (config.intensity || 3) * 1.5;
  const font = config.font || 'bold 24px sans-serif';
  ctx.font = font;
  ctx.fillStyle = config.color || '#fff';
  ctx.textBaseline = 'middle';
  let cx = x;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const ox = (Math.random() - 0.5) * amplitude;
    const oy = (Math.random() - 0.5) * amplitude;
    ctx.fillText(ch, cx + ox, y + oy);
    cx += ctx.measureText(ch).width;
  }
}

export function drawRainbowText(ctx, text, x, y, time, config = {}) {
  const speed = (config.speed || 3) * 0.5;
  const font = config.font || 'bold 24px sans-serif';
  ctx.font = font;
  ctx.textBaseline = 'middle';
  let cx = x;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const hue = ((time * speed * 60 + i * 30) % 360);
    ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width;
  }
}

export function drawFadeInText(ctx, text, x, y, progress, config = {}) {
  // progress 0..1, fades in left to right
  const font = config.font || 'bold 24px sans-serif';
  ctx.font = font;
  ctx.textBaseline = 'middle';
  const total = text.length;
  let cx = x;
  for (let i = 0; i < total; i++) {
    const ch = text[i];
    const charProgress = Math.max(0, Math.min(1, progress * total - i));
    ctx.globalAlpha = charProgress;
    ctx.fillStyle = config.color || '#fff';
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width;
  }
  ctx.globalAlpha = 1;
}

export function drawWaveText(ctx, text, x, y, time, config = {}) {
  const amplitude = (config.intensity || 3) * 4;
  const speed = (config.speed || 3) * 1.5;
  const font = config.font || 'bold 24px sans-serif';
  ctx.font = font;
  ctx.fillStyle = config.color || '#fff';
  ctx.textBaseline = 'middle';
  let cx = x;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const offsetY = Math.sin(time * speed + i * 0.5) * amplitude;
    ctx.fillText(ch, cx, y + offsetY);
    cx += ctx.measureText(ch).width;
  }
}
