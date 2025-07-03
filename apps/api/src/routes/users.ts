import { getUserSessions } from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/auth";
import "../middleware/chain";
import "../middleware/swagger";
import { getContract } from "thirdweb";
import { isContractDeployed } from "thirdweb/utils";
import {
  type ReadCurrentUserReply,
  notFoundReplySchema,
  readCurrentUserReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { createUnauthorizedError } from "../utils/error";

export const usersRoutes =
  ({ client }: TdkApiContext): FastifyPluginAsync =>
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
          authenticatedUserAddress: userAddress,
          authenticationError,
        } = req;
        if (!userAddress) {
          throw createUnauthorizedError("Unauthorized", {
            error: authenticationError,
          });
        }

        const isSmartAccountDeployed = await isContractDeployed(
          getContract({
            client,
            chain,
            address: userAddress,
          }),
        );

        const userSessions = isSmartAccountDeployed
          ? await getUserSessions({
              client,
              chain,
              address: userAddress,
            })
          : [];

        reply.send({
          address: userAddress,
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
  };
