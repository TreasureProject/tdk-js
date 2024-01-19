import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/chain";
import { db } from "../utils/db";
import { env } from "../utils/env";
import { baseReplySchema, nullableStringSchema } from "../utils/schema";

const readProjectParamsSchema = Type.Object({
  slug: Type.String(),
});

const readProjectReplySchema = Type.Object({
  slug: Type.String(),
  name: Type.String(),
  backendWallets: Type.Array(Type.String()),
  callTargets: Type.Array(Type.String()),
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
    async ({ chainId, params: { slug } }, reply) => {
      const project = await db.project.findUniqueOrThrow({
        where: { slug },
        select: {
          slug: true,
          name: true,
          redirectUris: true,
          icon: true,
          cover: true,
          color: true,
          backendWallets: {
            where: {
              chainId,
            },
            select: {
              address: true,
            },
          },
          callTargets: {
            where: {
              chainId,
            },
            select: {
              address: true,
            },
          },
        },
      });
      const backendWallets = project.backendWallets.map(
        ({ address }) => address,
      );
      reply.send({
        ...project,
        backendWallets:
          backendWallets.length > 0
            ? backendWallets
            : [env.DEFAULT_BACKEND_WALLET],
        callTargets: project.callTargets.map(({ address }) => address),
      });
    },
  );
};
