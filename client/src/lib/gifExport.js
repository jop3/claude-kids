/**
 * Pure-JS animated GIF encoder — no external dependencies.
 * Supports 256-color palette per frame using median-cut quantization.
 */

// ─── LZW encoder ─────────────────────────────────────────────────────────────

function lzwEncode(pixels, colorDepth) {
  const minCodeSize = Math.max(2, colorDepth);
  const clearCode = 1 << minCodeSize;
  const eofCode = clearCode + 1;

  const output = [];
  let codeSize = minCodeSize + 1;
  let nextCode = eofCode + 1;

  const table = new Map();
  function resetTable() {
    table.clear();
    for (let i = 0; i < clearCode; i++) table.set(String(i), i);
    codeSize = minCodeSize + 1;
    nextCode = eofCode + 1;
  }

  // Bit packer
  let bitBuf = 0, bitCount = 0;
  const bytes = [];
  function emitCode(code) {
    bitBuf |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      bytes.push(bitBuf & 0xff);
      bitBuf >>= 8;
      bitCount -= 8;
    }
  }
  function flush() {
    if (bitCount > 0) bytes.push(bitBuf & 0xff);
  }

  resetTable();
  emitCode(clearCode);

  let index = 0;
  let buf = String(pixels[index++]);

  while (index < pixels.length) {
    const k = String(pixels[index++]);
    const bk = buf + ',' + k;
    if (table.has(bk)) {
      buf = bk;
    } else {
      emitCode(table.get(buf));
      if (nextCode < 4096) {
        table.set(bk, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
      } else {
        emitCode(clearCode);
        resetTable();
      }
      buf = k;
    }
  }
  emitCode(table.get(buf));
  emitCode(eofCode);
  flush();

  // Pack into sub-blocks (max 255 bytes each)
  output.push(minCodeSize);
  let i = 0;
  while (i < bytes.length) {
    const blockSize = Math.min(255, bytes.length - i);
    output.push(blockSize);
    for (let j = 0; j < blockSize; j++) output.push(bytes[i++]);
  }
  output.push(0); // block terminator
  return output;
}

// ─── Median-cut color quantization (max 256 colors) ─────────────────────────

function quantize(imageData, maxColors) {
  const { data, width, height } = imageData;
  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue; // skip transparent
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }

  if (pixels.length === 0) {
    const palette = new Array(maxColors).fill([0, 0, 0]);
    return { palette, indexFn: () => 0 };
  }

  // Build palette via median cut
  function bucket(pxs) { return { pixels: pxs }; }
  function rangeOf(pxs, ch) {
    let mn = 255, mx = 0;
    for (const p of pxs) { if (p[ch] < mn) mn = p[ch]; if (p[ch] > mx) mx = p[ch]; }
    return mx - mn;
  }
  function split(pxs) {
    const r = rangeOf(pxs, 0), g = rangeOf(pxs, 1), b = rangeOf(pxs, 2);
    const ch = r >= g && r >= b ? 0 : g >= b ? 1 : 2;
    const sorted = [...pxs].sort((a, b2) => a[ch] - b2[ch]);
    const mid = sorted.length >> 1;
    return [sorted.slice(0, mid), sorted.slice(mid)];
  }
  function avg(pxs) {
    let r = 0, g = 0, b = 0;
    for (const p of pxs) { r += p[0]; g += p[1]; b += p[2]; }
    const n = pxs.length;
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  }

  let buckets = [pixels];
  while (buckets.length < maxColors) {
    // Split the largest bucket
    buckets.sort((a, b2) => b2.length - a.length);
    const [a, b2] = split(buckets.shift());
    if (a.length) buckets.push(a);
    if (b2.length) buckets.push(b2);
    if (buckets.length === 0) break;
  }

  const palette = buckets.map(avg);
  // Pad to maxColors
  while (palette.length < maxColors) palette.push([0, 0, 0]);

  // Build nearest-color lookup (cache)
  const cache = new Map();
  function nearest(r, g, b) {
    const key = (r << 16) | (g << 8) | b;
    if (cache.has(key)) return cache.get(key);
    let best = 0, bestD = Infinity;
    for (let i = 0; i < palette.length; i++) {
      const dr = r - palette[i][0], dg = g - palette[i][1], db = b - palette[i][2];
      const d = dr * dr + dg * dg + db * db;
      if (d < bestD) { bestD = d; best = i; }
    }
    cache.set(key, best);
    return best;
  }

  function indexFn(imageDataObj) {
    const d = imageDataObj.data;
    const out = new Uint8Array(imageDataObj.width * imageDataObj.height);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      if (d[i + 3] < 128) out[p] = 0; // transparent -> index 0
      else out[p] = nearest(d[i], d[i + 1], d[i + 2]);
    }
    return out;
  }

  return { palette, indexFn };
}

