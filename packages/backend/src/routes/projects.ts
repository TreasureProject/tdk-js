import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { db } from "../utils/db";
import { baseReplySchema, nullStringSchemaType } from "../utils/schema";

const ReadProjectParamsSchema = Type.Object({
  slug: Type.String(),
});
const ReadProjectReplySchema = Type.Object({
  slug: Type.String(),
  name: Type.String(),
  icon: nullStringSchemaType,
  cover: nullStringSchemaType,
  color: nullStringSchemaType,
});

export const projectsRoutes: FastifyPluginAsync = async (app) => {
  app.get<{
    Params: Static<typeof ReadProjectParamsSchema>;
    Reply: Static<typeof ReadProjectReplySchema>;
  }>(
    "/projects/:slug",
    {
      schema: {
        response: {
          ...baseReplySchema,
          200: ReadProjectReplySchema,
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const project = await db.project.findUniqueOrThrow({
        where: { slug },
        select: {
          slug: true,
          name: true,
          icon: true,
          cover: true,
          color: true,
        },
      });
      reply.send(project);
    },
  );
};
