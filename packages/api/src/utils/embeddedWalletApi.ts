export const fetchEmbeddedWalletUser = async (adminAddress: string) => {
  const embeddedWalletResponse = await fetch(
    `https://embedded-wallet.thirdweb.com/api/2023-11-30/embedded-wallet/user-details?queryBy=walletAddress&walletAddress=${adminAddress}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.THIRDWEB_SECRET_KEY}`,
      },
    },
  );
  const embeddedWalletUsers = (await embeddedWalletResponse.json()) as {
    email: string;
  }[];
  return embeddedWalletUsers.length > 0 ? embeddedWalletUsers[0] : undefined;
};