// ─── GIF byte writer ──────────────────────────────────────────────────────────

function encodeGif(frames, width, height, delayCs) {
  // delayCs: delay in centiseconds per frame

  const MAX_COLORS = 256;
  const COLOR_DEPTH = 8; // log2(256)

  const bytes = [];
  function b(v) { bytes.push(v & 0xff); }
  function w(v) { b(v); b(v >> 8); } // little-endian word

  // Header
  bytes.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61); // GIF89a

  // Logical Screen Descriptor
  w(width); w(height);
  b(0xf7); // Global Color Table Flag=1, Color Res=7, Sort=0, Size=7 (256 colors)
  b(0);    // Background color index
  b(0);    // Pixel aspect ratio

  // Build a single global palette from the first frame (simplest approach)
  // For animated GIFs with varied colors, each frame uses local palette via quantization
  // We'll use local palettes per frame for quality.

  // Write a dummy global color table (256 entries of black)
  for (let i = 0; i < 256; i++) { b(0); b(0); b(0); }

  // Netscape Application Extension (loop forever)
  bytes.push(0x21, 0xff, 0x0b);
  // NETSCAPE2.0
  bytes.push(0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30);
  bytes.push(0x03, 0x01);
  w(0); // loop count 0 = infinite
  b(0); // block terminator

  for (const frameImageData of frames) {
    const { palette, indexFn } = quantize(frameImageData, MAX_COLORS);
    const indices = indexFn(frameImageData);

    // Graphic Control Extension
    bytes.push(0x21, 0xf9, 0x04);
    b(0x00); // disposal: do not dispose
    w(delayCs); // delay in 1/100 s
    b(0);    // transparent color index (none)
    b(0);    // block terminator

    // Image Descriptor
    b(0x2c);
    w(0); w(0);   // left, top
    w(width); w(height);
    b(0xc7); // Local Color Table Flag=1, Interlace=0, Size=7 (256 colors)

    // Local Color Table (256 entries)
    for (let i = 0; i < 256; i++) {
      const c = palette[i] || [0, 0, 0];
      b(c[0]); b(c[1]); b(c[2]);
    }

    // Image data (LZW compressed)
    const lzw = lzwEncode(Array.from(indices), COLOR_DEPTH);
    for (const byte of lzw) bytes.push(byte);
  }

  // Trailer
  b(0x3b);

  return new Uint8Array(bytes);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Capture animation frames by calling renderFn for each time step.
 * @param {function} renderFn - (timeMs, canvas, ctx) => void
 * @param {number} duration - total duration in ms
 * @param {number} fps - frames per second
 * @param {number} width - canvas width
 * @param {number} height - canvas height
 * @returns {ImageData[]}
 */
export function captureAnimationFrames(renderFn, duration, fps, width, height) {
  const frameCount = Math.max(1, Math.round(duration * fps / 1000));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    const timeMs = (i / frameCount) * duration;
    ctx.clearRect(0, 0, width, height);
    renderFn(timeMs, canvas, ctx);
    frames.push(ctx.getImageData(0, 0, width, height));
  }
  return frames;
}

/**
 * Encode an array of frames as an animated GIF and trigger browser download.
 * @param {HTMLCanvasElement[]|ImageData[]} frames
 * @param {number} width
 * @param {number} height
 * @param {string} filename
 * @param {number} fps
 * @returns {Promise<void>}
 */
export async function exportAnimationAsGif(frames, width, height, filename = 'animation.gif', fps = 12) {
  if (!frames || frames.length === 0) throw new Error('No frames');

  // Convert HTMLCanvasElement to ImageData if needed
  const imageDataFrames = frames.map(f => {
    if (f instanceof ImageData) return f;
    // HTMLCanvasElement
    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    const tmpCtx = tmpCanvas.getContext('2d');
    tmpCtx.drawImage(f, 0, 0, width, height);
    return tmpCtx.getImageData(0, 0, width, height);
  });

  const delayCs = Math.round(100 / fps); // centiseconds per frame
  const gifBytes = encodeGif(imageDataFrames, width, height, delayCs);

  const blob = new Blob([gifBytes], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.gif') ? filename : filename + '.gif';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
