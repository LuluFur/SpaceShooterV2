import { getP5 } from '../game/p5Instance.js';
import { QuadTree } from './QuadTree.js';
import { createBulletImpactDebris } from '../effects/EffectManager.js';
import { spawnXPOrbs } from '../game/XPSpawner.js';
import { openDeathMenu } from '../game/DeathMenu.js';
import { MiniBossAlien } from '../entities/MiniBossAlien.js';

export class CollisionManager {
  constructor() {
    this.quadTree = null;
    this.debug = true;
    this.highlightDuration = 1000;
    this.highlightedDivisions = [];
  }

  initialize() {
    const p5 = getP5();
    const margin = Math.max(p5.width, p5.height);
    const boundary = {
      x: p5.width / 2,
      y: p5.height / 2,
      w: p5.width + margin,
      h: p5.height + margin
    };
    this.quadTree = new QuadTree(boundary, 2);
  }

  clear() {
    if (!this.quadTree) this.initialize();
    this.quadTree.points = [];
    this.quadTree.divided = false;
  }

  insert(entity) {
    const normalized = {
      ...entity,
      x: entity.position.x,
      y: entity.position.y
    };
    this.quadTree.insert(normalized);
  }

  queryWithWrapping(entity) {
    const p5 = getP5();
    const radius = entity.size;
    let found = this.quadTree.queryCircle(entity.position, radius, []);

    if (entity.position.x < entity.size) {
      const wrappedPosition = { x: entity.position.x + p5.width, y: entity.position.y };
      found = found.concat(this.quadTree.queryCircle(wrappedPosition, radius, []));
    } else if (entity.position.x > p5.width - entity.size) {
      const wrappedPosition = { x: entity.position.x - p5.width, y: entity.position.y };
      found = found.concat(this.quadTree.queryCircle(wrappedPosition, radius, []));
    }

    if (entity.position.y < entity.size) {
      const wrappedPosition = { x: entity.position.x, y: entity.position.y + p5.height };
      found = found.concat(this.quadTree.queryCircle(wrappedPosition, radius, []));
    } else if (entity.position.y > p5.height - entity.size) {
      const wrappedPosition = { x: entity.position.x, y: entity.position.y - p5.height };
      found = found.concat(this.quadTree.queryCircle(wrappedPosition, radius, []));
    }

    return [...new Set(found)];
  }

  handleCollisions(entities, gameState) {
    // Handle asteroid collisions
    this.handleAsteroidCollisions(entities, gameState);
    
    // Handle alien collisions
    this.handleAlienCollisions(entities, gameState);
  }

  handleAsteroidCollisions(entities, gameState) {
    for (let i = entities.asteroids.length - 1; i >= 0; i--) {
      const asteroid = entities.asteroids[i];
      const found = this.queryWithWrapping(asteroid);

      for (const projectile of found) {
        if (projectile.type?.includes('playerProjectile')) {
          if (asteroid.checkProjectileCollision(projectile)) {
            this.highlightCollision(this.quadTree);
            if (asteroid.health <= 0) {
              if (asteroid.isGold) {
                gameState.score += 100;
                spawnXPOrbs(asteroid.position.x, asteroid.position.y, 50);
              } else {
                gameState.score += 10;
                spawnXPOrbs(asteroid.position.x, asteroid.position.y, 5);
              }
              entities.asteroids.splice(i, 1);
            }
            break;
          }
        }
      }
    }
  }

  handleAlienCollisions(entities, gameState) {
    const p5 = getP5();
    for (let i = entities.aliens.length - 1; i >= 0; i--) {
      const alien = entities.aliens[i];
      const found = this.queryWithWrapping(alien);

      // Handle alien projectiles vs player
      for (const projectile of found) {
        if (projectile.type === 'alienProjectile' && entities.player) {
          if (this.checkCollision(entities.player, projectile)) {
            this.highlightCollision(this.quadTree);
            entities.player.applyDamage(projectile.damage);
            projectile.isDestroyed = true;

            if (entities.player.health <= 0) {
              openDeathMenu();
            }

            this.createImpactEffect(p5, entities.player, projectile);
            break;
          }
        }
      }

      // Handle player projectiles vs alien
      if (entities.player) {
        for (const projectile of found) {
          if (projectile.type?.includes('playerProjectile')) {
            if (this.checkCollision(alien, projectile)) {
              this.highlightCollision(this.quadTree);
              if (alien.takeDamage(projectile.damage)) {
                entities.aliens.splice(i, 1);
                this.handleAlienDestroyed(alien, gameState);
              }
              this.createImpactEffect(p5, alien, projectile);
              projectile.isDestroyed = true;
              break;
            }
          }
        }
      }
    }
  }

  checkCollision(entity1, entity2) {
    const p5 = getP5();
    const distance = p5.dist(
      entity1.position.x, entity1.position.y,
      entity2.position.x, entity2.position.y
    );
    return distance < entity1.size + entity2.size;
  }

  createImpactEffect(p5, entity, projectile) {
    const relativeVelocity = p5.createVector(
      projectile.velocity.x - entity.velocity.x,
      projectile.velocity.y - entity.velocity.y
    );
    const impactDirection = p5.degrees(relativeVelocity.heading());

    createBulletImpactDebris({
      position: projectile.position,
      direction: impactDirection,
      spreadAngle: 120,
    });
  }

  handleAlienDestroyed(alien, gameState) {
    if (alien instanceof MiniBossAlien) {
      gameState.score += 1000;
      spawnXPOrbs(alien.position.x, alien.position.y, 300);
    } else {
      gameState.score += 200;
      spawnXPOrbs(alien.position.x, alien.position.y, 30);
    }
  }

  highlightCollision(division) {
    const p5 = getP5();
    this.highlightedDivisions.push({ 
      quadTree: division, 
      timestamp: p5.millis() 
    });
  }

  drawDebug() {
    if (!this.debug) return;
    this.drawQuadTree(this.quadTree);
    this.drawHighlights();
  }

  drawQuadTree(quadTree) {
    const p5 = getP5();
    p5.push();
    p5.noFill();
    p5.stroke(255, 0, 0);
    p5.strokeWeight(1);
    p5.rectMode(p5.CENTER);
    p5.rect(quadTree.boundary.x, quadTree.boundary.y, quadTree.boundary.w * 2, quadTree.boundary.h * 2);
    p5.pop();

    if (quadTree.divided) {
      this.drawQuadTree(quadTree.northwest);
      this.drawQuadTree(quadTree.northeast);
      this.drawQuadTree(quadTree.southwest);
      this.drawQuadTree(quadTree.southeast);
    }
  }

  drawHighlights() {
    const p5 = getP5();
    p5.push();
    p5.noFill();
    p5.stroke(0, 255, 0);
    p5.strokeWeight(2);
    p5.rectMode(p5.CENTER);

    this.highlightedDivisions = this.highlightedDivisions.filter(
      ({ timestamp }) => p5.millis() - timestamp < this.highlightDuration
    );

    this.highlightedDivisions.forEach(({ quadTree }) => {
      p5.rect(quadTree.boundary.x, quadTree.boundary.y, quadTree.boundary.w * 2, quadTree.boundary.h * 2);
    });
    p5.pop();
  }
}

export const collisionManager = new CollisionManager();
