import type { User } from "../types";

export const getUserAddress = (user: User, chainId: number) =>
  user.smartAccounts.find((smartAccount) => smartAccount.chainId === chainId)
    ?.address;
