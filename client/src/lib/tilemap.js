export const TILE_TYPES = {
  EMPTY: 0,
  SOLID: 1,
  PLATFORM: 2,
  SPIKE: 3,
  COIN: 4,
  GOAL: 5,
};

export const TILE_COLORS = {
  0: null,
  1: '#5c6bc0',
  2: '#8d6748',
  3: '#e53935',
  4: '#fdd835',
  5: '#43a047',
};

export const TILE_LABELS = {
  0: 'Tom',
  1: 'Solid',
  2: 'Plattform',
  3: 'Tagg',
  4: 'Mynt',
  5: 'Mål',
};

export class Tilemap {
  constructor(cols, rows, tileSize) {
    this._cols = cols;
    this._rows = rows;
    this._tileSize = tileSize;
    this._grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  }

  get cols() { return this._cols; }
  get rows() { return this._rows; }
  get tileSize() { return this._tileSize; }

  setTile(col, row, tileType) {
    if (col < 0 || col >= this._cols || row < 0 || row >= this._rows) return;
    this._grid[row][col] = tileType;
  }

  getTile(col, row) {
    if (col < 0 || col >= this._cols || row < 0 || row >= this._rows) return 0;
    return this._grid[row][col];
  }

  fillRow(row, tileType) {
    if (row < 0 || row >= this._rows) return;
    for (let c = 0; c < this._cols; c++) {
      this._grid[row][c] = tileType;
    }
  }

  fillCol(col, tileType) {
    if (col < 0 || col >= this._cols) return;
    for (let r = 0; r < this._rows; r++) {
      this._grid[r][col] = tileType;
    }
  }

  clear() {
    this._grid = Array.from({ length: this._rows }, () => new Array(this._cols).fill(0));
  }

  getSolidRects() {
    const rects = [];
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        const t = this._grid[r][c];
        if (t === TILE_TYPES.SOLID || t === TILE_TYPES.PLATFORM) {
          rects.push({
            x: c * this._tileSize,
            y: r * this._tileSize,
            w: this._tileSize,
            h: this._tileSize,
            type: t,
          });
        }
      }
    }
    return rects;
  }

  draw(ctx, offsetX = 0, offsetY = 0) {
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        const t = this._grid[r][c];
        if (t === TILE_TYPES.EMPTY) continue;
        const px = offsetX + c * this._tileSize;
        const py = offsetY + r * this._tileSize;
        const color = TILE_COLORS[t];
        if (!color) continue;

        ctx.fillStyle = color;
        ctx.fillRect(px, py, this._tileSize, this._tileSize);

        // Coin: circle
        if (t === TILE_TYPES.COIN) {
          ctx.fillStyle = '#ffee58';
          const cx = px + this._tileSize / 2;
          const cy = py + this._tileSize / 2;
          const r2 = this._tileSize * 0.35;
          ctx.beginPath();
          ctx.arc(cx, cy, r2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Spike: triangle
        if (t === TILE_TYPES.SPIKE) {
          ctx.fillStyle = '#ff5252';
          ctx.beginPath();
          ctx.moveTo(px + this._tileSize / 2, py + 2);
          ctx.lineTo(px + this._tileSize - 2, py + this._tileSize - 2);
          ctx.lineTo(px + 2, py + this._tileSize - 2);
          ctx.closePath();
          ctx.fill();
        }

        // Goal: star marker
        if (t === TILE_TYPES.GOAL) {
          ctx.fillStyle = '#69f0ae';
          ctx.font = `bold ${Math.round(this._tileSize * 0.6)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', px + this._tileSize / 2, py + this._tileSize / 2);
        }

        // Light border
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, this._tileSize, this._tileSize);
      }
    }
  }

  drawGrid(ctx, offsetX = 0, offsetY = 0, zoom = 1) {
    const ts = this._tileSize * zoom;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let r = 0; r <= this._rows; r++) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + r * ts);
      ctx.lineTo(offsetX + this._cols * ts, offsetY + r * ts);
      ctx.stroke();
    }
    for (let c = 0; c <= this._cols; c++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + c * ts, offsetY);
      ctx.lineTo(offsetX + c * ts, offsetY + this._rows * ts);
      ctx.stroke();
    }
  }

  toJSON() {
    return {
      cols: this._cols,
      rows: this._rows,
      tileSize: this._tileSize,
      grid: this._grid.map(row => [...row]),
    };
  }

  fromJSON(data) {
    if (!data) return;
    this._cols = data.cols ?? this._cols;
    this._rows = data.rows ?? this._rows;
    this._tileSize = data.tileSize ?? this._tileSize;
    if (Array.isArray(data.grid)) {
      this._grid = data.grid.map(row => [...row]);
    }
  }

  static fromJSON(data) {
    const tm = new Tilemap(data.cols, data.rows, data.tileSize);
    tm.fromJSON(data);
    return tm;
  }
}
