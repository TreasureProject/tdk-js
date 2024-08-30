import * as Sentry from "@sentry/node";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/auth";
import "../middleware/chain";
import "../middleware/swagger";
import {
  type CreateRawTransactionBody,
  type CreateRawTransactionReply,
  type CreateTransactionBody,
  type CreateTransactionReply,
  type ErrorReply,
  type ReadTransactionParams,
  type ReadTransactionReply,
  createRawTransactionBodySchema,
  createRawTransactionReplySchema,
  createTransactionBodySchema,
  createTransactionReplySchema,
  readTransactionReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import {
  TDK_ERROR_CODES,
  TDK_ERROR_NAMES,
  TdkError,
  parseEngineErrorMessage,
} from "../utils/error";

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
        if (env.ENGINE_MAINTENANCE_MODE_ENABLED) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.TransactionError,
            code: TDK_ERROR_CODES.MAINTENANCE_MODE_ENABLED,
            message:
              "Sorry, this feature is in planned maintenance mode. Please try again later.",
          });
        }

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
            name: TDK_ERROR_NAMES.AuthError,
            code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
            message: "Unauthorized",
            data: { authError },
          });
        }

        const backendWallet =
          overrideBackendWallet ?? env.DEFAULT_BACKEND_WALLET;
        try {
          const transactionAbi =
            typeof abi === "string" && abi.length > 0
              ? JSON.parse(abi)
              : Array.isArray(abi) && abi.length > 0
                ? abi
                : undefined;

          Sentry.setExtra(
            "transaction",
            JSON.stringify(
              {
                address,
                functionName,
                abi: !!transactionAbi,
                args,
              },
              null,
              2,
            ),
          );

          const { result } = await engine.contract.write(
            chainId.toString(),
            address,
            backendWallet,
            {
              abi: transactionAbi,
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
            name: TDK_ERROR_NAMES.TransactionError,
            code: TDK_ERROR_CODES.TRANSACTION_CREATE_FAILED,
            message: `Error creating transaction: ${parseEngineErrorMessage(err as Error) ?? "Unknown error"}`,
          });
        }
      },
    );

    app.post<{
      Body: CreateRawTransactionBody;
      Reply: CreateRawTransactionReply | ErrorReply;
    }>(
      "/transactions/raw",
      {
        schema: {
          summary: "Send raw transaction",
          description:
            "Send a raw transaction, including native token transfer",
          security: [{ authToken: [] }],
          body: createRawTransactionBodySchema,
          response: {
            200: createRawTransactionReplySchema,
          },
        },
      },
      async (req, reply) => {
        if (env.ENGINE_MAINTENANCE_MODE_ENABLED) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.TransactionError,
            code: TDK_ERROR_CODES.MAINTENANCE_MODE_ENABLED,
            message:
              "Sorry, this feature is in planned maintenance mode. Please try again later.",
          });
        }

        const {
          chainId,
          userAddress,
          authError,
          body: {
            to,
            value = "0x00",
            data,
            txOverrides,
            backendWallet: overrideBackendWallet,
          },
        } = req;
        if (!userAddress) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.AuthError,
            code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
            message: "Unauthorized",
            data: { authError },
          });
        }

        const backendWallet =
          overrideBackendWallet ?? env.DEFAULT_BACKEND_WALLET;
        try {
          Sentry.setExtra("transaction", { to, value, data });
          const { result } = await engine.backendWallet.sendTransaction(
            chainId.toString(),
            backendWallet,
            {
              toAddress: to,
              value: value,
              data,
              txOverrides,
            },
            false,
            undefined,
            userAddress,
          );
          reply.send(result);
        } catch (err) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.TransactionError,
            code: TDK_ERROR_CODES.TRANSACTION_CREATE_FAILED,
            message: `Error creating raw transaction: ${parseEngineErrorMessage(err as Error) ?? "Unknown error"}`,
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
            name: TDK_ERROR_NAMES.TransactionError,
            code: TDK_ERROR_CODES.TRANSACTION_READ_FAILED,
            message: `Error fetching transaction: ${parseEngineErrorMessage(err as Error) ?? "Unknown error"}`,
          });
        }
      },
    );
  };
