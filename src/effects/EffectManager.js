import { entities } from '../game/GameState.js';
import { ParticleEffect } from './ParticleEffect.js';
import { TextEffect } from './TextEffect.js';
import { ObjectPool } from '../utils/ObjectPool.js';
import { BulletImpactDebris } from './BulletImpactDebris.js';
import { ExplosionEffect } from './ExplosionEffect.js';
import { HealEffect } from './HealEffect.js';

class EffectPool {
  constructor() {
    this.impactPool = new ObjectPool(
      config => new BulletImpactDebris(config),
      1000
    );
    this.explosionPool = new ObjectPool(
      config => new ExplosionEffect(config),
      100
    );
    this.healPool = new ObjectPool(
      config => new HealEffect(config),
      50
    );
  }

  createBulletImpactDebris(config) {
    return this.impactPool.get(config);
  }

  createExplosionEffect(config) {
    return this.explosionPool.get(config);
  }

  createHealEffect(config) {
    return this.healPool.get(config);
  }

  update() {
    this.impactPool.update();
    this.explosionPool.update();
    this.healPool.update();
  }

  draw() {
    this.impactPool.draw();
    this.explosionPool.draw();
    this.healPool.draw();
  }

  clear() {
    this.impactPool.clear();
    this.explosionPool.clear();
    this.healPool.clear();
  }
}

export const effectPool = new EffectPool();

export function updateEffects() {
  effectPool.update();
  updateTextEffects();
}

function updateParticleEffects() {
  for (let i = entities.particleEffects.length - 1; i >= 0; i--) {
    entities.particleEffects[i].update();
    entities.particleEffects[i].draw();
    if (entities.particleEffects[i].isFinished()) {
      entities.particleEffects.splice(i, 1);
    }
  }
}

function updateTextEffects() {
  for (let i = entities.textEffects.length - 1; i >= 0; i--) {
    entities.textEffects[i].update();
    entities.textEffects[i].draw();
    if (entities.textEffects[i].isFinished()) {
      entities.textEffects.splice(i, 1);
    }
  }
}

export function createExplosionEffect(position) {
  entities.particleEffects.push(
    new ParticleEffect({
      x: position.x,
      y: position.y,
      numParticles: 25,
      sizeMin: 8,
      sizeMax: 2,
      color1: [255, 255, 255],
      color2: [50, 50, 50],
      alpha1: 255,
      alpha2: 50,
      lifetime: 1.2,
      speedMin: 1,
      speedMax: 3,
      angleMin: 0,
      angleMax: 360,
    })
  );
}

export function createHealEffect(position, amount) {
  // Create healing particles
  entities.particleEffects.push(
    new ParticleEffect({
      x: position.x,
      y: position.y,
      numParticles: 15,
      sizeMin: 4,
      sizeMax: 8,
      color1: [0, 255, 0],  // Green
      color2: [200, 255, 200],
      alpha1: 255,
      alpha2: 0,
      lifetime: 1,
      speedMin: 1,
      speedMax: 2,
      angleMin: 240,
      angleMax: 300,
    })
  );

  // Create healing text
  entities.textEffects.push(
    new TextEffect({
      x: position.x,
      y: position.y - 30,
      textMinSize: 16,
      textMaxSize: 24,
      textColor1: [0, 255, 0],
      textColor2: [200, 255, 200],
      alpha1: 255,
      alpha2: 0,
      lifetime: 1,
      angleMin: 270 - 5,
      angleMax: 270 + 5,
      text: `+${amount}`,
    })
  );
}

export function createBulletImpactDebris({ position, direction, spreadAngle = 120 }) {
  const halfSpread = spreadAngle / 2;
  const baseAngle = direction - 180; // Point particles in opposite direction of impact
  
  entities.particleEffects.push(
    new ParticleEffect({
      x: position.x,
      y: position.y,
      numParticles: 15,
      sizeMin: 3,
      sizeMax: 6,
      color1: [255, 50, 50], // Red
      color2: [255, 200, 0], // Orange
      alpha1: 255,
      alpha2: 50,
      lifetime: 0.75,
      speedMin: 1,
      speedMax: 3,
      angleMin: baseAngle - halfSpread,
      angleMax: baseAngle + halfSpread,
    })
  );
}

export function createHitTextEffect(p5Instance, position, text) {
  entities.textEffects.push(
    new TextEffect({
      x: position.x,
      y: position.y,
      textMinSize: 12,
      textMaxSize: 32,
      lifetime: 1,
      angleMin: 270 - 5,
      angleMax: 270 + 5,
      text: text,
    })
  );
}