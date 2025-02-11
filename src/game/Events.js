import { entities, gameState } from './GameState.js';
import { spawnMiniBosses, spawnBoss, spawnAlien } from './AlienSpawning.js';
import { gameMessager } from './Messages.js';
import { spawnAsteroids } from './AsteroidSpawning.js';
import { getP5 } from './p5Instance.js';

// Event weights configuration
const EVENT_WEIGHTS = {
  SHOOTING_ASTEROIDS: 0.6,
  ALIEN_RAID: 0.4,
  GOLDEN_ASTEROIDS: 0.2,
  METEOR_SHOWER: 0.3,
  ALIEN_INVASION: 0.3,
  GOLD_RUSH: 0.1,
  MINI_BOSS_SPAWN: 0.0
};

// Event configuration
const EVENT_CONFIG = {
  SHOOTING_ASTEROIDS: {
    weight: EVENT_WEIGHTS.SHOOTING_ASTEROIDS,
    priority: 1,
    minPlayerLevel: 1,
    asteroidCount: 0,
    maxAsteroids: 15,
    totalWaves: 3,
    currentWave: 0,
    asteroidsPerWave: 5,
    waveDelay: 5000,
    lastWaveTime: 0,
    endConditionMet: false,
    endConditionTime: 0,
    endDebounceDelay: 2000,

    onStart: function (event) {
      gameMessager.show('Shooting Asteroids Approaching!', 'DANGER');
      event.currentWave = 0;
      event.lastWaveTime = Date.now();
      event.endConditionMet = false;
      event.endConditionTime = 0;
    },

    onTick: function (event) {
      const currentTime = Date.now();
      event.asteroidCount = entities.asteroids.length;

      if (
        event.currentWave < event.totalWaves &&
        currentTime - event.lastWaveTime >= event.waveDelay &&
        event.asteroidCount === 0
      ) {
        event.currentWave++;
        event.lastWaveTime = currentTime;
        event.endConditionMet = false;
        event.endConditionTime = 0;

        const spawnCount = Math.floor(event.asteroidsPerWave);
        for (let i = 0; i < spawnCount; i++) {
          const asteroid = spawnAsteroids(getP5(), 1);
          if (asteroid) {
            event.asteroidCount++;
          }
        }

        gameMessager.show(
          `Asteroid Wave ${event.currentWave}/${event.totalWaves}!`,
          'WARNING'
        );
      }

      const allWavesComplete = event.currentWave >= event.totalWaves;
      const allAsteroidsDestroyed = event.asteroidCount <= 0;

      if (allWavesComplete && allAsteroidsDestroyed) {
        if (!event.endConditionMet) {
          event.endConditionMet = true;
          event.endConditionTime = currentTime;
        }
      } else {
        event.endConditionMet = false;
        event.endConditionTime = 0;
      }
    },

    shouldEnd: function (event) {
      return (
        event.endConditionMet &&
        Date.now() - event.endConditionTime >= event.endDebounceDelay
      );
    },

    onEnd: function (event) {
      gameMessager.show('All Asteroid Waves Cleared!', 'ACHIEVEMENT');
      // Increase difficulty for next time
      event.totalWaves++;
      event.asteroidsPerWave += 2;
    },
  },

  ALIEN_RAID: {
    weight: EVENT_WEIGHTS.ALIEN_RAID,
    priority: 1,
    minPlayerLevel: 3,
    alienCount: 0,
    totalWaves: 3,
    currentWave: 0,
    aliensPerWave: 3,
    waveDelay: 5000,
    lastWaveTime: 0,

    onStart: function (event) {
      gameMessager.show('Alien Raid Approaching!', 'DANGER');
      event.currentWave = 0;
      event.lastWaveTime = Date.now();
    },

    onTick: function (event) {
      const currentTime = Date.now();
      event.alienCount = entities.aliens.length;

      if (
        event.currentWave < event.totalWaves &&
        currentTime - event.lastWaveTime >= event.waveDelay &&
        event.alienCount === 0
      ) {
        event.currentWave++;
        event.lastWaveTime = currentTime;

        const spawnCount = Math.floor(event.aliensPerWave);
        for (let i = 0; i < spawnCount; i++) {
          spawnAlien();
          event.alienCount++;
        }

        gameMessager.show(
          `Alien Wave ${event.currentWave}/${event.totalWaves}!`,
          'WARNING'
        );
      }
    },

    shouldEnd: function (event) {
      return event.currentWave >= event.totalWaves && event.alienCount <= 0;
    },

    onEnd: function (event) {
      gameMessager.show('All Alien Waves Defeated!', 'ACHIEVEMENT');
      // Increase difficulty for next time
      event.totalWaves++;
      event.aliensPerWave += 2;
    },
  },

  GOLDEN_ASTEROIDS: {
    weight: EVENT_WEIGHTS.GOLDEN_ASTEROIDS,
    priority: 1,
    minPlayerLevel: 5,
    originalGoldAsteroidChance: 0,
    duration: 15000, // 15 seconds
    startTime: 0,

    onStart: function (event) {
      gameMessager.show('Golden Asteroids Incoming!', 'DANGER');
      event.originalGoldAsteroidChance = gameState.goldAsteroidChance;
      gameState.goldAsteroidChance = 100;
      event.startTime = Date.now();

      // Spawn many gold asteroids
      const spawnCount = 20; // Adjust the number of gold asteroids to spawn
      for (let i = 0; i < spawnCount; i++) {
        spawnAsteroids(getP5(), 1);
      }
    },

    onTick: function (event) {
      const currentTime = Date.now();
      if (currentTime - event.startTime >= event.duration) {
        event.config.onEnd(event);
      }
    },

    shouldEnd: function (event) {
      return Date.now() - event.startTime >= event.duration;
    },

    onEnd: function (event) {
      gameMessager.show('Golden Asteroids Event Ended!', 'ACHIEVEMENT');
      gameState.goldAsteroidChance = event.originalGoldAsteroidChance;
      // Increase duration for next time
      event.duration += 5000;
    },
  },

  METEOR_SHOWER: {
    weight: EVENT_WEIGHTS.METEOR_SHOWER,
    priority: 1,
    minPlayerLevel: 2,
    meteorCount: 0,
    totalWaves: 5,
    currentWave: 0,
    meteorsPerWave: 10,
    waveDelay: 3000,
    lastWaveTime: 0,

    onStart: function (event) {
      gameMessager.show('Meteor Shower Incoming!', 'DANGER');
      event.currentWave = 0;
      event.lastWaveTime = Date.now();
    },

    onTick: function (event) {
      const currentTime = Date.now();
      event.meteorCount = entities.asteroids.length;

      if (
        event.currentWave < event.totalWaves &&
        currentTime - event.lastWaveTime >= event.waveDelay &&
        event.meteorCount === 0
      ) {
        event.currentWave++;
        event.lastWaveTime = currentTime;

        const spawnCount = Math.floor(event.meteorsPerWave);
        for (let i = 0; i < spawnCount; i++) {
          const meteor = spawnAsteroids(getP5(), 1);
          if (meteor) {
            event.meteorCount++;
          }
        }

        gameMessager.show(
          `Meteor Wave ${event.currentWave}/${event.totalWaves}!`,
          'WARNING'
        );
      }

      const allWavesComplete = event.currentWave >= event.totalWaves;
      const allMeteorsDestroyed = event.meteorCount <= 0;

      if (allWavesComplete && allMeteorsDestroyed) {
        if (!event.endConditionMet) {
          event.endConditionMet = true;
          event.endConditionTime = currentTime;
        }
      } else {
        event.endConditionMet = false;
        event.endConditionTime = 0;
      }
    },

    shouldEnd: function (event) {
      return (
        event.endConditionMet &&
        Date.now() - event.endConditionTime >= event.endDebounceDelay
      );
    },

    onEnd: function (event) {
      gameMessager.show('All Meteor Waves Cleared!', 'ACHIEVEMENT');
      // Increase difficulty for next time
      event.totalWaves++;
      event.meteorsPerWave += 5;
    },
  },

  ALIEN_INVASION: {
    weight: EVENT_WEIGHTS.ALIEN_INVASION,
    priority: 1,
    minPlayerLevel: 5,
    alienCount: 0,
    totalWaves: 5,
    currentWave: 0,
    aliensPerWave: 5,
    waveDelay: 3000,
    lastWaveTime: 0,

    onStart: function (event) {
      gameMessager.show('Alien Invasion Incoming!', 'DANGER');
      event.currentWave = 0;
      event.lastWaveTime = Date.now();
    },

    onTick: function (event) {
      const currentTime = Date.now();
      event.alienCount = entities.aliens.length;

      if (
        event.currentWave < event.totalWaves &&
        currentTime - event.lastWaveTime >= event.waveDelay &&
        event.alienCount === 0
      ) {
        event.currentWave++;
        event.lastWaveTime = currentTime;

        const spawnCount = Math.floor(event.aliensPerWave);
        for (let i = 0; i < spawnCount; i++) {
          spawnAlien();
          event.alienCount++;
        }

        gameMessager.show(
          `Alien Wave ${event.currentWave}/${event.totalWaves}!`,
          'WARNING'
        );
      }
    },

    shouldEnd: function (event) {
      return event.currentWave >= event.totalWaves && event.alienCount <= 0;
    },

    onEnd: function (event) {
      gameMessager.show('All Alien Waves Defeated!', 'ACHIEVEMENT');
      // Increase difficulty for next time
      event.totalWaves++;
      event.aliensPerWave += 5;
    },
  },

  GOLD_RUSH: {
    weight: EVENT_WEIGHTS.GOLD_RUSH,
    priority: 1,
    minPlayerLevel: 6,
    originalGoldAsteroidChance: 0,
    duration: 20000, // 20 seconds
    startTime: 0,

    onStart: function (event) {
      gameMessager.show('Gold Rush Incoming!', 'DANGER');
      event.originalGoldAsteroidChance = gameState.goldAsteroidChance;
      gameState.goldAsteroidChance = 100;
      event.startTime = Date.now();
    },

    onTick: function (event) {
      const currentTime = Date.now();
      if (currentTime - event.startTime >= event.duration) {
        event.config.onEnd(event);
      }
    },

    shouldEnd: function (event) {
      return Date.now() - event.startTime >= event.duration;
    },

    onEnd: function (event) {
      gameMessager.show('Gold Rush Event Ended!', 'ACHIEVEMENT');
      gameState.goldAsteroidChance = event.originalGoldAsteroidChance;
      // Increase duration for next time
      event.duration += 5000;
    },
  },
  MINI_BOSS_SPAWN: {
    weight: EVENT_WEIGHTS.MINI_BOSS_SPAWN,
    priority: 1,
    minPlayerLevel: 1,
    miniBosses: [],
    onStart: function (event) {
      gameMessager.show('Mini Boss Approaching!', 'DANGER');
      event.miniBosses = spawnMiniBosses(entities.player.level % 5);
    },
    onTick: function (event) {
      // Do nothing
    },
    shouldEnd: function (event) {
      // check if mini bosses still alive
      event.miniBosses = event.miniBosses.filter((alien) => entities.aliens.includes(alien));
      return event.miniBosses.length === 0;
    },
    onEnd: function (event) {
      gameMessager.show('Mini Boss Defeated!', 'ACHIEVEMENT');
    },
  },
  BOSS_SPAWN: {
    weight: EVENT_WEIGHTS.BOSS_SPAWN,
    priority: 1,
    minPlayerLevel: 1,
    boss: [],
    onStart: function (event) {
      gameMessager.show('Boss Approaching!', 'DANGER');
      event.boss = spawnBoss(entities.player.level);
    },
    onTick: function (event) {
      // Do nothing
    },
    shouldEnd: function (event) {
      // check if boss still alive
      return !entities.aliens.includes(event.boss);
    },
    onEnd: function (event) {
      gameMessager.show('Boss Defeated!', 'ACHIEVEMENT');
    },
  },
};

