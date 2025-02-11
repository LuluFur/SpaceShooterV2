console.debug("SkillMenu.js is loaded");

import { gameState, entities } from '../game/GameState.js';
import { getP5 } from '../game/p5Instance.js';
import { gameMessager } from '../game/Messages.js';

const RARITY_WEIGHTS = {
  common: 0.5,
  uncommon: 0.3,
  rare: 0.15,
  epic: 0.04,
  legendary: 0.01,
  unique: 0.005
};

const RARITY_COLORS = {
  common: 'gray',
  uncommon: 'darkgreen',
  rare: 'aqua',
  epic: 'magenta',
  legendary: 'orange',
  unique: 'yellow'
};

export const skills = {
  bulletDamage: {
    name: "Bullet Damage",
    level: 1,
    maxLevel: 5,
    rarity: 'rare',
    dependancy: null,
    description: "Increase bullet damage and size",
    func: () => {
      if (!entities.player) return;
      let skill = skills.bulletDamage;
      entities.player.bulletDamage = 3 + Math.pow(skill.level, 2);
      entities.player.bulletSize = 5 + Math.pow(skill.level, 1.3);
    },
    getDescription: (level) => {
      const damageBefore = 3 + Math.pow(level - 1, 2);
      const damageAfter = 3 + Math.pow(level, 2);
      const sizeBefore = 5 + Math.pow(level - 1, 1.3);
      const sizeAfter = 5 + Math.pow(level, 1.3);
      return formatDescription("Increase bullet damage and size", [
        { name: "damage", before: damageBefore, after: damageAfter },
        { name: "size", before: sizeBefore, after: sizeAfter }
      ]);
    }
  },
  fireRate: {
    name: "Fire Rate",
    level: 1,
    maxLevel: 5,
    rarity: 'rare',
    dependancy: null,
    description: "Increase firing speed",
    func: () => {
      if (!entities.player) return;
      let skill = skills.fireRate;
      entities.player.fireRate = 1 + Math.pow(skill.level, 1.5) * 0.2;
    },
    getDescription: (level) => {
      const rateBefore = 1 + Math.pow(level - 1, 1.5) * 0.2;
      const rateAfter = 1 + Math.pow(level, 1.5) * 0.2;
      return formatDescription("Increase firing speed", [
        { name: "fire rate", before: rateBefore, after: rateAfter }
      ]);
    }
  },
  bulletCount: {
    name: "Bullet Count",
    level: 1,
    maxLevel: 5,
    rarity: 'epic',
    dependancy: null,
    description: "Increase the number of bullets fired at once",
    func: () => {
      if (!entities.player) return;
      let skill = skills.bulletCount;
      entities.player.bulletCount += 1;
    },
    getDescription: (level) => {
      const countBefore = level;
      const countAfter = level + 1;
      return formatDescription("Increase the number of bullets fired at once", [
        { name: "bullet count", before: countBefore, after: countAfter }
      ]);
    }
  },
  maxHealth: {
    name: "Max Health",
    level: 1,
    maxLevel: 5,
    rarity: 'common',
    dependancy: null,
    description: "Increase maximum health",
    func: () => {
      if (!entities.player) return;
      let skill = skills.maxHealth;
      const oldMaxHealth = entities.player.maxHealth;
      entities.player.maxHealth = 100 + Math.pow(skill.level, 2) * 25;
      entities.player.heal(oldMaxHealth * 0.5);
    },
    getDescription: (level) => {
      const healthBefore = 100 + Math.pow(level - 1, 2) * 25;
      const healthAfter = 100 + Math.pow(level, 2) * 25;
      return formatDescription("Increase maximum health", [
        { name: "max health", before: healthBefore, after: healthAfter }
      ]);
    }
  },
  xpRange: {
    name: "XP Range",
    level: 1,
    maxLevel: 5,
    rarity: 'common',
    dependancy: null,
    description: "Increase XP collection range",
    func: () => {
      if (!entities.player) return;
      let skill = skills.xpRange;
      entities.player.xpCollectionRange = 200 + Math.pow(skill.level, 1.8) * 100;
    },
    getDescription: (level) => {
      const rangeBefore = 200 + Math.pow(level - 1, 1.8) * 100;
      const rangeAfter = 200 + Math.pow(level, 1.8) * 100;
      return formatDescription("Increase XP collection range", [
        { name: "XP range", before: rangeBefore, after: rangeAfter }
      ]);
    }
  },
  xpMultiplier: {
    name: "XP Multiplier",
    level: 1,
    maxLevel: 3,
    rarity: 'rare',
    dependancy: null,
    description: "Multiply XP gained from all sources",
    func: () => {
      if (!entities.player) return;
      let skill = skills.xpMultiplier;
      entities.player.xpMultiplier = 1 + Math.pow(skill.level, 1.5) * 0.5;
    },
    getDescription: (level) => {
      const multiplierBefore = 1 + Math.pow(level - 1, 1.5) * 0.5;
      const multiplierAfter = 1 + Math.pow(level, 1.5) * 0.5;
      return formatDescription("Multiply XP gained from all sources", [
        { name: "XP multiplier", before: multiplierBefore, after: multiplierAfter }
      ]);
    }
  },
  bulletBounce: {
    name: "Bouncing Bullets",
    level: 0,
    maxLevel: 3,
    rarity: 'legendary',
    dependancy: null,
    description: "Bullets bounce between enemies",
    func: () => {
      if (!entities.player) return;
      let skill = skills.bulletBounce;
      entities.player.bulletBounces = skill.level;
    },
    getDescription: (level) => {
      const bounceBefore = level - 1;
      const bounceAfter = level;
      return formatDescription("Bullets bounce between enemies", [
        { name: "bounces", before: bounceBefore, after: bounceAfter }
      ]);
    }
  },
  goldAsteroidChance: {
    name: "Gold Asteroid Chance",
    level: 0,
    maxLevel: 5,
    rarity: 'rare',
    dependancy: null,
    description: "Increase the chances of a gold asteroid",
    func: () => {
      if (!entities.player) return;
      let skill = skills.goldAsteroidChance;
      gameState.goldAsteroidChance = skill.level * 2;
    },
    getDescription: (level) => {
      const chanceBefore = (level - 1) * 2;
      const chanceAfter = level * 2;
      return formatDescription("Increase the chances of a gold asteroid", [
        { name: "gold asteroid chance", before: chanceBefore, after: chanceAfter }
      ]);
    }
  },
  bounceDamage: {
    name: "Bounce Damage",
    level: 1,
    maxLevel: 5,
    rarity: 'unique',
    dependancy: 'bulletBounce',
    description: "Increase projectile damage with each bounce",
    func: () => {
      if (!entities.player) return;
      let skill = skills.bounceDamage;
      entities.player.bounceDamageMultiplier = 1 + skill.level * 0.5;
    },
    getDescription: (level) => {
      const multiplierBefore = 1 + (level - 1) * 0.5;
      const multiplierAfter = 1 + level * 0.5;
      return formatDescription("Increase projectile damage with each bounce", [
        { name: "damage multiplier", before: multiplierBefore, after: multiplierAfter }
      ]);
    }
  }
};

