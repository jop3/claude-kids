export class InputHandler {
  constructor(canvas) {
    this._canvas = canvas;
    this._keys = new Set();
    this._justPressed = new Set();
    this._justPressedConsumed = new Set();
    this._touchDpad = null;

    this._onKeyDown = (e) => {
      if (!this._keys.has(e.code)) {
        this._keys.add(e.code);
        this._justPressed.add(e.code);
      }
    };
    this._onKeyUp = (e) => {
      this._keys.delete(e.code);
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  isKeyDown(key) {
    return this._keys.has(key);
  }

  isKeyJustPressed(key) {
    if (this._justPressed.has(key) && !this._justPressedConsumed.has(key)) {
      this._justPressedConsumed.add(key);
      return true;
    }
    return false;
  }

  get left()   { return this._keys.has('ArrowLeft')  || this._keys.has('KeyA'); }
  get right()  { return this._keys.has('ArrowRight') || this._keys.has('KeyD'); }
  get up()     { return this._keys.has('ArrowUp')    || this._keys.has('KeyW'); }
  get down()   { return this._keys.has('ArrowDown')  || this._keys.has('KeyS'); }
  get jump()   { return this._keys.has('ArrowUp')    || this._keys.has('KeyW') || this._keys.has('Space'); }
  get action() { return this._keys.has('Space') || this._keys.has('KeyZ') || this._keys.has('Enter'); }

  update() {
    this._justPressed.clear();
    this._justPressedConsumed.clear();
  }

  // Create on-screen virtual d-pad overlay inside canvas parent
  createTouchDpad(options = {}) {
    if (this._touchDpad) this.destroyTouchDpad();

    const {
      position = 'bottom-left',
      size = 'medium',
      actionLabel = 'A',
    } = options;

    const btnSize = size === 'small' ? 44 : size === 'large' ? 72 : 56;
    const gap = 4;
    const pad = 12;

    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      bottom: ${pad}px;
      ${position === 'bottom-right' ? 'right' : 'left'}: ${pad}px;
      display: flex;
      align-items: flex-end;
      gap: ${gap * 4}px;
      pointer-events: none;
      z-index: 100;
      user-select: none;
      -webkit-user-select: none;
    `;

    // D-pad cluster
    const dpadWrap = document.createElement('div');
    dpadWrap.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, ${btnSize}px);
      grid-template-rows: repeat(3, ${btnSize}px);
      gap: ${gap}px;
      pointer-events: none;
    `;

    const dpadDefs = [
      { row: 1, col: 2, label: '▲', code: 'ArrowUp' },
      { row: 2, col: 1, label: '◀', code: 'ArrowLeft' },
      { row: 2, col: 3, label: '▶', code: 'ArrowRight' },
      { row: 3, col: 2, label: '▼', code: 'ArrowDown' },
    ];

    for (let r = 1; r <= 3; r++) {
      for (let c = 1; c <= 3; c++) {
        const def = dpadDefs.find(d => d.row === r && d.col === c);
        const cell = document.createElement('div');
        if (def) {
          cell.textContent = def.label;
          cell.style.cssText = `
            width: ${btnSize}px;
            height: ${btnSize}px;
            background: rgba(255,255,255,0.15);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${Math.round(btnSize * 0.45)}px;
            color: rgba(255,255,255,0.8);
            cursor: pointer;
            pointer-events: all;
            -webkit-tap-highlight-color: transparent;
            touch-action: none;
          `;
          const code = def.code;
          cell.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            cell.style.background = 'rgba(255,255,255,0.35)';
            this._keys.add(code);
            this._justPressed.add(code);
          });
          cell.addEventListener('pointerup', () => {
            cell.style.background = 'rgba(255,255,255,0.15)';
            this._keys.delete(code);
          });
          cell.addEventListener('pointerleave', () => {
            cell.style.background = 'rgba(255,255,255,0.15)';
            this._keys.delete(code);
          });
        } else {
          cell.style.cssText = `width:${btnSize}px;height:${btnSize}px;`;
        }
        dpadWrap.appendChild(cell);
      }
    }

    // Action button
    const actionBtn = document.createElement('div');
    actionBtn.textContent = actionLabel;
    actionBtn.style.cssText = `
      width: ${Math.round(btnSize * 1.3)}px;
      height: ${Math.round(btnSize * 1.3)}px;
      background: rgba(88, 166, 255, 0.25);
      border: 2px solid rgba(88, 166, 255, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${Math.round(btnSize * 0.45)}px;
      color: rgba(255,255,255,0.9);
      font-weight: bold;
      cursor: pointer;
      pointer-events: all;
      -webkit-tap-highlight-color: transparent;
      touch-action: none;
      align-self: center;
    `;
    actionBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      actionBtn.style.background = 'rgba(88,166,255,0.5)';
      this._keys.add('Space');
      this._justPressed.add('Space');
    });
    actionBtn.addEventListener('pointerup', () => {
      actionBtn.style.background = 'rgba(88,166,255,0.25)';
      this._keys.delete('Space');
    });
    actionBtn.addEventListener('pointerleave', () => {
      actionBtn.style.background = 'rgba(88,166,255,0.25)';
      this._keys.delete('Space');
    });

    container.appendChild(dpadWrap);
    container.appendChild(actionBtn);

    // Insert into canvas parent
    const parent = this._canvas.parentElement || document.body;
    if (parent.style.position === '' || parent.style.position === 'static') {
      parent.style.position = 'relative';
    }
    parent.appendChild(container);
    this._touchDpad = container;
  }

  destroyTouchDpad() {
    if (this._touchDpad) {
      this._touchDpad.remove();
      this._touchDpad = null;
    }
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.destroyTouchDpad();
    this._keys.clear();
    this._justPressed.clear();
  }
}
