import pjson from "../../package.json";
import { DEFAULT_TDK_DARKMATTER_BASE_URI } from "../constants";
import { addCachedEvent, clearCachedEvents, getCachedEvents } from "./storage";
import type { AnalyticsPayload, AppInfo, TrackableEvent } from "./types";
import { getEventId, getServerTime } from "./utils";

export class AnalyticsManager {
  apiUri: string;

  apiKey: string;

  app: AppInfo;

  constructor({
    apiUri = DEFAULT_TDK_DARKMATTER_BASE_URI,
    apiKey,
    app,
  }: { apiUri?: string; apiKey: string; app: AppInfo }) {
    this.apiUri = apiUri;
    this.apiKey = apiKey;
    this.app = app;

    setInterval(
      () => {
        this.retryAllCachedEvents();
      },
      1000 * 60 * 5,
    );
  }

  /**
   * Submits an array of payloads to the Analytics API.
   *
   * @param {AnalyticsPayload[]} payload - The payloads to submit.
   * @returns {Promise<void>} - A promise that resolves when the payloads have been submitted.
   */
  async submitPayload(payload: AnalyticsPayload[]): Promise<void> {
    const response = await fetch(`${this.apiUri}/ingress/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Failed to track custom event: ${response.status}`);
    }
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
      await this.submitPayload([payload]);
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
    const cachedEvents = getCachedEvents();
    if (cachedEvents.length === 0) {
      return;
    }
    try {
      await this.submitPayload(cachedEvents);
      clearCachedEvents();
    } catch (err) {
      console.error("Error retrying cached events:", err);
    }
  }
}
