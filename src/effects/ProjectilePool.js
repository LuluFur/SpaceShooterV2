import { ObjectPool } from '../utils/ObjectPool.js';
import { Projectile } from '../entities/Projectile.js';
import { ProjectileQuad } from '../entities/ProjectileQuad.js';
import { HomingRocket } from '../entities/HomingRocket.js';

class ProjectilePool {
  constructor() {
    this.normalPool = new ObjectPool(
      (config) => new Projectile(config.x, config.y, config.velocity, config.owner),
      500
    );
    this.quadPool = new ObjectPool(
      (config) => new ProjectileQuad(config.x, config.y, config.velocity, config.owner),
      200
    );
    this.rocketPool = new ObjectPool(
      (config) => new HomingRocket(config.x, config.y, config.velocity, config.owner),
      100
    );
  }

  createProjectile(type, config) {
    switch (type) {
      case 'normal':
        return this.normalPool.get(config);
      case 'quad':
        return this.quadPool.get(config);
      case 'rocket':
        return this.rocketPool.get(config);
      default:
        return this.normalPool.get(config);
    }
  }

  update() {
    this.normalPool.update();
    this.quadPool.update();
    this.rocketPool.update();
  }

  draw() {
    this.normalPool.draw();
    this.quadPool.draw();
    this.rocketPool.draw();
  }

  clear() {
    this.normalPool.clear();
    this.quadPool.clear();
    this.rocketPool.clear();
  }
}

export const projectilePool = new ProjectilePool();
