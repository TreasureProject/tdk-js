import type { FastifyPluginAsync } from "fastify";

import "../middleware/chain";
import "../middleware/swagger";
import {
  type ReadProjectParams,
  type ReadProjectReply,
  readProjectReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { TdkError } from "../utils/error";

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
          summary: "Get project details",
          description: "Get project details to power login experience",
          response: {
            200: readProjectReplySchema,
          },
        },
      },
      async ({ chainId, params: { slug } }, reply) => {
        const project = await db.project.findUnique({
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
        if (!project) {
          throw new TdkError({
            code: "TDK_NOT_FOUND",
            message: "Project not found",
            data: { slug },
          });
        }

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
