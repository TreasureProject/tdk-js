import type { FastifyInstance } from "fastify";

import { db } from "../utils/db";
import { env } from "../utils/env";
import "./chain";

declare module "fastify" {
  interface FastifyRequest {
    backendWallet: string;
  }
}

export const withProject = async (app: FastifyInstance) => {
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
      if (project && project.backendWallets.length > 0) {
        req.backendWallet = project.backendWallets[0].address;
      }
    }

    if (!req.backendWallet) {
      req.backendWallet = env.DEFAULT_BACKEND_WALLET;
    }
  });
};
