import { ObjectPool } from '../utils/ObjectPool.js';
import { Alien } from './Alien.js';
import { AlienRocket } from './AlienRocket.js';
import { AlienRapidFire } from './AlienRapidFire.js';
import { AlienSniper } from './AlienSniper.js';
import { AlienSwarmer } from './AlienSwarmer.js';
import { AlienKamikaze } from './AlienKamikaze.js';
import { AlienPassive } from './AlienPassive.js';
import { AlienRammer } from './AlienRammer.js';
import { MiniBossAlien } from './MiniBossAlien.js';
import { BossAlien } from './BossAlien.js';

class AlienPoolManager {
  constructor() {
    this.pools = {
      basic: new ObjectPool(config => new Alien(config.x, config.y), 100),
      rocket: new ObjectPool(config => new AlienRocket(config.x, config.y), 50),
      rapidFire: new ObjectPool(config => new AlienRapidFire(config.x, config.y), 50),
      sniper: new ObjectPool(config => new AlienSniper(config.x, config.y), 30),
      swarmer: new ObjectPool(config => new AlienSwarmer(config.x, config.y), 100),
      kamikaze: new ObjectPool(config => new AlienKamikaze(config.x, config.y), 50),
      passive: new ObjectPool(config => new AlienPassive(config.x, config.y), 30),
      rammer: new ObjectPool(config => new AlienRammer(config.x, config.y), 30),
      miniBoss: new ObjectPool(config => new MiniBossAlien(config.x, config.y), 10),
      boss: new ObjectPool(config => new BossAlien(config.x, config.y), 5)
    };
  }

  createAlien(type, config) {
    const pool = this.pools[type];
    if (!pool) {
      console.warn(`No pool found for alien type: ${type}`);
      return null;
    }
    return pool.get(config);
  }

  release(alien) {
    // Determine alien type and release to appropriate pool
    for (const [type, pool] of Object.entries(this.pools)) {
      if (alien instanceof pool.createFn({}).constructor) {
        pool.release(alien);
        break;
      }
    }
  }

  update() {
    Object.values(this.pools).forEach(pool => pool.update());
  }

  draw() {
    Object.values(this.pools).forEach(pool => pool.draw());
  }

  clear() {
    Object.values(this.pools).forEach(pool => pool.clear());
  }
}

export const alienPool = new AlienPoolManager();
