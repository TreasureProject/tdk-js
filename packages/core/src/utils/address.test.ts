import { describe, expect, it } from "vitest";
import { truncateEthAddress } from "./address";

describe("address utils", () => {
  it("should ignore empty eth address", () => {
    expect(truncateEthAddress("")).toBe("");
  });

  it("should truncate eth address", () => {
    expect(
      truncateEthAddress("0x0eB5B03c0303f2F47cD81d7BE4275AF8Ed347576"),
    ).toBe("0x0eB5…7576");
  });
});
