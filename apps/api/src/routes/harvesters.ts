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
      const {
        magicBalance: userMagicBalance,
        magicAllowance: userMagicAllowance,
        permitsBalance: userPermitsBalance,
        permitsApproved: userPermitsApproved,
        boostersBalances: userBoostersBalances,
        boostersApproved: userBoostersApproved,
        magicMaxStakeable: userMagicMaxStakeable,
        magicStaked: userMagicStaked,
        totalBoost: userTotalBoost,
      } = user?.address
        ? await getHarvesterUserInfo({
            chainId,
            harvesterAddress,
            nftHandlerAddress,
            permitsAddress,
            permitsTokenId,
            userAddress: user.address as AddressString,
          })
        : {
            magicBalance: 0n,
            magicAllowance: 0n,
            permitsBalance: 0n,
            permitsApproved: false,
            boostersBalances: [],
            boostersApproved: false,
            magicMaxStakeable: 0n,
            magicStaked: 0n,
            totalBoost: 0,
          };

      reply.send({
        id,
        ...harvesterInfo,
        permitsTokenId: permitsTokenId.toString(),
        permitsMagicMaxStakeable:
          harvesterInfo.permitsMagicMaxStakeable.toString(),
        boostersMaxStakeable: Number(harvesterInfo.boostersMaxStakeable),
        magicMaxStakeable: harvesterInfo.magicMaxStakeable.toString(),
        totalMagicStaked: harvesterInfo.totalMagicStaked.toString(),
        boosters: harvesterInfo.boosters.map((booster) => ({
          ...booster,
          tokenId: booster.tokenId.toString(),
        })),
        userMagicBalance: userMagicBalance.toString(),
        userMagicAllowance: userMagicAllowance.toString(),
        userPermitsBalance: Number(userPermitsBalance),
        userPermitsApproved,
        userBoostersBalances,
        userBoostersApproved,
        userMagicMaxStakeable: userMagicMaxStakeable.toString(),
        userMagicStaked: userMagicStaked.toString(),
        userTotalBoost: userTotalBoost,
      });
    },
  );
};
