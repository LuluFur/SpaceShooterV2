import { Projectile } from './Projectile.js';
import { getP5 } from '../game/p5Instance.js';

export class ProjectileQuad extends Projectile {
  constructor(x, y, velocity, owner) {
    super(x, y, velocity, owner);
    const p5 = getP5();
    // Override size and speed for the passive projectile.
    this.size = 8; // Custom size for a quadrilateral shape
    this.speed = 0.5; // Make it slow moving
    this.velocity.setMag(this.speed);
    
    // Optionally, this passive object might not deal damage (or minimal damage)
    this.damage = 0;
  }

  // Override the draw method to render a quadrilateral instead of a circle.
  draw() {
    const p5 = getP5();
    p5.push();
    p5.translate(this.position.x, this.position.y);
    // Rotate in the direction of travel
    p5.rotate(this.velocity.heading() + p5.frameCount * 0.01);
    
    // Draw a quadrilateral shape—here using quad() to draw a diamond-like shape.
    // Adjust vertices as needed to change the shape.
    p5.noStroke();
    p5.fill(200, 200, 50, 150); // A translucent yellowish fill
    
    const halfWidth = this.size;      // vertical extent
    const halfHeight = this.size * 0.6; // horizontal extent
    p5.quad(
      0, -halfWidth,     // Top point
      halfHeight, 0,     // Right point
      0, halfWidth,      // Bottom point
      -halfHeight, 0     // Left point
    );
    
    p5.pop();
  }
}