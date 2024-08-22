import { describe, expect, it } from "vitest";
import { bigIntToNumber } from "./number";

describe("number utils", () => {
  it("should parse bigint to number", () => {
    expect(bigIntToNumber(1000000000000000000n)).toBe(1);
  });

  it("should parse bigint to number with custom decimals", () => {
    expect(bigIntToNumber(1000000n, 6)).toBe(1);
  });
});
