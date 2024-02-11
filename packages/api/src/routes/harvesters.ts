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
  harvester: Type.Object({
    nftHandlerAddress: Type.String(),
    permitsAddress: Type.String(),
    permitsTokenId: Type.String(),
  }),
  user: Type.Object({
    magicBalance: Type.String(),
    permitsBalance: Type.Number(),
    harvesterMagicAllowance: Type.String(),
    harvesterPermitsApproved: Type.Boolean(),
    harvesterDepositCap: Type.String(),
    harvesterDepositAmount: Type.String(),
  }),
});

export type ReadHarvesterParams = Static<typeof readHarvesterParamsSchema>;
export type ReadHarvesterReply =
  | Static<typeof readHarvesterReplySchema>
  | ErrorReply;

export const harvestersRoutes: FastifyPluginAsync = async (app) => {
  app.get<{
    Params: ReadHarvesterParams;
    Reply: ReadHarvesterReply;
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
      const user = await getUser(req);
      if (!user) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      const contractAddresses = getContractAddresses(chainId);
      const smartAccountAddress = user.address as AddressString;
      const harvesterAddress = id as AddressString;

      const [
        { result: magicBalance = 0n },
        { result: magicAllowance = 0n },
        { result: nftHandlerAddress = zeroAddress },
        {
          result: [permitsAddress, permitsTokenId] = [zeroAddress, 0n] as const,
        },
        { result: depositCap = 0n },
        { result: [harvesterDepositAmount] = [0n] as const },
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
            address: harvesterAddress,
            abi: harvesterAbi,
            functionName: "nftHandler",
          },
          {
            address: harvesterAddress,
            abi: harvesterAbi,
            functionName: "depositCapPerWallet",
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

      if (nftHandlerAddress === zeroAddress) {
        return reply.code(404).send({ error: "Not found" });
      }

      const [
        { result: permitsBalance = 0n },
        { result: harvesterPermitsApproved = false },
      ] = await readContracts(config, {
        contracts: [
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
        ],
      });

      reply.send({
        harvester: {
          nftHandlerAddress,
          permitsAddress,
          permitsTokenId: permitsTokenId.toString(),
        },
        user: {
          magicBalance: magicBalance.toString(),
          permitsBalance: Number(permitsBalance),
          harvesterMagicAllowance: magicAllowance.toString(),
          harvesterPermitsApproved,
          harvesterDepositCap: depositCap.toString(),
          harvesterDepositAmount: harvesterDepositAmount.toString(),
        },
      });
    },
  );
};
