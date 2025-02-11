import { eventManager } from "./Events.js";

const eventDelay = 45000; // 45 seconds between events

export function initializeEvents(p) {
  let eventTimer = p.millis();

  let startingEvent = eventManager.createEventInstance('SHOOTING_ASTEROIDS');
  eventManager.startEventImmediately(startingEvent);

  return eventTimer;
}

export function updateEvents(p, eventTimer) {
  if (p.millis() - eventTimer > eventDelay && eventManager.activeEvents.length === 0) {
    let newEvent = eventManager.createEventInstance('SHOOTING_ASTEROIDS');
    eventManager.startEventImmediately(newEvent);
    eventTimer = p.millis();
  }

  eventManager.tickEvents();
}
