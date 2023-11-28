import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { getUser } from "../middleware/auth";
import { db } from "../utils/db";
import {
  type ErrorReply,
  baseReplySchema,
  nullableStringSchema,
} from "../utils/schema";

const updateUserBodySchema = Type.Object({
  email: Type.Optional(Type.String()),
});

const updateUserReplySchema = Type.Object({
  email: nullableStringSchema,
  treasureTag: nullableStringSchema,
});

export type UpdateUserBody = Static<typeof updateUserBodySchema>;
export type UpdateUserReply = Static<typeof updateUserReplySchema>;

export const usersRoutes: FastifyPluginAsync = async (app) => {
  app.post<{
    Body: UpdateUserBody;
    Reply: UpdateUserReply | ErrorReply;
  }>(
    "/users/me",
    {
      schema: {
        response: {
          ...baseReplySchema,
          200: updateUserReplySchema,
        },
      },
    },
    async (req, reply) => {
      const authUser = await getUser(req);
      if (!authUser) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      const user = await db.user.update({
        where: {
          smartAccountAddress: authUser.address,
        },
        data: {
          email: req.body.email,
        },
        select: {
          email: true,
          treasureTag: true,
        },
      });
      reply.send(user);
    },
  );
};
