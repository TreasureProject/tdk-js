import { fetchPools } from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";

import type { TdkApiContext } from "../types";

export const magicSwapRoutes =
  ({ env, wagmiConfig }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get(
      "/magic-swap/pools",
      {
        schema: {
          summary: "Get Magic Swap Pools",
          // description:
          //   "Get Harvester details including user info if valid authorization token is provided",
          // response: {
          //   200: readHarvesterReplySchema,
          // },
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
  };
