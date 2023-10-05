import { parseEther, zeroAddress } from "viem";

import { getTreasureContractAddresses } from "../contracts";
import {
  type PaymentsCalculatePaymentAmountParams,
  PaymentsPriceType,
  type PaymentsToken,
} from "./types";

export const getPaymentsTokenAddress = (
  chainId: number,
  token: PaymentsToken | "USD",
) => {
  const contractAddresses = getTreasureContractAddresses(chainId);
  switch (token) {
    case "ARB":
    case "MAGIC":
      return contractAddresses[token];
    case "NATIVE":
    case "USD":
      return zeroAddress;
    default:
      return token;
  }
};

export const getPaymentsPriceType = ({
  paymentToken,
  pricedToken,
}: Pick<
  PaymentsCalculatePaymentAmountParams,
  "paymentToken" | "pricedToken"
>) => {
  if (pricedToken === paymentToken) {
    return PaymentsPriceType.STATIC;
  }

  if (pricedToken === "USD") {
    return PaymentsPriceType.PRICED_IN_USD;
  }

  if (pricedToken === "NATIVE") {
    return PaymentsPriceType.PRICED_IN_GAS_TOKEN;
  }

  return PaymentsPriceType.PRICED_IN_ERC20;
};

export const getPaymentsCalculatePaymentAmountArgs = (
  chainId: number,
  {
    paymentToken,
    pricedToken,
    pricedAmount,
  }: PaymentsCalculatePaymentAmountParams,
) =>
  [
    getPaymentsTokenAddress(chainId, paymentToken),
    parseEther(pricedAmount.toString()),
    getPaymentsPriceType({ paymentToken, pricedToken }),
    getPaymentsTokenAddress(chainId, pricedToken),
  ] as const;
