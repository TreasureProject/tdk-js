import { Type } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";

import "../middleware/swagger";
import { type Token, tokenSchema } from "../schema/magicswap";
import { type ErrorReply, notFoundReplySchema } from "../schema/shared";
import type { Context } from "../types";
import { getChainSlug } from "../utils/chain";
import { hexStringToUint8Array } from "../utils/hex";

export const tokensRoutes =
  ({ db }: Context): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Params: {
        chainId: number;
        address: string;
      };
      Reply: Token | ErrorReply;
    }>(
      "/tokens/:chainId/:address",
      {
        schema: {
          summary: "Get token",
          description: "Get token by address",
          params: Type.Object({
            chainId: Type.Integer(),
            address: Type.String(),
          }),
          response: {
            200: tokenSchema,
            404: notFoundReplySchema,
          },
        },
      },
      async (req, reply) => {
        const token = await db.token.findUnique({
          where: {
            chain_address: {
              chain: getChainSlug(req.params.chainId),
              address: hexStringToUint8Array(req.params.address),
            },
          },
        });
        if (!token) {
          reply.status(404).send({ error: "Token not found" });
          return;
        }

        reply.send(token);
      },
    );
  };
