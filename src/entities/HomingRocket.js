import { Projectile } from './Projectile.js';
import { getP5 } from '../game/p5Instance.js';
import { entities } from '../game/GameState.js';

export class HomingRocket extends Projectile {
  constructor(x, y, velocity, owner) {
    super(x, y, velocity, owner);
    this.homingStrength = 0.05; // How strongly the rocket homes in on the player
  }

  update() {
    const p5 = getP5();
    if (!entities.player) return;

    // Calculate angle to player
    const angleToPlayer = p5.atan2(
      entities.player.position.y - this.position.y,
      entities.player.position.x - this.position.x
    );

    // Adjust velocity to home in on player
    const desiredVelocity = p5.createVector(
      p5.cos(angleToPlayer),
      p5.sin(angleToPlayer)
    ).mult(this.velocity.mag());

    this.velocity.lerp(desiredVelocity, this.homingStrength);

    // Update position
    this.position.add(this.velocity);

    // Check for collision with player
    const distanceToPlayer = p5.dist(
      this.position.x, this.position.y,
      entities.player.position.x, entities.player.position.y
    );

    if (distanceToPlayer < this.size + entities.player.size) {
      entities.player.applyDamage(this.damage);
      this.isDestroyed = true;
    }
  }

  draw() {
    const p5 = getP5();
    
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.rotate(this.velocity.heading() + p5.HALF_PI);
    
    // Draw rocket shape
    p5.stroke(255, 0, 0);
    p5.strokeWeight(2);
    p5.noFill();
    p5.beginShape();
    p5.vertex(0, -this.size);
    p5.vertex(-this.size / 2, this.size);
    p5.vertex(this.size / 2, this.size);
    p5.endShape(p5.CLOSE);
    
    p5.pop();
  }
}
