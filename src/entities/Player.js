import { GameObject } from './GameObject.js';
import { getP5 } from '../game/p5Instance.js';
import { Projectile } from './Projectile.js';
import { ParticleEffect } from '../effects/ParticleEffect.js';
import { playSound } from '../game/SoundManager.js';
import { createHealEffect } from '../effects/EffectManager.js';
import { eventManager, EVENT_CONFIG } from '../game/Events.js';
import { projectilePool } from '../effects/ProjectilePool.js';

export class Player extends GameObject {
  constructor(x, y) {
    const p5 = getP5();
    super(x, y, 20, p5.createVector(0, 0), 0);
    
    // Combat properties
    this.shootDelay = 500;
    this.lastShotTime = 0;
    this.projectiles = [];
    this.iFrames = 0;
    
    // Bullet properties
    this.bulletCount = 1;
    this.bulletDamage = 5;
    this.bulletSize = 5;
    this.fireRate = 1;
    this.bulletSpeed = 1;
    this.bulletBounces = 0;
    this.piercing = 0;
    this.explosiveDamage = 0;
    
    // Defense properties
    this.shieldEnabled = false;
    this.shieldHits = 2;
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.speed = 2;
    this.damageReduction = 0;
    this.regeneration = 0;
    this.reflectiveDamage = 0;
    
    // XP System
    this.level = 1;
    this.xp = 0;
    this.xpToNextLevel = 10;
    this.xpMultiplier = 1;
    this.xpCollectionRange = 100;
    
    // Critical hit properties
    this.criticalChance = 0;
    this.criticalMultiplier = 1.5;
    
    // Clone properties
    this.cloneDuration = 0;
  }

  heal(amount) {
    const oldHealth = this.health;
    this.health = Math.min(this.health + amount, this.maxHealth);
    const healedAmount = this.health - oldHealth;
    
    if (healedAmount > 0) {
      createHealEffect(this.position, Math.ceil(healedAmount));
    }
  }

  addXP(amount) {
    const adjustedAmount = amount * this.xpMultiplier;
    this.xp += adjustedAmount;
    
    while (this.xp >= this.xpToNextLevel) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.xp -= this.xpToNextLevel;
    this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
    this.heal(this.maxHealth * 0.1); // Heal 10% of max health on level up

    // if level is 5, spawn a mini boss
    if (this.level % 5 === 0 && this.level < 20) {
      let miniboss_event = eventManager.createEventInstance("MINI_BOSS_SPAWN");
      eventManager.startEventImmediately(miniboss_event);
    }

    // if level is 20, spawn a boss
    else if (this.level === 20) {
      let boss_event = eventManager.createEventInstance("BOSS_SPAWN");
      eventManager.startEventImmediately(boss_event);
    }
  }

  setHealth(health) {
    this.health = Math.min(health, this.maxHealth);
  }

  applyDamage(damage, attacker = null) {
    if (this.iFrames > 0) return;
    
    const reducedDamage = this.calculateReducedDamage(damage);
    this.health -= reducedDamage;
    this.health = Math.max(this.health, 0);
    this.iFrames = 60;
    
    if (this.reflectiveDamage > 0 && attacker) {
      this.reflectDamage(reducedDamage, attacker);
    }
  }

  calculateReducedDamage(damage) {
    return damage * (1 - this.damageReduction);
  }

  reflectDamage(damage, attacker) {
    const reflectedDamage = damage * this.reflectiveDamage;
    if (attacker && typeof attacker.applyDamage === 'function') {
      attacker.applyDamage(reflectedDamage);
    }
  }

  getHealthPercentage() {
    return (this.health / this.maxHealth) * 100;
  }

  generateVertices() {
    const p5 = getP5();
    this.shieldSeed = Math.floor((p5.frameCount / 15) % 4) + 1;

    let vertices = [];
    let totalVertices = 8;
    let noiseStrength = 3;

    for (let i = 0; i < totalVertices; i++) {
      let angle = p5.TWO_PI / totalVertices * i;
      let radius = this.size + p5.noise(i * noiseStrength, this.shieldSeed) * this.size * 0.5;
      vertices.push(p5.createVector(p5.cos(angle) * radius, p5.sin(angle) * radius));
    }
    return vertices;
  }

