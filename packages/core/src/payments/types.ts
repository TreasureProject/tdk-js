import type { AddressString } from "../types";

export type PaymentsToken = "ARB" | "MAGIC" | "GAS" | AddressString;

export enum PaymentsPriceType {
  STATIC,
  PRICED_IN_ERC20,
  PRICED_IN_USD,
  PRICED_IN_GAS_TOKEN,
}
