import { Alien } from './Alien.js';
import { getP5 } from '../game/p5Instance.js';
import { gameState } from '../game/GameState.js';

export class AlienSniper extends Alien {
  constructor(x, y) {
    super(x, y);
    this.reset({ x, y });
  }

  reset(config) {
    super.reset(config);
    
    // Override base properties
    this.shootDelay = 2000;
    this.maxHealth = 15 * (1 + (0.5 * gameState.difficulty));
    this.health = this.maxHealth;
    this.damage = 20;
    this.maxSpeed = 1;
    this.preferredDistance = 400;
    this.fleeDistance = 300;
    this.intelligenceLevel = 0.9; // High accuracy
    this.isDestroyed = false;

    return this;
  }

  // ...existing methods...
}