function formatDescription(baseDescription, changes) {
  let description = `<br>-------------------<br>${baseDescription}<br><br>`;
  changes.forEach(change => {
    const changeText = `${change.name}: ${change.before} > ${change.after}`;
    description += truncateChangeText(changeText) + "<br>";
  });
  description += "-------------------<br>";
  return description;
}

function truncateChangeText(changeText) {
  const MAX_CHAR_PER_LINE = 20;
  if (changeText.length <= MAX_CHAR_PER_LINE) return changeText;
  const words = changeText.split(' ');
  let truncatedText = words[0];
  for (let i = 1; i < words.length; i++) {
    if ((truncatedText + ' ' + words[i]).length > MAX_CHAR_PER_LINE) break;
    truncatedText += ' ' + words[i];
  }
  return truncatedText;
}

// Initialize available skills
export function initializeSkills() {
  gameState.skillsToChoose = Object.keys(skills).filter(skillId => !skills[skillId].dependancy);
}

export function getAvailableSkills() {
  return Object.entries(skills)
    .filter(([id, skill]) => skill.level < skill.maxLevel && (!skill.dependancy || skills[skill.dependancy].level > 0))
    .map(([id, _]) => id);
}

function getWeightedRandomSkill(availableSkills) {
  console.debug("Determining weighted random skill from available skills:", availableSkills);
  const totalWeight = availableSkills.reduce((sum, skillId) => sum + RARITY_WEIGHTS[skills[skillId].rarity], 0);
  console.debug("Total weight calculated:", totalWeight);
  let random = Math.random() * totalWeight;
  console.debug("Random value generated:", random);

  for (const skillId of availableSkills) {
    random -= RARITY_WEIGHTS[skills[skillId].rarity];
    console.debug(`Checking skill: ${skills[skillId].name}, remaining random value: ${random}`);
    if (random <= 0) {
      console.debug("Selected skill:", skills[skillId]);
      return skillId;
    }
  }

  console.debug("Fallback to first skill:", availableSkills[0]);
  return availableSkills[0];
}

