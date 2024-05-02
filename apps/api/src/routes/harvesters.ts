import {
  type AddressString,
  fetchHarvesterCorruptionRemovalInfo,
  getHarvesterInfo,
  getHarvesterUserInfo,
} from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";
import { zeroAddress } from "viem";

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
import { verifyAuth } from "../utils/auth";

export const harvestersRoutes =
  ({ env, auth }: TdkApiContext): FastifyPluginAsync =>
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
          params: { id },
        } = req;

        const harvesterAddress = id as AddressString;
        const harvesterInfo = await getHarvesterInfo({
          chainId,
          harvesterAddress,
          tokenApiKey: env.TROVE_API_KEY,
        });

        if (harvesterInfo.nftHandlerAddress === zeroAddress) {
          return reply.code(404).send({ error: "Not found" });
        }

        // User address is optional for this request
        const authResult = await verifyAuth(auth, req);
        const userAddress = authResult.valid
          ? (authResult.parsedJWT.sub as AddressString)
          : undefined;

        const harvesterUserInfo = userAddress
          ? await getHarvesterUserInfo({
              chainId,
              harvesterInfo,
              userAddress,
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

        // User address is optional for this request
        const authResult = await verifyAuth(auth, req);
        const userAddress = authResult.valid
          ? (authResult.parsedJWT.sub as AddressString)
          : undefined;

        const harvesterCorruptionRemovalInfo =
          await fetchHarvesterCorruptionRemovalInfo({
            chainId,
            harvesterAddress: id,
            userAddress,
            inventoryApiKey: env.TROVE_API_KEY,
          });
        reply.send(harvesterCorruptionRemovalInfo);
      },
    );
  };
