import type { UserProfile } from "@prisma/client";
import {
  DEFAULT_TDK_ECOSYSTEM_ID,
  type EcosystemIdString,
} from "@treasure-dev/tdk-core";
import { type GetUserResult, type ThirdwebClient, getUser } from "thirdweb";

import { log } from "./log";

export const transformUserProfileResponseFields = (
  profile: Partial<UserProfile>,
) => ({
  tagModifiedAt: profile.tagModifiedAt?.toISOString() ?? null,
  tagLastCheckedAt: profile.tagLastCheckedAt?.toISOString() ?? null,
  emailSecurityPhraseUpdatedAt:
    profile.emailSecurityPhraseUpdatedAt?.toISOString() ?? null,
  testnetFaucetLastUsedAt:
    profile.testnetFaucetLastUsedAt?.toISOString() ?? null,
});

export const getThirdwebUser = async ({
  client,
  ecosystemId = DEFAULT_TDK_ECOSYSTEM_ID,
  ecosystemPartnerId,
  walletAddress,
}: {
  client: ThirdwebClient;
  ecosystemId?: EcosystemIdString;
  ecosystemPartnerId: string;
  walletAddress: string;
}) => {
  try {
    const ecosystemWalletUser = await getUser({
      client,
      ecosystem: {
        id: ecosystemId,
        partnerId: ecosystemPartnerId,
      },
      walletAddress,
    });
    if (ecosystemWalletUser) {
      return ecosystemWalletUser;
    }
  } catch (err) {
    // Ignore failures from the Thirdweb SDK, this info is "nice-to-have"
    log.warn("Error fetching Thirdweb ecosystem wallets user:", err);
  }

  // Fall back to querying in-app wallets (no ecosystem ID)
  try {
    const inAppWalletUser = await getUser({
      client,
      walletAddress,
    });
    if (inAppWalletUser) {
      return inAppWalletUser;
    }
  } catch (err) {
    // Ignore failures from the Thirdweb SDK, this info is "nice-to-have"
    log.warn("Error fetching Thirdweb in-app wallets user:", err);
  }

  return undefined;
};

export const parseThirdwebUserEmail = (user: GetUserResult) => {
  if (user.email) {
    return user.email;
  }

  const profileEmail = user.profiles.find(({ type }) => type === "email")
    ?.details.email;
  if (profileEmail) {
    return profileEmail;
  }

  for (const profile of user.profiles) {
    if (profile.details.email) {
      return profile.details.email;
    }
  }

  return undefined;
};
