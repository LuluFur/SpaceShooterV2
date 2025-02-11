import p5 from 'p5';
import { initializeP5, getP5 } from './game/p5Instance.js';
import { Player } from './entities/Player.js';
import { gameState, entities } from './game/GameState.js';
import { loadSounds, playSound, initializeSoundVolumes } from './game/SoundManager.js';
import { updateAsteroidSpawning, spawnAsteroids } from './game/AsteroidSpawning.js';
import { spawnAlien } from './game/AlienSpawning.js';
import { updateEffects } from './effects/EffectManager.js';
import { initializeSkills, openSkillMenu, closeSkillMenu } from './skills/SkillMenu.js';
import { openDeathMenu } from './game/DeathMenu.js';
import { openMainMenu } from './game/MainMenu.js';
import { spawnXPOrbs } from './game/XPSpawner.js';
import { spawnBackgroundParticles, drawBackgroundParticles } from './effects/BackgroundParticles.js';
import { eventManager } from "./game/Events.js";
import { gameMessager } from "./game/Messages.js";
import { togglePauseMenu } from "./game/PauseMenu.js";
import { formatTime } from './utils/TimeUtils.js';
import { drawStatusBars } from './ui/StatusBars.js';
import { updateAndDrawEntities } from './entities/EntityManager.js';
import { initializeEvents, updateEvents } from './game/EventManager.js';

// Prevent right-click context menu globally
document.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    togglePauseMenu();
  }
});

const sketch = (p) => {
  let lastPlayerLevel = 1;
  let backgroundParticles = [];
  let eventTimer = 0;
  let sounds = {};

  p.preload = () => {
    initializeP5(p);
    let p5 = window.p5Instance;
    // load sounds manually
    // p5.soundFormats? p5.soundFormats('mp3', 'ogg') : console.warn('soundFormats not available');
    // sounds.explodeSound1 = p5.loadSound('./sounds/8bit_explode_1.mp3');
    // sounds.explodeSound2 = p5.loadSound('./sounds/8bit_explode_2.mp3');
    // sounds.explosionBass = p5.loadSound('./sounds/8bit_explosion_bass.mp3');
    // sounds.gameStartSound = p5.loadSound('./sounds/8bit_game_start.mp3');
    // sounds.shootSound = p5.loadSound('./sounds/8bit_shoot.mp3');
  };

  p.setup = () => {
    const canvas = p.createCanvas(1080, 720);
    canvas.parent('main');
    canvas.id('gameCanvas');

    initializeSoundVolumes();
    initializeSkills(); // Ensure skills are initialized
    
    entities.asteroids = [];
    entities.aliens = [];
    entities.particleEffects = [];
    entities.textEffects = [];
    entities.xpOrbs = [];

    // Initialize background particles
    backgroundParticles = spawnBackgroundParticles();

    gameState.startTime = p.millis();
    eventTimer = initializeEvents(p);

    // Open main menu instead of starting game directly
    openMainMenu();
  };

  p.draw = () => {
  // map gameState.blurriness (0-1) to 255-0
    p.background(0, 0, 0, 255 * gameState.blurriness * 2);

    // Draw background particles
    drawBackgroundParticles(backgroundParticles);

    // Update events
    updateEvents(p, eventTimer);

    // Check if player leveled up
    if (entities.player && entities.player.level > lastPlayerLevel) {
      lastPlayerLevel = entities.player.level;
      openSkillMenu();
    }

    let timePlayed = p.floor((p.millis() - gameState.startTime) / 1000);

    document.getElementById('score').innerText = `Score: ${gameState.score}`;
    document.getElementById('time-played').innerText = `Time: ${formatTime(
      timePlayed
    )}`;

    // Update and draw entities
    updateAndDrawEntities(p, entities, gameState);

    // Update effects
    updateEffects();

    if (entities.player) {
      entities.player.update();
      entities.player.draw();
      drawStatusBars(p, entities);
    }

    // Draw game messages
    gameMessager.draw(p);
  };
};

new p5(sketch);