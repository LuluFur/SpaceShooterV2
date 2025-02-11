import { Alien } from './Alien.js';
import { getP5 } from '../game/p5Instance.js';
import { entities, gameState } from '../game/GameState.js';
import { playSound } from '../game/SoundManager.js';
import { createExplosionEffect } from '../effects/EffectManager.js';

export class AlienKamikaze extends Alien {
  constructor(x, y) {
    super(x, y);
    this.reset({ x, y });
  }

  reset(config) {
    super.reset(config);
    
    // Override base properties
    this.size = 15;
    this.maxHealth = 15 * (1 + (0.5 * gameState.difficulty));
    this.health = this.maxHealth;
    this.damage = 30;
    this.maxSpeed = 1;
    this.chargeSpeed = 5;
    this.preferredDistance = 250;
    this.fleeDistance = 200;
    
    // Kamikaze specific properties
    this.isCharging = false;
    this.chargeTimer = 0;
    this.chargeDuration = 1000;
    this.chargeWindup = 500;
    this.isWindingUp = false;
    this.glowIntensity = 0;
    this.glowDirection = 1;
    this.lastExplosionTime = 0;
    this.explosionCooldown = 1000;
    this.isDestroyed = false;

    return this;
  }

  update() {
    const p5 = getP5();
    if (!entities.player) return;

    // Calculate distance to player
    const distanceToPlayer = p5.dist(
      this.position.x, this.position.y,
      entities.player.position.x, entities.player.position.y
    );

    // Update glow effect
    this.glowIntensity += 0.1 * this.glowDirection;
    if (this.glowIntensity >= 1) this.glowDirection = -1;
    if (this.glowIntensity <= 0) this.glowDirection = 1;

    // Charge logic
    if (!this.isCharging && !this.isWindingUp && p5.millis() - this.chargeTimer > this.chargeDuration) {
      this.isWindingUp = true;
      this.chargeTimer = p5.millis();
    }

    // Start charge after windup
    if (this.isWindingUp && p5.millis() - this.chargeTimer > this.chargeWindup) {
      this.isWindingUp = false;
      this.isCharging = true;
      this.chargeTimer = p5.millis();
    }

    // Calculate angle to player
    const angleToPlayer = p5.atan2(
      entities.player.position.y - this.position.y,
      entities.player.position.x - this.position.x
    );

    // Movement behavior
    if (this.isCharging) {
      // Charge straight at player
      this.velocity = p5.createVector(
        p5.cos(angleToPlayer),
        p5.sin(angleToPlayer)
      ).mult(this.chargeSpeed);

      // Check for collision with player during charge
      if (distanceToPlayer < this.size + entities.player.size) {
        entities.player.applyDamage(this.damage);
        
        // Debounce explosion effect
        if (p5.millis() - this.lastExplosionTime > this.explosionCooldown) {
          createExplosionEffect(this.position);
          playSound('explosionBass');
          this.lastExplosionTime = p5.millis();
        }
        
        this.health = 0; // Destroy self on impact
      }

      // End charge after a while
      if (p5.millis() - this.chargeTimer > 1000) {
        this.isCharging = false;
        this.chargeTimer = p5.millis();
      }
    } else if (!this.isWindingUp) {
      // Circle around player at preferred distance when not charging
      const orbitAngle = angleToPlayer + p5.HALF_PI;
      const targetVelocity = p5.createVector(
        p5.cos(orbitAngle),
        p5.sin(orbitAngle)
      ).mult(this.maxSpeed);

      this.velocity.lerp(targetVelocity, 0.1);
    }

    // Update position and direction
    this.position.add(this.velocity);
    this.direction = p5.degrees(angleToPlayer);

    // Screen wrapping
    if (this.position.x > p5.width + this.size) this.position.x = -this.size;
    else if (this.position.x < -this.size) this.position.x = p5.width + this.size;
    if (this.position.y > p5.height + this.size) this.position.y = -this.size;
    else if (this.position.y < -this.size) this.position.y = p5.height + this.size;

    // Kill alien if touching player
    if (distanceToPlayer < this.size + entities.player.size) {
      this.health = 0;
    }
  }

  draw() {
    const p5 = getP5();
    
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.rotate(p5.radians(this.direction) + p5.HALF_PI);

    // Enhanced glow effect based on state
    let glowColor = this.isWindingUp ? 
      'rgba(255, 0, 0, 0.5)' : 
      this.isCharging ? 
        'rgba(255, 0, 0, 0.8)' : 
        'rgba(255, 150, 0, 0.3)';
    
    p5.drawingContext.shadowBlur = 20 + (this.glowIntensity * 10);
    p5.drawingContext.shadowColor = glowColor;

    // Draw alien ship
    p5.stroke(this.isCharging ? 255 : 200, 
             this.isCharging ? 0 : 100, 
             0);
    p5.strokeWeight(2);
    p5.noFill();

    // Sharp, aggressive shape
    p5.beginShape();
    p5.vertex(0, -this.size);
    p5.vertex(-this.size/2, this.size/2);
    p5.vertex(0, this.size/4);
    p5.vertex(this.size/2, this.size/2);
    p5.endShape(p5.CLOSE);

    // Additional details
    if (this.isWindingUp) {
      // Pulsing warning indicator
      p5.stroke(255, 0, 0, this.glowIntensity * 255);
      p5.circle(0, 0, this.size * 2);
    }

    p5.drawingContext.shadowBlur = 0;
    p5.pop();
  }

  // Override shoot method to prevent shooting
  shoot() {}
}