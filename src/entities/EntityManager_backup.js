import { spawnXPOrbs } from '../game/XPSpawner.js';
import { createBulletImpactDebris } from '../effects/EffectManager.js';
import { MiniBossAlien } from './MiniBossAlien.js';
import { openDeathMenu } from '../game/DeathMenu.js';

export function updateAndDrawEntities(p, entities, gameState) {
  // Update and draw XP orbs
  for (let i = entities.xpOrbs.length - 1; i >= 0; i--) {
    const orb = entities.xpOrbs[i];
    orb.update(entities.player);
    orb.draw();
    if (orb.collected) {
      entities.xpOrbs.splice(i, 1);
    }
  }

  // Update and draw asteroids
  for (let i = entities.asteroids.length - 1; i >= 0; i--) {
    const asteroid = entities.asteroids[i];
    asteroid.update();
    asteroid.draw();

    if (asteroid.checkPlayerCollision(entities.player)) {
      entities.asteroids.splice(i, 1);
      continue;
    }

    for (let j = entities.player?.projectiles?.length - 1; j >= 0; j--) {
      const projectile = entities.player.projectiles[j];
      if (asteroid.checkProjectileCollision(projectile)) {
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

    for (let j = i + 1; j < entities.asteroids.length; j++) {
      asteroid.applyRepulsion(entities.asteroids[j]);
    }
  }

  // Update and draw aliens
  for (let i = entities.aliens.length - 1; i >= 0; i--) {
    const alien = entities.aliens[i];
    alien.update();
    alien.draw();

    // Check alien projectiles collision with player
    for (let j = alien.projectiles.length - 1; j >= 0; j--) {
      const projectile = alien.projectiles[j];
      if (!entities.player) continue;

      const distance = p.dist(
        entities.player.position.x,
        entities.player.position.y,
        projectile.position.x,
        projectile.position.y
      );

      if (distance < entities.player.size + projectile.size) {
        entities.player.applyDamage(projectile.damage);
        projectile.isDestroyed = true;

        if (entities.player.health <= 0) {
          openDeathMenu();
        }

        const relativeVelocity = p.createVector(
          projectile.velocity.x - entities.player.velocity.x,
          projectile.velocity.y - entities.player.velocity.y
        );
        const impactDirection = p.degrees(relativeVelocity.heading());

        createBulletImpactDebris({
          position: projectile.position,
          direction: impactDirection,
          spreadAngle: 120,
        });

        break;
      }
    }

    // Check player projectiles collision with alien
    if (entities.player) {
      for (let j = entities.player.projectiles.length - 1; j >= 0; j--) {
        const projectile = entities.player.projectiles[j];
        const distance = p.dist(
          alien.position.x,
          alien.position.y,
          projectile.position.x,
          projectile.position.y
        );

        if (distance < alien.size + projectile.size) {
          if (alien.takeDamage(projectile.damage)) {
            entities.aliens.splice(i, 1);

            if (alien instanceof MiniBossAlien) {
              gameState.score += 1000;
              spawnXPOrbs(alien.position.x, alien.position.y, 300);
            } else {
              gameState.score += 200;
              spawnXPOrbs(alien.position.x, alien.position.y, 30);
            }
          }

          const relativeVelocity = p.createVector(
            projectile.velocity.x - alien.velocity.x,
            projectile.velocity.y - alien.velocity.y
          );
          const impactDirection = p.degrees(relativeVelocity.heading());

          createBulletImpactDebris({
            position: projectile.position,
            direction: impactDirection,
            spreadAngle: 120,
          });

          projectile.isDestroyed = true;
          break;
        }
      }
    }
  }
}
