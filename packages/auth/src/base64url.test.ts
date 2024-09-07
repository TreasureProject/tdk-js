import { describe, expect, it } from "vitest";
import { base64url } from "./base64url";

describe("base64url utils", () => {
  it("should encode string", () => {
    expect(base64url("Test string")).toBe("VGVzdCBzdHJpbmc");
  });

  it("should encode uint8 array", () => {
    expect(base64url(new Uint8Array([0x54, 0x65, 0x73, 0x74]))).toBe("VGVzdA");
  });
});
