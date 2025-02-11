import { getP5 } from '../game/p5Instance.js';
import { entities } from '../game/GameState.js';

export class ParticleEffect {
  constructor({
    x,
    y,
    numParticles = 10,
    sizeMin = 3,
    sizeMax = 6,
    color1 = [255, 100, 0],
    color2 = [255, 255, 0],
    alpha1 = 255,
    alpha2 = 0,
    lifetime = 1,
    speedMin = 1,
    speedMax = 3,
    angleMin = 0,
    angleMax = 360,
  }) {
    const p5 = getP5();
    this.particles = [];
    this.lifetime = lifetime * 60;

    for (let i = 0; i < numParticles; i++) {
      // Convert degrees to radians using Math
      const angle = (p5.random(angleMin, angleMax) * Math.PI) / 180;
      const speed = p5.random(speedMin, speedMax);
      
      // Create velocity vector using Math.cos and Math.sin
      const velocity = p5.createVector(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      this.particles.push({
        position: p5.createVector(x, y),
        velocity: velocity,
        life: this.lifetime,
        currentLife: this.lifetime,
        sizeMin: sizeMin,
        sizeMax: sizeMax,
        color1: color1,
        color2: color2,
        alpha1: alpha1,
        alpha2: alpha2,
      });
    }

    // Add the effect to the global effects array
    entities.particleEffects.push(this);
  }

  update() {
    const p5 = getP5();
    for (let particle of this.particles) {
      particle.position.add(particle.velocity);
      particle.currentLife -= 1;
      
      if (particle.currentLife <= 0) {
        continue;
      }

      particle.size = p5.map(
        particle.currentLife,
        0,
        this.lifetime,
        particle.sizeMin,
        particle.sizeMax
      );

      particle.alpha = p5.map(
        particle.currentLife,
        0,
        this.lifetime,
        particle.alpha2,
        particle.alpha1
      );

      let progress = 1 - particle.currentLife / this.lifetime;
      particle.color = p5.lerpColor(
        p5.color(particle.color1),
        p5.color(particle.color2),
        progress
      );
    }

    this.particles = this.particles.filter((p) => p.currentLife > 0);
  }

  draw() {
    const p5 = getP5();
    for (let particle of this.particles) {
      if (particle.currentLife <= 0) continue;

      p5.push();
      p5.noStroke();
      p5.fill(
        p5.red(particle.color),
        p5.green(particle.color),
        p5.blue(particle.color),
        particle.alpha
      );
      p5.circle(particle.position.x, particle.position.y, particle.size);
      p5.pop();
    }
  }

  isFinished() {
    return this.particles.length === 0;
  }
}