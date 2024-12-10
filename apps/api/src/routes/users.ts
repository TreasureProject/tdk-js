import type { Prisma } from "@prisma/client";
import { getUserSessions } from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";
import { ZERO_ADDRESS } from "thirdweb";

import "../middleware/auth";
import "../middleware/chain";
import "../middleware/swagger";
import {
  type ReadCurrentUserReply,
  type ReadCurrentUserSessionsQuerystring,
  type ReadCurrentUserSessionsReply,
  type ReadUserPublicProfileParams,
  type ReadUserPublicProfileReply,
  type ReadUserTransactionsParams,
  type ReadUserTransactionsQuerystring,
  type ReadUserTransactionsReply,
  type UpdateCurrentUserBody,
  type UpdateCurrentUserMigrationBody,
  type UpdateCurrentUserMigrationReply,
  type UpdateCurrentUserReply,
  notFoundReplySchema,
  readCurrentUserReplySchema,
  readCurrentUserSessionsQuerystringSchema,
  readCurrentUserSessionsReplySchema,
  readUserPublicProfileReplySchema,
  readUserTransactionsQuerystringSchema,
  readUserTransactionsReplySchema,
  updateCurrentUserBodySchema,
  updateCurrentUserMigrationBodySchema,
  updateCurrentUserMigrationReplySchema,
  updateCurrentUserReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import {
  USER_NOTIFICATION_SETTINGS_SELECT_FIELDS,
  USER_PROFILE_SELECT_FIELDS,
  USER_PUBLIC_PROFILE_SELECT_FIELDS,
  USER_SELECT_FIELDS,
  USER_SMART_ACCOUNT_SELECT_FIELDS,
  USER_SOCIAL_ACCOUNT_SELECT_FIELDS,
} from "../utils/db";
import {
  TDK_ERROR_CODES,
  TDK_ERROR_NAMES,
  TdkError,
  createUnauthorizedError,
  createUserNotFoundError,
} from "../utils/error";
import {
  checkCanMigrateLegacyUser,
  createUserProfileBannerUrl,
  createUserProfilePictureUrl,
  migrateLegacyUser,
  parseThirdwebUserLinkedAccounts,
  transformUserProfileResponseFields,
} from "../utils/user";

export const usersRoutes =
  ({ db, env, client, getThirdwebUser }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Reply: ReadCurrentUserReply;
    }>(
      "/users/me",
      {
        schema: {
          summary: "Get user",
          description: "Get current user profile details",
          security: [{ authToken: [] }],
          response: {
            200: readCurrentUserReplySchema,
            404: notFoundReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          chain,
          authenticatedUserId: userId,
          authenticatedUserAddress: userAddress,
          authenticationError,
        } = req;
        if (!userId || !userAddress) {
          throw createUnauthorizedError("Unauthorized", {
            error: authenticationError,
          });
        }

        const [userResult, userSessionsResult] = await Promise.allSettled([
          db.user.findUnique({
            where: {
              id: userId,
            },
            select: {
              ...USER_SELECT_FIELDS,
              smartAccounts: {
                select: USER_SMART_ACCOUNT_SELECT_FIELDS,
              },
              profile: {
                select: USER_PROFILE_SELECT_FIELDS,
              },
              socialAccounts: {
                select: USER_SOCIAL_ACCOUNT_SELECT_FIELDS,
              },
              notificationSettings: {
                select: USER_NOTIFICATION_SETTINGS_SELECT_FIELDS,
              },
            },
          }),
          getUserSessions({
            client,
            chain,
            address: userAddress,
          }),
        ]);

        const user =
          userResult.status === "fulfilled" ? userResult.value : undefined;
        const userSessions =
          userSessionsResult.status === "fulfilled"
            ? userSessionsResult.value
            : [];

        if (!user || !user.profile) {
          throw createUserNotFoundError();
        }

        const userSmartAccount =
          user.smartAccounts.find(
            (smartAccount) => smartAccount.chainId === chain.id,
          ) ?? user.smartAccounts[0];
        const thirdwebUser = userSmartAccount
          ? await getThirdwebUser({
              ecosystemWalletAddress: userSmartAccount.ecosystemWalletAddress,
            })
          : null;
        const { profile, ...restUser } = user;
        reply.send({
          ...restUser,
          ...profile,
          ...transformUserProfileResponseFields(profile),
          ...parseThirdwebUserLinkedAccounts(thirdwebUser),
          address: userSmartAccount?.address ?? ZERO_ADDRESS, // fallback added for TypeScript, should not reach
          sessions: userSessions.map((session) => ({
            ...session,
            approvedTargets: session.approvedTargets.map((target) =>
              target.toLowerCase(),
            ),
            nativeTokenLimitPerTransaction:
              session.nativeTokenLimitPerTransaction.toString(),
            startTimestamp: session.startTimestamp.toString(),
            endTimestamp: session.endTimestamp.toString(),
          })),
        });
      },
    );

    app.put<{
      Body: UpdateCurrentUserBody;
      Reply: UpdateCurrentUserReply;
    }>(
      "/users/me",
      {
        schema: {
          summary: "Update user",
          description: "Update current user profile details",
          security: [{ authToken: [] }],
          body: updateCurrentUserBodySchema,
          response: {
            200: updateCurrentUserReplySchema,
            404: notFoundReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          authenticatedUserId: userId,
          authenticatedUserAddress: userAddress,
          authenticationError,
        } = req;
        if (!userId || !userAddress) {
          throw createUnauthorizedError("Unauthorized", {
            error: authenticationError,
          });
        }

        const {
          emailSecurityPhrase,
          featuredNftIds,
          featuredBadgeIds,
          highlyFeaturedBadgeId,
          about,
          pfpData,
          bannerData,
          showMagicBalance,
          showEthBalance,
          showGemsBalance,
        } = req.body;

        const [pfp, banner] = await Promise.all([
          pfpData
            ? await createUserProfilePictureUrl({
                userAddress,
                pfpData,
                inventoryApiUrl: env.TROVE_API_URL,
                inventoryApiKey: env.TROVE_API_KEY,
              })
            : pfpData,
          bannerData
            ? await createUserProfileBannerUrl({
                userAddress,
                bannerData,
                inventoryApiUrl: env.TROVE_API_URL,
                inventoryApiKey: env.TROVE_API_KEY,
              })
            : bannerData,
        ]);
        const emailSecurityPhraseUpdatedAt =
          typeof emailSecurityPhrase !== "undefined" ? new Date() : undefined;

        const [updatedProfile, socialAccounts, notificationSettings] =
          await Promise.all([
            db.userProfile.update({
              where: { userId },
              data: {
                emailSecurityPhrase,
                emailSecurityPhraseUpdatedAt,
                featuredNftIds,
                featuredBadgeIds,
                highlyFeaturedBadgeId,
                about,
                pfp,
                banner,
                showMagicBalance,
                showEthBalance,
                showGemsBalance,
              },
              select: USER_PROFILE_SELECT_FIELDS,
            }),
            db.userSocialAccount.findMany({
              where: {
                userId,
              },
              select: USER_SOCIAL_ACCOUNT_SELECT_FIELDS,
            }),
            db.userNotificationSettings.findMany({
              where: {
                userId,
              },
              select: USER_NOTIFICATION_SETTINGS_SELECT_FIELDS,
            }),
          ]);

        reply.send({
          ...updatedProfile,
          ...transformUserProfileResponseFields(updatedProfile),
          socialAccounts,
          notificationSettings,
        });
      },
    );

    app.post<{
      Body: UpdateCurrentUserMigrationBody;
      Reply: UpdateCurrentUserMigrationReply;
    }>(
      "/users/me/migrate",
      {
        schema: {
          summary: "Migrate user profile",
          description: "Migrate user profile from legacy data",
          body: updateCurrentUserMigrationBodySchema,
          response: {
            200: updateCurrentUserMigrationReplySchema,
            404: notFoundReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          authenticatedUserId: userId,
          authenticatedUserAddress: userAddress,
          authenticationError,
          chain,
          body: { id: legacyProfileId, rejected = false },
        } = req;
        if (!userId || !userAddress || !env.USER_MIGRATION_ENABLED) {
          throw createUnauthorizedError("Unauthorized", {
            error: authenticationError,
          });
        }

        const userSmartAccount = await db.userSmartAccount.findUnique({
          where: {
            chainId_address: {
              chainId: chain.id,
              address: userAddress,
            },
          },
          select: {
            ecosystemWalletAddress: true,
          },
        });

        const thirdwebUser = userSmartAccount
          ? await getThirdwebUser({
              ecosystemWalletAddress: userSmartAccount.ecosystemWalletAddress,
            })
          : null;

        const { emailAddresses, externalWalletAddresses } =
          parseThirdwebUserLinkedAccounts(thirdwebUser);

        const { canMigrate, profile, legacyProfile } =
          await checkCanMigrateLegacyUser({
            db,
            userId,
            emailAddresses,
            externalWalletAddresses,
            legacyProfileId,
          });
        if (!canMigrate || !profile || !legacyProfile) {
          // User selected an unlinked profile and cannot migrate
          throw new TdkError({
            name: TDK_ERROR_NAMES.UserError,
            code: TDK_ERROR_CODES.USER_FORBIDDEN,
            statusCode: 403,
            message: "Forbidden",
          });
        }

        if (rejected) {
          const [profile, socialAccounts, notificationSettings] =
            await Promise.all([
              db.userProfile.upsert({
                where: { userId },
                update: {},
                create: { userId, email: legacyProfile.email },
                select: USER_PROFILE_SELECT_FIELDS,
              }),
              db.userSocialAccount.findMany({
                where: {
                  userId,
                },
                select: USER_SOCIAL_ACCOUNT_SELECT_FIELDS,
              }),
              db.userNotificationSettings.findMany({
                where: {
                  userId,
                },
                select: USER_NOTIFICATION_SETTINGS_SELECT_FIELDS,
              }),
            ]);
          reply.send({
            ...profile,
            ...transformUserProfileResponseFields(profile),
            socialAccounts,
            notificationSettings,
          });
        } else {
          const {
            updatedProfile,
            updatedSocialAccounts,
            updatedNotificationSettings,
          } = await migrateLegacyUser({
            db,
            userId,
            userProfileId: profile?.id ?? undefined,
            legacyProfile,
          });
          reply.send({
            ...updatedProfile,
            ...transformUserProfileResponseFields(updatedProfile),
            socialAccounts: updatedSocialAccounts,
            notificationSettings: updatedNotificationSettings,
          });
        }
      },
    );

    app.get<{
      Querystring: ReadCurrentUserSessionsQuerystring;
      Reply: ReadCurrentUserSessionsReply;
    }>(
      "/users/me/sessions",
      {
        schema: {
          summary: "Get user sessions",
          description: "Get current user's on-chain sessions",
          security: [{ authToken: [] }],
          querystring: readCurrentUserSessionsQuerystringSchema,
          response: {
            200: readCurrentUserSessionsReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          chain,
          authenticatedUserAddress: userAddress,
          authenticationError,
        } = req;
        if (!userAddress) {
          throw createUnauthorizedError("Unauthorized", {
            error: authenticationError,
          });
        }

        const sessions = await getUserSessions({
          client,
          chain,
          address: userAddress,
        });

        reply.send(
          sessions.map((session) => ({
            ...session,
            approvedTargets: session.approvedTargets.map((target) =>
              target.toLowerCase(),
            ),
            nativeTokenLimitPerTransaction:
              session.nativeTokenLimitPerTransaction.toString(),
            startTimestamp: session.startTimestamp.toString(),
            endTimestamp: session.endTimestamp.toString(),
          })),
        );
      },
    );

    app.get<{
      Params: ReadUserPublicProfileParams;
      Reply: ReadUserPublicProfileReply;
    }>(
      "/users/:id",
      {
        schema: {
          summary: "Get user profile",
          description: "Get user's public profile details",
          response: {
            200: readUserPublicProfileReplySchema,
            404: notFoundReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { id: userId } = req.params;
        const [publicProfile, publicSocialAccounts] = await Promise.all([
          db.userProfile.findUnique({
            where: {
              userId,
            },
            select: USER_PUBLIC_PROFILE_SELECT_FIELDS,
          }),
          db.userSocialAccount.findMany({
            where: {
              userId,
              isPublic: true,
            },
            select: USER_SOCIAL_ACCOUNT_SELECT_FIELDS,
          }),
        ]);

        if (!publicProfile) {
          throw createUserNotFoundError();
        }

        reply.send({
          ...publicProfile,
          ...transformUserProfileResponseFields(publicProfile),
          socialAccounts: publicSocialAccounts,
        });
      },
    );

    app.get<{
      Params: ReadUserTransactionsParams;
      Querystring: ReadUserTransactionsQuerystring;
      Reply: ReadUserTransactionsReply;
    }>(
      "/users/:id/transactions",
      {
        schema: {
          summary: "Get user transaction history",
          description: "Get user's Treasure Account transaction history",
          security: [{ authToken: [] }],
          querystring: readUserTransactionsQuerystringSchema,
          response: {
            200: readUserTransactionsReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { id: userId } = req.params;
        const {
          chainId,
          fromAddress,
          toAddress,
          page = 1,
          limit = 25,
        } = req.query;

        // Fetch user's smart account addresses if no from filter is provided
        const userSmartAccounts = fromAddress
          ? []
          : await db.userSmartAccount.findMany({
              where: {
                userId,
              },
            });

        const filter: Prisma.TransactionWhereInput = {
          chainId,
          fromAddress: fromAddress?.toLowerCase() ?? {
            in: userSmartAccounts.map((smartAccount) =>
              smartAccount.address.toLowerCase(),
            ),
          },
          toAddress,
        };

        const [total, transactions] = await db.$transaction([
          db.transaction.count({ where: filter }),
          db.transaction.findMany({
            where: filter,
            take: limit,
            skip: (page - 1) * limit,
            orderBy: {
              blockTimestamp: "desc",
            },
          }),
        ]);

        reply.send({
          results: transactions.map((transaction) => ({
            ...transaction,
            blockNumber: transaction.blockNumber.toString(),
            blockTimestamp: transaction.blockTimestamp.toISOString(),
            value: transaction.value?.toString() ?? "0",
          })),
          total,
        });
      },
    );
  };
