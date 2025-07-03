import type { GetUserResult } from "thirdweb";

export const parseThirdwebUserLinkedAccounts = (user: GetUserResult | null) => {
  if (!user) {
    return {
      emailAddresses: [],
      externalWalletAddresses: [],
    };
  }

  const emailAddresses = new Set<string>();
  const externalWalletAddresses = new Set<string>();

  if (user.email) {
    emailAddresses.add(user.email.toLowerCase());
  }

  for (const profile of user.profiles) {
    if (profile.details.email) {
      emailAddresses.add(profile.details.email.toLowerCase());
    }

    if (
      // @ts-ignore: Thirdweb SDK has a type mismatch bug here as of v5.72.0
      (profile.type === "wallet" || profile.type === "siwe") &&
      profile.details.address
    ) {
      externalWalletAddresses.add(profile.details.address.toLowerCase());
    }
  }

  return {
    emailAddresses: [...emailAddresses],
    externalWalletAddresses: [...externalWalletAddresses],
  };
};
