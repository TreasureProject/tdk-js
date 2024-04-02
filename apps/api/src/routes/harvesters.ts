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
        permitsDepositCap,
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
        depositCap: userDepositCap,
        depositAmount: userDepositAmount,
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
            depositCap: 0n,
            depositAmount: 0n,
          };

      // Get boosters info
      const {
        maxStakeable: boostersMaxStakeable,
        totalBoost: boostersTotalBoost,
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
        permitsDepositCap: permitsDepositCap.toString(),
        boostersMaxStakeable: Number(boostersMaxStakeable),
        boostersTotalBoost: boostersTotalBoost.toString(),
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
        userDepositCap: userDepositCap.toString(),
        userDepositAmount: userDepositAmount.toString(),
      });
    },
  );
};
