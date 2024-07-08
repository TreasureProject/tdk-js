import { fetchPools, fetchQuote, getSwapRoute } from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/chain";
import "../middleware/swagger";

import {
  type ErrorReply,
  type PoolQuoteParams,
  type PoolQuoteReply,
  type PoolsReply,
  type RouteReply,
  poolQuoteSchema,
  poolsReplySchema,
} from "../schema";
import { type RouteBody, routeReplySchema } from "../schema/magicswap";
import type { TdkApiContext } from "../types";

export const magicswapRoutes =
  ({ env, wagmiConfig }: TdkApiContext): FastifyPluginAsync =>
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
      Params: PoolQuoteParams;
      Reply: PoolQuoteReply | ErrorReply;
    }>(
      "/magicswap/pools/:id/quote",
      {
        schema: {
          summary: "Get pool quote",
          description: "Get Magicswap pool quote",
          response: {
            200: poolQuoteSchema,
          },
        },
      },
      async (req, reply) => {
        const { chainId, params } = req;

        const quote = await fetchQuote({
          poolId: params.id,
          chainId,
          wagmiConfig,
        });

        reply.send({
          quote: quote.toString(),
        });
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

        const route = await getSwapRoute({
          tokenInId: body.tokenInId,
          tokenOutId: body.tokenOutId,
          amount: body.amount,
          isExactOut: body.isExactOut,
          chainId,
          inventoryApiUrl: env.TROVE_API_URL,
          inventoryApiKey: env.TROVE_API_KEY,
          wagmiConfig,
        });

        reply.send({
          route: {
            ...route,
            amountIn: route.amountIn.toString(),
            amountOut: route.amountOut.toString(),
          },
        });
      },
    );
  };
