/**
 * Tween presets — pre-built animation sequences for common motions.
 * Each preset has keyframes ready to be added to an object's timeline track.
 *
 * Keyframe shape: { time (ms), x, y, scaleX, scaleY, rotation, opacity, easing }
 */

export const TWEEN_PRESETS = [
  {
    id: 'hop',
    name: 'Hopp',
    emoji: '🐸',
    keyframes: [
      { time: 0,    x: 0, y: 0,   scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'easeOutBounce' },
      { time: 400,  x: 0, y: -50, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'easeOutBounce' },
      { time: 800,  x: 0, y: 0,   scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'linear' },
    ],
  },
  {
    id: 'spin',
    name: 'Snurra',
    emoji: '🌀',
    keyframes: [
      { time: 0,    x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0,   opacity: 1, easing: 'easeInOutQuad' },
      { time: 1000, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 360, opacity: 1, easing: 'linear' },
    ],
  },
  {
    id: 'pulse',
    name: 'Puls',
    emoji: '💓',
    keyframes: [
      { time: 0,   x: 0, y: 0, scaleX: 1,   scaleY: 1,   rotation: 0, opacity: 1, easing: 'easeInOutCubic' },
      { time: 400, x: 0, y: 0, scaleX: 1.3, scaleY: 1.3, rotation: 0, opacity: 1, easing: 'easeInOutCubic' },
      { time: 800, x: 0, y: 0, scaleX: 1,   scaleY: 1,   rotation: 0, opacity: 1, easing: 'linear' },
    ],
  },
  {
    id: 'shake',
    name: 'Skaka',
    emoji: '😱',
    keyframes: [
      { time: 0,   x: 0,   y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'linear' },
      { time: 100, x: -10, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'linear' },
      { time: 200, x: 10,  y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'linear' },
      { time: 300, x: -10, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'linear' },
      { time: 400, x: 0,   y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'linear' },
    ],
  },
  {
    id: 'fadeIn',
    name: 'Tona in',
    emoji: '🌅',
    keyframes: [
      { time: 0,    x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 0, easing: 'easeInQuad' },
      { time: 1000, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'linear' },
    ],
  },
  {
    id: 'fadeOut',
    name: 'Tona ut',
    emoji: '🌆',
    keyframes: [
      { time: 0,    x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'easeOutQuad' },
      { time: 1000, x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 0, easing: 'linear' },
    ],
  },
  {
    id: 'flyIn',
    name: 'Flyg in',
    emoji: '✈️',
    keyframes: [
      { time: 0,    x: -200, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'easeOutBack' },
      { time: 800,  x: 0,    y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'linear' },
    ],
  },
  {
    id: 'bounce',
    name: 'Studsa',
    emoji: '⚽',
    keyframes: [
      { time: 0,    x: 0, y: 0,   scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'easeOutBounce' },
      { time: 400,  x: 0, y: -80, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'easeOutBounce' },
      { time: 700,  x: 0, y: 0,   scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'easeOutBounce' },
      { time: 900,  x: 0, y: -40, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'easeOutBounce' },
      { time: 1100, x: 0, y: 0,   scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, easing: 'linear' },
    ],
  },
];
