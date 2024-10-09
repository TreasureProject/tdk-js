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
   * @returns {Promise<string>} - A promise that resolves with the newly created event's unique ID.
   */
  async trackCustomEvent(event: TrackableEvent): Promise<string> {
    const serverTime = await getServerTime(this.apiUri);
    const localTime = `${Date.now()}`;
    const eventId = getEventId();
    const payload: AnalyticsPayload = {
      ...event,
      id: eventId,
      time_server: serverTime,
      time_local: localTime,
      app: this.app,
    };

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
  }
}
