import { zeroAddress } from "viem";

import { getTreasureContractAddresses } from "../contracts";
import { PaymentsPriceType, type PaymentsToken } from "./types";

export const getPaymentsTokenAddress = (
  chainId: number,
  token: PaymentsToken | "USD",
) => {
  const contractAddresses = getTreasureContractAddresses(chainId);
  switch (token) {
    case "ARB":
    case "MAGIC":
      return contractAddresses[token];
    case "GAS":
    case "USD":
      return zeroAddress;
    default:
      return token;
  }
};

export const getPaymentsPriceType = (
  paymentToken: PaymentsToken,
  pricedToken: PaymentsToken | "USD",
) => {
  if (pricedToken === paymentToken) {
    return PaymentsPriceType.STATIC;
  }

  if (pricedToken === "USD") {
    return PaymentsPriceType.PRICED_IN_USD;
  }

  if (pricedToken === "GAS") {
    return PaymentsPriceType.PRICED_IN_GAS_TOKEN;
  }

  return PaymentsPriceType.PRICED_IN_ERC20;
};
