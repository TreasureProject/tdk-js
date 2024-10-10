import { describe, expect, it } from "vitest";
import { addCachedEvent, clearCachedEvents, getCachedEvents } from "./storage";
import type { AnalyticsPayload } from "./types";

describe("analytics storage", () => {
  it("adds and gets cached events", () => {
    const payload: AnalyticsPayload = {
      id: "test-id",
      cartridge_tag: "test-cartridge-tag",
      name: "test-name",
      op: "upsert",
      properties: {
        test: "test-value",
      },
      time_server: "test-server-time",
      time_local: "test-local-time",
      app: {
        app_identifier: "test-app-name",
        app_version: "test-app-version",
        app_environment: 0,
      },
      smart_account: "test-smart-account",
      tdk_flavour: "tdk-js",
      tdk_version: "test-tdk-version",
    };
    addCachedEvent(payload);
    expect(getCachedEvents()).toEqual([payload]);
    clearCachedEvents();
    expect(getCachedEvents()).toEqual([]);
  });
});
