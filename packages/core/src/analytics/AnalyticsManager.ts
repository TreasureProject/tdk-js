import pjson from "../../package.json";
import { addCachedEvent, clearCachedEvents, getCachedEvents } from "./storage";
import type { AnalyticsPayload, AppInfo, TrackableEvent } from "./types";
import { getEventId, getServerTime } from "./utils";

export class AnalyticsManager {
  apiUri: string;

  xApiKey: string;

  app: AppInfo;

  constructor(apiUri: string, xApiKey: string, app: AppInfo) {
    this.apiUri = apiUri;
    this.xApiKey = xApiKey;
    this.app = app;
  }

  /**
   * Tracks a custom event.
   *
   * @param {TrackableEvent} event - The event to track.
   * @param {boolean} cacheOnFailure - Whether to cache the event on failure.
   * @returns {Promise<string>} - A promise that resolves with the newly created event's unique ID.
   */
  async trackCustomEvent(
    event: TrackableEvent,
    cacheOnFailure = true,
  ): Promise<string> {
    const serverTime = await getServerTime(this.apiUri);
    const localTime = `${Date.now()}`;
    const eventId = getEventId();
    const payload: AnalyticsPayload = {
      ...event,
      id: eventId,
      time_server: serverTime,
      time_local: localTime,
      app: this.app,
      tdk_flavour: "tdk-js",
      tdk_version: pjson.version,
    };

    try {
      const response = await fetch(`${this.apiUri}/ingress/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.xApiKey,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to track custom event");
      }
      return eventId;
    } catch (err) {
      console.error("Error tracking custom event:", err);
      if (cacheOnFailure) {
        addCachedEvent(payload);
      }
      throw err;
    }
  }

  async retryAllCachedEvents() {
    const _cachedEvents = getCachedEvents();
    // TODO: retry all events
    clearCachedEvents();
  }
}
