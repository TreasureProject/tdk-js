import { toTokens } from "thirdweb";

export const bigIntToNumber = (value: bigint, decimals = 18) =>
  Number(toTokens(value, decimals));
