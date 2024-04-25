import {
  type AddressString,
  fetchHarvesterCorruptionRemovalInfo,
  getHarvesterInfo,
  getHarvesterUserInfo,
} from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";
import { zeroAddress } from "viem";

import { getUser } from "../middleware/auth";
import "../middleware/chain";
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

export const harvestersRoutes =
  ({ env }: TdkApiContext): FastifyPluginAsync =>
  async (app) => {
    app.get<{
      Params: ReadHarvesterParams;
      Reply: ReadHarvesterReply | ErrorReply;
    }>(
      "/harvesters/:id",
      {
        schema: {
          response: {
            200: readHarvesterReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          chainId,
          // params: { id },
        } = req;

        const harvesterAddress = "0x36882e71d11eadd9f869b0fd70d18d5045939986"; // id as AddressString;
        const harvesterInfo = await getHarvesterInfo({
          chainId,
          harvesterAddress,
        });

        if (harvesterInfo.nftHandlerAddress === zeroAddress) {
          return reply.code(404).send({ error: "Not found" });
        }

        const user = await getUser(req);
        const harvesterUserInfo = user?.address
          ? await getHarvesterUserInfo({
              chainId,
              harvesterInfo,
              userAddress: user.address as AddressString,
              inventoryApiUrl: env.TROVE_API_URL,
              inventoryApiKey: env.TROVE_API_KEY,
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
          response: {
            200: readHarvesterCorruptionRemovalReplySchema,
          },
        },
      },
      async (req, reply) => {
        const {
          chainId,
          params: { id },
        } = req;
        const user = await getUser(req);
        const harvesterCorruptionRemovalInfo =
          await fetchHarvesterCorruptionRemovalInfo({
            chainId,
            harvesterAddress: id,
            userAddress: user?.address,
            inventoryApiUrl: env.TROVE_API_URL,
            inventoryApiKey: env.TROVE_API_KEY,
          });
        reply.send(harvesterCorruptionRemovalInfo);
      },
    );
  };
