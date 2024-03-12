import type { FastifyPluginAsync } from "fastify";

import "../middleware/chain";
import {
  type ReadProjectParams,
  type ReadProjectReply,
  readProjectReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";

export const projectsRoutes =
  ({ env, db }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Params: ReadProjectParams;
      Reply: ReadProjectReply;
    }>(
      "/projects/:slug",
      {
        schema: {
          response: {
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
            customAuth: true,
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
