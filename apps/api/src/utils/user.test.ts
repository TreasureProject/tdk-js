import { $Enums, PrismaClient } from "@prisma/client";
import { beforeEach, describe, expect, it } from "vitest";

import {
  checkCanMigrateLegacyUser,
  migrateLegacyUser,
  parseThirdwebUserLinkedAccounts,
} from "./user";

const EMAIL = "rappzula@treasure.lol";
const EMAIL2 = "rappzula+2@treasure.lol";
const EXTERNAL_WALLET_ADDRESS = "0x73239D66c237D5923a7DF2D4E1E59fB7432c7826";
const EXTERNAL_WALLET_ADDRESS2 = "0xAe41952DF7e8C8d7798F10c15C0b19ab98e4Fe1A";
const ECOSYSTEM_WALLET_ADDRESS = "0xc292b6155baeb5ccdba82e3d36ecb7ad0a121baa";

describe("user utils", () => {
  it("should parse thirdweb user email", () => {
    const result = parseThirdwebUserLinkedAccounts({
      userId: "thirdweb-user-id",
      walletAddress: ECOSYSTEM_WALLET_ADDRESS,
      email: EMAIL,
      createdAt: "",
      profiles: [],
    });
    expect(result.emailAddresses).toStrictEqual([EMAIL]);
    expect(result.externalWalletAddresses).toStrictEqual([]);
  });

  it("should parse thirdweb user profiles", () => {
    const result = parseThirdwebUserLinkedAccounts({
      userId: "thirdweb-user-id",
      walletAddress: ECOSYSTEM_WALLET_ADDRESS,
      createdAt: "",
      profiles: [
        {
          type: "email",
          details: {
            email: EMAIL,
          },
        },
        {
          type: "google",
          details: {
            email: EMAIL2,
          },
        },
        {
          // @ts-ignore: Thirdweb SDK has a type mismatch bug here as of v5.72.0
          type: "siwe",
          details: {
            address: EXTERNAL_WALLET_ADDRESS,
          },
        },
        {
          type: "wallet",
          details: {
            address: EXTERNAL_WALLET_ADDRESS2,
          },
        },
      ],
    });
    expect(result.emailAddresses).toStrictEqual([EMAIL, EMAIL2]);
    expect(result.externalWalletAddresses).toStrictEqual([
      EXTERNAL_WALLET_ADDRESS.toLowerCase(),
      EXTERNAL_WALLET_ADDRESS2.toLowerCase(),
    ]);
  });

  it("should handle parsing empty thirdweb user", () => {
    const result = parseThirdwebUserLinkedAccounts(null);
    expect(result.emailAddresses).toStrictEqual([]);
    expect(result.externalWalletAddresses).toStrictEqual([]);
  });
});

describe("user migration utils", () => {
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
    const user = await db.user.create({
      data: {
        externalUserId: "thirdweb-user-id",
      },
    });

    await db.userSmartAccount.create({
      data: {
        address: "0xfa2b4d1c2fd0f340d8d156116347b1ec7ffc28e9",
        chainId: 421614,
        ecosystemWalletAddress: ECOSYSTEM_WALLET_ADDRESS,
        userId: user.id,
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
        legacyAddress: params?.legacyAddress ?? EXTERNAL_WALLET_ADDRESS,
        legacyEmail: params?.legacyEmail ?? EMAIL,
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

    const canMigrateResult = await checkCanMigrateLegacyUser({
      db,
      userId: user.id,
      emailAddresses: [EMAIL],
      externalWalletAddresses: [],
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
  });

  it("should connect legacy profile to user", async () => {
    const user = await createEcosystemWalletUser();
    const legacyProfile = await createLegacyUserProfile();

    const canMigrateResult = await checkCanMigrateLegacyUser({
      db,
      userId: user.id,
      emailAddresses: [],
      externalWalletAddresses: [EXTERNAL_WALLET_ADDRESS],
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
      emailAddresses: [],
      externalWalletAddresses: [],
      legacyProfileId: otherLegacyProfile.id,
    });
    expect(!canMigrateResult.canMigrate);
  });
});
