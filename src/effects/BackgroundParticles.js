import { getP5 } from '../game/p5Instance.js';

// this class describes the properties of a single particle.
export class BackgroundParticle {
  // setting the co-ordinates, radius and the
  // speed of a particle in both the co-ordinates axes.
  constructor() {
    const p5 = getP5();
    this.x = p5.random(0, p5.width);
    this.y = p5.random(0, p5.height);
    this.r = p5.random(1, 8);
    this.xSpeed = p5.random(-0.2, 0.2);
    this.ySpeed = p5.random(-0.1, 0.15);
  }

  // creation of a particle.
  createParticle() {
    const p5 = getP5();
    p5.noStroke();
    p5.fill('rgba(200,169,169,0.01)');
    p5.circle(this.x, this.y, this.r);
  }

  // setting the particle in motion.
  moveParticle() {
    const p5 = getP5();
    if (this.x < 0 || this.x > p5.width)
      this.xSpeed *= -1;
    if (this.y < 0 || this.y > p5.height)
      this.ySpeed *= -1;
    this.x += this.xSpeed;
    this.y += this.ySpeed;
  }

  // this function creates the connections(lines)
  // between particles which are less than a certain distance apart
  joinParticles(particles) {
    const p5 = getP5();
    particles.forEach(element => {
      let dis = p5.dist(this.x, this.y, element.x, element.y);
      if (dis < 85) {
        p5.stroke('rgba(255,255,255,0.01)');
        p5.line(this.x, this.y, element.x, element.y);
      }
    });
  }
}

export function spawnBackgroundParticles() {
  const p5 = getP5();
  const particles = [];
  for (let i = 0; i < p5.width / 10; i++) {
    particles.push(new BackgroundParticle());
  }
  return particles;
}

export function drawBackgroundParticles(particles) {
  for (let i = 0; i < particles.length; i++) {
    particles[i].createParticle();
    particles[i].moveParticle();
    particles[i].joinParticles(particles.slice(i));
  }
}