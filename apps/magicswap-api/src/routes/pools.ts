import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/swagger";
import { type Pool, poolSchema } from "../schema/magicswap";
import { type ErrorReply, notFoundReplySchema } from "../schema/shared";
import type { Context } from "../types";
import { getChainSlug } from "../utils/chain";
import { hexStringToUint8Array } from "../utils/hex";

export const poolsRoutes =
  ({ db }: Context): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Querystring: Partial<{
        chainId: number;
      }>;
      Reply: {
        pools: Pool[];
      };
    }>(
      "/pools",
      {
        schema: {
          summary: "List pools",
          description: "List available liquidity pools",
          querystring: Type.Partial(
            Type.Object({
              chainId: Type.Integer(),
            }),
          ),
          response: {
            200: Type.Object({
              pools: Type.Array(poolSchema),
            }),
          },
        },
      },
      async (req, reply) => {
        const pools = await db.pair.findMany({
          where: {
            chain: req.query.chainId
              ? getChainSlug(req.query.chainId)
              : undefined,
          },
          include: {
            token0: true,
            token1: true,
          },
        });
        reply.send({ pools });
      },
    );

    app.get<{
      Params: {
        chainId: number;
        address: string;
      };
      Reply: Pool | ErrorReply;
    }>(
      "/pools/:chainId/:address",
      {
        schema: {
          summary: "Get pool",
          description: "Get pool by LP token address",
          params: Type.Object({
            chainId: Type.Integer(),
            address: Type.String(),
          }),
          response: {
            200: poolSchema,
            404: notFoundReplySchema,
          },
        },
      },
      async (req, reply) => {
        const pool = await db.pair.findUnique({
          where: {
            chain_address: {
              chain: getChainSlug(req.params.chainId),
              address: hexStringToUint8Array(req.params.address),
            },
          },
          include: {
            token0: true,
            token1: true,
          },
        });
        if (!pool) {
          reply.status(404).send({ error: "Pool not found" });
          return;
        }

        reply.send(pool);
      },
    );
  };
