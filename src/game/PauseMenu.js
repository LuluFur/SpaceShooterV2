import { getP5 } from "./p5Instance.js";
import { startGame } from "./MainMenu.js";
import { gameState, entities } from './GameState.js';
import { eventManager } from './Events.js';

export function togglePauseMenu() {
  const p5 = getP5();
  if (!p5) return;

  const existingPauseMenu = document.getElementById('pause-menu');
  if (existingPauseMenu) {
    closePauseMenu();
    return;
  }
  
  openPauseMenu();
}

export function openPauseMenu() {
  const p5 = getP5();
  if (!p5) return;

  const pauseMenu = document.createElement('div');
  pauseMenu.className = 'pause-menu';
  pauseMenu.id = 'pause-menu';
  
  const content = document.createElement('div');
  content.className = 'pause-menu-content';
  
  content.innerHTML = `
    <h1 class="pause-title">PAUSED</h1>
    <div class="pause-menu-buttons">
      <button class="pause-menu-button" onclick="window.resumeGame()">Resume</button>
      <button class="pause-menu-button" onclick="window.restartGame()">Restart</button>
      <button class="pause-menu-button" onclick="window.returnToMainMenu()">Main Menu</button>
    </div>
  `;
  
  pauseMenu.appendChild(content);
  document.getElementById('game-container').appendChild(pauseMenu);
  document.body.classList.add('game-paused');
  
  p5.noLoop();
}

export function closePauseMenu() {
  const p5 = getP5();
  if (!p5) return;

  const pauseMenu = document.getElementById('pause-menu');
  if (pauseMenu) {
    pauseMenu.remove();
  }
  
  document.body.classList.remove('game-paused');
  p5.loop();
}

function resumeGame() {
  closePauseMenu();
}

function restartGame() {
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

  // Start the "Shooting Asteroids" event immediately
  const startingEvent = eventManager.createEventInstance('SHOOTING_ASTEROIDS');
  eventManager.startEventImmediately(startingEvent);

  // Close pause menu
  closePauseMenu();
  
  // Start fresh game
  startGame();
}

function returnToMainMenu() {
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

  closePauseMenu();
  
  // Open main menu
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

// Make these functions available globally
window.resumeGame = resumeGame;
window.restartGame = restartGame;
window.returnToMainMenu = returnToMainMenu;