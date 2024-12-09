import type { PrismaClient, UserProfile } from "@prisma/client";
import {
  USER_PROFILE_FREE_BANNER_URLS,
  fetchUserInventory,
  getContractAddress,
} from "@treasure-dev/tdk-core";
import type { GetUserResult } from "thirdweb";
import { arbitrum } from "thirdweb/chains";

import type { UpdateCurrentUserBody } from "../schema";
import {
  USER_NOTIFICATION_SETTINGS_SELECT_FIELDS,
  USER_PROFILE_SELECT_FIELDS,
  USER_SOCIAL_ACCOUNT_SELECT_FIELDS,
} from "./db";

export const transformUserProfileResponseFields = (
  profile: Partial<UserProfile>,
) => ({
  email: profile.email ?? null,
  emailSecurityPhraseUpdatedAt:
    profile.emailSecurityPhraseUpdatedAt?.toISOString() ?? null,
  testnetFaucetLastUsedAt:
    profile.testnetFaucetLastUsedAt?.toISOString() ?? null,
});

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

const isValidUserProfileBannerCollection = ({
  chainId,
  collectionAddress,
}: {
  chainId: number;
  collectionAddress: string;
}) => {
  const address = collectionAddress.toLowerCase();
  return (
    (chainId === arbitrum.id &&
      address.toLowerCase() === "0xb8c465243b405a5908dc2a664535025b5ba5bac0") || // Wastelands
    address === getContractAddress(chainId, "TreasureBanners")
  );
};

export const createUserProfileBannerUrl = async ({
  userAddress,
  bannerData,
  inventoryApiUrl,
  inventoryApiKey,
}: {
  userAddress: string;
  bannerData: NonNullable<UpdateCurrentUserBody["bannerData"]>;
  inventoryApiUrl: string;
  inventoryApiKey: string;
}) => {
  if (typeof bannerData === "string") {
    return USER_PROFILE_FREE_BANNER_URLS[bannerData];
  }

  const { chainId, collectionAddress, tokenId } = bannerData;
  if (!isValidUserProfileBannerCollection({ chainId, collectionAddress })) {
    return null;
  }

  const [token] = await fetchUserInventory({
    chainId,
    apiUrl: inventoryApiUrl,
    apiKey: inventoryApiKey,
    userAddress,
    tokens: [{ address: collectionAddress, tokenId }],
  });
  return token && token.balance > 0 ? token.image : null;
};

export const createUserProfilePictureUrl = async ({
  userAddress,
  pfpData,
  inventoryApiUrl,
  inventoryApiKey,
}: {
  userAddress: string;
  pfpData: NonNullable<UpdateCurrentUserBody["pfpData"]>;
  inventoryApiUrl: string;
  inventoryApiKey: string;
}) => {
  const { chainId, collectionAddress, tokenId } = pfpData;
  const [token] = await fetchUserInventory({
    chainId,
    apiUrl: inventoryApiUrl,
    apiKey: inventoryApiKey,
    userAddress,
    tokens: [{ address: collectionAddress, tokenId }],
  });
  // TODO: implement crop and upload
  return token && token.balance > 0 ? token.image : null;
};

export const checkCanMigrateLegacyUser = async ({
  db,
  userId,
  emailAddresses,
  externalWalletAddresses,
  legacyProfileId,
}: {
  db: PrismaClient;
  userId: string;
  emailAddresses: string[];
  externalWalletAddresses: string[];
  legacyProfileId: string;
}) => {
  const [profile, legacyProfile] = await Promise.all([
    db.userProfile.findUnique({
      where: { userId },
      select: { id: true },
    }),
    db.userProfile.findUnique({
      where: {
        id: legacyProfileId,
      },
    }),
  ]);

  const externalWalletAddressMatch =
    !!legacyProfile?.legacyAddress &&
    externalWalletAddresses
      .map((address) => address.toLowerCase())
      .includes(legacyProfile.legacyAddress.toLowerCase());
  const emailAddressMatch =
    !!legacyProfile?.legacyEmail &&
    !!legacyProfile.legacyEmailVerifiedAt &&
    emailAddresses.includes(legacyProfile.legacyEmail.toLowerCase());

  return {
    canMigrate: externalWalletAddressMatch || emailAddressMatch,
    profile,
    legacyProfile,
  };
};

