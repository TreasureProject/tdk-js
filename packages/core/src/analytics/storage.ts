import type { AnalyticsPayload } from "./types";

function getCachedEventIds(): string[] {
  let cachedEventIds: string[] = [];
  const cachedEventIdsValue = localStorage.getItem("tdk-analytics-event-ids");
  if (cachedEventIdsValue) {
    const parsedCachedEventIds = JSON.parse(cachedEventIdsValue);
    if (Array.isArray(parsedCachedEventIds)) {
      cachedEventIds = parsedCachedEventIds;
    }
  }
  return cachedEventIds;
}

export function getCachedEvents(): AnalyticsPayload[] {
  const cachedEventIds = getCachedEventIds();
  const cachedEvents: AnalyticsPayload[] = [];

  for (let i = 0; i < cachedEventIds.length; i += 1) {
    const eventId = cachedEventIds[i];
    if (!eventId) {
      continue;
    }
    const event = localStorage.getItem(`tdk-analytic-${eventId}`);
    if (event) {
      cachedEvents.push(JSON.parse(event));
    }
  }
  return cachedEvents;
}

export function addCachedEvent(event: AnalyticsPayload): void {
  const cachedEventIds = getCachedEventIds();
  cachedEventIds.push(event.id);
  localStorage.setItem(
    "tdk-analytics-event-ids",
    JSON.stringify(cachedEventIds),
  );
  localStorage.setItem(`tdk-analytic-${event.id}`, JSON.stringify(event));
}

export function clearCachedEvents(): void {
  const cachedEventIds = getCachedEventIds();
  for (let i = 0; i < cachedEventIds.length; i += 1) {
    const eventId = cachedEventIds[i];
    if (!eventId) {
      continue;
    }
    localStorage.removeItem(`tdk-analytic-${eventId}`);
  }
  localStorage.removeItem("tdk-analytics-event-ids");
}
