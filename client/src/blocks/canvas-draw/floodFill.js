/**
 * BFS flood fill on a canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} startX
 * @param {number} startY
 * @param {string} fillColor  - CSS hex string e.g. '#ff0000'
 */
export function floodFill(ctx, startX, startY, fillColor) {
  const canvas = ctx.canvas;
  const W = canvas.width;
  const H = canvas.height;

  const imageData = ctx.getImageData(0, 0, W, H);
  const data = imageData.data;

  const sx = Math.floor(startX);
  const sy = Math.floor(startY);

  if (sx < 0 || sx >= W || sy < 0 || sy >= H) return;

  // Parse fill color
  const tmp = document.createElement('canvas');
  tmp.width = tmp.height = 1;
  const tc = tmp.getContext('2d');
  tc.fillStyle = fillColor;
  tc.fillRect(0, 0, 1, 1);
  const fillPx = tc.getImageData(0, 0, 1, 1).data;
  const [fillR, fillG, fillB, fillA] = fillPx;

  // Get target color at start pixel
  const idx0 = (sy * W + sx) * 4;
  const targetR = data[idx0];
  const targetG = data[idx0 + 1];
  const targetB = data[idx0 + 2];
  const targetA = data[idx0 + 3];

  // If target already matches fill color, nothing to do
  if (
    Math.abs(targetR - fillR) < 2 &&
    Math.abs(targetG - fillG) < 2 &&
    Math.abs(targetB - fillB) < 2 &&
    Math.abs(targetA - fillA) < 2
  ) return;

  const TOLERANCE = 30;

  function colorMatch(idx) {
    return (
      Math.abs(data[idx]     - targetR) <= TOLERANCE &&
      Math.abs(data[idx + 1] - targetG) <= TOLERANCE &&
      Math.abs(data[idx + 2] - targetB) <= TOLERANCE &&
      Math.abs(data[idx + 3] - targetA) <= TOLERANCE
    );
  }

  function setColor(idx) {
    data[idx]     = fillR;
    data[idx + 1] = fillG;
    data[idx + 2] = fillB;
    data[idx + 3] = fillA;
  }

  const visited = new Uint8Array(W * H);
  const queue = [[sx, sy]];
  visited[sy * W + sx] = 1;

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const idx = (y * W + x) * 4;

    if (!colorMatch(idx)) continue;
    setColor(idx);

    const neighbors = [
      [x - 1, y], [x + 1, y],
      [x, y - 1], [x, y + 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      const ni = ny * W + nx;
      if (visited[ni]) continue;
      visited[ni] = 1;
      queue.push([nx, ny]);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
