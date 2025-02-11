import { GameObject } from './GameObject.js';
import { getP5 } from '../game/p5Instance.js';
import { entities } from '../game/GameState.js';
import { createBulletImpactDebris, createExplosionEffect } from '../effects/EffectManager.js';
import { BounceEffect } from '../effects/BounceEffect.js';

export class Projectile extends GameObject {
  constructor(x, y, velocity, player) {
    const p5 = getP5();
    super(x, y, 5, velocity, 0);
    this.damage = 5;
    this.isDestroyed = false;
    this.speed = 1;
    this.velocity.mult(this.speed);
    this.player = player;
    
    // Bouncing properties
    this.bouncesRemaining = player?.bulletBounces || 0;
    this.bounceRange = 150 + (this.bouncesRemaining * 50); // Base 150px + 50px per level
    this.hitTargets = new Set(); // Track hit targets to prevent infinite bounces
    
    // Piercing properties
    this.piercing = player?.piercing || 0;
    this.piercedTargets = new Set(); // Track pierced targets
    
    // Explosive properties
    this.explosiveDamage = player?.explosiveDamage || 0;
    
    // Bounce damage multiplier
    this.bounceDamageMultiplier = player?.bounceDamageMultiplier || 1;
    
    // Bounce effects
    this.bounceEffects = [];
  }

  calculateBounceNormal(asteroid) {
    const p5 = getP5();
    // Get the vector from asteroid center to projectile
    const normal = p5.createVector(
      this.position.x - asteroid.position.x,
      this.position.y - asteroid.position.y
    ).normalize();
    
    return normal;
  }

  bounce(normal) {
    const p5 = getP5();
    // r = d - 2(d·n)n where d is incident vector, n is normal vector
    const dot = this.velocity.dot(normal);
    const reflection = p5.createVector(
      this.velocity.x - 2 * dot * normal.x,
      this.velocity.y - 2 * dot * normal.y
    );
    
    // Maintain original speed
    reflection.setMag(this.velocity.mag());
    this.velocity = reflection;
    
    // Increase damage and size with each bounce
    this.damage *= this.bounceDamageMultiplier;
    this.size *= 1.2;
    
    // Trigger bounce effect
    this.triggerBounceEffect();
  }

  triggerBounceEffect() {
    const p5 = getP5();
    const effect = new BounceEffect({
      position: this.position,
      shapeFunc: (size) => {
        p5.circle(0, 0, size);
      },
      size: this.size,
      thickness: this.size,
      life: 15,
      sizeIncrease: 5,
      alpha: 128,
      alphaDecrease: 8.5
    });
    this.bounceEffects.push(effect);
  }

  updateBounceEffects() {
    this.bounceEffects = this.bounceEffects.filter(effect => effect.isAlive());
    this.bounceEffects.forEach(effect => effect.update());
  }

  drawBounceEffects() {
    this.bounceEffects.forEach(effect => effect.draw());
  }

  update() {
    const p5 = getP5();
    if (this.isDestroyed) {
      this.Destroy();
      return;
    }

    // Check for collisions with screen edges and bounce
    if (this.bouncesRemaining > 0) {
      let bounced = false;
      
      // Bounce off left or right edges
      if (this.position.x <= 0 || this.position.x >= p5.width) {
        this.velocity.x *= -1; // Reverse x velocity
        bounced = true;
      }
      
      // Bounce off top or bottom edges
      if (this.position.y <= 0 || this.position.y >= p5.height) {
        this.velocity.y *= -1; // Reverse y velocity
        bounced = true;
      }

      if (bounced) {
        this.bouncesRemaining--;
        
        // Create impact effect at bounce position
        createBulletImpactDebris({
          position: this.position,
          direction: p5.degrees(this.velocity.heading()),
          spreadAngle: 30
        });
        
        // Increase damage with each bounce
        this.damage *= this.bounceDamageMultiplier;
        this.size *= 1.2;
        
        // Trigger bounce effect
        this.triggerBounceEffect();
      }
    }

    // Check for collisions with asteroids
    for (const asteroid of entities.asteroids) {
      if (this.hitTargets.has(asteroid)) continue;

      const distance = p5.dist(
        this.position.x, this.position.y,
        asteroid.position.x, asteroid.position.y
      );

      if (distance < asteroid.radius + this.size) {
        // Deal damage to the asteroid
        if (asteroid.health > 0) {
          asteroid.health -= this.damage;
          asteroid.triggerDamageEffect();
          this.hitTargets.add(asteroid);
          
          // Create impact effect
          createBulletImpactDebris({
            position: this.position,
            direction: p5.degrees(this.velocity.heading()),
            spreadAngle: 30
          });

          if (this.explosiveDamage > 0) {
            // Deal explosive damage to nearby asteroids
            for (const otherAsteroid of entities.asteroids) {
              if (otherAsteroid !== asteroid) {
                const otherDistance = p5.dist(
                  this.position.x, this.position.y,
                  otherAsteroid.position.x, otherAsteroid.position.y
                );
                const EXPLOSION_SIZE = this.size * 10;

                if (otherDistance < EXPLOSION_SIZE) {
                  otherAsteroid.health -= this.explosiveDamage;
                  otherAsteroid.triggerDamageEffect();

                  // Create explosion effect
                  createExplosionEffect({
                    position: this.position,
                    size: EXPLOSION_SIZE
                  });
                }
              }
            }
          }

          if (this.piercing > 0) {
            this.piercing--;
          } else {
            this.isDestroyed = true;
            break;
          }
        }
      }
    }

    this.position.add(this.velocity);

    // Only destroy if out of bounds and no bounces remaining
    if (this.bouncesRemaining <= 0 && (
        this.position.x < 0 || this.position.x > p5.width ||
        this.position.y < 0 || this.position.y > p5.height)) {
      this.isDestroyed = true;
    }
    
    // Update bounce effects
    this.updateBounceEffects();
  }

  draw() {
    const p5 = getP5();
    p5.push();
    p5.translate(this.position.x, this.position.y);

    // Enhanced glow effect for bouncing bullets
    if (this.bouncesRemaining > 0) {
      p5.drawingContext.shadowBlur = 20;
      p5.drawingContext.shadowColor = 'rgba(0, 255, 255, 1)';
    } else {
      p5.drawingContext.shadowBlur = 20;
      p5.drawingContext.shadowColor = 'rgba(255, 0, 0, 1)';
    }

    p5.noStroke();
    p5.fill(255, 255, 255);
    p5.circle(0, 0, this.size);

    p5.drawingContext.shadowBlur = 0;
    p5.pop();
    
    // Draw bounce effects
    this.drawBounceEffects();
  }

  Destroy() {
    if (this.player) {
      const index = this.player.projectiles.indexOf(this);
      if (index !== -1) {
        this.player.projectiles.splice(index, 1);
      }
    }
  }
}