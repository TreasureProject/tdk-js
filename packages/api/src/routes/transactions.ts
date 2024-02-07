import { type Static, Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import { getUser } from "../middleware/auth";
import type { TdkApiContext } from "../types";
import {
  type ErrorReply,
  baseReplySchema,
  nullableStringSchema,
} from "../utils/schema";

const readTransactionParamsSchema = Type.Object({
  queueId: Type.String(),
});

const readTransactionReplySchema = Type.Object({
  status: nullableStringSchema,
  transactionHash: nullableStringSchema,
  errorMessage: nullableStringSchema,
});

export type ReadTransactionParams = Static<typeof readTransactionParamsSchema>;
export type ReadTransactionReply =
  | Static<typeof readTransactionReplySchema>
  | ErrorReply;

export const transactionsRoutes =
  ({ engine }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Params: ReadTransactionParams;
      Reply: ReadTransactionReply;
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
        const user = await getUser(req);
        if (!user) {
          return reply.code(401).send({ error: "Unauthorized" });
        }

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
