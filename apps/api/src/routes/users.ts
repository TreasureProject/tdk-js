import { getAllActiveSigners } from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/chain";
import "../middleware/swagger";
import {
  type ErrorReply,
  type ReadCurrentUserReply,
  readCurrentUserReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { verifyAuth } from "../utils/auth";

export const usersRoutes =
  ({ db, auth, wagmiConfig }: TdkApiContext): FastifyPluginAsync =>
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
        const authResult = await verifyAuth(auth, req);
        if (!authResult.valid) {
          console.error(
            "Error authenticating user for user details read:",
            authResult.error,
          );
          return reply
            .code(401)
            .send({ error: `Unauthorized: ${authResult.error}` });
        }

        const smartAccountAddress = authResult.parsedJWT.sub;

        const [dbUser, allActiveSigners] = await Promise.all([
          db.user.findUnique({
            where: { smartAccountAddress },
            select: { id: true, smartAccountAddress: true, email: true },
          }),
          getAllActiveSigners({
            chainId: req.chainId,
            address: smartAccountAddress,
            wagmiConfig,
          }),
        ]);

        if (!dbUser) {
          return reply.code(401).send({ error: "Unauthorized" });
        }

        return {
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
        };
      },
    );
  };
