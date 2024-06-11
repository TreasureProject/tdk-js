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
  readCurrentUserReplySchema,
  readCurrentUserSessionsReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { TdkError } from "../utils/error";

export const usersRoutes =
  ({ db, wagmiConfig }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Reply: ReadCurrentUserReply | ErrorReply;
    }>(
      "/users/me",
      {
        schema: {
          summary: "Get current user",
          description: "Get current user profile details and on-chain sessions",
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
            code: "TDK_UNAUTHORIZED",
            message: "Unauthorized",
            data: { authError },
          });
        }

        const [dbUser, allActiveSigners] = await Promise.all([
          db.user.findUnique({
            where: { smartAccountAddress: userAddress },
            select: { id: true, smartAccountAddress: true, email: true },
          }),
          getAllActiveSigners({
            chainId,
            address: userAddress,
            wagmiConfig,
          }),
        ]);

        if (!dbUser) {
          throw new TdkError({
            code: "TDK_NOT_FOUND",
            message: "User not found",
            data: { userAddress },
          });
        }

        reply.send({
          ...dbUser,
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

    app.get<{
      Querystring: ReadCurrentUserSessionsQuerystring;
      Reply: ReadCurrentUserSessionsReply | ErrorReply;
    }>(
      "/users/me/sessions",
      {
        schema: {
          summary: "Get current user's on-chain sessions'",
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
            code: "TDK_UNAUTHORIZED",
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
