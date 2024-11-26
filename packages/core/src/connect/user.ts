export const getUserAddress = (
  user: {
    smartAccounts: { address: string; chainId: number }[];
  },
  chainId: number,
) =>
  user.smartAccounts.find((smartAccount) => smartAccount.chainId === chainId)
    ?.address;
