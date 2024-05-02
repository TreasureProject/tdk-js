import type { FastifyPluginAsync } from "fastify";

import "../middleware/chain";
import "../middleware/project";
import type { ReadContractBody, ReadContractReply } from "../schema";
import {
  type ErrorReply,
  readContractBodySchema,
  readContractReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { verifyAuth } from "../utils/auth";

export const contractsRoutes =
  ({ auth, engine }: TdkApiContext): FastifyPluginAsync =>
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
        const authResult = await verifyAuth(auth, req);
        if (!authResult.valid) {
          console.error(
            "Error authenticating user for contract read:",
            authResult.error,
          );
          return reply
            .code(401)
            .send({ error: `Unauthorized: ${authResult.error}` });
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
          console.error("Error reading contract:", err);
          if (err instanceof Error) {
            reply.code(500).send({ error: err.message });
          }
        }
      },
    );
  };
