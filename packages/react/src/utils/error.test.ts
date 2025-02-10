import { describe, expect, it } from "vitest";

import { getErrorMessage } from "./error";

class MockCustomError extends Error {
  constructor(message) {
    super(message);
    this.name = "MockCustomError";
  }
}

describe("error utils", () => {
  it("should get error message", () => {
    expect(getErrorMessage(new Error("test"))).toBe("test");
    expect(getErrorMessage("test")).toBe("test");
    expect(getErrorMessage(new MockCustomError("test"))).toBe("test");
    expect(getErrorMessage({ message: "test" })).toBe("test");
    expect(
      getErrorMessage({
        code: 5000,
        message: '{"code":4001,"message":"test"}',
      }),
    ).toBe("test");
    expect(getErrorMessage({})).toBe("{}");
    expect(getErrorMessage(7)).toBe("7");
  });
});
