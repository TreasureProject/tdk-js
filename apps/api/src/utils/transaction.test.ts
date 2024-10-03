import { describe, expect, it } from "vitest";
import { parseTxOverrides } from "./transaction";

describe("transaction utils", () => {
  it("should parse tx overrides", () => {
    expect(parseTxOverrides()).toBeUndefined();

    expect(parseTxOverrides({})).toBeUndefined();

    expect(parseTxOverrides({ gas: "10000000000" })).toStrictEqual({
      gas: "10000000000",
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined,
      value: undefined,
    });

    expect(parseTxOverrides({ maxFeePerGas: "10000000000" })).toStrictEqual({
      gas: undefined,
      maxFeePerGas: "10000000000",
      maxPriorityFeePerGas: undefined,
      value: undefined,
    });

    expect(
      parseTxOverrides({ maxPriorityFeePerGas: "10000000000" }),
    ).toStrictEqual({
      gas: undefined,
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: "10000000000",
      value: undefined,
    });

    expect(parseTxOverrides({ value: "10000000000" })).toStrictEqual({
      gas: undefined,
      maxFeePerGas: undefined,
      maxPriorityFeePerGas: undefined,
      value: "10000000000",
    });

    expect(
      parseTxOverrides({
        gas: "10000000000",
        maxFeePerGas: "10000000000",
        maxPriorityFeePerGas: "10000000000",
        value: "10000000000",
      }),
    ).toStrictEqual({
      gas: "10000000000",
      maxFeePerGas: "10000000000",
      maxPriorityFeePerGas: "10000000000",
      value: "10000000000",
    });

    expect(
      parseTxOverrides({
        gas: "",
        maxFeePerGas: "10000000000",
        maxPriorityFeePerGas: "10000000000",
        value: "10000000000",
      }),
    ).toStrictEqual({
      gas: undefined,
      maxFeePerGas: "10000000000",
      maxPriorityFeePerGas: "10000000000",
      value: "10000000000",
    });

    expect(
      parseTxOverrides({
        gas: null as unknown as string,
        maxFeePerGas: "10000000000",
        maxPriorityFeePerGas: null as unknown as string,
        value: "10000000000",
      }),
    ).toStrictEqual({
      gas: undefined,
      maxFeePerGas: "10000000000",
      maxPriorityFeePerGas: undefined,
      value: "10000000000",
    });
  });
});
