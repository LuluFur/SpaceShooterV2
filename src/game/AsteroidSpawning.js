import { gameState, entities } from './GameState.js';
import { ObjectPool } from '../utils/ObjectPool.js';
import { Asteroid } from '../entities/Asteroid.js';
import { getP5 } from './p5Instance.js';

export const asteroidPool = new ObjectPool(
  config => new Asteroid(
    config.x, 
    config.y, 
    config.size, 
    config.seed, 
    config.isGold, 
    config.health
  ),
  200 // Maximum number of asteroids
);

export function updateAsteroidSpawning(p5Instance) {
  // Remove destroyed asteroids from entities and return them to pool
  for (let i = entities.asteroids.length - 1; i >= 0; i--) {
    if (entities.asteroids[i].isDestroyed) {
      asteroidPool.release(entities.asteroids[i]);
      entities.asteroids.splice(i, 1);
    }
  }

  if (entities.asteroids.length >= gameState.asteroidCap) return;

  let noiseOffset = p5Instance.noise(gameState.asteroidSpawnNoiseOffset) * 2 - 1;
  gameState.asteroidSpawnNoiseOffset += 0.01;
  let randomDelay = gameState.spawnDelay + noiseOffset * 1000;

  if (p5Instance.millis() > gameState.nextSpawnTime) {
    spawnAsteroids(1);
    gameState.nextSpawnTime = p5Instance.millis() + randomDelay;
  }
}

export function spawnAsteroids(count, isGold = false) {
  const p5 = getP5();
  for (let i = 0; i < count; i++) {
    // ...existing spawn position logic...
    const spawnSide = Math.floor(p5.random(4));
    let x, y;

    switch (spawnSide) {
      case 0: x = p5.random(p5.width); y = -50; break;
      case 1: x = p5.width + 50; y = p5.random(p5.height); break;
      case 2: x = p5.random(p5.width); y = p5.height + 50; break;
      case 3: x = -50; y = p5.random(p5.height); break;
    }

    const asteroid = asteroidPool.get({
      x,
      y,
      size: p5.random(30, 60),
      seed: p5.random(1000),
      isGold,
      health: isGold ? 40 : 20
    });

    if (asteroid) {
      entities.asteroids.push(asteroid);
    }
  }
}