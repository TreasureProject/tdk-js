import {
  type AddressString,
  fetchHarvesterCorruptionRemovalInfo,
  getHarvesterInfo,
  getHarvesterUserInfo,
} from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";
import { zeroAddress } from "viem";

import "../middleware/auth";
import "../middleware/chain";
import "../middleware/swagger";
import type {
  ReadHarvesterCorruptionRemovalParams,
  ReadHarvesterCorruptionRemovalReply,
} from "../schema";
import {
  type ErrorReply,
  type ReadHarvesterParams,
  type ReadHarvesterReply,
  readHarvesterCorruptionRemovalReplySchema,
  readHarvesterReplySchema,
} from "../schema";
import type { TdkApiContext } from "../types";
import { TdkError } from "../utils/error";

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
          response: {
            200: readHarvesterReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          chainId,
          params: { id },
          userAddress: authUserAddress,
          overrideUserAddress,
        } = req;

        const harvesterAddress = id as AddressString;
        const harvesterInfo = await getHarvesterInfo({
          chainId,
          harvesterAddress,
          wagmiConfig,
        });

        if (harvesterInfo.nftHandlerAddress === zeroAddress) {
          throw new TdkError({
            code: "TDK_NOT_FOUND",
            message: "NftHandler not found",
            data: { harvesterAddress },
          });
        }

        const userAddress = overrideUserAddress ?? authUserAddress;
        const harvesterUserInfo = userAddress
          ? await getHarvesterUserInfo({
              chainId,
              harvesterInfo,
              userAddress,
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

    app.get<{
      Params: ReadHarvesterCorruptionRemovalParams;
      Reply: ReadHarvesterCorruptionRemovalReply | ErrorReply;
    }>(
      "/harvesters/:id/corruption-removal",
      {
        schema: {
          summary: "Get Harvester Corruption Removal",
          description:
            "Get Corruption Removal recipes for Harvester including user info if valid authorization token is provided",
          response: {
            200: readHarvesterCorruptionRemovalReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          chainId,
          params: { id },
          userAddress: authUserAddress,
          overrideUserAddress,
        } = req;

        const harvesterCorruptionRemovalInfo =
          await fetchHarvesterCorruptionRemovalInfo({
            chainId,
            harvesterAddress: id,
            userAddress: overrideUserAddress ?? authUserAddress,
            inventoryApiUrl: env.TROVE_API_URL,
            inventoryApiKey: env.TROVE_API_KEY,
            wagmiConfig,
          });
        reply.send(harvesterCorruptionRemovalInfo);
      },
    );
  };
