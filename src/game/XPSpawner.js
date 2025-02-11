import { ObjectPool } from '../utils/ObjectPool.js';
import { XPOrb } from '../entities/XPOrb.js';
import { getP5 } from './p5Instance.js';
import { entities } from './GameState.js';

class XPOrbPool extends ObjectPool {
  constructor() {
    super(
      config => new XPOrb(config.x, config.y, config.value),
      1000
    );
  }

  createXPOrb(x, y, value) {
    return this.get({ x, y, value });
  }
}

export const xpOrbPool = new XPOrbPool();

export function spawnXPOrbs(x, y, value) {
  const p5 = getP5();
  const orbCount = Math.min(Math.ceil(value / 5), 10);
  const valuePerOrb = Math.ceil(value / orbCount);

  for (let i = 0; i < orbCount; i++) {
    const angle = p5.random(p5.TWO_PI);
    const distance = p5.random(10, 30);
    const orbX = x + p5.cos(angle) * distance;
    const orbY = y + p5.sin(angle) * distance;
    
    const orb = xpOrbPool.createXPOrb(orbX, orbY, valuePerOrb);
    if (orb) {
      entities.xpOrbs.push(orb);
    }
  }
}