import { Alien } from './Alien.js';
import { getP5 } from '../game/p5Instance.js';
import { gameState } from '../game/GameState.js';

export class AlienPassive extends Alien {
  constructor(x, y) {
    super(x, y);
    this.reset({ x, y });
  }

  reset(config) {
    super.reset(config);
    
    const p5 = getP5();
    
    // Override base properties
    this.shootDelay = Infinity;
    this.passiveDelay = 3000;
    this.lastPassiveTime = 0;
    this.maxHealth = 40 * (1 + (0.5 * gameState.difficulty));
    this.health = this.maxHealth;
    this.damage = 0;
    this.maxSpeed = 1.5;
    this.intelligenceLevel = p5.random(0.5, 0.8);
    this.passiveProjectiles = [];
    this.isDestroyed = false;

    return this;
  }
  
  update() {
    const p5 = getP5();
    if (!entities.player) return;
    
    // Update passive objects before moving.
    for (let obj of this.passiveProjectiles) {
      obj.update();
    }
    
    // Movement behavior (similar to the base Alien)
    const distanceToPlayer = p5.dist(
      this.position.x, this.position.y,
      entities.player.position.x, entities.player.position.y
    );
    
    if (p5.millis() - this.lastStateChange > this.stateChangeCooldown) {
      if (distanceToPlayer < this.fleeDistance) {
        this.state = 'flee';
      } else if (distanceToPlayer > this.preferredDistance * 1.2) {
        this.state = 'approach';
      } else {
        this.state = 'maintain';
      }
      this.lastStateChange = p5.millis();
    }
    
    const angleToPlayer = p5.atan2(
      entities.player.position.y - this.position.y,
      entities.player.position.x - this.position.x
    );
    
    let targetVelocity = p5.createVector(0, 0);
    switch (this.state) {
      case 'approach':
        targetVelocity = p5.createVector(p5.cos(angleToPlayer), p5.sin(angleToPlayer));
        break;
      case 'flee':
        targetVelocity = p5.createVector(-p5.cos(angleToPlayer), -p5.sin(angleToPlayer));
        break;
      case 'maintain':
        const orbitAngle = angleToPlayer + p5.HALF_PI;
        targetVelocity = p5.createVector(p5.cos(orbitAngle), p5.sin(orbitAngle));
        break;
    }
    targetVelocity.mult(this.maxSpeed * this.intelligenceLevel);
    this.velocity.lerp(targetVelocity, 0.1);
    this.position.add(this.velocity);
    
    // Ensure the alien faces the player.
    this.direction = p5.degrees(angleToPlayer);
    
    // Passive ability: release a quad projectile if enough time has passed.
    if (p5.millis() - this.lastPassiveTime > this.passiveDelay) {
      this.releasePassive();
      this.lastPassiveTime = p5.millis();
    }
    
    // Screen wrapping for the alien.
    if (this.position.x > p5.width + this.size) this.position.x = -this.size;
    else if (this.position.x < -this.size) this.position.x = p5.width + this.size;
    if (this.position.y > p5.height + this.size) this.position.y = -this.size;
    else if (this.position.y < -this.size) this.position.y = p5.height + this.size;
  }
  
  releasePassive() {
    const p5 = getP5();
    // Release a QuadProjectile that moves slowly in the alien's current movement direction.
    const angle = this.velocity.heading();
    const slowVelocity = p5.createVector(p5.cos(angle), p5.sin(angle)).mult(0.5);
    
    const quadProjectile = new ProjectileQuad(this.position.x, this.position.y, slowVelocity, this);
    this.passiveProjectiles.push(quadProjectile);
    
    // Play a sound effect for the passive ability (make sure the sound key exists)
    playSound('passiveReleaseSound');
  }
  
  draw() {
    const p5 = getP5();
    // Draw the passive projectiles first.
    for (let obj of this.passiveProjectiles) {
      obj.draw();
    }
    
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.rotate(p5.radians(this.direction) + p5.HALF_PI);
    
    // Draw a distinct shape for PassiveAlien (a square in this case)
    p5.drawingContext.shadowBlur = 20;
    p5.drawingContext.shadowColor = 'rgba(100, 100, 255, 0.5)';
    p5.stroke(100, 100, 255);
    p5.strokeWeight(2);
    p5.noFill();
    
    p5.rectMode(p5.CENTER);
    p5.rect(0, 0, this.size * 2, this.size * 2);
    
    p5.drawingContext.shadowBlur = 0;
    p5.pop();
  }
}