import type { FastifyInstance } from "fastify";

import type { TdkApiContext } from "../types";
import "./chain";

declare module "fastify" {
  interface FastifyRequest {
    projectId: string;
    backendWallet: string;
  }
}

export const withProject = async (
  app: FastifyInstance,
  { env, db }: TdkApiContext,
) => {
  app.decorateRequest("backendWallet", null);
  app.addHook("onRequest", async (req) => {
    const projectId = req.headers["x-project-id"];

    if (typeof projectId === "string") {
      const project = await db.project.findUnique({
        where: {
          slug: projectId,
        },
        select: {
          backendWallets: {
            where: {
              chainId: req.chainId,
            },
            select: {
              address: true,
            },
          },
        },
      });

      if (project) {
        req.projectId = projectId;
        if (project.backendWallets.length > 0) {
          req.backendWallet = project.backendWallets[0].address;
        }
      }
    }

    if (!req.backendWallet) {
      req.backendWallet = env.DEFAULT_BACKEND_WALLET;
    }
  });
};
