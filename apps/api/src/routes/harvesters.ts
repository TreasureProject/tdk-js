import {
  type AddressString,
  getHarvesterInfo,
  getHarvesterUserInfo,
} from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";
import { ZERO_ADDRESS } from "thirdweb";

import "../middleware/auth";
import "../middleware/chain";
import "../middleware/swagger";
import {
  type ErrorReply,
  type ReadHarvesterParams,
  type ReadHarvesterReply,
  notFoundReplySchema,
  readHarvesterReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { TDK_ERROR_CODES, TDK_ERROR_NAMES, TdkError } from "../utils/error";

export const harvestersRoutes =
  ({ env, wagmiConfig }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Params: ReadHarvesterParams;
      Reply: ReadHarvesterReply | ErrorReply;
    }>(
      "/harvesters/:id",
      {
        schema: {
          summary: "Get Harvester",
          description:
            "Get Harvester details including user info if valid authorization token is provided",
          deprecated: true,
          response: {
            200: readHarvesterReplySchema,
            404: notFoundReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          chain,
          params: { id },
          authenticatedUserAddress,
        } = req;

        const harvesterAddress = id as AddressString;
        const harvesterInfo = await getHarvesterInfo({
          chainId: chain.id,
          harvesterAddress,
          wagmiConfig,
        });

        if (harvesterInfo.nftHandlerAddress === ZERO_ADDRESS) {
          throw new TdkError({
            name: TDK_ERROR_NAMES.HarvesterError,
            code: TDK_ERROR_CODES.HARVESTER_NFT_HANDLER_NOT_FOUND,
            statusCode: 404,
            message: "NftHandler not found",
          });
        }

        const harvesterUserInfo = authenticatedUserAddress
          ? await getHarvesterUserInfo({
              chainId: chain.id,
              harvesterInfo,
              userAddress: authenticatedUserAddress,
              inventoryApiUrl: env.TROVE_API_URL,
              inventoryApiKey: env.TROVE_API_KEY,
              wagmiConfig,
            })
          : undefined;

        reply.send({
          ...harvesterInfo,
          ...harvesterUserInfo,
        });
      },
    );
  };
