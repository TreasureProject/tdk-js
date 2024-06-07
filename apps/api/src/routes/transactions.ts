import type { FastifyPluginAsync } from "fastify";

import "../middleware/auth";
import "../middleware/chain";
import "../middleware/project";
import "../middleware/swagger";
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
import { TdkError, parseEngineErrorMessage } from "../utils/error";

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
          summary: "Write contract",
          description: "Call a contract write function",
          security: [{ authToken: [] }],
          body: createTransactionBodySchema,
          response: {
            200: createTransactionReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          chainId,
          backendWallet,
          userAddress,
          authError,
          body: postBody,
        } = req;
        if (!userAddress) {
          throw new TdkError({
            code: "TDK_UNAUTHORIZED",
            message: "Unauthorized",
            data: { authError },
          });
        }

        const { address, ...body } = postBody;
        try {
          const { result } = await engine.contract.write(
            chainId.toString(),
            address,
            backendWallet,
            body,
            false,
            userAddress,
          );
          reply.send(result);
        } catch (err) {
          throw new TdkError({
            code: "TDK_CREATE_TRANSACTION",
            message: `Error creating transaction: ${parseEngineErrorMessage(err) ?? "Unknown error"}`,
            data: {
              chainId,
              backendWallet,
              userAddress,
              address,
              ...body,
            },
          });
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
          summary: "Get transaction",
          description: "Get transaction status by queue ID",
          response: {
            200: readTransactionReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { queueId } = req.params;
        try {
          const data = await engine.transaction.status(queueId);
          reply.send(data.result);
        } catch (err) {
          throw new TdkError({
            code: "TDK_READ_TRANSACTION",
            message: `Error fetching transaction: ${parseEngineErrorMessage(err) ?? "Unknown error"}`,
            data: { queueId },
          });
        }
      },
    );
  };
