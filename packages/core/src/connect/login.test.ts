import { describe, expect, it } from "vitest";
import { isSocialConnectMethod } from "./login";

describe("login utils", () => {
  it("should detect social connect method", () => {
    expect(isSocialConnectMethod("apple")).toBe(true);
    expect(isSocialConnectMethod("passkey")).toBe(false);
  });
});