class EventManager {
  constructor() {
    this.eventStack = [];
    this.activeEvents = [];
    this.nextEventId = 1;
    this.usedEventIds = new Set();
    this.eventStartDelay = 5000;
    this.lastEventEndTime = 0;
  }

  generateEventId() {
    const eventId = this.nextEventId++;
    this.usedEventIds.add(eventId);
    return eventId;
  }

  createEventInstance(eventType) {
    if (!EVENT_CONFIG[eventType]) {
      throw new Error(`Unknown event type: ${eventType}`);
    }

    const eventConfig = EVENT_CONFIG[eventType];
    const eventInstance = {
      id: this.generateEventId(),
      type: eventType,
      config: eventConfig,
      startTime: null,
      isActive: false,
      forceEndTime: Date.now() + 30000, // Force end after 30 seconds
      ...Object.fromEntries(
        Object.entries(eventConfig).filter(
          ([key]) =>
            !['onStart', 'onTick', 'onEnd', 'shouldEnd', 'priority'].includes(
              key
            )
        )
      ),
    };

    return eventInstance;
  }

  getWeightedRandomEvent() {
    const totalWeight = Object.values(EVENT_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    const rand = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (const eventType of Object.keys(EVENT_CONFIG)) {
      const eventConfig = EVENT_CONFIG[eventType];
      if (entities.player.level >= eventConfig.minPlayerLevel) {
        cumulativeWeight += EVENT_WEIGHTS[eventType];
        if (rand <= cumulativeWeight) {
          return eventType;
        }
      }
    }
    return Object.keys(EVENT_CONFIG)[0];
  }

  startEventImmediately(eventInstance) {
    eventInstance.startTime = Date.now();
    eventInstance.isActive = true;
    this.activeEvents.push(eventInstance);
    eventInstance.config.onStart(eventInstance);
    this.lastEventEndTime = Date.now();
  }

  activateNextEvent() {
    if (this.eventStack.length > 0) {
      const nextEvent = this.eventStack.shift();
      const currentTime = Date.now();

      if (currentTime - this.lastEventEndTime >= this.eventStartDelay) {
        this.startEventImmediately(nextEvent);
      } else {
        const remainingDelay =
          this.eventStartDelay - (currentTime - this.lastEventEndTime);
        this.eventStack.unshift(nextEvent);
        setTimeout(() => this.activateNextEvent(), remainingDelay);
      }
    } else {
      const eventType = this.getWeightedRandomEvent();
      const eventInstance = this.createEventInstance(eventType);
      this.startEventImmediately(eventInstance);
    }
  }

  addEvent(eventType) {
    const eventInstance = this.createEventInstance(eventType);
    this.eventStack.push(eventInstance);
    this.eventStack.sort((a, b) => b.config.priority - a.config.priority);

    if (
      this.activeEvents.length === 0 &&
      Date.now() - this.lastEventEndTime >= this.eventStartDelay
    ) {
      this.activateNextEvent();
    }
    return eventInstance.id;
  }

  endEvent(eventId) {
    const eventIndex = this.activeEvents.findIndex(
      (event) => event.id === eventId
    );
    if (eventIndex !== -1) {
      const event = this.activeEvents[eventIndex];
      event.config.onEnd(event);
      this.activeEvents.splice(eventIndex, 1);
      this.lastEventEndTime = Date.now();
      this.activateNextEvent();
    }
  }

  tickEvents() {
    const currentTime = Date.now();
    for (let i = this.activeEvents.length - 1; i >= 0; i--) {
      const event = this.activeEvents[i];
      event.config.onTick(event);

      if (event.config.shouldEnd(event) || currentTime >= event.forceEndTime) {
        this.endEvent(event.id);
      }
    }
  }

  // Utility methods
  setEventStartDelay(delay) {
    this.eventStartDelay = delay;
  }
  getActiveEvents() {
    return this.activeEvents;
  }
  hasActiveEvents() {
    return this.activeEvents.length > 0;
  }
  getEventStack() {
    return this.eventStack;
  }
}

const eventManager = new EventManager();
export { eventManager, EVENT_CONFIG };