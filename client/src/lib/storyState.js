export class StoryState {
  constructor() {
    this._vars = {};
  }

  setVar(name, value) {
    this._vars[name] = value;
  }

  getVar(name) {
    return this._vars[name];
  }

  hasVar(name) {
    return Object.prototype.hasOwnProperty.call(this._vars, name);
  }

  reset() {
    this._vars = {};
  }

  toJSON() {
    return JSON.stringify(this._vars);
  }

  fromJSON(json) {
    try {
      this._vars = JSON.parse(json) || {};
    } catch {
      this._vars = {};
    }
  }
}

export class SceneGraph {
  constructor() {
    this._scenes = {};
    this._currentId = null;
  }

  addScene(id, scene) {
    this._scenes[id] = { id, name: '', blocks: [], nextScene: null, choices: [], ...scene };
    if (!this._currentId) this._currentId = id;
  }

  getScene(id) {
    return this._scenes[id] || null;
  }

  goto(id) {
    if (this._scenes[id]) {
      this._currentId = id;
    }
  }

  get currentScene() {
    return this._currentId ? this._scenes[this._currentId] : null;
  }

  get scenes() {
    return Object.values(this._scenes);
  }

  removeScene(id) {
    delete this._scenes[id];
    if (this._currentId === id) {
      const remaining = Object.keys(this._scenes);
      this._currentId = remaining.length > 0 ? remaining[0] : null;
    }
  }
}
