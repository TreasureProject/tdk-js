import type { PrismaClient, UserProfile } from "@prisma/client";
import {
  DEFAULT_TDK_ECOSYSTEM_ID,
  type EcosystemIdString,
} from "@treasure-dev/tdk-core";
import { type GetUserResult, type ThirdwebClient, getUser } from "thirdweb";
import { checksumAddress } from "thirdweb/utils";

import {
  USER_NOTIFICATION_SETTINGS_SELECT_FIELDS,
  USER_PROFILE_SELECT_FIELDS,
  USER_SOCIAL_ACCOUNT_SELECT_FIELDS,
} from "./db";
import { log } from "./log";

export const transformUserProfileResponseFields = (
  profile: Partial<UserProfile>,
) => ({
  email: profile.email ?? null,
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
  const checksumWalletAddress = checksumAddress(walletAddress);
  try {
    const ecosystemWalletUser = await getUser({
      client,
      ecosystem: {
        id: ecosystemId,
        partnerId: ecosystemPartnerId,
      },
      walletAddress: checksumWalletAddress,
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
      walletAddress: checksumWalletAddress,
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

export const checkCanMigrateLegacyUser = async ({
  db,
  userId,
  legacyProfileId,
}: {
  db: PrismaClient;
  userId: string;
  legacyProfileId: string;
}) => {
  const [user, profile, legacyProfile] = await Promise.all([
    db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        externalWalletAddress: true,
        smartAccounts: {
          select: {
            initialEmail: true,
            initialWalletAddress: true,
          },
        },
      },
    }),
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

  if (!user || !legacyProfile) {
    return { canMigrate: false };
  }

  let canMigrate = false;

  // Check if the current user is linked to this legacy profile via wallet address
  if (legacyProfile.legacyAddress) {
    const walletAddresses = user.smartAccounts
      .map((smartAccount) => smartAccount.initialWalletAddress.toLowerCase())
      .filter((walletAddress) => Boolean(walletAddress));
    canMigrate = walletAddresses.includes(
      legacyProfile.legacyAddress.toLowerCase(),
    );
  }

  // Check if the current user is linked to this legacy profile via email address
  if (legacyProfile.legacyEmail && legacyProfile.legacyEmailVerifiedAt) {
    const emailAddresses = user.smartAccounts
      .map((smartAccount) => smartAccount.initialEmail?.toLowerCase())
      .filter((emailAddress) => Boolean(emailAddress)) as string[];
    canMigrate = emailAddresses.includes(
      legacyProfile.legacyEmail.toLowerCase(),
    );
  }

  return { canMigrate, profile, legacyProfile };
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
        // Clear legacy profile data so migration is not triggered again
        legacyAddress: null,
        legacyEmail: null,
        legacyEmailVerifiedAt: null,
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
