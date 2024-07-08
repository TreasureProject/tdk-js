//
import { describe, expect, it } from "vitest";
import { decodeAuthToken } from "./jwt";

describe("jwt utils", () => {
  it("should throw error while decoding invalid auth token", () => {
    expect(() => decodeAuthToken("invalid")).toThrowError("Invalid token");
  });

  it("should decode valid auth token", () => {
    expect(
      decodeAuthToken(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNTE2MjM5MDIyLCJjdHgiOnsiZW1haWwiOiJ0ZXN0QHRyZWFzdXJlLmxvbCJ9fQ.NTORZqdDq6dlOa1ha5BK8ZcdNJ_4dB_fx66xcUgDpGg",
      ),
    ).toStrictEqual({
      sub: "1234567890",
      exp: 1516239022,
      ctx: {
        email: "test@treasure.lol",
      },
    });
  });
});
