import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { getUser } from "../middleware/auth";
import type { TdkApiContext } from "../types";
import type { ErrorReply } from "../utils/schema";
import { nullableStringSchema } from "../utils/schema";

const readCurrentUserReplySchema = Type.Object({
  id: Type.String(),
  smartAccountAddress: Type.String(),
  email: nullableStringSchema,
});

export type ReadCurrentUserReply = Static<typeof readCurrentUserReplySchema>;

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
