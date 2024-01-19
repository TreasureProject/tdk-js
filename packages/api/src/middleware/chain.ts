import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    chainId: number;
  }
}

export const withChain = async (app: FastifyInstance) => {
  app.decorateRequest("chainId", null);
  app.addHook("onRequest", async (req) => {
    let chainId: number | undefined;

    if (typeof req.headers["x-chain-id"] === "string") {
      chainId = Number(req.headers["x-chain-id"]);
    }

    req.chainId = chainId ?? 42161;
  });
};
