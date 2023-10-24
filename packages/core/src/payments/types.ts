import type { AddressString } from "../types";

export type Token = "ARB" | "MAGIC" | "ETH" | AddressString;

export type Currency = Token | "USD";

export enum PaymentsPriceType {
  STATIC,
  PRICED_IN_ERC20,
  PRICED_IN_USD,
  PRICED_IN_GAS_TOKEN,
}
