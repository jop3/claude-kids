/**
 * PNG export utilities for CanvasDrawBlock and PixelEditorBlock.
 */

/**
 * Composites an array of HTMLCanvasElement onto a temp canvas and triggers download.
 * @param {HTMLCanvasElement[]} canvases - Array of canvas elements to composite (bottom to top)
 * @param {string} filename - Output filename (e.g. 'ritning.png')
 */
export function exportCanvasAsPng(canvases, filename = 'ritning.png') {
  const first = canvases.find(c => c != null);
  if (!first) return;
  const w = first.width;
  const h = first.height;

  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const tc = tmp.getContext('2d');

  // White background
  tc.fillStyle = '#ffffff';
  tc.fillRect(0, 0, w, h);

  for (const canvas of canvases) {
    if (!canvas) continue;
    tc.globalAlpha = 1;
    tc.drawImage(canvas, 0, 0);
  }
  tc.globalAlpha = 1;

  triggerDownload(tmp.toDataURL('image/png'), filename);
}

/**
 * Renders pixel editor frames as a horizontal sprite sheet and triggers download.
 * @param {Array<Array<Array<string|null>>>} frames - Array of 2D color grids
 * @param {number} gridSize - Width/height of each grid in cells
 * @param {string} filename - Output filename
 * @param {number} scale - Pixels per cell (default 4)
 */
export function exportPixelGridAsPng(frames, gridSize, filename = 'pixelkonst.png', scale = 4) {
  if (!frames || frames.length === 0) return;

  const cellPx = gridSize * scale;
  const totalWidth = cellPx * frames.length;
  const totalHeight = cellPx;

  const tmp = document.createElement('canvas');
  tmp.width = totalWidth;
  tmp.height = totalHeight;
  const tc = tmp.getContext('2d');

  for (let fi = 0; fi < frames.length; fi++) {
    const grid = frames[fi];
    const offsetX = fi * cellPx;

    // Background per frame
    tc.fillStyle = '#1a1a1a';
    tc.fillRect(offsetX, 0, cellPx, cellPx);

    // Draw pixels
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const color = grid[r] && grid[r][c];
        if (color) {
          tc.fillStyle = color;
          tc.fillRect(offsetX + c * scale, r * scale, scale, scale);
        }
      }
    }
  }

  triggerDownload(tmp.toDataURL('image/png'), filename);
}

function triggerDownload(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
