import { sounds } from './GameState.js';
import { getP5 } from './p5Instance.js';

export function loadSounds() {
  const p5 = getP5();
  if (!p5) {
    console.warn('p5 instance not found');
    return;
  }

  if (typeof p5.loadSound !== 'function') {
    console.warn('p5.loadSound is not a function. Ensure p5.sound.js is loaded.');
    return;
  }

  try {
    // Load sounds with error handling
    sounds.explodeSound1 = p5.loadSound('/sounds/8bit_explode_1.mp3', 
      () => console.log('Loaded explode1'),
      (err) => console.warn('Failed to load explode1:', err)
    );
    sounds.explodeSound2 = p5.loadSound('/sounds/8bit_explode_2.mp3',
      () => console.log('Loaded explode2'),
      (err) => console.warn('Failed to load explode2:', err)
    );
    sounds.explosionBass = p5.loadSound('/sounds/8bit_explosion_bass.mp3',
      () => console.log('Loaded explosion bass'),
      (err) => console.warn('Failed to load explosion bass:', err)
    );
    sounds.gameStartSound = p5.loadSound('/sounds/8bit_game_start.mp3',
      () => console.log('Loaded game start'),
      (err) => console.warn('Failed to load game start:', err)
    );
    sounds.shootSound = p5.loadSound('/sounds/8bit_shoot.mp3',
      () => console.log('Loaded shoot'),
      (err) => console.warn('Failed to load shoot:', err)
    );
  } catch (error) {
    console.warn('Sound loading failed:', error);
  }
}

export function initializeSoundVolumes() {
  Object.values(sounds).forEach(sound => {
    if (sound && sound.setVolume) {
      sound.setVolume(0.2);
    }
  });
}

export function playSound(soundName) {
  const sound = sounds[soundName];
  if (sound && sound.isLoaded && sound.isLoaded()) {
    try {
      sound.play();
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }
}