export class ObjectPool {
  constructor(createFn, maxSize = 1000) {
    this.createFn = createFn;
    this.maxSize = maxSize;
    this.active = new Set();
    this.inactive = [];
  }

  get(config) {
    let object;
    if (this.inactive.length > 0) {
      object = this.inactive.pop();
      object.reset(config);
    } else if (this.active.size < this.maxSize) {
      object = this.createFn(config);
    } else {
      return null; // Pool is full
    }
    this.active.add(object);
    return object;
  }

  release(object) {
    if (this.active.has(object)) {
      this.active.delete(object);
      this.inactive.push(object);
    }
  }

  update() {
    for (const object of this.active) {
      if (object.isDestroyed) {
        this.release(object);
      } else {
        object.update();
      }
    }
  }

  draw() {
    for (const object of this.active) {
      object.draw();
    }
  }

  clear() {
    this.inactive.push(...this.active);
    this.active.clear();
  }
}
