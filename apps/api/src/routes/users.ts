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
  type UpdateCurrentUserBody,
  type UpdateCurrentUserReply,
  readCurrentUserReplySchema,
  readCurrentUserSessionsReplySchema,
  updateCurrentUserReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { USER_PROFILE_SELECT_FIELDS, USER_SELECT_FIELDS } from "../utils/db";
import { TDK_ERROR_CODES, TDK_ERROR_NAMES, TdkError } from "../utils/error";

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
          },
        },
      },
      async (req, reply) => {
        const { chainId, userAddress, authError } = req;
        if (!userAddress) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.AuthError,
            code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
            message: "Unauthorized",
            data: { authError },
          });
        }

        const [user, allActiveSigners] = await Promise.all([
          db.user.findUnique({
            where: { address: userAddress },
            select: USER_SELECT_FIELDS,
          }),
          getAllActiveSigners({
            chainId,
            address: userAddress,
            wagmiConfig,
          }),
        ]);

        if (!user) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.UserError,
            code: TDK_ERROR_CODES.USER_NOT_FOUND,
            message: "User not found",
          });
        }

        const profile = await db.userProfile.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
          select: USER_PROFILE_SELECT_FIELDS,
        });

        reply.send({
          ...user,
          ...profile,
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
          response: {
            200: updateCurrentUserReplySchema,
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

        const user = await db.user.findUnique({
          where: { address: userAddress },
          select: USER_SELECT_FIELDS,
        });

        if (!user) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.UserError,
            code: TDK_ERROR_CODES.USER_NOT_FOUND,
            message: "User not found",
          });
        }

        const profile = await db.userProfile.upsert({
          where: { userId: user.id },
          update: req.body,
          create: { userId: user.id },
          select: USER_PROFILE_SELECT_FIELDS,
        });

        reply.send({
          ...user,
          ...profile,
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
  };
