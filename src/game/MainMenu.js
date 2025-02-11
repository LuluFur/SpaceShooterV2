import { getP5 } from './p5Instance.js';
import { entities, gameState } from './GameState.js';
import { Player } from '../entities/Player.js';
import { spawnAsteroids } from './AsteroidSpawning.js';
import { playSound } from './SoundManager.js';
import { eventManager } from './Events.js';

export function openMainMenu() {
  const p5 = getP5();
  if (!p5) return;

  const mainMenu = document.createElement('div');
  mainMenu.className = 'main-menu';
  mainMenu.id = 'main-menu';
  
  const content = document.createElement('div');
  content.className = 'main-menu-content';
  
  content.innerHTML = `
    <h1 class="main-menu-title">SPACE SHOOTER</h1>
    <div class="main-menu-buttons">
      <button class="main-menu-button" onclick="window.startGame()">Play</button>
      <button class="main-menu-button" onclick="window.openSettings()">Settings</button>
      <button class="main-menu-button" onclick="window.openInfo()">How to Play</button>
      <button class="main-menu-button" onclick="window.quitGame()">Quit</button>
    </div>
    <div id="info-modal" class="info-modal">
      <button class="close-modal" onclick="window.closeInfo()">&times;</button>
      <div class="info-modal-content">
        <h2>How to Play</h2>
        <p>🎮 Controls:</p>
        <p>- Left Click to shoot</p>
        <p>- Right Click and hold to thrust</p>
        <p>- Mouse to aim</p>
        <p>🎯 Objectives:</p>
        <p>- Destroy asteroids and aliens to gain XP and score</p>
        <p>- Level up to unlock new abilities</p>
        <p>- Survive as long as possible!</p>
      </div>
    </div>
  `;
  
  mainMenu.appendChild(content);
  document.getElementById('game-container').appendChild(mainMenu);
  
  document.getElementById("gameCanvas").style.display = "none";
  p5.noLoop();
}

export function closeMainMenu() {
  const p5 = getP5();
  if (!p5) return;

  const mainMenu = document.getElementById('main-menu');
  if (mainMenu) {
    mainMenu.remove();
  }
  
  document.getElementById("gameCanvas").style.display = "block";
  p5.loop();
}

export function startGame() {
  const p5 = getP5();
  if (!p5) return;

  // Reset game state
  gameState.score = 0;
  gameState.startTime = p5.millis();
  gameState.difficulty = 1;
  gameState.skillLevelUp = 0;
  gameState.goldAsteroidChance = 0;
  
  // Clear all entities
  entities.player = null;
  entities.asteroids = [];
  entities.aliens = [];
  entities.particleEffects = [];
  entities.textEffects = [];
  entities.xpOrbs = [];

  // Reset event manager
  eventManager.activeEvents = [];
  eventManager.eventStack = [];
  eventManager.lastEventEndTime = 0;

  // Create new player
  entities.player = new Player(p5.width / 2, p5.height / 2);
  
  // Spawn initial asteroids
  spawnAsteroids(p5, 5);
  
  // Start the "Shooting Asteroids" event immediately
  const startingEvent = eventManager.createEventInstance('SHOOTING_ASTEROIDS');
  eventManager.startEventImmediately(startingEvent);
  
  // Play start sound
  playSound('gameStartSound');
  
  closeMainMenu();
}

function openInfo() {
  const infoModal = document.getElementById('info-modal');
  if (infoModal) {
    infoModal.style.display = 'block';
  }
}

function closeInfo() {
  const infoModal = document.getElementById('info-modal');
  if (infoModal) {
    infoModal.style.display = 'none';
  }
}

function openSettings() {
  // Placeholder for settings functionality
  console.log('Settings clicked');
}

function quitGame() {
  window.close();
}

// Make functions available globally
window.startGame = startGame;
window.openSettings = openSettings;
window.openInfo = openInfo;
window.closeInfo = closeInfo;
window.quitGame = quitGame;