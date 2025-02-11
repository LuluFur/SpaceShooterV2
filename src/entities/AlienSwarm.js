import Alien from './Alien';

export class AlienSwarm extends Alien {
    constructor(x, y) {
      super(x, y);
      this.maxHealth = 10; // Lower health
      this.damage = 5; // Lower damage
      this.maxSpeed = 4; // Faster movement
      this.size = 10; // Smaller size
    }
  
    update() {
      // Custom update logic for swarm
      // ...existing code...
    }
  
    draw() {
      // Custom drawing logic for swarm
      // ...existing code...
    }
  }