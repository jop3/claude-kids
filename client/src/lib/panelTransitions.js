// Panel transition functions
// Each takes (ctx, fromCanvas, toCanvas, progress 0-1, width, height)

export function slideLeft(ctx, from, to, progress, w, h) {
  const offset = Math.round(w * progress);
  ctx.drawImage(from, -offset, 0, w, h);
  ctx.drawImage(to, w - offset, 0, w, h);
}

export function slideRight(ctx, from, to, progress, w, h) {
  const offset = Math.round(w * progress);
  ctx.drawImage(from, offset, 0, w, h);
  ctx.drawImage(to, offset - w, 0, w, h);
}

export function slideUp(ctx, from, to, progress, w, h) {
  const offset = Math.round(h * progress);
  ctx.drawImage(from, 0, -offset, w, h);
  ctx.drawImage(to, 0, h - offset, w, h);
}

export function fade(ctx, from, to, progress, w, h) {
  ctx.drawImage(from, 0, 0, w, h);
  ctx.globalAlpha = progress;
  ctx.drawImage(to, 0, 0, w, h);
  ctx.globalAlpha = 1;
}

export function cut(ctx, from, to, progress, w, h) {
  if (progress < 0.5) {
    ctx.drawImage(from, 0, 0, w, h);
  } else {
    ctx.drawImage(to, 0, 0, w, h);
  }
}

export function wipe(ctx, from, to, progress, w, h) {
  ctx.drawImage(from, 0, 0, w, h);
  const wipeX = Math.round(w * progress);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, wipeX, h);
  ctx.clip();
  ctx.drawImage(to, 0, 0, w, h);
  ctx.restore();
}

export const TRANSITIONS = { slideLeft, slideRight, slideUp, fade, cut, wipe };

export const TRANSITION_LIST = [
  { id: 'slideLeft',  label: 'Svep vanster', emoji: '\u2190' },
  { id: 'slideRight', label: 'Svep hoger',   emoji: '\u2192' },
  { id: 'slideUp',    label: 'Svep upp',      emoji: '\u2191' },
  { id: 'fade',       label: 'Tona',          emoji: '\u2605' },
  { id: 'cut',        label: 'Klipp',         emoji: '\u2702' },
  { id: 'wipe',       label: 'Torka',         emoji: '\u25b6' },
];
