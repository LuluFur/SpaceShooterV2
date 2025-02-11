import { getP5 } from '../game/p5Instance.js';

export class GameObject {
  constructor(x, y, size, velocity, direction) {
    const p5 = getP5();
    this.position = p5.createVector(x, y);
    this.size = size;
    this.velocity = velocity;
    this.direction = direction;
  }

  update() {
    this.position.add(this.velocity);
  }

  draw() {
    // Override in subclasses
  }

  isColliding(other) {
    const p5 = getP5();
    let distance = p5.dist(
      this.position.x, 
      this.position.y, 
      other.position.x, 
      other.position.y
    );
    return distance < (this.size + other.size) / 2;
  }
}