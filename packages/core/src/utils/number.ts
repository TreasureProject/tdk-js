import { formatUnits } from "viem";

export const bigIntToNumber = (value: bigint, decimals = 18) =>
  Number(formatUnits(value, decimals));
