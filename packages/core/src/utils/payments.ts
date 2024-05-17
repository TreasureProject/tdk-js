import type { Currency, Token } from "../types";

export enum PaymentsPriceType {
  STATIC = 0,
  PRICED_IN_ERC20 = 1,
  PRICED_IN_USD = 2,
  PRICED_IN_GAS_TOKEN = 3,
}

export const getPaymentsPriceType = (
  paymentToken: Token,
  pricedCurrency: Currency,
) => {
  if (pricedCurrency === paymentToken) {
    return PaymentsPriceType.STATIC;
  }

  if (pricedCurrency === "USD") {
    return PaymentsPriceType.PRICED_IN_USD;
  }

  if (pricedCurrency === "ETH") {
    return PaymentsPriceType.PRICED_IN_GAS_TOKEN;
  }

  return PaymentsPriceType.PRICED_IN_ERC20;
};
