import { build } from "../domBuilder/index.js";
export class Store {
  constructor() {
    this._dirty = false; // if the data in store has been modified since last update (archive !=)
    this.animationFrameRequested = false;
    this.store = {}; // contain the most current value, some value may not be flushed to DOM yet.
    this._archive = {}; // contain the store state on last frame update (flush), write to store to archive after every frame update
    this._dependents = [];
  }

  // add key-value to store
  add(key, value) {
    Object.defineProperty(this.store, key, {
      set: x => {
        console.log(`[STORE INFO] ${key} is modified to `, x);
        this._dirty = true;
        this.store[`_${key}`] = x;
        if (this._dirty && !this.animationFrameRequested) {
          this.animationFrameRequested = true;
          window.requestAnimationFrame(() => {
            this._dependents.forEach(c => {
              build(c);
            });
            this._dirty = false;
            this.animationFrameRequested = false;
          });
        }
      },
      get: () => this.store[`_${key}`]
    });
    this.store[`_${key}`] = value;
  }

  addDependentComponent(component) {
    this._dependents.push(component);
  }
}
