import { GameObject } from './GameObject.js';
import { getP5 } from '../game/p5Instance.js';
import { createBulletImpactDebris } from '../effects/EffectManager.js';
import { playSound } from '../game/SoundManager.js';
import { openDeathMenu } from '../game/DeathMenu.js';
import { BounceEffect } from '../effects/BounceEffect.js';
import { entities } from '../game/GameState.js';

export class Asteroid extends GameObject {
  constructor(x, y, size, seed, isGold = false, health = 20) {
    const p5 = getP5();
    super(x, y, size, p5.createVector(0, 0), p5.random(0, 360));
    this.reset({ x, y, size, seed, isGold, health });
  }

  reset(config) {
    const p5 = getP5();
    this.position.x = config.x;
    this.position.y = config.y;
    this.size = config.size;
    this.seed = config.seed;
    this.isGold = config.isGold;
    this.color = "white";
    this.vertices = this.generateVertices();
    this.radius = this.calculateRadius();
    this.maxHealth = config.health;
    this.health = this.maxHealth;
    this.damageEffects = [];
    this.isDestroyed = false;
    this.damage = 10;
    this.speed = 50;
    this.maxSize = this.size;
    
    // Speed control properties
    this.maxSpeed = 5;
    this.dampening = 0.95;

    // Calculate direction to center with some randomness
    const centerX = p5.width / 2;
    const centerY = p5.height / 2;
    const angleToCenter = p5.atan2(centerY - config.y, centerX - config.x);
    const randomAngleOffset = p5.random(-0.35, 0.35);
    const finalAngle = angleToCenter + randomAngleOffset;
    
    // Set velocity using the calculated angle
    this.velocity.x = p5.cos(finalAngle);
    this.velocity.y = p5.sin(finalAngle);
    this.velocity.mult((1/this.size) * this.speed * (1 + p5.min(p5.max(0.2, 0.1 * p5.sqrt(this.size)), 2)));

    return this;
  }

  generateVertices() {
    const p5 = getP5();
    p5.noiseSeed(this.seed);
    let vertices = [];
    let totalVertices = p5.int(p5.random(8, 16));
    let noiseStrength = 3;

    for (let i = 0; i < totalVertices; i++) {
      let angle = p5.TWO_PI / totalVertices * i;
      let radius = this.size + p5.noise(i * noiseStrength, this.seed) * this.size * 0.5;
      vertices.push(p5.createVector(p5.cos(angle) * radius, p5.sin(angle) * radius));
    }
    return vertices;
  }

  calculateRadius() {
    let maxDistance = 0;
    for (let v of this.vertices) {
      let distance = v.mag();
      if (distance > maxDistance) maxDistance = distance;
    }
    return maxDistance * (this.size / 60);
  }

  checkPlayerCollision(player) {
    const p5 = getP5();
    if (!player) return false;
    
    let distance = p5.dist(this.position.x, this.position.y, player.position.x, player.position.y);
    
    if (distance < this.radius + player.size) {
      // Apply damage to player
      player.applyDamage(this.damage);
      
      // Calculate repulsion direction (away from player)
      const repulsionAngle = p5.atan2(
        this.position.y - player.position.y,
        this.position.x - player.position.x
      );
      
      // Create repulsion vector
      const repulsionForce = p5.createVector(
        p5.cos(repulsionAngle),
        p5.sin(repulsionAngle)
      ).mult(2); // Adjust multiplier to control repulsion strength
      
      // Apply repulsion to asteroid
      this.velocity.add(repulsionForce);
      
      // Damage the asteroid
      this.health -= this.health * 0.3;
      
      // Check if asteroid should be destroyed
      if (this.health <= 0) {
        this.isDestroyed = true;
        // Heal player when destroying asteroid
        player.heal(10);
        return true;
      }
    }
    return false;
  }

  triggerDamageEffect() {
    const p5 = getP5();
    const effect = new BounceEffect({
      position: this.position,
      shapeFunc: (size) => {
        p5.beginShape();
        for (let v of this.vertices) {
          let scaledVertex = v.copy().mult(size / 60);
          p5.vertex(scaledVertex.x, scaledVertex.y);
        }
        p5.endShape(p5.CLOSE);
      },
      size: this.size,
      thickness: Math.max(2, entities.player.bulletDamage * 0.5),
      life: 15,
      sizeIncrease: 3,
      alpha: 128,
      alphaDecrease: 8.5
    });
    this.damageEffects.push(effect);
  }

