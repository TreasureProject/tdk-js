import type { FastifyPluginAsync } from "fastify";

import { getUser } from "../middleware/auth";
import {
  type ErrorReply,
  type ReadCurrentUserReply,
  readCurrentUserReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";

export const usersRoutes =
  ({ db }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Reply: ReadCurrentUserReply | ErrorReply;
    }>(
      "/users/me",
      {
        schema: {
          response: {
            200: readCurrentUserReplySchema,
          },
        },
      },
      async (req, reply) => {
        const user = await getUser(req);
        if (!user) {
          return reply.code(401).send({ error: "Unauthorized" });
        }

        const dbUser = await db.user.findUnique({
          where: { smartAccountAddress: user.address },
          select: { id: true, smartAccountAddress: true, email: true },
        });
        if (!dbUser) {
          return reply.code(401).send({ error: "Unauthorized" });
        }

        return dbUser;
      },
    );
  };
