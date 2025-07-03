import * as Sentry from "@sentry/node";
import { ACCOUNT_FACTORY_ADDRESS } from "@treasure-dev/tdk-core";
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
  createUnauthorizedError,
  normalizeEngineErrorMessage,
  parseEngineErrorMessage,
} from "../utils/error";
import { parseTxOverrides } from "../utils/transaction";

export const transactionsRoutes =
  ({ engine, env }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    const checkMaintenanceMode = () => {
      if (env.ENGINE_MAINTENANCE_MODE_ENABLED) {
        throw new TdkError({
          name: TDK_ERROR_NAMES.TransactionError,
          code: TDK_ERROR_CODES.MAINTENANCE_MODE_ENABLED,
          message:
            "Sorry, this feature is in planned maintenance mode. Please try again later.",
        });
      }
    };

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
        checkMaintenanceMode();

        if (!req.isAuthenticated) {
          throw createUnauthorizedError("Unauthorized", {
            error: req.authenticationError,
          });
        }

        const {
          address,
          abi,
          functionName,
          args,
          txOverrides,
          simulateTransaction = env.ENGINE_TRANSACTION_SIMULATION_ENABLED,
          backendWallet,
        } = req.body;

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

          // ZEE: This is the main entry point for sending transactions. Everything else is for auth and other validation.
          const { result } = await engine.contract.write(
            req.chain.id.toString(),
            address,
            backendWallet,
            {
              abi: transactionAbi,
              functionName,
              args,
              txOverrides: parseTxOverrides(txOverrides),
            },
            simulateTransaction,
            undefined,
            req.authenticatedUserAddress, // ZEE: Replace with any other account address for backend transactions on user's behalf
            ACCOUNT_FACTORY_ADDRESS,
          );
          reply.send(result);
        } catch (err) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.TransactionError,
            code: TDK_ERROR_CODES.TRANSACTION_CREATE_FAILED,
            message: parseEngineErrorMessage(err),
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
        checkMaintenanceMode();

        if (!req.isAuthenticated) {
          throw createUnauthorizedError("Unauthorized", {
            error: req.authenticationError,
          });
        }

        const {
          to,
          value = "0x00",
          data,
          txOverrides,
          simulateTransaction = env.ENGINE_TRANSACTION_SIMULATION_ENABLED,
          backendWallet,
        } = req.body;

        Sentry.setExtra("transaction", { to, value, data });

        try {
          // ZEE: This is the entry point for sending raw transactions
          const { result } = await engine.backendWallet.sendTransaction(
            req.chain.id.toString(),
            backendWallet,
            {
              toAddress: to,
              value: value,
              data,
              txOverrides: parseTxOverrides(txOverrides),
            },
            simulateTransaction,
            undefined,
            req.authenticatedUserAddress, // ZEE: Replace with any other account address for backend transactions on user's behalf
            ACCOUNT_FACTORY_ADDRESS,
          );
          reply.send(result);
        } catch (err) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.TransactionError,
            code: TDK_ERROR_CODES.TRANSACTION_CREATE_FAILED,
            message: parseEngineErrorMessage(err),
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
          const { result } = await engine.transaction.status(queueId);
          const transaction = {
            ...result,
            status:
              // Normalize status when the AA transaction is mined but the underlying user op failed
              result.status === "mined" && result.onChainTxStatus === 0
                ? "errored"
                : result.status,
            errorMessage: result.errorMessage
              ? normalizeEngineErrorMessage(result.errorMessage)
              : null,
          };

          reply.send(transaction);
        } catch (err) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.TransactionError,
            code: TDK_ERROR_CODES.TRANSACTION_READ_FAILED,
            message: parseEngineErrorMessage(err),
          });
        }
      },
    );
  };
