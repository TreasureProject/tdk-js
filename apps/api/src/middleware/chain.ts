import * as Sentry from "@sentry/node";
import {
  DEFAULT_TDK_CHAIN_ID,
  SUPPORTED_CHAIN_IDS,
  type SupportedChainId,
} from "@treasure-dev/tdk-core";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    chainId: SupportedChainId;
  }
}

export const withChain = async (app: FastifyInstance) => {
  app.decorateRequest("chainId", null);
  app.addHook("onRequest", async (req) => {
    let chainId: number | undefined;

    if (typeof req.headers["x-chain-id"] === "string") {
      chainId = Number(req.headers["x-chain-id"]);
    }

    req.chainId =
      chainId && (SUPPORTED_CHAIN_IDS as number[]).includes(chainId)
        ? (chainId as SupportedChainId)
        : DEFAULT_TDK_CHAIN_ID;

    Sentry.setContext("chain", { chainId: req.chainId });
  });
};
