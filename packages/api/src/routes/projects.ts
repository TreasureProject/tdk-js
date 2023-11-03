import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { db } from "../utils/db";
import { baseReplySchema, nullStringSchema } from "../utils/schema";

const readProjectParamsSchema = Type.Object({
  slug: Type.String(),
});

const readProjectReplySchema = Type.Object({
  slug: Type.String(),
  name: Type.String(),
  redirectUris: Type.Array(Type.String()),
  icon: nullStringSchema,
  cover: nullStringSchema,
  color: nullStringSchema,
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
          redirectUris: true,
          icon: true,
          cover: true,
          color: true,
        },
      });
      reply.send(project);
    },
  );
};