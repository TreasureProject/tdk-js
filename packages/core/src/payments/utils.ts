import Decimal from "decimal.js-light";

import { type Currency, PaymentsPriceType, type Token } from "./types";

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

export const formatUSD = (value: number | string) =>
  `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatAmount = (value: string | number, toLocale = true) => {
  const decimal = new Decimal(value);
  let decimalPlaces: number;
  if (decimal.lt(1e-3)) {
    decimalPlaces = 6;
  } else if (decimal.lt(1)) {
    decimalPlaces = 4;
  } else if (decimal.lt(100)) {
    decimalPlaces = 3;
  } else {
    decimalPlaces = 2;
  }

  const rounded = decimal.toDecimalPlaces(decimalPlaces, Decimal.ROUND_DOWN);

  if (toLocale) {
    return rounded
      .toNumber()
      .toLocaleString("en-US", { maximumFractionDigits: decimalPlaces });
  }

  return rounded.toString();
};
