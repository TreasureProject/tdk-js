import type { Prisma } from "@prisma/client";
import { getUserSessions } from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";
import { ZERO_ADDRESS } from "thirdweb";

import "../middleware/auth";
import "../middleware/chain";
import "../middleware/swagger";
import {
  type ErrorReply,
  type ReadCurrentUserReply,
  type ReadCurrentUserSessionsQuerystring,
  type ReadCurrentUserSessionsReply,
  type ReadUserTransactionsParams,
  type ReadUserTransactionsQuerystring,
  type ReadUserTransactionsReply,
  type UpdateCurrentUserBody,
  type UpdateCurrentUserReply,
  notFoundReplySchema,
  readCurrentUserReplySchema,
  readCurrentUserSessionsQuerystringSchema,
  readCurrentUserSessionsReplySchema,
  readUserTransactionsQuerystringSchema,
  readUserTransactionsReplySchema,
  updateCurrentUserBodySchema,
  updateCurrentUserReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import {
  USER_PROFILE_SELECT_FIELDS,
  USER_SELECT_FIELDS,
  USER_SMART_ACCOUNT_SELECT_FIELDS,
} from "../utils/db";
import {
  TDK_ERROR_CODES,
  TDK_ERROR_NAMES,
  TdkError,
  throwUnauthorizedError,
} from "../utils/error";
import { transformUserProfileResponseFields } from "../utils/user";

export const usersRoutes =
  ({ db, client }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Reply: ReadCurrentUserReply | ErrorReply;
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
          throwUnauthorizedError(authError ?? "Unauthorized");
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
          throw new TdkError({
            name: TDK_ERROR_NAMES.UserError,
            code: TDK_ERROR_CODES.USER_NOT_FOUND,
            statusCode: 404,
            message: "User not found",
          });
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
      Reply: UpdateCurrentUserReply | ErrorReply;
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
        const { chain, userId, authError } = req;
        if (!userId) {
          throwUnauthorizedError(authError ?? "Unauthorized");
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

        const profile = await db.userProfile.update({
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
          select: {
            ...USER_PROFILE_SELECT_FIELDS,
            user: {
              select: USER_SELECT_FIELDS,
              include: {
                smartAccounts: {
                  select: USER_SMART_ACCOUNT_SELECT_FIELDS,
                },
              },
            },
          },
        });

        if (!profile.user) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.UserError,
            code: TDK_ERROR_CODES.USER_NOT_FOUND,
            statusCode: 404,
            message: "User not found",
          });
        }

        const { user, ...restProfile } = profile;
        reply.send({
          ...user,
          ...restProfile,
          ...transformUserProfileResponseFields(restProfile),
          address:
            user.smartAccounts.find(
              (smartAccount) => smartAccount.chainId === chain.id,
            )?.address ??
            user.smartAccounts[0]?.address ??
            ZERO_ADDRESS, // added for TypeScript, should not reach
        });
      },
    );

    app.get<{
      Querystring: ReadCurrentUserSessionsQuerystring;
      Reply: ReadCurrentUserSessionsReply | ErrorReply;
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
          throw new TdkError({
            name: TDK_ERROR_NAMES.AuthError,
            code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
            message: "Unauthorized",
            data: { authError },
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
      Params: ReadUserTransactionsParams;
      Querystring: ReadUserTransactionsQuerystring;
      Reply: ReadUserTransactionsReply | ErrorReply;
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
