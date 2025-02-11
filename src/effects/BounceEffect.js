import { getP5 } from '../game/p5Instance.js';

export class BounceEffect {
  constructor({
    position,
    shapeFunc,
    size = 1,
    thickness = 2,
    life = 15,
    sizeIncrease = 0.1,
    alpha = 128,
    alphaDecrease = 8.5
  }) {
    this.position = position.copy();
    this.shapeFunc = shapeFunc;
    this.size = size;
    this.thickness = thickness;
    this.life = life;
    this.sizeIncrease = sizeIncrease;
    this.alpha = alpha;
    this.alphaDecrease = alphaDecrease;
  }

  update() {
    this.size += this.sizeIncrease;
    this.alpha -= this.alphaDecrease;
    this.life -= 1;
  }

  draw() {
    const p5 = getP5();
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.noFill();
    p5.stroke(0, 255, 255, this.alpha);
    p5.strokeWeight(this.thickness);
    this.shapeFunc(this.size); // Pass the size to the shape function
    p5.pop();
  }

  isAlive() {
    return this.life > 0;
  }
}
