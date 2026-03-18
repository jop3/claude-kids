// Board Engine — grid and path data structures for board games

export class BoardGrid {
  constructor(cols = 8, rows = 8, cellSize = 40) {
    this.cols = cols;
    this.rows = rows;
    this.cellSize = cellSize;
    this._cells = {};
  }

  _key(col, row) { return `${col},${row}`; }

  setCell(col, row, data) {
    if (!this.isValid(col, row)) return;
    this._cells[this._key(col, row)] = { ...data };
  }

  getCell(col, row) {
    return this._cells[this._key(col, row)] || { type: 'normal', color: null, piece: null };
  }

  isValid(col, row) {
    return col >= 0 && col < this.cols && row >= 0 && row < this.rows;
  }

  getNeighbors(col, row) {
    return [
      [col - 1, row], [col + 1, row],
      [col, row - 1], [col, row + 1],
    ].filter(([c, r]) => this.isValid(c, r)).map(([c, r]) => ({ col: c, row: r, ...this.getCell(c, r) }));
  }

  draw(ctx, offsetX = 0, offsetY = 0) {
    const cs = this.cellSize;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.getCell(c, r);
        const x = offsetX + c * cs;
        const y = offsetY + r * cs;
        ctx.fillStyle = cell.color || ((c + r) % 2 === 0 ? '#f0d9b5' : '#b58863');
        ctx.fillRect(x, y, cs, cs);
        ctx.strokeStyle = '#00000033';
        ctx.strokeRect(x, y, cs, cs);
        if (cell.type === 'blocked') {
          ctx.fillStyle = '#33333388';
          ctx.fillRect(x, y, cs, cs);
        } else if (cell.type === 'special') {
          ctx.fillStyle = '#f1c40f';
          ctx.font = `${cs * 0.6}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⭐', x + cs / 2, y + cs / 2);
        } else if (cell.type === 'goal') {
          ctx.fillStyle = '#27ae60';
          ctx.font = `${cs * 0.6}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🏁', x + cs / 2, y + cs / 2);
        }
        if (cell.piece) {
          ctx.font = `${cs * 0.6}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.piece, x + cs / 2, y + cs / 2);
        }
      }
    }
  }

  get allCells() {
    const result = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        result.push({ col: c, row: r, ...this.getCell(c, r) });
      }
    }
    return result;
  }
}

export class BoardPath {
  constructor(squares = []) {
    // squares: array of { x, y, type, action, label }
    this._squares = squares;
  }

  getSquare(index) {
    return this._squares[index] || null;
  }

  get length() {
    return this._squares.length;
  }

  get squares() {
    return [...this._squares];
  }

  draw(ctx) {
    const sq = this._squares;
    if (sq.length === 0) return;
    const SIZE = 36;
    const typeColors = {
      normal: '#3498db',
      start: '#27ae60',
      finish: '#e74c3c',
      snake_head: '#e74c3c',
      snake_tail: '#f39c12',
      ladder_bottom: '#f1c40f',
      ladder_top: '#2ecc71',
      special: '#9b59b6',
    };
    sq.forEach((s, i) => {
      const color = typeColors[s.type] || '#3498db';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(s.x - SIZE / 2, s.y - SIZE / 2, SIZE, SIZE, 6);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i + 1, s.x, s.y);
    });
  }

  static generateSpiral(count, width, height) {
    const squares = [];
    const margin = 40;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const stepX = (width - margin * 2) / Math.max(cols - 1, 1);
    const stepY = (height - margin * 2) / Math.max(rows - 1, 1);
    let placed = 0;
    for (let r = rows - 1; r >= 0 && placed < count; r--) {
      if ((rows - 1 - r) % 2 === 0) {
        for (let c = 0; c < cols && placed < count; c++) {
          squares.push({ x: margin + c * stepX, y: margin + r * stepY, type: 'normal' });
          placed++;
        }
      } else {
        for (let c = cols - 1; c >= 0 && placed < count; c--) {
          squares.push({ x: margin + c * stepX, y: margin + r * stepY, type: 'normal' });
          placed++;
        }
      }
    }
    if (squares.length > 0) squares[0].type = 'start';
    if (squares.length > 1) squares[squares.length - 1].type = 'finish';
    return squares;
  }
}
