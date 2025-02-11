import { gameState, entities } from './GameState.js';
import { Alien } from '../entities/Alien.js';
import { AlienKamikaze } from '../entities/AlienKamikaze.js';
import { AlienStealth } from '../entities/AlienStealth.js';
import { AlienRapidFire } from "../entities/AlienRapidFire.js";
import { AlienPassive } from "../entities/AlienPassive.js";
import { MiniBossAlien } from '../entities/MiniBossAlien.js';
import { BossAlien } from '../entities/BossAlien.js';
import { getP5 } from './p5Instance.js';

// Level-based spawn configuration
const LEVEL_CONFIG = {
  // Level 1-4
  beginner: {
    levelRange: [1, 4],
    aliens: [
      { type: Alien, weight: 100 }  // 100% regular aliens
    ],
    spawnCount: 1
  },
  // Level 5-9
  intermediate: {
    levelRange: [5, 9],
    aliens: [
      { type: Alien, weight: 70 },
      { type: AlienStealth, weight: 30 }
    ],
    spawnCount: 2
  },
  // Level 10-14
  advanced: {
    levelRange: [10, 14],
    aliens: [
      { type: AlienRapidFire, weight: 50 },
      { type: AlienStealth, weight: 30 },
      { type: AlienKamikaze, weight: 20 }
    ],
    spawnCount: 3
  },
  // Level 15+
  expert: {
    levelRange: [15, Infinity],
    aliens: [
      { type: AlienKamikaze, weight: 40 },
      { type: AlienRapidFire, weight: 30 },
      { type: AlienPassive, weight: 30 }
    ],
    spawnCount: 4
  }
};

// Mini-boss configuration
const MINIBOSS_CONFIG = {
  spawnInterval: 5, // Spawn every 5 levels
  baseCount: 1,     // Base number of mini-bosses
  // Additional mini-boss every 15 levels
  getCount: (level) => Math.floor(1 + Math.floor(level / 15))
};

// Spawn positions
const spawnPositions = {
  top: (p5) => ({ x: p5.random(p5.width), y: -20 }),
  bottom: (p5) => ({ x: p5.random(p5.width), y: p5.height + 20 }),
  left: (p5) => ({ x: -20, y: p5.random(p5.height) }),
  right: (p5) => ({ x: p5.width + 20, y: p5.random(p5.height) })
};

function getRandomSpawnPosition(p5) {
  const sides = Object.keys(spawnPositions);
  const randomSide = p5.random(sides);
  return spawnPositions[randomSide](p5);
}

function getCurrentLevelConfig(level) {
  return Object.values(LEVEL_CONFIG).find(config => 
    level >= config.levelRange[0] && level <= config.levelRange[1]
  );
}

function getWeightedRandomAlien(aliens) {
  const totalWeight = aliens.reduce((sum, alien) => sum + alien.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const alien of aliens) {
    random -= alien.weight;
    if (random <= 0) return alien.type;
  }
  
  return aliens[0].type;
}

function spawnAliens(level, count, specificType = null, boundary = null) {
  const p5 = getP5();
  const config = getCurrentLevelConfig(level);
  
  for (let i = 0; i < count; i++) {
    const AlienType = specificType || getWeightedRandomAlien(config.aliens);
    const position = boundary ? spawnPositions[boundary](p5) : getRandomSpawnPosition(p5);
    entities.aliens.push(new AlienType(position.x, position.y));
  }
}

function spawnAlienGroup(level, count, boundary = null) {
  const p5 = getP5();
  const config = getCurrentLevelConfig(level);
  const groupCenter = boundary ? spawnPositions[boundary](p5) : getRandomSpawnPosition(p5);
  const groupRadius = 50; // Radius within which to spawn the group

  for (let i = 0; i < count; i++) {
    const AlienType = getWeightedRandomAlien(config.aliens);
    const angle = p5.random(p5.TWO_PI);
    const distance = p5.random(groupRadius);
    const x = groupCenter.x + p5.cos(angle) * distance;
    const y = groupCenter.y + p5.sin(angle) * distance;
    entities.aliens.push(new AlienType(x, y));
  }
}

export function spawnStandardAliens(level) {
  const config = getCurrentLevelConfig(level);
  const totalSpawnCount = config.spawnCount + Math.floor(level / 10);
  spawnAlienGroup(level, totalSpawnCount);
}

export function spawnMiniBosses(level) {
  const miniBossCount = 1 + Math.floor(level / 15);
  spawnAliens(level, miniBossCount, MiniBossAlien);
}

export function spawnBoss(level) {
  spawnAliens(level, 1, BossAlien);
}

export function spawnAlien() {
  const player = entities.player;
  if (!player) return;
  const level = player.level;

  // Spawn standard aliens
  spawnStandardAliens(level);
}