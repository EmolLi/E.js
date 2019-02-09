export class Store {
  constructor() {
    _store = {}; // contain the most current value, some value may not be flushed to DOM yet.
    _archive = {}; // contain the store state on last frame update (flush), write to store to archive after every frame update
  }
}
