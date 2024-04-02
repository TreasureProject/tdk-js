import {
  type AddressString,
  getHarvesterBoostersInfo,
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
      const {
        nftHandlerAddress,
        permitsStakingRulesAddress,
        boostersStakingRulesAddress,
        legionsStakingRulesAddress,
        treasuresStakingRulesAddress,
        charactersStakingRulesAddress,
        permitsAddress,
        permitsTokenId,
        permitsMagicMaxStakeable,
        totalEmissionsActivated,
        totalMagicStaked,
        totalBoost,
      } = await getHarvesterInfo({ chainId, harvesterAddress });

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

      // Get boosters info
      const {
        maxStakeable: boostersMaxStakeable,
        totalBoost: totalBoostersBoost,
        boosters,
      } = await getHarvesterBoostersInfo({
        chainId,
        stakingRulesAddress: boostersStakingRulesAddress,
      });

      reply.send({
        id,
        nftHandlerAddress,
        permitsStakingRulesAddress,
        boostersStakingRulesAddress,
        legionsStakingRulesAddress,
        treasuresStakingRulesAddress,
        charactersStakingRulesAddress,
        permitsAddress,
        permitsTokenId: permitsTokenId.toString(),
        permitsMagicMaxStakeable: permitsMagicMaxStakeable.toString(),
        boostersMaxStakeable: Number(boostersMaxStakeable),
        magicMaxStakeable: "0",
        totalEmissionsActivated,
        totalMagicStaked: totalMagicStaked.toString(),
        totalBoost,
        totalBoostersBoost: totalBoostersBoost.toString(),
        boosters: boosters.map((booster) => ({
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
