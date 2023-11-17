import { describe, expect, it } from "vitest";

import { PaymentsPriceType, getPaymentsPriceType } from "./payments";

describe("payments utils", () => {
  it("should get payments price type", () => {
    expect(getPaymentsPriceType("MAGIC", "MAGIC")).toBe(
      PaymentsPriceType.STATIC,
    );
    expect(getPaymentsPriceType("MAGIC", "USD")).toBe(
      PaymentsPriceType.PRICED_IN_USD,
    );
    expect(getPaymentsPriceType("MAGIC", "ETH")).toBe(
      PaymentsPriceType.PRICED_IN_GAS_TOKEN,
    );
    expect(getPaymentsPriceType("MAGIC", "ARB")).toBe(
      PaymentsPriceType.PRICED_IN_ERC20,
    );
  });
});
