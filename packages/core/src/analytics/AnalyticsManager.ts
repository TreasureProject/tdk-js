import pjson from "../../package.json";
import { DEFAULT_TDK_DARKMATTER_BASE_URI } from "../constants";
import {
  addCachedEvent,
  clearCachedEvents,
  getCachedEvents,
  removeOldEvents,
} from "./storage";
import type {
  AnalyticsPayload,
  AppInfo,
  Device,
  TrackableEvent,
} from "./types";
import { getDevice, getEventId, getServerTime } from "./utils";

export class AnalyticsManager {
  static _instance: AnalyticsManager;

  initialized = false;

  apiUri!: string;

  apiKey!: string;

  app!: AppInfo;

  cartridgeTag!: string;

  device?: Device;

  private constructor() {}

  public static get instance(): AnalyticsManager {
    if (!AnalyticsManager._instance) {
      AnalyticsManager._instance = new AnalyticsManager();
    }

    return AnalyticsManager._instance;
  }

  public init({
    apiUri = DEFAULT_TDK_DARKMATTER_BASE_URI,
    apiKey,
    app,
    cartridgeTag,
    device,
  }: {
    apiUri?: string;
    apiKey: string;
    app: AppInfo;
    cartridgeTag: string;
    device?: Device;
  }) {
    if (this.initialized) {
      return;
    }

    this.apiUri = apiUri;
    this.apiKey = apiKey;
    this.app = app;
    this.cartridgeTag = cartridgeTag;
    const defaultDevice = getDevice();
    this.device = {
      ...defaultDevice,
      ...device,
    };
    this.initialized = true;

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
    if (!this.initialized) {
      throw new Error("AnalyticsManager is not initialized");
    }
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
      cartridge_tag: this.cartridgeTag,
      time_server: serverTime,
      time_local: localTime,
      app: this.app,
      device: this.device,
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
      removeOldEvents();
    }
  }
}