  updateDamageEffects() {
    this.damageEffects = this.damageEffects.filter(effect => effect.isAlive());
    this.damageEffects.forEach(effect => effect.update());
  }

  drawDamageEffects() {
    this.damageEffects.forEach(effect => effect.draw());
  }

  draw() {
    const p5 = getP5();
    this.updateDamageEffects();
    this.drawDamageEffects();
    
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.rotate(p5.radians(this.direction));

    p5.drawingContext.shadowBlur = 20;
    p5.drawingContext.shadowColor = `rgba(150, 150, 150, 0.8)`;

    p5.noFill();
    if (this.isGold) {
      p5.stroke(150, 125, 0);
    } else {
      p5.stroke(this.color);
    }
    p5.strokeWeight(2);
    p5.beginShape();
    for (let v of this.vertices) {
      p5.vertex(v.x * (this.size / 60), v.y * (this.size / 60));
    }
    p5.endShape(p5.CLOSE);

    p5.drawingContext.shadowBlur = 0;
    p5.pop();
  }

  update() {
    const p5 = getP5();
    if (this.isDestroyed) {
      return;
    }

    // Apply speed dampening if exceeding max speed
    const currentSpeed = this.velocity.mag();
    if (currentSpeed > this.maxSpeed) {
      this.velocity.mult(this.dampening);
    }

    this.position.add(this.velocity);

    if (this.position.x > p5.width + this.radius) this.position.x = -this.radius;
    else if (this.position.x < -this.radius) this.position.x = p5.width + this.radius;
    if (this.position.y > p5.height + this.radius) this.position.y = -this.radius;
    else if (this.position.y < -this.radius) this.position.y = p5.height + this.radius;

    let offset = this.radius;
    if (this.position.x < -this.radius - offset ||
        this.position.x > p5.width + this.radius + offset ||
        this.position.y < -this.radius - offset ||
        this.position.y > p5.height + this.radius + offset) {
      this.isDestroyed = true;
    }
  }

  checkProjectileCollision(projectile) {
    const p5 = getP5();
    let distance = p5.dist(this.position.x, this.position.y, projectile.position.x, projectile.position.y);

    if (distance < this.radius + projectile.size) {
      this.health -= projectile.damage;
      
      const impactForce = p5.createVector(
        this.position.x - projectile.position.x,
        this.position.y - projectile.position.y
      ).normalize().mult(1 / this.size * 20);
      
      this.velocity.add(impactForce);
      this.triggerDamageEffect();
      
      this.size = p5.map(this.health, this.maxHealth, 0, this.maxSize, 20);
      this.radius = this.calculateRadius();
      
      // Calculate relative velocity for impact direction
      const relativeVelocity = p5.createVector(
        projectile.velocity.x - this.velocity.x,
        projectile.velocity.y - this.velocity.y
      );
      const impactDirection = p5.degrees(relativeVelocity.heading());
      
      createBulletImpactDebris({
        position: projectile.position,
        direction: impactDirection,
        spreadAngle: 120
      });
      
      playSound('explodeSound1');
      
      projectile.isDestroyed = true;

      if (this.health <= 0) {
        this.isDestroyed = true;
      }
      return this.health <= 0;
    }
    return false;
  }

  applyRepulsion(other) {
    const p5 = getP5();
    let distance = p5.dist(this.position.x, this.position.y, other.position.x, other.position.y);
    let overlap = this.radius + other.radius - distance;

    if (overlap > 0) {
      const repulsion = p5.createVector(
        this.position.x - other.position.x,
        this.position.y - other.position.y
      ).normalize();
      
      let repulsionStrength = p5.min(overlap * 0.1, 1);
      repulsion.mult(repulsionStrength);

      this.velocity.add(repulsion);
      other.velocity.sub(repulsion);

      this.velocity.mult(0.9);
      other.velocity.mult(0.9);
    }
  }
}