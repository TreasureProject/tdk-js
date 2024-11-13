import {
  type AddressString,
  createAddLiquidityArgs,
  createRemoveLiquidityArgs,
  createRoute,
  createSwapArgs,
  fetchPool,
  fetchPools,
  magicswapV2RouterAbi,
} from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/auth";
import "../middleware/chain";
import "../middleware/swagger";

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
  type RemoveLiquidityBody,
  type RouteBody,
  type SwapBody,
  addLiquidityBodySchema,
  poolReplySchema,
  removeLiquidityBodySchema,
  routeBodySchema,
  routeReplySchema,
  swapBodySchema,
} from "../schema/magicswap";
import type { TdkApiContext } from "../types";
import {
  TDK_ERROR_CODES,
  TDK_ERROR_NAMES,
  TdkError,
  parseEngineErrorMessage,
  throwUnauthorizedError,
} from "../utils/error";
import { writeTransaction } from "../utils/transaction";

export const magicswapRoutes =
  ({ client, env, engine }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Reply: PoolsReply | ErrorReply;
    }>(
      "/magicswap/pools",
      {
        schema: {
          summary: "Get pools",
          description: "Get Magicswap pools aggregated information",
          response: {
            200: poolsReplySchema,
          },
        },
      },
      async (req, reply) => {
        const pools = await fetchPools({
          client,
          chainId: req.chain.id,
          inventoryApiUrl: env.TROVE_API_URL,
          inventoryApiKey: env.TROVE_API_KEY,
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
          summary: "Get pool",
          description: "Get Magicswap pool aggregated information",
          response: {
            200: poolReplySchema,
          },
        },
      },
      async (req, reply) => {
        const pool = await fetchPool({
          client,
          chainId: req.chain.id,
          pairId: req.params.id,
          inventoryApiUrl: env.TROVE_API_URL,
          inventoryApiKey: env.TROVE_API_KEY,
        });

        if (!pool) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.MagicswapError,
            code: TDK_ERROR_CODES.MAGICSWAP_POOL_NOT_FOUND,
            statusCode: 404,
            message: "Pool not found",
          });
        }

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
          summary: "Get swap route",
          description: "Get route to swap Magicswap tokens",
          body: routeBodySchema,
          response: {
            200: routeReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { chain, body } = req;

        const pools = await fetchPools({
          client,
          chainId: chain.id,
          inventoryApiUrl: env.TROVE_API_URL,
          inventoryApiKey: env.TROVE_API_KEY,
        });

        const route = createRoute({
          pools,
          tokenInId: body.tokenInId,
          tokenOutId: body.tokenOutId,
          amount: body.amount,
          isExactOut: body.isExactOut,
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
          description: "Swap Magicswap tokens",
          body: swapBodySchema,
          response: {
            200: createTransactionReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { authError, body, chain } = req;
        const userAddress = req.backendUserAddress ?? req.userAddress;

        if (!userAddress) {
          throwUnauthorizedError(authError);
          return;
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
          backendWallet,
          simulateTransaction = env.ENGINE_TRANSACTION_SIMULATION_ENABLED,
        } = body;

        const pools = await fetchPools({
          client,
          chainId: chain.id,
          inventoryApiUrl: env.TROVE_API_URL,
          inventoryApiKey: env.TROVE_API_KEY,
        });

        const poolTokens = pools
          .flatMap(({ token0, token1 }) => [token0, token1])
          .reduce(
            (acc, poolToken) => {
              acc[poolToken.id] = poolToken;
              return acc;
            },
            {} as Record<string, (typeof pools)[number]["token0"]>,
          );

        const tokenIn = poolTokens[tokenInId];
        const tokenOut = poolTokens[tokenOutId];

        if (!tokenIn) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.MagicswapError,
            code: TDK_ERROR_CODES.MAGICSWAP_SWAP_FAILED,
            message: "Input token not found",
          });
        }

        if (!tokenOut) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.MagicswapError,
            code: TDK_ERROR_CODES.MAGICSWAP_SWAP_FAILED,
            message: "Output token not found",
          });
        }

        const {
          address: contractAddress,
          functionName,
          args,
          value,
        } = createSwapArgs({
          chainId: chain.id,
          toAddress: userAddress,
          tokenIn,
          tokenOut,
          nftsIn,
          nftsOut,
          amountIn: amountIn ? BigInt(amountIn) : undefined,
          amountOut: amountOut ? BigInt(amountOut) : undefined,
          isExactOut,
          path: path as AddressString[],
          slippage,
        });

        try {
          const result = await writeTransaction({
            engine,
            chainId: chain.id,
            contractAddress,
            backendWallet: req.backendWallet ?? backendWallet,
            smartAccountAddress: userAddress,
            abi: magicswapV2RouterAbi,
            functionName,
            args,
            txOverrides: value
              ? {
                  value: value.toString(),
                }
              : undefined,
            simulateTransaction,
          });
          reply.send(result);
        } catch (err) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.MagicswapError,
            code: TDK_ERROR_CODES.MAGICSWAP_SWAP_FAILED,
            message: parseEngineErrorMessage(err),
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
          summary: "Add liquidity",
          description: "Add liquidity to a Magicswap pool",
          body: addLiquidityBodySchema,
          response: {
            200: createTransactionReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { authError, body, chain, params } = req;
        const userAddress = req.backendUserAddress ?? req.userAddress;

        if (!userAddress) {
          throwUnauthorizedError(authError);
          return;
        }

        const {
          amount0,
          amount1,
          amount0Min,
          amount1Min,
          nfts0,
          nfts1,
          backendWallet,
          simulateTransaction = env.ENGINE_TRANSACTION_SIMULATION_ENABLED,
        } = body;

        const pool = await fetchPool({
          client,
          chainId: chain.id,
          pairId: params.id,
          inventoryApiUrl: env.TROVE_API_URL,
          inventoryApiKey: env.TROVE_API_KEY,
        });

        if (!pool) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.MagicswapError,
            code: TDK_ERROR_CODES.MAGICSWAP_POOL_NOT_FOUND,
            statusCode: 404,
            message: "Pool not found",
          });
        }

        const {
          address: contractAddress,
          functionName,
          args,
          value,
        } = createAddLiquidityArgs({
          chainId: chain.id,
          toAddress: userAddress,
          amount0: amount0 ? BigInt(amount0) : undefined,
          amount1: amount1 ? BigInt(amount1) : undefined,
          amount0Min: amount0Min ? BigInt(amount0Min) : undefined,
          amount1Min: amount1Min ? BigInt(amount1Min) : undefined,
          nfts0,
          nfts1,
          pool,
        });

        try {
          const result = await writeTransaction({
            engine,
            chainId: chain.id,
            contractAddress,
            backendWallet: req.backendWallet ?? backendWallet,
            smartAccountAddress: userAddress,
            abi: magicswapV2RouterAbi,
            functionName,
            args,
            txOverrides: value
              ? {
                  value: value.toString(),
                }
              : undefined,
            simulateTransaction,
          });
          reply.send(result);
        } catch (err) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.MagicswapError,
            code: TDK_ERROR_CODES.MAGICSWAP_ADD_LIQUIDITY_FAILED,
            message: parseEngineErrorMessage(err),
          });
        }
      },
    );

    app.post<{
      Params: PoolParams;
      Body: RemoveLiquidityBody;
      Reply: CreateTransactionReply | ErrorReply;
    }>(
      "/magicswap/pools/:id/remove-liquidity",
      {
        schema: {
          summary: "Remove liquidity",
          description: "Remove liquidity from a Magicswap pool",
          body: removeLiquidityBodySchema,
          response: {
            200: createTransactionReplySchema,
          },
        },
      },
      async (req, reply) => {
        const { authError, body, chain, params } = req;
        const userAddress = req.backendUserAddress ?? req.userAddress;

        if (!userAddress) {
          throwUnauthorizedError(authError);
          return;
        }

        const {
          amountLP,
          amount0Min,
          amount1Min,
          nfts0,
          nfts1,
          swapLeftover = true,
          backendWallet,
          simulateTransaction = env.ENGINE_TRANSACTION_SIMULATION_ENABLED,
        } = body;

        const pool = await fetchPool({
          client,
          chainId: chain.id,
          pairId: params.id,
          inventoryApiUrl: env.TROVE_API_URL,
          inventoryApiKey: env.TROVE_API_KEY,
        });

        if (!pool) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.MagicswapError,
            code: TDK_ERROR_CODES.MAGICSWAP_POOL_NOT_FOUND,
            statusCode: 404,
            message: "Pool not found",
          });
        }

        const {
          address: contractAddress,
          functionName,
          args,
          value,
        } = createRemoveLiquidityArgs({
          chainId: chain.id,
          toAddress: userAddress,
          amountLP: BigInt(amountLP),
          amount0Min: BigInt(amount0Min),
          amount1Min: BigInt(amount1Min),
          nfts0,
          nfts1,
          pool,
          swapLeftover,
        });

        try {
          const result = await writeTransaction({
            engine,
            chainId: chain.id,
            contractAddress,
            backendWallet: req.backendWallet ?? backendWallet,
            smartAccountAddress: userAddress,
            abi: magicswapV2RouterAbi,
            functionName,
            args,
            txOverrides: value
              ? {
                  value: value.toString(),
                }
              : undefined,
            simulateTransaction,
          });
          reply.send(result);
        } catch (err) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.MagicswapError,
            code: TDK_ERROR_CODES.MAGICSWAP_REMOVE_LIQUIDITY_FAILED,
            message: parseEngineErrorMessage(err),
          });
        }
      },
    );
  };
