import { type Static, Type } from "@sinclair/typebox";
import {
  type AddressString,
  erc20Abi,
  erc1155Abi,
  getContractAddresses,
  harvesterAbi,
} from "@treasure/tdk-core";
import { readContracts } from "@wagmi/core";
import type { FastifyPluginAsync } from "fastify";
import { zeroAddress } from "viem";

import { getUser } from "../middleware/auth";
import "../middleware/chain";
import { type ErrorReply, baseReplySchema } from "../utils/schema";
import { config } from "../utils/wagmi";

const readHarvesterParamsSchema = Type.Object({
  id: Type.String(),
});

const readHarvesterReplySchema = Type.Object({
  id: Type.String(),
  nftHandlerAddress: Type.String(),
  permitsAddress: Type.String(),
  permitsTokenId: Type.String(),
  permitsDepositCap: Type.String(),
  userMagicBalance: Type.String(),
  userPermitsBalance: Type.Number(),
  userMagicAllowance: Type.String(),
  userApprovedPermits: Type.Boolean(),
  userDepositCap: Type.String(),
  userDepositAmount: Type.String(),
});

export type ReadHarvesterParams = Static<typeof readHarvesterParamsSchema>;
export type ReadHarvesterReply = Static<typeof readHarvesterReplySchema>;

export const harvestersRoutes: FastifyPluginAsync = async (app) => {
  app.get<{
    Params: ReadHarvesterParams;
    Reply: ReadHarvesterReply | ErrorReply;
  }>(
    "/harvesters/:id",
    {
      schema: {
        response: {
          ...baseReplySchema,
          200: readHarvesterReplySchema,
        },
      },
    },
    async (req, reply) => {
      const {
        chainId,
        params: { id },
      } = req;

      const contractAddresses = getContractAddresses(chainId);
      const harvesterAddress = id as AddressString;

      const [
        { result: nftHandlerAddress = zeroAddress },
        {
          result: [permitsAddress, permitsTokenId, permitsDepositCap] = [
            zeroAddress,
            0n,
            0n,
          ] as const,
        },
      ] = await readContracts(config, {
        contracts: [
          {
            address: harvesterAddress,
            abi: harvesterAbi,
            functionName: "nftHandler",
          },
          {
            address: harvesterAddress,
            abi: harvesterAbi,
            functionName: "depositCapPerWallet",
          },
        ],
      });

      if (nftHandlerAddress === zeroAddress) {
        return reply.code(404).send({ error: "Not found" });
      }

      let magicBalance = 0n;
      let magicAllowance = 0n;
      let permitsBalance = 0n;
      let userApprovedPermits = false;
      let depositCap = 0n;
      let depositAmount = 0n;
      const user = await getUser(req);
      if (user) {
        const smartAccountAddress = user.address as AddressString;
        const [
          { result: magicBalanceResult },
          { result: magicAllowanceResult },
          { result: permitsBalanceResult },
          { result: userApprovedPermitsResult },
          { result: depositCapResult },
          { result: globalDepositResult },
        ] = await readContracts(config, {
          contracts: [
            {
              address: contractAddresses.MAGIC,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [smartAccountAddress],
            },
            {
              address: contractAddresses.MAGIC,
              abi: erc20Abi,
              functionName: "allowance",
              args: [smartAccountAddress, harvesterAddress],
            },
            {
              address: permitsAddress,
              abi: erc1155Abi,
              functionName: "balanceOf",
              args: [smartAccountAddress, permitsTokenId],
            },
            {
              address: permitsAddress,
              abi: erc1155Abi,
              functionName: "isApprovedForAll",
              args: [smartAccountAddress, nftHandlerAddress],
            },
            {
              address: harvesterAddress,
              abi: harvesterAbi,
              functionName: "getUserDepositCap",
              args: [smartAccountAddress],
            },
            {
              address: harvesterAddress,
              abi: harvesterAbi,
              functionName: "getUserGlobalDeposit",
              args: [smartAccountAddress],
            },
          ],
        });

        magicBalance = magicBalanceResult ?? 0n;
        magicAllowance = magicAllowanceResult ?? 0n;
        permitsBalance = permitsBalanceResult ?? 0n;
        userApprovedPermits = userApprovedPermitsResult ?? false;
        depositCap = depositCapResult ?? 0n;
        depositAmount = globalDepositResult?.[0] ?? 0n;
      }

      reply.send({
        id,
        nftHandlerAddress,
        permitsAddress,
        permitsTokenId: permitsTokenId.toString(),
        permitsDepositCap: permitsDepositCap.toString(),
        userMagicBalance: magicBalance.toString(),
        userPermitsBalance: Number(permitsBalance),
        userMagicAllowance: magicAllowance.toString(),
        userApprovedPermits,
        userDepositCap: depositCap.toString(),
        userDepositAmount: depositAmount.toString(),
      });
    },
  );
};
