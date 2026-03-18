export function vibrate(pattern = 10) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}
export const tap = () => vibrate(10);
export const success = () => vibrate([20, 10, 20]);
export const error = () => vibrate([50, 20, 50]);
