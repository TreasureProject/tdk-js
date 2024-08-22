import * as Sentry from "@sentry/node";
import { DEFAULT_TDK_CHAIN_ID } from "@treasure-dev/tdk-core";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    chainId: number;
  }
}

export const withChain = async (app: FastifyInstance) => {
  app.decorateRequest("chainId", null);
  app.addHook("onRequest", async (req) => {
    req.chainId =
      typeof req.headers["x-chain-id"] === "string"
        ? Number(req.headers["x-chain-id"])
        : DEFAULT_TDK_CHAIN_ID;
    Sentry.setContext("chain", { chainId: req.chainId });
  });
};
