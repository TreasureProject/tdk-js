import type { Currency, Token } from "../types";

export enum PaymentsPriceType {
  STATIC,
  PRICED_IN_ERC20,
  PRICED_IN_USD,
  PRICED_IN_GAS_TOKEN,
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
