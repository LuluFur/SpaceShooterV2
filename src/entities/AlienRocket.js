import { Alien } from './Alien.js';
import { getP5 } from '../game/p5Instance.js';
import { HomingRocket } from './HomingRocket.js';
import { playSound } from '../game/SoundManager.js';

export class AlienRocket extends Alien {
  constructor(x, y) {
    super(x, y);
    this.reset({ x, y });
  }

  reset(config) {
    super.reset(config);
    
    // Override base properties
    this.shootDelay = 2000;
    this.maxHealth = 20 * (1 + 0.5 * gameState.difficulty);
    this.health = this.maxHealth;
    this.damage = 50;
    this.maxSpeed = 1.5;
    this.preferredDistance = 300;
    this.size = 25;
    this.isDestroyed = false;

    return this;
  }

  shoot() {
    const p5 = getP5();
    if (!entities.player) return;

    const angleToPlayer = p5.atan2(
      entities.player.position.y - this.position.y,
      entities.player.position.x - this.position.x
    );

    const velocity = p5.createVector(
      p5.cos(angleToPlayer),
      p5.sin(angleToPlayer)
    ).mult(2); // Slower rocket speed

    const rocket = new HomingRocket(
      this.position.x + p5.cos(angleToPlayer) * 20,
      this.position.y + p5.sin(angleToPlayer) * 20,
      velocity,
      this
    );

    rocket.damage = this.damage;
    this.projectiles.push(rocket);
    this.lastShotTime = p5.millis();
    playSound('rocketLaunch');
  }

  draw() {
    const p5 = getP5();
    
    // Draw all active projectiles first
    for (let proj of this.projectiles) {
      proj.draw();
    }
    
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.rotate(p5.radians(this.direction) + p5.HALF_PI);
    
    // Custom shadow effect
    p5.drawingContext.shadowBlur = 20;
    p5.drawingContext.shadowColor = 'rgba(255, 0, 0, 0.5)';
    
    p5.stroke(255, 0, 0);
    p5.strokeWeight(2);
    p5.noFill();
    
    // Draw a larger, distinct shape for AlienRocket
    p5.triangle(0, -this.size, -this.size * 0.8, this.size, this.size * 0.8, this.size);
    
    // Reset shadow
    p5.drawingContext.shadowBlur = 0;
    p5.pop();
  }
}