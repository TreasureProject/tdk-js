import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getTreasureLauncherWalletComponents } from "./utils";

describe("getTreasureLauncherWalletComponents", () => {
  let originalArgv: string[];

  beforeEach(() => {
    // Store original process.argv
    originalArgv = process.argv;
  });

  afterEach(() => {
    // Restore original process.argv
    process.argv = originalArgv;
  });

  it("returns undefined when no arguments are provided", () => {
    process.argv = ["node", "script.js"]; // No relevant args
    expect(getTreasureLauncherWalletComponents()).toBeUndefined();
  });

  it("returns undefined if any required argument is missing", () => {
    process.argv = [
      "node",
      "script.js",
      "--tdk-wallet-id=wallet123",
      "--tdk-auth-provider=providerX",
      // Missing --tdk-auth-cookie
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
