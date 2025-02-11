export function drawStatusBars(p, entities) {
  const barWidth = 200;
  const barHeight = 10;
  const x = p.width / 2 - barWidth / 2;

  if (!entities.player) return;

  // Draw health bar
  const healthY = p.height - 40;
  p.push();
  p.noStroke();
  // Background
  p.fill(100, 0, 0);
  p.rect(x, healthY, barWidth, barHeight);
  // Current health
  const healthWidth =
    (entities.player.health / entities.player.maxHealth) * barWidth;
  p.fill(255, 0, 0);
  p.rect(x, healthY, healthWidth, barHeight);

  // Health text
  p.fill(255);
  p.textAlign(p.LEFT, p.CENTER);
  p.textSize(12);
  p.text(
    `${Math.ceil(entities.player.health)}/${entities.player.maxHealth}`,
    x + barWidth + 10,
    healthY + barHeight / 2
  );
  p.pop();

  // Draw XP bar
  const xpY = p.height - 20;
  p.push();
  p.noStroke();
  // Background
  p.fill(0, 50, 100);
  p.rect(x, xpY, barWidth, barHeight);
  // Current XP
  const xpWidth =
    (entities.player.xp / entities.player.xpToNextLevel) * barWidth;
  p.fill(0, 150, 255);
  p.rect(x, xpY, xpWidth, barHeight);

  // Level indicator
  p.textAlign(p.LEFT, p.CENTER);
  p.fill(255);
  p.textSize(12);
  p.text(
    `Level ${entities.player.level}`,
    x + barWidth + 10,
    xpY + barHeight / 2
  );
  p.pop();
}
