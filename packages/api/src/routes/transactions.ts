import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { getUser } from "../middleware/auth";
import "../middleware/chain";
import "../middleware/project";
import type { TdkApiContext } from "../types";
import {
  type ErrorReply,
  baseReplySchema,
  nullableStringSchema,
} from "../utils/schema";

const createTransactionBodySchema = Type.Object({
  address: Type.String(),
  functionName: Type.String(),
  args: Type.Any(),
});

const createTransactionReplySchema = Type.Object({
  queueId: Type.String(),
});

const readTransactionParamsSchema = Type.Object({
  queueId: Type.String(),
});

const readTransactionReplySchema = Type.Object({
  status: nullableStringSchema,
  transactionHash: nullableStringSchema,
  errorMessage: nullableStringSchema,
});

export type CreateTransactionBody = Static<typeof createTransactionBodySchema>;
export type CreateTransactionReply = Static<
  typeof createTransactionReplySchema
>;

export type ReadTransactionParams = Static<typeof readTransactionParamsSchema>;
export type ReadTransactionReply = Static<typeof readTransactionReplySchema>;

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
          response: {
            ...baseReplySchema,
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
            ...baseReplySchema,
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
