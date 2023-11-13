import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { db } from "../utils/db";
import { env } from "../utils/env";
import { baseReplySchema, nullableStringSchema } from "../utils/schema";

const readProjectParamsSchema = Type.Object({
  slug: Type.String(),
});

const readProjectReplySchema = Type.Object({
  slug: Type.String(),
  name: Type.String(),
  backendWallet: Type.String(),
  redirectUris: Type.Array(Type.String()),
  icon: nullableStringSchema,
  cover: nullableStringSchema,
  color: nullableStringSchema,
});

export type ReadProjectParams = Static<typeof readProjectParamsSchema>;
export type ReadProjectReply = Static<typeof readProjectReplySchema>;

export const projectsRoutes: FastifyPluginAsync = async (app) => {
  app.get<{
    Params: ReadProjectParams;
    Reply: ReadProjectReply;
  }>(
    "/projects/:slug",
    {
      schema: {
        response: {
          ...baseReplySchema,
          200: readProjectReplySchema,
        },
      },
    },
    async ({ params: { slug } }, reply) => {
      const project = await db.project.findUniqueOrThrow({
        where: { slug },
        select: {
          slug: true,
          name: true,
          backendWallet: true,
          redirectUris: true,
          icon: true,
          cover: true,
          color: true,
        },
      });
      reply.send({
        ...project,
        backendWallet: project.backendWallet || env.DEFAULT_BACKEND_WALLET,
      });
    },
  );
};