export const migrateLegacyUser = async ({
  db,
  userId,
  userProfileId,
  legacyProfile,
}: {
  db: PrismaClient;
  userId: string;
  userProfileId?: string;
  legacyProfile: UserProfile;
}) => {
  // Migrate supporting data
  const [[, , updatedSocialAccounts], [, , updatedNotificationSettings]] =
    await Promise.all([
      // Migrate social accounts
      db.$transaction([
        // Delete current social accounts
        db.userSocialAccount.deleteMany({
          where: {
            userId,
          },
        }),
        // Connect social accounts to user
        db.userSocialAccount.updateMany({
          where: {
            legacyUserProfileId: legacyProfile.id,
          },
          data: {
            userId,
            // Clear legacy profile data so migration is not triggered again
            legacyUserProfileId: null,
          },
        }),
        // Select migrated social accounts
        db.userSocialAccount.findMany({
          where: {
            userId,
          },
          select: USER_SOCIAL_ACCOUNT_SELECT_FIELDS,
        }),
      ]),
      // Migrate notification settings
      db.$transaction([
        // Delete current notification settings
        db.userNotificationSettings.deleteMany({
          where: {
            userId,
          },
        }),
        // Connect notification settings to user
        db.userNotificationSettings.updateMany({
          where: {
            legacyUserProfileId: legacyProfile.id,
          },
          data: {
            userId,
            // Clear legacy profile data so migration is not triggered again
            legacyUserProfileId: null,
          },
        }),
        // Select migrated notification settings
        db.userNotificationSettings.findMany({
          where: {
            userId,
          },
          select: USER_NOTIFICATION_SETTINGS_SELECT_FIELDS,
        }),
      ]),
    ]);

  await Promise.all([
    // Migrate gems summary
    db.$transaction([
      // Delete current gems summary
      db.gemsSummary.deleteMany({
        where: {
          userId,
        },
      }),
      // Connect gems summary to user
      db.gemsSummary.updateMany({
        where: {
          legacyUserProfileId: legacyProfile.id,
        },
        data: {
          userId,
          // Clear legacy profile data so migration is not triggered again
          legacyUserProfileId: null,
        },
      }),
    ]),
    // Migrate gems txs
    db.$transaction([
      // Delete current gems txs
      db.gemsTx.deleteMany({
        where: {
          userId,
        },
      }),
      // Connect gems txs to user
      db.gemsTx.updateMany({
        where: {
          legacyUserProfileId: legacyProfile.id,
        },
        data: {
          userId,
          // Clear legacy profile data so migration is not triggered again
          legacyUserProfileId: null,
        },
      }),
    ]),
  ]);
  await Promise.all([
    // Migrate vouchers
    db.$transaction([
      // Delete current vouchers
      db.voucher.deleteMany({
        where: {
          userId,
        },
      }),
      // Connect vouchers to user
      db.voucher.updateMany({
        where: {
          legacyUserProfileId: legacyProfile.id,
        },
        data: {
          userId,
          // Clear legacy profile data so migration is not triggered again
          legacyUserProfileId: null,
        },
      }),
    ]),
    // Migrate user quests
    db.$transaction([
      // Delete current user quests
      db.userQuest.deleteMany({
        where: {
          userId,
        },
      }),
      // Connect user quests to user
      db.userQuest.updateMany({
        where: {
          legacyUserProfileId: legacyProfile.id,
        },
        data: {
          userId,
          // Clear legacy profile data so migration is not triggered again
          legacyUserProfileId: null,
        },
      }),
    ]),
  ]);

  let updatedProfile: Pick<
    UserProfile,
    keyof typeof USER_PROFILE_SELECT_FIELDS
  >;

  // Merge data if user has existing profile or connect legacy profile if not
  if (userProfileId && userProfileId !== legacyProfile.id) {
    const [updateResult] = await db.$transaction([
      db.userProfile.update({
        where: {
          id: userProfileId,
        },
        data: {
          tag: legacyProfile.tag ?? undefined,
          discriminant: legacyProfile.discriminant ?? undefined,
          emailSecurityPhrase: legacyProfile.emailSecurityPhrase ?? undefined,
          emailSecurityPhraseUpdatedAt:
            legacyProfile.emailSecurityPhraseUpdatedAt ?? undefined,
          featuredNftIds: legacyProfile.featuredNftIds,
          featuredBadgeIds: legacyProfile.featuredBadgeIds,
          highlyFeaturedBadgeId:
            legacyProfile.highlyFeaturedBadgeId ?? undefined,
          about: legacyProfile.about ?? undefined,
          pfp: legacyProfile.pfp ?? undefined,
          banner: legacyProfile.banner ?? undefined,
          showMagicBalance: legacyProfile.showMagicBalance,
          showEthBalance: legacyProfile.showEthBalance,
          showGemsBalance: legacyProfile.showGemsBalance,
          testnetFaucetLastUsedAt:
            legacyProfile.testnetFaucetLastUsedAt ?? undefined,
          legacyProfileMigratedAt: new Date(),
        },
        select: USER_PROFILE_SELECT_FIELDS,
      }),
      // Delete the legacy record now that it's merged
      db.userProfile.delete({
        where: {
          id: legacyProfile.id,
        },
      }),
    ]);
    updatedProfile = updateResult;
  } else {
    updatedProfile = await db.userProfile.update({
      where: {
        id: legacyProfile.id,
      },
      data: {
        userId,
        legacyProfileMigratedAt: new Date(),
        // // Preserve legacy info for historical purposes.
        // legacyAddress: null,
        // legacyEmail: null,
        // legacyEmailVerifiedAt: null,
      },
      select: USER_PROFILE_SELECT_FIELDS,
    });
  }

  // Delete any other legacy records that weren't migrated
  await db.$transaction([
    db.userProfile.deleteMany({
      where: {
        legacyAddress: legacyProfile.legacyAddress,
      },
    }),
    ...(legacyProfile.email
      ? []
      : [
          db.userProfile.deleteMany({
            where: {
              legacyEmail: legacyProfile.legacyEmail,
            },
          }),
        ]),
  ]);

  return {
    updatedProfile,
    updatedSocialAccounts,
    updatedNotificationSettings,
  };
};

export const clearLegacyUser = async ({
  db,
  legacyProfile,
}: {
  db: PrismaClient;
  legacyProfile: UserProfile;
}) =>
  Promise.all([
    // Delete social accounts associated with this legacy profile
    db.userSocialAccount.deleteMany({
      where: {
        legacyUserProfileId: legacyProfile.id,
      },
    }),
    // Delete notification settings associated with this legacy profile
    db.userNotificationSettings.deleteMany({
      where: {
        legacyUserProfileId: legacyProfile.id,
      },
    }),
    // Delete all legacy records
    db.$transaction([
      db.userProfile.deleteMany({
        where: {
          legacyAddress: legacyProfile.legacyAddress,
        },
      }),
      ...(legacyProfile.email
        ? []
        : [
            db.userProfile.deleteMany({
              where: {
                legacyEmail: legacyProfile.legacyEmail,
              },
            }),
          ]),
    ]),
  ]);
