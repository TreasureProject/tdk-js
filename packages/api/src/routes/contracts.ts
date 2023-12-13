import type { FastifyPluginAsync } from "fastify";

import { getUser } from "../middleware/auth";
import "../middleware/chain";
import "../middleware/project";
import { engine } from "../utils/engine";

export const contractsRoutes: FastifyPluginAsync = async (app) => {
  app.post<{
    Params: {
      address: string;
    };
    Body: {
      functionName: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      args: any[];
    };
  }>("/contracts/:address", async (req, reply) => {
    const user = await getUser(req);
    if (!user) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    try {
      const { result } = await engine.contract.write(
        req.chainId.toString(),
        req.params.address,
        req.backendWallet,
        req.body,
        user.address,
      );
      reply.send(result);
    } catch (err) {
      console.error("Contract write error:", err);
      if (err instanceof Error) {
        reply.code(500).send({ error: err.message });
      }
    }
  });
};
