import { Alien } from './Alien.js';
import { getP5 } from '../game/p5Instance.js';
import { Projectile } from './Projectile.js';
import { entities, gameState } from '../game/GameState.js';
import { playSound } from '../game/SoundManager.js';

export class AlienRapidFire extends Alien {
  constructor(x, y) {
    super(x, y);
    this.reset({ x, y });
  }

  reset(config) {
    super.reset(config);
    
    const p5 = getP5();
    this.shootDelay = 500;
    this.maxHealth = 15 * (1 + 0.5 * gameState.difficulty);
    this.health = this.maxHealth;
    this.damage = 5;
    this.maxSpeed = 3;
    this.intelligenceLevel = p5.random(0.7, 1);
    this.projectiles = [];
    this.isDestroyed = false;

    return this;
  }

  // Override shoot to fire three projectiles in a spread
  shoot() {
    const p5 = getP5();
    if (!entities.player) return;

    const angleToPlayer = p5.atan2(
      entities.player.position.y - this.position.y,
      entities.player.position.x - this.position.x
    );

    // Inaccuracy factor is slightly reduced for this variant
    const inaccuracy = (1 - this.intelligenceLevel) * 0.3;

    // Fire three projectiles: one aimed directly, one with a slight left offset, and one with a slight right offset
    const offsets = [-inaccuracy, 0, inaccuracy];
    for (let offset of offsets) {
      const finalAngle = angleToPlayer + offset;
      const velocity = p5.createVector(
        p5.cos(finalAngle),
        p5.sin(finalAngle)
      ).mult(4);
      
      const projectile = new Projectile(
        this.position.x + p5.cos(finalAngle) * 20,
        this.position.y + p5.sin(finalAngle) * 20,
        velocity,
        this
      );
      projectile.damage = this.damage;
      this.projectiles.push(projectile);
    }
    
    this.lastShotTime = p5.millis();
    playSound('shootSound');
  }

  // Override draw to give a unique visual appearance (red vs. green)
  draw() {
    const p5 = getP5();
    
    // Draw all active projectiles first
    for (let proj of this.projectiles) {
      proj.draw();
    }
    
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.rotate(p5.radians(this.direction) + p5.HALF_PI);
    
    // Custom red shadow effect
    p5.drawingContext.shadowBlur = 20;
    p5.drawingContext.shadowColor = 'rgba(255, 0, 0, 0.5)';
    
    p5.stroke(255, 0, 0);
    p5.strokeWeight(2);
    p5.noFill();
    
    // Draw a triangle that represents the RapidfireAlien
    // Slightly different shape vs. the original alien for visual distinction
    p5.triangle(0, -this.size, -this.size * 0.8, this.size, this.size * 0.8, this.size);
    
    // Reset shadow
    p5.drawingContext.shadowBlur = 0;
    p5.pop();
  }
}