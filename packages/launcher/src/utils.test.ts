import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getTreasureLauncherAuthToken,
  getTreasureLauncherPort,
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

describe("getTreasureLauncherPort", () => {
  let originalArgv: string[];

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it("returns 16001 when no arguments are provided", () => {
    process.argv = ["node", "script.js"];
    expect(getTreasureLauncherPort()).toBe(16001);
  });

  it("returns 16001 when --server-port is missing", () => {
    process.argv = ["node", "script.js", "--some-other-arg=value"];
    expect(getTreasureLauncherPort()).toBe(16001);
  });

  it("returns the correct port when provided", () => {
    process.argv = ["node", "script.js", "--server-port=1234"];
    expect(getTreasureLauncherPort()).toBe(1234);
  });

  it("ignores unrelated arguments", () => {
    process.argv = [
      "node",
      "script.js",
      "--server-port=1234",
      "--other-flag=true",
    ];
    expect(getTreasureLauncherPort()).toBe(1234);
  });
});
