import * as Sentry from "@sentry/node";
import {
  fetchPool,
  fetchPools,
  getAddLiquidityArgs,
  getSwapArgs,
  getSwapRoute,
} from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/auth";
import "../middleware/chain";
import "../middleware/swagger";

import { magicSwapV2RouterABI } from "../abis/magicSwapV2RouterAbi";
import {
  type CreateTransactionReply,
  type ErrorReply,
  type PoolsReply,
  type RouteReply,
  createTransactionReplySchema,
  poolsReplySchema,
} from "../schema";
import {
  type AddLiquidityBody,
  type PoolParams,
  type PoolReply,
  type RouteBody,
  type SwapBody,
  poolReplySchema,
  routeReplySchema,
} from "../schema/magicswap";
import type { TdkApiContext } from "../types";
import {
  TDK_ERROR_CODES,
  TDK_ERROR_NAMES,
  TdkError,
  parseEngineErrorMessage,
} from "../utils/error";

export const magicswapRoutes =
  ({ env, wagmiConfig, engine }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Reply: PoolsReply | ErrorReply;
    }>(
      "/magicswap/pools",
      {
        schema: {
          summary: "Get Magicswap Pools",
          description: "Get Magicswap pools aggregated information",
          response: {
            200: poolsReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { chainId } = req;

        const pools = await fetchPools({
          chainId,
          inventoryApiUrl: env.TROVE_API_URL,
          inventoryApiKey: env.TROVE_API_KEY,
          wagmiConfig,
        });

        reply.send({
          pools,
        });
      },
    );

    app.get<{
      Params: PoolParams;
      Reply: PoolReply | ErrorReply;
    }>(
      "/magicswap/pools/:id",
      {
        schema: {
          summary: "Get Magicswap Pool",
          description: "Get Magicswap pool aggregated information",
          response: {
            200: poolReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          chainId,
          params: { id },
        } = req;

        const pool = await fetchPool({
          pairId: id,
          chainId,
          inventoryApiUrl: env.TROVE_API_URL,
          inventoryApiKey: env.TROVE_API_KEY,
          wagmiConfig,
        });

        reply.send(pool);
      },
    );

    app.post<{
      Body: RouteBody;
      Reply: RouteReply | ErrorReply;
    }>(
      "/magicswap/route",
      {
        schema: {
          summary: "Get pool quote",
          description: "Get Magicswap pool quote",
          response: {
            200: routeReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { chainId, body } = req;

        const pools = await fetchPools({
          chainId,
          inventoryApiUrl: env.TROVE_API_URL,
          inventoryApiKey: env.TROVE_API_KEY,
          wagmiConfig,
        });

        const route = getSwapRoute({
          tokenInId: body.tokenInId,
          tokenOutId: body.tokenOutId,
          amount: body.amount,
          isExactOut: body.isExactOut,
          pools,
        });

        reply.send({
          ...route,
          amountIn: route.amountIn.toString(),
          amountOut: route.amountOut.toString(),
        });
      },
    );

    app.post<{ Body: SwapBody; Reply: CreateTransactionReply | ErrorReply }>(
      "/magicswap/swap",
      {
        schema: {
          summary: "Swap tokens",
          description: "Swap tokens using Magicswap",
          response: {
            200: createTransactionReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { userAddress, authError, body, chainId } = req;

        if (!userAddress) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.AuthError,
            code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
            message: "Unauthorized",
            data: { authError },
          });
        }

        const {
          tokenInId,
          tokenOutId,
          amountIn,
          amountOut,
          path,
          nftsIn,
          nftsOut,
          isExactOut,
          slippage,
          backendWallet: overrideBackendWallet,
        } = body;

        const backendWallet =
          overrideBackendWallet ?? env.DEFAULT_BACKEND_WALLET;

        const pools = await fetchPools({
          chainId,
          inventoryApiUrl: env.TROVE_API_URL,
          inventoryApiKey: env.TROVE_API_KEY,
          wagmiConfig,
        });

        const poolTokens = pools
          .flatMap(({ token0, token1 }) => [token0, token1])
          .reduce((acc, poolToken) => {
            acc[poolToken.id] = poolToken;
            return acc;
          }, {});

        const tokenIn = poolTokens[tokenInId];
        const tokenOut = poolTokens[tokenOutId];

        const swapArguments = getSwapArgs({
          chainId,
          toAddress: userAddress,
          tokenIn,
          tokenOut,
          nftsIn,
          nftsOut,
          amountIn: amountIn ? BigInt(amountIn) : undefined,
          amountOut: amountOut ? BigInt(amountOut) : undefined,
          isExactOut,
          path,
          slippage,
        });

        if (!swapArguments.address) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.MagicswapError,
            code: TDK_ERROR_CODES.MAGICSWAP_SWAP_FAILED,
            message: "Error performing swap: missing contract address",
          });
        }

        try {
          Sentry.setExtra(
            "transaction",
            JSON.stringify(swapArguments, null, 2),
          );
          const { result } = await engine.contract.write(
            chainId.toString(),
            swapArguments.address,
            backendWallet,
            {
              abi: magicSwapV2RouterABI,
              functionName: swapArguments.functionName,
              args: swapArguments.args as string[],
            },
            false,
            undefined,
            userAddress,
          );
          reply.send(result);
        } catch (err) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.MagicswapError,
            code: TDK_ERROR_CODES.MAGICSWAP_SWAP_FAILED,
            message: `Error performing swap: ${parseEngineErrorMessage(err) ?? "Unknown error"}`,
          });
        }
      },
    );

    app.post<{
      Params: PoolParams;
      Body: AddLiquidityBody;
      Reply: CreateTransactionReply | ErrorReply;
    }>(
      "/magicswap/pools/:id/add-liquidity",
      {
        schema: {
          summary: "Adds liquidity to a pool",
          description: "Adds liquidity to a pool using Magicswap",
          response: {
            200: createTransactionReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { userAddress, authError, body, chainId, params } = req;

        if (!userAddress) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.AuthError,
            code: TDK_ERROR_CODES.AUTH_UNAUTHORIZED,
            message: "Unauthorized",
            data: { authError },
          });
        }

        const { id: poolId } = params;

        const {
          amount0,
          amount1,
          amount0Min,
          amount1Min,
          nfts0,
          nfts1,
          backendWallet: overrideBackendWallet,
        } = body;

        const backendWallet =
          overrideBackendWallet ?? env.DEFAULT_BACKEND_WALLET;

        const pool = await fetchPool({
          pairId: poolId,
          chainId,
          inventoryApiUrl: env.TROVE_API_URL,
          inventoryApiKey: env.TROVE_API_KEY,
          wagmiConfig,
        });

        const addLiquidityArgs = getAddLiquidityArgs({
          chainId,
          toAddress: userAddress,
          amount0: amount0 ? BigInt(amount0) : undefined,
          amount1: amount1 ? BigInt(amount1) : undefined,
          amount0Min: amount0Min ? BigInt(amount0Min) : undefined,
          amount1Min: amount1Min ? BigInt(amount1Min) : undefined,
          nfts0,
          nfts1,
          pool,
        });

        if (!addLiquidityArgs.address) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.MagicswapError,
            code: TDK_ERROR_CODES.MAGICSWAP_SWAP_FAILED,
            message: "Error adding liquidity: missing contract address",
          });
        }

        try {
          Sentry.setExtra(
            "transaction",
            JSON.stringify(addLiquidityArgs, null, 2),
          );
          const { result } = await engine.contract.write(
            chainId.toString(),
            addLiquidityArgs.address,
            backendWallet,
            {
              abi: magicSwapV2RouterABI,
              functionName: addLiquidityArgs.functionName,
              args: addLiquidityArgs.args as string[],
              // TODO: figure out how to send value through contract write
              // value: addLiquidityArgs.value,
            },
            false,
            undefined,
            userAddress,
          );
          reply.send(result);
        } catch (err) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.MagicswapError,
            code: TDK_ERROR_CODES.MAGICSWAP_SWAP_FAILED,
            message: `Error performing swap: ${parseEngineErrorMessage(err) ?? "Unknown error"}`,
          });
        }
      },
    );
  };
