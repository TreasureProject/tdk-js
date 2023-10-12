import { zeroAddress } from "viem";
import { arbitrumGoerli } from "viem/chains";
import { describe, expect, it } from "vitest";

import { TREASURE_CONTRACT_ADDRESSES } from "../contracts";
import { PaymentsPriceType } from "./types";
import { getPaymentsPriceType, getPaymentsTokenAddress } from "./utils";

describe("payments utils", () => {
  it("should get payments token address", () => {
    const chainId = arbitrumGoerli.id;
    expect(getPaymentsTokenAddress(chainId, "ARB")).toBe(
      TREASURE_CONTRACT_ADDRESSES[chainId].ARB,
    );
    expect(getPaymentsTokenAddress(chainId, "MAGIC")).toBe(
      TREASURE_CONTRACT_ADDRESSES[chainId].MAGIC,
    );
    expect(getPaymentsTokenAddress(chainId, "GAS")).toBe(zeroAddress);
    expect(getPaymentsTokenAddress(chainId, "USD")).toBe(zeroAddress);
    expect(
      getPaymentsTokenAddress(
        chainId,
        "0xe2Eb040846F9c9005675fAF945FB839b5C2B04E1",
      ),
    ).toBe("0xe2Eb040846F9c9005675fAF945FB839b5C2B04E1");
  });

  it("should get payments price type", () => {
    expect(getPaymentsPriceType("MAGIC", "MAGIC")).toBe(
      PaymentsPriceType.STATIC,
    );
    expect(getPaymentsPriceType("MAGIC", "USD")).toBe(
      PaymentsPriceType.PRICED_IN_USD,
    );
    expect(getPaymentsPriceType("MAGIC", "GAS")).toBe(
      PaymentsPriceType.PRICED_IN_GAS_TOKEN,
    );
    expect(getPaymentsPriceType("MAGIC", "ARB")).toBe(
      PaymentsPriceType.PRICED_IN_ERC20,
    );
  });
});
