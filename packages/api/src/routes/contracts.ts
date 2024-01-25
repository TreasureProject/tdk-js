import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { getUser } from "../middleware/auth";
import "../middleware/chain";
import "../middleware/project";
import { engine } from "../utils/engine";
import { type ErrorReply, baseReplySchema } from "../utils/schema";

const writeContractParamsSchema = Type.Object({
  address: Type.String(),
});

const writeContractBodySchema = Type.Object({
  functionName: Type.String(),
  args: Type.Any(),
});

const writeContractReplySchema = Type.Object({
  queueId: Type.String(),
});

export type WriteContractParams = Static<typeof writeContractParamsSchema>;
export type WriteContractBody = Static<typeof writeContractBodySchema>;
export type WriteContractReply =
  | Static<typeof writeContractReplySchema>
  | ErrorReply;

export const contractsRoutes: FastifyPluginAsync = async (app) => {
  app.post<{
    Params: WriteContractParams;
    Body: WriteContractBody;
    Reply: WriteContractReply;
  }>(
    "/contracts/:address",
    {
      schema: {
        response: {
          ...baseReplySchema,
          200: writeContractReplySchema,
        },
      },
    },
    async (req, reply) => {
      const user = await getUser(req);
      if (!user) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      const {
        chainId,
        backendWallet,
        params: { address },
        body,
      } = req;
      try {
        const { result } = await engine.contract.write(
          chainId.toString(),
          address,
          backendWallet,
          body,
          user.address,
        );
        reply.send(result);
      } catch (err) {
        console.error("Contract write error:", err);
        if (err instanceof Error) {
          reply.code(500).send({ error: err.message });
        }
      }
    },
  );
};
