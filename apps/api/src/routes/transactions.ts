import type { FastifyPluginAsync } from "fastify";

import { getUser } from "../middleware/auth";
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

export const transactionsRoutes =
  ({ engine }: TdkApiContext): FastifyPluginAsync =>
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
        const user = await getUser(req);
        if (!user) {
          return reply.code(401).send({ error: "Unauthorized" });
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
