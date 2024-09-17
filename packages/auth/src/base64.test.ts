import { describe, expect, it } from "vitest";
import { base64, base64url } from "./base64";

describe("base64 utils", () => {
  it("should encode string", () => {
    expect(base64("Test string")).toBe("VGVzdCBzdHJpbmc=");
  });

  it("should encode uint8 array", () => {
    expect(base64(new Uint8Array([0x54, 0x65, 0x73, 0x74]))).toBe("VGVzdA==");
  });

  it("should url encode string", () => {
    expect(base64url("Test string")).toBe("VGVzdCBzdHJpbmc");
  });

  it("should url encode uint8 array", () => {
    expect(base64url(new Uint8Array([0x54, 0x65, 0x73, 0x74]))).toBe("VGVzdA");
  });
});
