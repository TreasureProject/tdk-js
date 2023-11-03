import { getTreasureContractAddress } from "@treasure/tdk-core";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    chainId: number;
    accountFactory: string;
  }
}

export const withChain = async (app: FastifyInstance) => {
  app.decorateRequest("chainId", null);
  app.decorateRequest("accountFactory", null);
  app.addHook("onRequest", async (req) => {
    let chainId: number | undefined;

    if (typeof req.headers["x-chain-id"] === "string") {
      chainId = Number(req.headers["x-chain-id"]);
    }

    req.chainId = chainId ?? 42161;
    req.accountFactory = getTreasureContractAddress(
      req.chainId,
      "TreasureLoginAccountFactory",
    );
  });
};
