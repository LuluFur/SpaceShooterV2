import { ObjectPool } from '../utils/ObjectPool.js';
import { Particle } from './Particle.js';

class ParticlePool extends ObjectPool {
  constructor() {
    super(
      (config) => new Particle(config),
      2000 // Maximum number of particles
    );
  }

  createParticle(config) {
    return this.get(config);
  }
}

export const particlePool = new ParticlePool();
