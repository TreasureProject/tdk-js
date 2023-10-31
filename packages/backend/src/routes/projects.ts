import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import type { ReadProjectReply } from "../types";
import { db } from "../utils/db";

export const User = Type.Object({
  name: Type.String(),
  mail: Type.Optional(Type.String({ format: "email" })),
});

export type UserType = Static<typeof User>;

export const projectsRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { slug: string }; Reply: ReadProjectReply }>(
    "/projects/:slug",
    async (request, reply) => {
      const { slug } = request.params;
      const project = await db.project.findUnique({
        where: { slug },
        select: {
          slug: true,
          name: true,
          icon: true,
          cover: true,
          color: true,
        },
      });
      if (!project) {
        return reply.code(404).send({ error: "Project not found" });
      }

      reply.send(project);
    },
  );
};
