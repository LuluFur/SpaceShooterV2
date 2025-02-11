import { GameObject } from './GameObject.js';
import { getP5 } from '../game/p5Instance.js';
import { Projectile } from './Projectile.js';
import { entities, gameState } from '../game/GameState.js';
import { playSound } from '../game/SoundManager.js';

export class Alien extends GameObject {
  constructor(x, y) {
    const p5 = getP5();
    super(x, y, 20, p5.createVector(0, 0), 0);
    this.reset({ x, y });
  }

  reset(config) {
    const p5 = getP5();
    this.position.x = config.x;
    this.position.y = config.y;
    
    // Combat properties
    this.shootDelay = 1000;
    this.lastShotTime = 0;
    this.projectiles = [];
    this.maxHealth = 25 * (1 + (0.5 * gameState.difficulty));
    this.health = this.maxHealth;
    this.damage = 10;
    
    // Movement properties
    this.maxSpeed = 2;
    this.preferredDistance = 200;
    this.fleeDistance = 100;
    this.intelligenceLevel = p5.random(0.5, 1);
    
    // Behavior state
    this.state = 'approach';
    this.lastStateChange = 0;
    this.stateChangeCooldown = 1000;
    this.isDestroyed = false;

    return this;
  }

  update() {
    const p5 = getP5();
    if (!entities.player) return;

    // Update projectiles
    for (let proj of this.projectiles) {
      proj.update();
    }

    // Calculate distance to player
    const distanceToPlayer = p5.dist(
      this.position.x, this.position.y,
      entities.player.position.x, entities.player.position.y
    );

    // Update state based on distance
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

    // Movement behavior based on state
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
        // Orbit around player
        const orbitAngle = angleToPlayer + p5.HALF_PI;
        targetVelocity = p5.createVector(p5.cos(orbitAngle), p5.sin(orbitAngle));
        break;
    }

    // Apply intelligence level to movement
    targetVelocity.mult(this.maxSpeed * this.intelligenceLevel);
    this.velocity.lerp(targetVelocity, 0.1);

    // Update position
    this.position.add(this.velocity);

    // Update direction to face player
    this.direction = p5.degrees(angleToPlayer);

    // Attempt to shoot based on intelligence level
    if (p5.millis() - this.lastShotTime > this.shootDelay / this.intelligenceLevel) {
      this.shoot();
    }

    // Screen wrapping
    if (this.position.x > p5.width + this.size) this.position.x = -this.size;
    else if (this.position.x < -this.size) this.position.x = p5.width + this.size;
    if (this.position.y > p5.height + this.size) this.position.y = -this.size;
    else if (this.position.y < -this.size) this.position.y = p5.height + this.size;
  }

  shoot() {
    const p5 = getP5();
    if (!entities.player) return;

    const angleToPlayer = p5.atan2(
      entities.player.position.y - this.position.y,
      entities.player.position.x - this.position.x
    );

    // Add some inaccuracy based on inverse of intelligence level
    const inaccuracy = (1 - this.intelligenceLevel) * 0.5;
    const finalAngle = angleToPlayer + p5.random(-inaccuracy, inaccuracy);

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
    this.lastShotTime = p5.millis();
    playSound('shootSound');
  }

  draw() {
    const p5 = getP5();
    
    // Draw projectiles
    for (let proj of this.projectiles) {
      proj.draw();
    }
    
    p5.push();
    p5.translate(this.position.x, this.position.y);
    p5.rotate(p5.radians(this.direction) + p5.HALF_PI);

    // Shadow effect
    p5.drawingContext.shadowBlur = 20;
    p5.drawingContext.shadowColor = 'rgba(0, 255, 0, 0.5)';
    p5.drawingContext.shadowOffsetX = 0;
    p5.drawingContext.shadowOffsetY = 0;

    // Draw alien ship
    p5.stroke(0, 255, 0);
    p5.strokeWeight(2);
    p5.noFill();
    p5.triangle(0, -this.size, -this.size / 2, this.size, this.size / 2, this.size);

    p5.drawingContext.shadowBlur = 0;
    p5.pop();
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      // Heal player when destroying alien
      if (entities.player) {
        entities.player.heal(20);
      }
      return true;
    }
    return false;
  }
}