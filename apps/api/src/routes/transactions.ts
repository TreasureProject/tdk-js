import * as Sentry from "@sentry/node";
import { getContractAddress } from "@treasure-dev/tdk-core";
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
  normalizeEngineErrorMessage,
  parseEngineErrorMessage,
} from "../utils/error";
import { parseTxOverrides } from "../utils/transaction";

export const transactionsRoutes =
  ({ db, engine, env }: TdkApiContext): FastifyPluginAsync =>
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

        const {
          chain,
          userAddress,
          authError,
          body: {
            address,
            abi,
            functionName,
            args,
            txOverrides,
            backendWallet = env.DEFAULT_BACKEND_WALLET,
            simulateTransaction = env.ENGINE_TRANSACTION_SIMULATION_ENABLED,
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

          const parsedTxOverrides = parseTxOverrides(txOverrides);

          const { result } = await engine.contract.write(
            chain.id.toString(),
            address,
            req.backendWallet ?? backendWallet,
            {
              abi: transactionAbi,
              functionName,
              args,
              txOverrides: parsedTxOverrides,
            },
            simulateTransaction,
            undefined,
            userAddress,
            getContractAddress(chain.id, "ManagedAccountFactory"),
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

        const {
          chain,
          userAddress,
          authError,
          body: {
            to,
            value = "0x00",
            data,
            txOverrides,
            backendWallet = env.DEFAULT_BACKEND_WALLET,
            simulateTransaction = env.ENGINE_TRANSACTION_SIMULATION_ENABLED,
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

        const parsedTxOverrides = parseTxOverrides(txOverrides);

        try {
          Sentry.setExtra("transaction", { to, value, data });
          const { result } = await engine.backendWallet.sendTransaction(
            chain.id.toString(),
            req.backendWallet ?? backendWallet,
            {
              toAddress: to,
              value: value,
              data,
              txOverrides: parsedTxOverrides,
            },
            simulateTransaction,
            undefined,
            userAddress,
            getContractAddress(chain.id, "ManagedAccountFactory"),
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

          if (transaction.status === "errored") {
            await db.transactionErrorLog.upsert({
              where: { queueId },
              create: {
                queueId,
                queuedAt: transaction.queuedAt ?? new Date(),
                chainId: Number(transaction.chainId ?? 0),
                signerAddress: transaction.signerAddress ?? "",
                accountAddress: transaction.accountAddress ?? "",
                target: transaction.target ?? "",
                functionName: transaction.functionName ?? "",
                errorMessage: transaction.errorMessage ?? "",
              },
              update: {},
            });
          }

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
