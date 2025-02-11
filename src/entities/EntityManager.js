import { spawnXPOrbs } from '../game/XPSpawner.js';
import { createBulletImpactDebris } from '../effects/EffectManager.js';
import { MiniBossAlien } from './MiniBossAlien.js';
import { openDeathMenu } from '../game/DeathMenu.js';
import { collisionManager } from '../utils/CollisionManager.js';
import { ProjectileQuad } from './ProjectileQuad.js';
import { HomingRocket } from './HomingRocket.js';
import { getP5 } from '../game/p5Instance.js';

export function updateAndDrawEntities(p, entities, gameState) {
  // Clear and prepare collision detection
  collisionManager.clear();

  // Insert all entities into collision manager
  entities.asteroids.forEach(asteroid => {
    collisionManager.insert({ ...asteroid, type: 'asteroid' });
  });

  entities.aliens.forEach(alien => {
    collisionManager.insert({ ...alien, type: 'alien' });
    alien.projectiles.forEach(projectile => {
      collisionManager.insert({ ...projectile, type: 'alienProjectile' });
    });
  });

  if (entities.player) {
    entities.player.projectiles.forEach(projectile => {
      const type = projectile instanceof ProjectileQuad ? 'playerProjectileQuad' :
                   projectile instanceof HomingRocket ? 'playerHomingRocket' :
                   'playerProjectile';
      collisionManager.insert({ ...projectile, type });
    });
  }

  // Update and draw entities
  entities.xpOrbs = entities.xpOrbs.filter(orb => {
    orb.update(entities.player);
    orb.draw();
    return !orb.collected;
  });

  entities.asteroids.forEach(asteroid => {
    asteroid.update();
    asteroid.draw();
  });

  entities.aliens.forEach(alien => {
    alien.update();
    alien.draw();
  });

  // Handle all collisions
  collisionManager.handleCollisions(entities, gameState);

  // Clean up destroyed entities
  entities.asteroids = entities.asteroids.filter(a => !a.isDestroyed);
  entities.aliens = entities.aliens.filter(a => !a.isDestroyed);

  // Draw debug visualization if enabled
  collisionManager.drawDebug();
}
