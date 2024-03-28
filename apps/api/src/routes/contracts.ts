import type { FastifyPluginAsync } from "fastify";

import { getUser } from "../middleware/auth";
import "../middleware/chain";
import "../middleware/project";
import type { ReadContractBody, ReadContractReply } from "../schema";
import {
  type ErrorReply,
  readContractBodySchema,
  readContractReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";

export const contractsRoutes =
  ({ engine }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.post<{
      Body: ReadContractBody;
      Reply: ReadContractReply | ErrorReply;
    }>(
      "/contracts/read",
      {
        schema: {
          body: readContractBodySchema,
          response: {
            200: readContractReplySchema,
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
          body: { address, functionName, args },
        } = req;
        try {
          const { result } = await engine.contract.read(
            functionName,
            chainId.toString(),
            address,
            args,
          );
          reply.send({ result });
        } catch (err) {
          console.error("Contract read error:", err);
          if (err instanceof Error) {
            reply.code(500).send({ error: err.message });
          }
        }
      },
    );
  };