  drawShieldEffect() {
    const p5 = getP5();
    p5.beginShape();
    for (let v of this.generateVertices()) {
      p5.vertex(v.x * (this.size / 15), v.y * (this.size / 15));
    }
    p5.endShape(p5.CLOSE);
  }

  move() {
    const p5 = getP5();
    let mouseVector = p5.createVector(p5.mouseX, p5.mouseY);
    let directionToMouse = mouseVector.sub(this.position).heading();
    this.direction = p5.degrees(directionToMouse);

    if (p5.mouseIsPressed && p5.mouseButton === p5.RIGHT) {
      let force = p5.createVector(p5.cos(directionToMouse), p5.sin(directionToMouse)).mult(0.1);
      this.velocity.add(force);
      
      new ParticleEffect({
        x: this.position.x - p5.cos(directionToMouse) * 15,
        y: this.position.y - p5.sin(directionToMouse) * 15,
        numParticles: 3,
        sizeMin: 6,
        sizeMax: 4,
        color1: [255, 50, 50],
        color2: [255, 200, 0],
        alpha1: 255,
        alpha2: 50,
        lifetime: 0.25,
        speedMin: 3,
        speedMax: 1,
        angleMin: p5.degrees(directionToMouse) + 180 - 35,
        angleMax: p5.degrees(directionToMouse) + 180 + 35,
      });
    } else {
      this.velocity.mult(0.98);
    }

    this.velocity.limit(3);
    this.position.add(this.velocity);
  }

  update() {
    const p5 = getP5();
    if (p5.mouseIsPressed && p5.mouseButton === p5.LEFT) {
      this.shoot();
    }
    
    this.move();
    
    if (this.iFrames > 0) this.iFrames--;

    for (let proj of this.projectiles) {
      proj.update();
    }
    
    if (this.regeneration > 0 && p5.frameCount % 60 === 0) {
      this.heal(this.regeneration);
    }
  }

  shoot() {
    const p5 = getP5();
    if (p5.millis() - this.lastShotTime < this.shootDelay) return;

    const projectile = projectilePool.createProjectile('normal', {
      x: this.position.x,
      y: this.position.y,
      velocity: this.getShootDirection(),
      owner: this
    });

    if (projectile) {
      this.projectiles.push(projectile);
      this.lastShotTime = p5.millis();
      playSound('shootSound');
    }
  }

  draw() {
    const p5 = getP5();
    
    for (let proj of this.projectiles) {
      proj.draw();
    }
    
    p5.push();
    p5.translate(this.position.x, this.position.y);
    
    // Flash effect during iFrames
    if (this.iFrames > 0) {
      // Flash every 4 frames
      if (Math.floor(this.iFrames / 4) % 2 === 0) {
        p5.stroke(255, 0, 0); // Red flash
      } else {
        p5.stroke(255); // Normal color
      }
    } else {
      p5.stroke(255); // Normal color
    }
    
    p5.noFill();
    p5.strokeWeight(2);
    
    if (this.shieldEnabled) {
      p5.stroke(0, 100, 255);
      this.drawShieldEffect();
      if (this.iFrames > 0) {
        p5.stroke(255, 0, 0);
      } else {
        p5.stroke(255);
      }
    }
    
    p5.rotate(p5.radians(this.direction) + p5.HALF_PI);

    p5.drawingContext.shadowBlur = 20;
    p5.drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
    p5.drawingContext.shadowOffsetX = 0;
    p5.drawingContext.shadowOffsetY = 0;

    p5.triangle(0, -this.size, -this.size / 2, this.size, this.size / 2, this.size);
    
    p5.drawingContext.shadowBlur = 0;
    p5.pop();
  }
}