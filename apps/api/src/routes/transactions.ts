import type { FastifyPluginAsync } from "fastify";

import "../middleware/auth";
import "../middleware/chain";
import "../middleware/swagger";
import {
  type CreateSendNativeTransactionBody,
  type CreateSendNativeTransactionReply,
  type CreateTransactionBody,
  type CreateTransactionReply,
  type ErrorReply,
  type ReadTransactionParams,
  type ReadTransactionReply,
  createSendNativeTransactionBodySchema,
  createSendNativeTransactionReplySchema,
  createTransactionBodySchema,
  createTransactionReplySchema,
  readTransactionReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { TdkError, parseEngineErrorMessage } from "../utils/error";

export const transactionsRoutes =
  ({ engine, env }: TdkApiContext): FastifyPluginAsync =>
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
          userAddress,
          authError,
          body: {
            address,
            abi,
            functionName,
            args,
            txOverrides,
            backendWallet: overrideBackendWallet,
          },
        } = req;
        if (!userAddress) {
          throw new TdkError({
            code: "TDK_UNAUTHORIZED",
            message: "Unauthorized",
            data: { authError },
          });
        }

        const backendWallet =
          overrideBackendWallet ?? env.DEFAULT_BACKEND_WALLET;
        try {
          const { result } = await engine.contract.write(
            chainId.toString(),
            address,
            backendWallet,
            {
              abi: abi && abi.length > 0 ? abi : undefined,
              functionName,
              args,
              txOverrides,
            },
            false,
            undefined,
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
              functionName,
              args,
            },
          });
        }
      },
    );

    app.post<{
      Body: CreateSendNativeTransactionBody;
      Reply: CreateSendNativeTransactionReply | ErrorReply;
    }>(
      "/transactions/send-native",
      {
        schema: {
          summary: "Send native tokens",
          description:
            "Send the chain's native (gas) token to the provided recipient",
          security: [{ authToken: [] }],
          body: createSendNativeTransactionBodySchema,
          response: {
            200: createSendNativeTransactionReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          chainId,
          userAddress,
          authError,
          body: { to, amount, backendWallet: overrideBackendWallet },
        } = req;
        if (!userAddress) {
          throw new TdkError({
            code: "TDK_UNAUTHORIZED",
            message: "Unauthorized",
            data: { authError },
          });
        }

        const backendWallet =
          overrideBackendWallet ?? env.DEFAULT_BACKEND_WALLET;
        try {
          const { result } = await engine.backendWallet.sendTransaction(
            chainId.toString(),
            backendWallet,
            {
              toAddress: to,
              value: amount,
              data: "0x",
            },
            false,
            userAddress,
          );
          reply.send(result);
        } catch (err) {
          throw new TdkError({
            code: "TDK_CREATE_TRANSACTION",
            message: `Error creating native send transaction: ${parseEngineErrorMessage(err) ?? "Unknown error"}`,
            data: {
              chainId,
              backendWallet,
              userAddress,
              to,
              amount,
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
