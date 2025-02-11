import { Alien } from './Alien.js';
import { getP5 } from '../game/p5Instance.js';
import { gameState } from '../game/GameState.js';

export class AlienSwarmer extends Alien {
  constructor(x, y) {
    super(x, y);
    this.reset({ x, y });
  }

  reset(config) {
    super.reset(config);
    
    const p5 = getP5();
    // Override base properties
    this.shootDelay = 800;
    this.maxHealth = 10 * (1 + (0.5 * gameState.difficulty));
    this.health = this.maxHealth;
    this.damage = 5;
    this.maxSpeed = 3;
    this.preferredDistance = 100;
    this.fleeDistance = 50;
    this.swarmRadius = p5.random(50, 150);
    this.orbitSpeed = p5.random(0.02, 0.05);
    this.orbitAngle = p5.random(p5.TWO_PI);
    this.isDestroyed = false;

    return this;
  }

  // ...existing methods...
}
