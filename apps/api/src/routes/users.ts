import { getAllActiveSigners } from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";

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
import { USER_PROFILE_SELECT_FIELDS, USER_SELECT_FIELDS } from "../utils/db";
import { TDK_ERROR_CODES, TDK_ERROR_NAMES, TdkError } from "../utils/error";
import { transformUserProfileResponseFields } from "../utils/user";

export const usersRoutes =
  ({ db, wagmiConfig }: TdkApiContext): FastifyPluginAsync =>
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
        const { chainId, userId, userAddress, authError } = req;
        if (!userId || !userAddress) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.AuthError,
            code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
            message: "Unauthorized",
            data: { authError },
          });
        }

        const [profile, allActiveSigners] = await Promise.all([
          db.userProfile.upsert({
            where: { userId },
            update: {},
            create: { userId },
            select: {
              ...USER_PROFILE_SELECT_FIELDS,
              user: {
                select: USER_SELECT_FIELDS,
              },
            },
          }),
          getAllActiveSigners({
            chainId,
            address: userAddress,
            wagmiConfig,
          }),
        ]);

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
          smartAccountAddress: user.address,
          allActiveSigners: allActiveSigners.map((activeSigner) => ({
            ...activeSigner,
            approvedTargets: activeSigner.approvedTargets.map((target) =>
              target.toLowerCase(),
            ),
            nativeTokenLimitPerTransaction:
              activeSigner.nativeTokenLimitPerTransaction.toString(),
            startTimestamp: activeSigner.startTimestamp.toString(),
            endTimestamp: activeSigner.endTimestamp.toString(),
          })),
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
        const { userId, authError } = req;
        if (!userId) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.AuthError,
            code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
            message: "Unauthorized",
            data: { authError },
          });
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

        const profile = await db.userProfile.upsert({
          where: { userId },
          update: {
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
          create: { userId },
          select: {
            ...USER_PROFILE_SELECT_FIELDS,
            user: {
              select: USER_SELECT_FIELDS,
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
          smartAccountAddress: user.address,
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
        const { userAddress, authError } = req;
        if (!userAddress) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.AuthError,
            code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
            message: "Unauthorized",
            data: { authError },
          });
        }

        const allActiveSigners = await getAllActiveSigners({
          chainId: Number(req.query.chainId),
          address: userAddress,
          wagmiConfig,
        });

        reply.send(
          allActiveSigners.map((activeSigner) => ({
            ...activeSigner,
            approvedTargets: activeSigner.approvedTargets.map((target) =>
              target.toLowerCase(),
            ),
            nativeTokenLimitPerTransaction:
              activeSigner.nativeTokenLimitPerTransaction.toString(),
            startTimestamp: activeSigner.startTimestamp.toString(),
            endTimestamp: activeSigner.endTimestamp.toString(),
          })),
        );
      },
    );

    app.get<{
      Params: ReadUserTransactionsParams;
      Querystring: ReadUserTransactionsQuerystring;
      Reply: ReadUserTransactionsReply | ErrorReply;
    }>(
      "/users/:address/transactions",
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
        const { address } = req.params;
        const { chainId, toAddress, page = 1, limit = 25 } = req.query;

        const filter = {
          chainId,
          fromAddress: address,
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
