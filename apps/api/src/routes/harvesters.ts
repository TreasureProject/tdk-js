import {
  type AddressString,
  getHarvesterInfo,
  getHarvesterUserInfo,
} from "@treasure-dev/tdk-core";
import type { FastifyPluginAsync } from "fastify";
import { zeroAddress } from "viem";

import { getUser } from "../middleware/auth";
import "../middleware/chain";
import {
  type ErrorReply,
  type ReadHarvesterParams,
  type ReadHarvesterReply,
  readHarvesterReplySchema,
} from "../schema";

export const harvestersRoutes: FastifyPluginAsync = async (app) => {
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
      });

      const { nftHandlerAddress, permitsAddress, permitsTokenId } =
        harvesterInfo;

      if (nftHandlerAddress === zeroAddress) {
        return reply.code(404).send({ error: "Not found" });
      }

      const user = await getUser(req);
      const harvesterUserInfo = user?.address
        ? await getHarvesterUserInfo({
            chainId,
            harvesterAddress,
            nftHandlerAddress: nftHandlerAddress as AddressString,
            permitsAddress: permitsAddress as AddressString,
            permitsTokenId,
            userAddress: user.address as AddressString,
          })
        : undefined;

      reply.send({
        ...harvesterInfo,
        ...harvesterUserInfo,
      });
    },
  );
};
