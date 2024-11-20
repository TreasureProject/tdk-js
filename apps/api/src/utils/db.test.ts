import { $Enums, PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";

import {
  checkCanMigrateLegacyUser,
  clearLegacyUser,
  migrateLegacyUser,
} from "./user";

const db = new PrismaClient();

const truncateTables = async () => {
  const tablenames = await db.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== "_prisma_migrations")
    .map((name) => `"public"."${name}"`)
    .join(", ");

  try {
    await db.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
  } catch (error) {
    console.log({ error });
  }
};

const createEcosystemWalletUser = async () => {
  const user = await db.user.create({ data: {} });

  await db.userSmartAccount.create({
    data: {
      address: "0xfa2b4d1c2fd0f340d8d156116347b1ec7ffc28e9",
      chainId: 421614,
      userId: user.id,
      initialWalletAddress: "0xc292b6155baeb5ccdba82e3d36ecb7ad0a121baa",
      initialEmail: "rappzula@treasure.lol",
    },
  });

  return user;
};

const createLegacyUserProfile = async (params?: {
  tag?: string;
  discriminant?: number;
  legacyAddress?: string;
  legacyEmail?: string;
}) => {
  const legacyProfile = await db.userProfile.create({
    data: {
      tag: params?.tag ?? "rappzulaLegacy",
      discriminant: params?.discriminant ?? 0,
      legacyAddress:
        params?.legacyAddress ?? "0x73239D66c237D5923a7DF2D4E1E59fB7432c7826",
      legacyEmail: params?.legacyEmail ?? "rappzula@treasure.lol",
      legacyEmailVerifiedAt: new Date(),
      legacyNotificationSettings: {
        create: {
          type: $Enums.NotificationType.BADGE,
        },
      },
      legacySocialAccounts: {
        create: {
          network: $Enums.SocialNetwork.TWITTER,
          accountId: "0xrappzula",
          accountName: "0xrappzula",
        },
      },
    },
    include: {
      legacyNotificationSettings: true,
      legacySocialAccounts: true,
    },
  });

  return legacyProfile;
};

const expectLegacyProfileCleared = async (id: string) => {
  const legacyProfile = await db.userProfile.findUnique({
    where: { id },
  });
  expect(!legacyProfile);

  const notificationSettings = await db.userNotificationSettings.findMany({
    where: { legacyUserProfileId: id },
  });
  expect(notificationSettings.length).toBe(0);

  const socialAccounts = await db.userSocialAccount.findMany({
    where: { legacyUserProfileId: id },
  });
  expect(socialAccounts.length).toBe(0);
};

describe("user migration", () => {
  beforeEach(async () => {
    await truncateTables();
  });

  it("should merge legacy profile into existing profile", async () => {
    const user = await createEcosystemWalletUser();
    const profile = await db.userProfile.create({
      data: {
        tag: "rappzulaExisting",
        userId: user.id,
      },
    });
    const legacyProfile = await createLegacyUserProfile();
    const legacyProfile2 = await createLegacyUserProfile({
      legacyAddress: "0xAe41952DF7e8C8d7798F10c15C0b19ab98e4Fe1A",
    });

    const canMigrateResult = await checkCanMigrateLegacyUser({
      db,
      userId: user.id,
      legacyProfileId: legacyProfile.id,
    });
    expect(canMigrateResult.canMigrate).toBe(true);
    expect(canMigrateResult.profile?.id).toBe(profile.id);
    expect(canMigrateResult.legacyProfile?.id).toBe(legacyProfile.id);

    const migrateResult = await migrateLegacyUser({
      db,
      userId: user.id,
      userProfileId: profile.id,
      legacyProfile,
    });
    expect(migrateResult.updatedProfile.id).toBe(profile.id);
    expect(migrateResult.updatedProfile.tag).toBe("rappzulaLegacy");
    expect(migrateResult.updatedSocialAccounts.length).not.toBe(0);
    expect(migrateResult.updatedNotificationSettings.length).not.toBe(0);
    expectLegacyProfileCleared(legacyProfile.id);
    expectLegacyProfileCleared(legacyProfile2.id);
  });

  it("should connect legacy profile to user", async () => {
    const user = await createEcosystemWalletUser();
    const legacyProfile = await createLegacyUserProfile();
    const legacyProfile2 = await createLegacyUserProfile({
      legacyAddress: "0xAe41952DF7e8C8d7798F10c15C0b19ab98e4Fe1A",
    });

    const canMigrateResult = await checkCanMigrateLegacyUser({
      db,
      userId: user.id,
      legacyProfileId: legacyProfile.id,
    });
    expect(canMigrateResult.canMigrate).toBe(true);
    expect(canMigrateResult.profile).toBe(null);
    expect(canMigrateResult.legacyProfile?.id).toBe(legacyProfile.id);

    const migrateResult = await migrateLegacyUser({
      db,
      userId: user.id,
      legacyProfile,
    });
    expect(migrateResult.updatedProfile.id).toBe(legacyProfile.id);
    expect(migrateResult.updatedProfile.tag).toBe("rappzulaLegacy");
    expect(migrateResult.updatedSocialAccounts.length).not.toBe(0);
    expect(migrateResult.updatedNotificationSettings.length).not.toBe(0);
    expectLegacyProfileCleared(legacyProfile2.id);
  });

  it("should clear legacy profile", async () => {
    const user = await createEcosystemWalletUser();
    const legacyProfile = await createLegacyUserProfile();
    const legacyProfile2 = await createLegacyUserProfile({
      legacyAddress: "0xAe41952DF7e8C8d7798F10c15C0b19ab98e4Fe1A",
    });

    const canMigrateResult = await checkCanMigrateLegacyUser({
      db,
      userId: user.id,
      legacyProfileId: legacyProfile.id,
    });
    expect(canMigrateResult.canMigrate).toBe(true);

    await clearLegacyUser({ db, legacyProfile });
    expectLegacyProfileCleared(legacyProfile.id);
    expectLegacyProfileCleared(legacyProfile2.id);
  });

  it("should not migrate legacy profile", async () => {
    const user = await createEcosystemWalletUser();
    const otherLegacyProfile = await createLegacyUserProfile({
      legacyEmail: "rappzula+fake@treasure.lol",
    });

    // User cannot migrate a legacy profile they're not linked to
    const canMigrateResult = await checkCanMigrateLegacyUser({
      db,
      userId: user.id,
      legacyProfileId: otherLegacyProfile.id,
    });
    expect(!canMigrateResult.canMigrate);
  });
});
