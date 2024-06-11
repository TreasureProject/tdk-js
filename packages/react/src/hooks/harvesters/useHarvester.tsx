import { useQuery } from "@tanstack/react-query";
import {
  type AddressString,
  type Contract,
  erc1155Abi,
  getContractAddresses,
  harvesterAbi,
  nftHandlerAbi,
} from "@treasure-dev/tdk-core";
import { erc20Abi, formatEther, zeroAddress, zeroHash } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";

import { useTreasure } from "../../context";

type Props = {
  chainId?: number;
  contract: Contract | AddressString;
  userAddress: AddressString;
};

export const useHarvester = ({
  chainId = arbitrum.id,
  contract,
  userAddress,
}: Props) => {
  const { tdk, user } = useTreasure();
  const contractAddresses = getContractAddresses(chainId);
  const smartAccountAddress = (user?.smartAccountAddress ??
    zeroAddress) as AddressString;
  const harvesterAddress = contract.startsWith("0x")
    ? (contract as AddressString)
    : contractAddresses[contract as Contract];

  const { data, refetch } = useQuery({
    queryKey: ["harvester", harvesterAddress, smartAccountAddress],
    queryFn: () => tdk.harvester.get(harvesterAddress),
  });

  const nftHandlerAddress = (data?.nftHandlerAddress ??
    zeroAddress) as AddressString;
  const permitTokenId = BigInt(data?.permitsTokenId ?? 0n);
  const smartAccountMagic = BigInt(data?.userMagicBalance ?? 0n);
  const smartAccountPermits = data?.userPermitsBalance ?? 0;
  const harvesterDepositCap = BigInt(data?.userMagicMaxStakeable ?? 0n);
  const harvesterDeposit = BigInt(data?.userMagicStaked ?? 0n);
  const harvesterPermits =
    data?.permitsMagicMaxStakeable && BigInt(data.permitsMagicMaxStakeable) > 0
      ? Number(formatEther(harvesterDepositCap)) /
        Number(formatEther(BigInt(data.permitsMagicMaxStakeable)))
      : 0;
  return {
    data: {
      harvesterAddress,
      nftHandlerAddress,
      permitTokenId,
      smartAccountMagic,
      smartAccountPermits,
      harvesterDepositCap,
      harvesterDeposit,
      harvesterPermits,
    },
    deposit: async (amount: bigint) => {
      if (!tdk) {
        return;
      }

      const prerequisiteTransactions: Promise<unknown>[] = [];
      let permitsToStake = 0n;

      if (smartAccountMagic < amount) {
        // Queue MAGIC transfer from EOA to smart account
        console.debug(
          `Transferring ${formatEther(
            amount,
          )} MAGIC from connected wallet to smart account`,
        );
        prerequisiteTransactions.push(
          tdk.transaction.create({
            address: contractAddresses.MAGIC,
            abi: erc20Abi,
            functionName: "transferFrom",
            args: [userAddress, smartAccountAddress, amount],
          }),
        );
      }

      if (harvesterDepositCap - harvesterDeposit < amount) {
        if (smartAccountPermits < 1) {
          // Queue Ancient Permit transfer from EOA to smart account
          console.debug(
            "Transferring Ancient Permit from connected wallet to smart account",
          );
          prerequisiteTransactions.push(
            tdk.transaction.create({
              address: contractAddresses.Consumables,
              abi: erc1155Abi,
              functionName: "safeTransferFrom",
              args: [
                userAddress,
                smartAccountAddress,
                permitTokenId,
                1n,
                zeroHash,
              ],
            }),
          );
        }

        // Queue Consumables-NftHandler approval
        console.debug("Approving Harvester to transfer Consumables");
        prerequisiteTransactions.push(
          tdk.transaction.create({
            address: contractAddresses.Consumables,
            abi: erc1155Abi,
            functionName: "setApprovalForAll",
            args: [nftHandlerAddress, true],
          }),
        );

        permitsToStake = 1n;
      }

      // Queue MAGIC-Harvester approval
      console.debug("Approving Harvester to transfer MAGIC");
      prerequisiteTransactions.push(
        tdk.transaction.create({
          address: contractAddresses.MAGIC,
          abi: erc20Abi,
          functionName: "approve",
          args: [harvesterAddress, amount],
        }),
      );

      await Promise.all(prerequisiteTransactions);

      if (permitsToStake > 0n) {
        // Queue Ancient Permit deposit
        console.debug("Staking Ancient Permit to Harvester");
        await tdk.transaction.create({
          address: nftHandlerAddress,
          abi: nftHandlerAbi,
          functionName: "stakeNft",
          args: [contractAddresses.Consumables, permitTokenId, permitsToStake],
        });
      }

      // // Queue Harvester deposit
      console.debug(`Depositing ${formatEther(amount)} MAGIC to Harvester`);
      await tdk.transaction.create({
        address: harvesterAddress,
        abi: harvesterAbi,
        functionName: "deposit",
        args: [amount, chainId === arbitrumSepolia.id ? 1n : 0n],
      });
    },
    withdrawAll: async () => {
      if (!tdk) {
        return;
      }

      if (harvesterDeposit > 0) {
        console.debug("Withdrawing all MAGIC from Harvester");
        await tdk.transaction.create({
          address: harvesterAddress,
          abi: harvesterAbi,
          functionName: "withdrawAll",
          args: [],
        });
      }

      if (harvesterPermits > 0) {
        console.debug("Withdrawing all Ancient Permits from Harvester");
        await tdk.transaction.create({
          address: nftHandlerAddress,
          abi: nftHandlerAbi,
          functionName: "unstakeNft",
          args: [
            contractAddresses.Consumables,
            permitTokenId,
            BigInt(harvesterPermits),
          ],
        });
      }
    },
    refetch,
  };
};
