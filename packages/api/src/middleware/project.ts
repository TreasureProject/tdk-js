import type { FastifyInstance } from "fastify";

import { db } from "../utils/db";
import { env } from "../utils/env";

declare module "fastify" {
  interface FastifyRequest {
    backendWallet: string;
  }
}

export const withProject = async (app: FastifyInstance) => {
  app.decorateRequest("backendWallet", null);
  app.addHook("onRequest", async (req) => {
    let backendWallet: string | undefined;

    if (typeof req.headers["x-project-id"] === "string") {
      const project = await db.project.findUnique({
        where: { slug: req.headers["x-project-id"] },
        select: { backendWallet: true },
      });

      if (project && project.backendWallet) {
        backendWallet = project.backendWallet;
      }
    }

    req.backendWallet = backendWallet || env.DEFAULT_BACKEND_WALLET;
  });
};
