import type { FastifyPluginAsync } from "fastify";

import {
  type ErrorReply,
  type ReadCurrentUserReply,
  readCurrentUserReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";

export const usersRoutes =
  ({ db, auth }: TdkApiContext): FastifyPluginAsync =>
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
        const authResult = await auth.verifyJWT({
          jwt: req.headers.authorization ?? "",
        });
        if (!authResult.valid) {
          console.error(
            "Error authenticating user for user details read:",
            authResult.error,
          );
          return reply
            .code(401)
            .send({ error: `Unauthorized: ${authResult.error}` });
        }

        const dbUser = await db.user.findUnique({
          where: { smartAccountAddress: authResult.parsedJWT.sub },
          select: { id: true, smartAccountAddress: true, email: true },
        });
        if (!dbUser) {
          return reply.code(401).send({ error: "Unauthorized" });
        }

        return dbUser;
      },
    );
  };
