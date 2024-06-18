import Decimal from "decimal.js-light";
import { zeroAddress } from "viem";

import type { Currency, Token } from "../types";
import { getContractAddresses } from "./contracts";

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

export const getTokenAddress = (chainId: number, token: Token) => {
  const contractAddresses = getContractAddresses(chainId);
  switch (token) {
    case "ARB":
    case "MAGIC":
      return contractAddresses[token];
    case "ETH":
      return zeroAddress;
    default:
      return token;
  }
};

export const getCurrencyAddress = (chainId: number, currency: Currency) =>
  currency === "USD" ? zeroAddress : getTokenAddress(chainId, currency);
