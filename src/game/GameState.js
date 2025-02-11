export const gameState = {
  score: 0,
  startTime: 0,
  difficulty: 1,
  difficultyScale: 0.5,
  goldAsteroidChance: 0,
  skillMenuOpen: false,
  asteroidCap: 5,
  spawnDelay: 300,
  nextSpawnTime: 0,
  asteroidSpawnNoiseOffset: 0,
  blurriness: 0.1,
  skillsToChoose: [],
  motivationTexts: [
    "BOOM!", "BAM!", "CRASH!", "POW!", 
    "WHAM!", "PEW!", "BANG!", "POP!", 
    "YES!", "KA-POW!"
  ]
};

export const entities = {
  player: null,
  asteroids: [],
  projectiles: [],
  aliens: [],
  particleEffects: [],
  textEffects: [],
  xpOrbs: []
};

export const sounds = {
  explodeSound1: undefined,
  explodeSound2: undefined,
  explosionBass: undefined,
  gameStartSound: undefined,
  shootSound: undefined
};