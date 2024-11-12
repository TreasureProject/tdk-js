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
  throwUnauthorizedError,
  throwUserNotFoundError,
} from "../utils/error";
import { transformUserProfileResponseFields } from "../utils/user";

export const usersRoutes =
  ({ db, client }: TdkApiContext): FastifyPluginAsync =>
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
        const { chain, userId, userAddress, authError } = req;
        if (!userId || !userAddress) {
          throwUnauthorizedError(authError);
          return;
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
          throwUserNotFoundError();
          return;
        }

        const sessions = userSessions.map((session) => ({
          ...session,
          approvedTargets: session.approvedTargets.map((target) =>
            target.toLowerCase(),
          ),
          nativeTokenLimitPerTransaction:
            session.nativeTokenLimitPerTransaction.toString(),
          startTimestamp: session.startTimestamp.toString(),
          endTimestamp: session.endTimestamp.toString(),
        }));
        const { profile, ...restUser } = user;
        reply.send({
          ...restUser,
          ...profile,
          ...transformUserProfileResponseFields(profile),
          address:
            restUser.smartAccounts.find(
              (smartAccount) => smartAccount.chainId === chain.id,
            )?.address ??
            restUser.smartAccounts[0]?.address ??
            ZERO_ADDRESS, // added for TypeScript, should not reach
          sessions,
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
        const { userId, authError } = req;
        if (!userId) {
          throwUnauthorizedError(authError);
          return;
        }

        const {
          emailSecurityPhrase,
          featuredNftIds,
          featuredBadgeIds,
          highlyFeaturedBadgeId,
          about,
          pfp,
          banner,
          showMagicBalance,
          showEthBalance,
          showGemsBalance,
        } = req.body;

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
          response: {
            200: updateCurrentUserMigrationReplySchema,
            404: notFoundReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { userId, authError } = req;
        if (!userId) {
          throwUnauthorizedError(authError);
          return;
        }

        const [user, profile, legacyProfile] = await Promise.all([
          db.user.findUnique({
            where: {
              id: userId,
            },
            select: {
              smartAccounts: {
                select: {
                  initialEmail: true,
                  initialWalletAddress: true,
                },
              },
            },
          }),
          db.userProfile.findUnique({ where: { userId } }),
          db.userProfile.findUnique({
            where: {
              id: req.body.id,
            },
          }),
        ]);

        if (!user || !legacyProfile) {
          throwUserNotFoundError();
          return;
        }

        let canMigrate = false;

        // Check if the current user is linked to this legacy profile via wallet address
        if (legacyProfile.legacyAddress) {
          const walletAddresses = user.smartAccounts
            .map((smartAccount) =>
              smartAccount.initialWalletAddress.toLowerCase(),
            )
            .filter((walletAddress) => Boolean(walletAddress));
          canMigrate = walletAddresses.includes(
            legacyProfile.legacyAddress.toLowerCase(),
          );
        }

        // Check if the current user is linked to this legacy profile via email address
        if (
          !canMigrate &&
          legacyProfile.legacyEmail &&
          legacyProfile.legacyEmailVerifiedAt
        ) {
          const emailAddresses = user.smartAccounts
            .map((smartAccount) => smartAccount.initialEmail?.toLowerCase())
            .filter((emailAddress) => Boolean(emailAddress)) as string[];
          canMigrate = emailAddresses.includes(
            legacyProfile.legacyEmail.toLowerCase(),
          );
        }

        if (!canMigrate) {
          // User selected an unlinked profile and cannot migrate
          throw new TdkError({
            name: TDK_ERROR_NAMES.UserError,
            code: TDK_ERROR_CODES.USER_FORBIDDEN,
            statusCode: 403,
            message: "Forbidden",
          });
        }

        await Promise.all([
          // Migrate social accounts
          db.userSocialAccount.updateMany({
            where: {
              userId,
              // Clear legacy profile data so migration is not triggered again
              legacyUserProfileId: legacyProfile.id,
            },
            data: {
              legacyUserProfileId: null,
            },
          }),
          // Migrate notification settings
          db.userNotificationSettings.updateMany({
            where: {
              userId,
              // Clear legacy profile data so migration is not triggered again
              legacyUserProfileId: legacyProfile.id,
            },
            data: {
              legacyUserProfileId: null,
            },
          }),
        ]);

        const [[, updatedSocialAccounts], [, updatedNotificationSettings]] =
          await Promise.all([
            db.$transaction([
              // Migrate social accounts
              db.userSocialAccount.updateMany({
                where: {
                  userId,
                  // Clear legacy profile data so migration is not triggered again
                  legacyUserProfileId: legacyProfile.id,
                },
                data: {
                  legacyUserProfileId: null,
                },
              }),
              db.userSocialAccount.findMany({
                where: {
                  userId,
                },
                select: USER_SOCIAL_ACCOUNT_SELECT_FIELDS,
              }),
            ]),
            db.$transaction([
              // Migrate notification settings
              db.userNotificationSettings.updateMany({
                where: {
                  userId,
                  // Clear legacy profile data so migration is not triggered again
                  legacyUserProfileId: legacyProfile.id,
                },
                data: {
                  legacyUserProfileId: null,
                },
              }),
              db.userNotificationSettings.findMany({
                where: {
                  userId,
                },
                select: USER_NOTIFICATION_SETTINGS_SELECT_FIELDS,
              }),
            ]),
          ]);

        let updatedProfile: Pick<
          Prisma.$UserProfilePayload["scalars"],
          keyof typeof USER_PROFILE_SELECT_FIELDS
        >;

        // Merge data if user has existing profile or connect legacy profile if not
        if (profile) {
          const [updateResult] = await db.$transaction([
            db.userProfile.update({
              where: {
                id: profile.id,
              },
              data: {
                tag: legacyProfile.tag ?? undefined,
                discriminant: legacyProfile.discriminant ?? undefined,
                emailSecurityPhrase:
                  legacyProfile.emailSecurityPhrase ?? undefined,
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

        reply.send({
          ...updatedProfile,
          ...transformUserProfileResponseFields(updatedProfile),
          socialAccounts: updatedSocialAccounts,
          notificationSettings: updatedNotificationSettings,
        });
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
        const { chain, userAddress, authError } = req;
        if (!userAddress) {
          throwUnauthorizedError(authError);
          return;
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
          throwUserNotFoundError();
          return;
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
