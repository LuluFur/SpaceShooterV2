import { GameObject } from './GameObject.js';
import { getP5 } from '../game/p5Instance.js'; // Remove this line

export class XPOrb extends GameObject {
  constructor(x, y, xpValue) {
    const p5 = getP5(); // Access p5 instance globally
    super(x, y, 10, p5.createVector(0, 0), 0);
    this.xpValue = xpValue;
    this.collectionRange = 150;
    this.attractionRange = 300;
    this.maxSpeed = 5;
    this.collected = false;

    // Add some random initial velocity
    const randomAngle = p5.random(p5.TWO_PI);
    this.velocity = p5
      .createVector(p5.cos(randomAngle), p5.sin(randomAngle))
      .mult(2);
  }

  update(player) {
    const p5 = getP5(); // Access p5 instance globally
    if (this.collected) return;

    const distanceToPlayer = p5.dist(
      this.position.x,
      this.position.y,
      player.position.x,
      player.position.y
    );

    // Check if within collection range
    if (distanceToPlayer < player.size) {
      player.addXP(this.xpValue);
      this.collected = true;
      return;
    }

    // Move towards player if within attraction range
    if (distanceToPlayer < this.attractionRange) {
      const direction = p5
        .createVector(
          player.position.x - this.position.x,
          player.position.y - this.position.y
        )
        .normalize();

      // Increase attraction speed as orb gets closer
      const attractionStrength = p5.map(
        distanceToPlayer,
        0,
        this.attractionRange,
        this.maxSpeed,
        0.5
      );

      direction.mult(attractionStrength);
      this.velocity.lerp(direction, 0.1);
    }

    // Apply velocity with some dampening
    this.velocity.mult(0.98);
    this.position.add(this.velocity);

    // Screen wrapping
    if (this.position.x > p5.width + this.size) this.position.x = -this.size;
    else if (this.position.x < -this.size)
      this.position.x = p5.width + this.size;
    if (this.position.y > p5.height + this.size) this.position.y = -this.size;
    else if (this.position.y < -this.size)
      this.position.y = p5.height + this.size;
  }

  draw() {
    const p5 = getP5(); // Access p5 instance globally
    if (this.collected) return;

    p5.push();
    p5.translate(this.position.x, this.position.y);

    // Glow effect
    p5.drawingContext.shadowBlur = 20;
    p5.drawingContext.shadowColor = 'rgba(0, 255, 255, 0.5)';

    // Draw orb
    p5.noStroke();
    p5.fill(0, 255, 255);
    p5.circle(0, 0, this.size);

    // Inner highlight
    p5.fill(255);
    p5.circle(0, 0, this.size * 0.5);

    p5.drawingContext.shadowBlur = 0;
    p5.pop();
  }
}
