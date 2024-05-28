import { describe, expect, it } from "vitest";
import { sumArray } from "./array";

describe("array utils", () => {
  it("should sum empty array", () => {
    expect(sumArray([])).toBe(0);
  });

  it("sholud sum array", () => {
    expect(sumArray([1, 2, 3, 4, 5])).toBe(15);
  });
});
