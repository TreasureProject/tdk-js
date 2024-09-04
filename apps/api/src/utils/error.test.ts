import { describe, expect, it } from "vitest";
import { normalizeEngineErrorMessage } from "./error";

describe("error utils", () => {
  it("should normalize Engine error messages", () => {
    expect(normalizeEngineErrorMessage("No normalization required")).toBe(
      "No normalization required",
    );
    expect(
      normalizeEngineErrorMessage(
        "UserOp failed with reason: 'Only basic foxes can be evolved' at txHash: 0xe4d9bfb4e5b6c8d5bd96dff274a6514d5b340df0245158a2690d682fd91d5a49",
      ),
    ).toBe("Only basic foxes can be evolved");
  });
});
