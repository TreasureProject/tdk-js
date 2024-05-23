import { getAllActiveSigners } from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/auth";
import "../middleware/chain";
import "../middleware/swagger";
import {
  type ErrorReply,
  type ReadCurrentUserReply,
  readCurrentUserReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";

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
          console.error(
            "Error authenticating user for user details read:",
            authError,
          );
          return reply.code(401).send({ error: `Unauthorized: ${authError}` });
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
          return reply.code(401).send({ error: "Unauthorized" });
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
  };
