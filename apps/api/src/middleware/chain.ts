import * as Sentry from "@sentry/node";
import { DEFAULT_TDK_CHAIN_ID } from "@treasure-dev/tdk-core";
import { type Chain, defineChain } from "thirdweb";

import type { App } from "../utils/app";

declare module "fastify" {
  interface FastifyRequest {
    chain: Chain;
  }
}

export const withChain = (app: App) => {
  app.decorateRequest("chain");
  app.decorateRequest("chainId");
  app.addHook("onRequest", async (req) => {
    const chainId =
      typeof req.headers["x-chain-id"] === "string"
        ? Number(req.headers["x-chain-id"])
        : DEFAULT_TDK_CHAIN_ID;
    req.chain = defineChain(chainId);
    Sentry.setContext("chain", { chainId });
  });
};
