//
import { describe, expect, it } from "vitest";
import { createLoginUrl, isSocialConnectMethod } from "./login";

describe("login utils", () => {
  it("should construct login url", () => {
    expect(
      createLoginUrl({
        project: "app",
        chainId: 1,
        domain: "https://login.treasure.lol",
        redirectUri: "https://app.treasure.lol/callback",
        data: JSON.stringify({ customData: "1234" }),
      }),
    ).toBe(
      'https://login.treasure.lol/app?redirect_uri=https://app.treasure.lol/callback&chain_id=1&data={"customData":"1234"}',
    );
  });

  it("should detect social connect method", () => {
    expect(isSocialConnectMethod("apple")).toBe(true);
    expect(isSocialConnectMethod("passkey")).toBe(false);
  });
});