export function getRandomSkills(count = 3) {
  console.debug("Getting random skills, count:", count);
  const available = getAvailableSkills();
  console.debug("Available skills:", available);
  const selected = [];
  while (selected.length < count && available.length > 0) {
    const skillId = getWeightedRandomSkill(available);
    console.debug("Selected skill ID:", skillId);
    selected.push(skillId);
    available.splice(available.indexOf(skillId), 1);
    console.debug("Remaining available skills:", available);
  }
  console.debug("Final selected skills:", selected);
  return selected; // Return skill IDs instead of names
}

export function selectSkill(skillId) {
  console.debug("Selecting skill with ID:", skillId);
  const skill = skills[skillId];
  if (skill && skill.level < skill.maxLevel) {
    skill.level++;
    console.debug(`Skill ${skill.name} upgraded to level ${skill.level}`);
    skill.func();
    
    // Add dependent skills to available skills if their dependencies are met
    Object.entries(skills).forEach(([id, dependentSkill]) => {
      if (dependentSkill.dependancy === skillId && !gameState.skillsToChoose.includes(id)) {
        gameState.skillsToChoose.push(id);
        console.debug(`Unlocked dependent skill: ${dependentSkill.name}`);
      }
    });
  } else {
    console.debug(`Skill ${skillId} is already at max level or does not exist.`);
  }
}

export function openSkillMenu() {
  const p5 = getP5();
  const selectedSkills = getRandomSkills(3);
  
  if (selectedSkills.length > 0) {
    renderSkills(selectedSkills);
    document.getElementById("skill-menu").style.display = "block";
    document.getElementById("gameCanvas").style.display = "none";
    gameState.skillMenuOpen = true;
    p5.noLoop();
  }
}

export function closeSkillMenu() {
  const p5 = getP5();
  gameState.skillMenuOpen = false;
  document.getElementById("skill-menu").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
  p5.loop();
}

export function renderSkills(selectedSkills) {
  const skillColumns = document.getElementById("skill-columns");
  if (!skillColumns) return;

  skillColumns.innerHTML = "";

  selectedSkills.forEach((skillId) => {
    const skill = skills[skillId];
    if (!skill) return;

    const skillContainer = document.createElement("div");
    skillContainer.classList.add("skill-bar-container");
    const skillColor = RARITY_COLORS[skill.rarity] || 'gray';
    skillContainer.style.setProperty('--skill-color', skillColor);

    const rarityChance = (RARITY_WEIGHTS[skill.rarity] * 100).toFixed(2);

    skillContainer.innerHTML = `
      <h3 class="skill-name">${skill.name}</h3>
      <p class="skill-rarity" style="color: ${skillColor}">${skill.rarity ? skill.rarity.toUpperCase() : 'COMMON'} (${rarityChance}% chance)</p>
      <p class="skill-level">Level: ${skill.level}/${skill.maxLevel}</p>
      <p class="skill-description">${skill.getDescription(skill.level)}</p>
      <button class="upgrade-button" onclick="window.upgradeSkill('${skillId}')">
        <span>Upgrade</span>
      </button>
      <div class="skill-minibars">
        ${[...Array(skill.maxLevel)]
          .map((_, i) => `<div class="skill-mini-bar ${i < skill.level ? "achieved" : ""}" 
           style="background-color: ${i < skill.level ? skillColor : "rgba(255, 255, 255, 0.1)"};"></div>`)
          .join("")}
      </div>
    `;

    skillColumns.appendChild(skillContainer);
  });
}

export function upgradeSkill(skillId) {
  const skill = skills[skillId];
  if (skill && skill.level < skill.maxLevel) {
    selectSkill(skillId);
    
    if (entities.player) {
      entities.player.heal(entities.player.maxHealth * 0.15);
    }
    
    // Show a message when the player upgrades a skill
    gameMessager.show(`Upgraded ${skill.name} to level ${skill.level}`, 'SKILL_UPGRADE');
    
    renderSkills(gameState.skillsToChoose);
    increaseDifficulty();
    closeSkillMenu();
  }
}

function increaseDifficulty() {
  gameState.difficulty++;
  gameState.spawnDelay *= 0.9;
  gameState.asteroidCap += 1;
}

window.upgradeSkill = upgradeSkill;