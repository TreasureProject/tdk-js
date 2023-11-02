import type { FastifyPluginAsync } from "fastify";

import { baseReplySchema } from "../schemas/common";
import { readProjectReplySchema } from "../schemas/projects";
import type { ReadProjectParams, ReadProjectReply } from "../types";
import { db } from "../utils/db";

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
    async (request, reply) => {
      const { slug } = request.params;
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
