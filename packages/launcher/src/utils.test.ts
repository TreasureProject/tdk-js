import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getTreasureLauncherAuthToken,
  getTreasureLauncherWalletComponents,
  isUsingTreasureLauncher,
} from "./utils";

describe("getTreasureLauncherAuthToken", () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it("returns undefined when no arguments are provided", () => {
    process.argv = ["node", "script.js"];
    expect(getTreasureLauncherAuthToken()).toBeUndefined();
  });

  it("returns undefined when --tdk-auth-token is missing", () => {
    process.argv = ["node", "script.js", "--some-other-arg=value"];
    expect(getTreasureLauncherAuthToken()).toBeUndefined();
  });

  it("returns the correct auth token when provided", () => {
    process.argv = ["node", "script.js", "--tdk-auth-token=secureToken123"];
    expect(getTreasureLauncherAuthToken()).toBe("secureToken123");
  });

  it("ignores unrelated arguments", () => {
    process.argv = [
      "node",
      "script.js",
      "--tdk-auth-token=secureToken123",
      "--other-flag=true",
    ];
    expect(getTreasureLauncherAuthToken()).toBe("secureToken123");
  });
});

describe("isUsingTreasureLauncher", () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it("returns false when no auth token is provided", () => {
    process.argv = ["node", "script.js"];
    expect(isUsingTreasureLauncher()).toBe(false);
  });

  it("returns true when --tdk-auth-token is provided", () => {
    process.argv = ["node", "script.js", "--tdk-auth-token=secureToken123"];
    expect(isUsingTreasureLauncher()).toBe(true);
  });
});

describe("getTreasureLauncherWalletComponents", () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it("returns undefined when no arguments are provided", () => {
    process.argv = ["node", "script.js"];
    expect(getTreasureLauncherWalletComponents()).toBeUndefined();
  });

  it("returns undefined if any required argument is missing", () => {
    process.argv = [
      "node",
      "script.js",
      "--tdk-wallet-id=wallet123",
      "--tdk-auth-provider=providerX",
    ];
    expect(getTreasureLauncherWalletComponents()).toBeUndefined();
  });

  it("returns the correct WalletComponents object when all arguments are provided", () => {
    process.argv = [
      "node",
      "script.js",
      "--tdk-wallet-id=wallet123",
      "--tdk-auth-provider=providerX",
      "--tdk-auth-cookie=cookieABC",
    ];
    expect(getTreasureLauncherWalletComponents()).toEqual({
      walletId: "wallet123",
      authProvider: "providerX",
      authCookie: "cookieABC",
    });
  });

  it("ignores unrelated arguments", () => {
    process.argv = [
      "node",
      "script.js",
      "--tdk-wallet-id=wallet123",
      "--tdk-auth-provider=providerX",
      "--tdk-auth-cookie=cookieABC",
      "--unrelated-arg=value",
    ];
    expect(getTreasureLauncherWalletComponents()).toEqual({
      walletId: "wallet123",
      authProvider: "providerX",
      authCookie: "cookieABC",
    });
  });
});
