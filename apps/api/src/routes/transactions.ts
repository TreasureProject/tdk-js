import type { FastifyPluginAsync } from "fastify";

import "../middleware/chain";
import "../middleware/project";
import {
  type CreateTransactionBody,
  type CreateTransactionReply,
  type ErrorReply,
  type ReadTransactionParams,
  type ReadTransactionReply,
  createTransactionBodySchema,
  createTransactionReplySchema,
  readTransactionReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { verifyAuth } from "../utils/auth";

export const transactionsRoutes =
  ({ auth, engine }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.post<{
      Body: CreateTransactionBody;
      Reply: CreateTransactionReply | ErrorReply;
    }>(
      "/transactions",
      {
        schema: {
          body: createTransactionBodySchema,
          response: {
            200: createTransactionReplySchema,
          },
        },
      },
      async (req, reply) => {
        const authResult = await verifyAuth(auth, req);
        if (!authResult.valid) {
          console.error(
            "Error authenticating user for transaction create:",
            authResult.error,
          );
          return reply
            .code(401)
            .send({ error: `Unauthorized: ${authResult.error}` });
        }

        const { chainId, backendWallet, body: postBody } = req;
        const { address, ...body } = postBody;
        try {
          const { result } = await engine.contract.write(
            chainId.toString(),
            address,
            backendWallet,
            body,
            false,
            authResult.parsedJWT.sub,
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

    app.get<{
      Params: ReadTransactionParams;
      Reply: ReadTransactionReply | ErrorReply;
    }>(
      "/transactions/:queueId",
      {
        schema: {
          response: {
            200: readTransactionReplySchema,
          },
        },
      },
      async (req, reply) => {
        try {
          const data = await engine.transaction.status(req.params.queueId);
          reply.send(data.result);
        } catch (err) {
          console.error("Transaction status error:", err);
          if (err instanceof Error) {
            reply.code(500).send({ error: err.message });
          }
        }
      },
    );
  };
