import { readContracts } from "@wagmi/core";
import { erc20Abi, formatEther, zeroAddress } from "viem";
import { arbitrumSepolia } from "viem/chains";

import { boosterStakingRulesAbi } from "../abis/boosterStakingRulesAbi";
import { consumablesAbi } from "../abis/consumablesAbi";
import { erc1155Abi } from "../abis/erc1155Abi";
import { harvesterAbi } from "../abis/harvesterAbi";
import { middlemanAbi } from "../abis/middlemanAbi";
import { nftHandlerAbi } from "../abis/nftHandlerAbi";
import { TOKEN_IDS } from "../constants";
import type { AddressString, SupportedChainId } from "../types";
import { getContractAddress, getContractAddresses } from "./contracts";
import { config } from "./wagmi";

const DEFAULT_BOOSTERS_MAX_STAKEABLE = 10n;
const DEFAULT_BOOSTERS_LIFETIMES = [
  10800n,
  10800n,
  10800n,
  14400n,
  7200n,
  3600n,
];

const BOOSTER_TOKEN_IDS = [
  TOKEN_IDS.Consumables.SmallMetabolicBooster,
  TOKEN_IDS.Consumables.MediumMetabolicBooster,
  TOKEN_IDS.Consumables.LargeMetabolicBooster,
  TOKEN_IDS.Consumables.DurableBooster,
  TOKEN_IDS.Consumables.AnabolicBooster,
  TOKEN_IDS.Consumables.OverclockedBooster,
];

export const getHarvesterInfo = async ({
  chainId,
  harvesterAddress,
}: {
  chainId: SupportedChainId;
  harvesterAddress: AddressString;
}) => {
  const contractAddresses = getContractAddresses(chainId);
  const [
    { result: nftHandlerAddress = zeroAddress },
    {
      result: [permitsAddress, permitsTokenId, permitsMagicMaxStakeable] = [
        zeroAddress,
        0n,
        0n,
      ] as const,
    },
    { result: totalEmissionsActivated = 0n },
    { result: totalMagicStaked = 0n },
    { result: totalBoost = 0n },
  ] = await readContracts(config, {
    contracts: [
      {
        chainId,
        address: harvesterAddress,
        abi: harvesterAbi,
        functionName: "nftHandler",
      },
      {
        chainId,
        address: harvesterAddress,
        abi: harvesterAbi,
        functionName: "depositCapPerWallet",
      },
      {
        chainId,
        address: contractAddresses.Middleman,
        abi: middlemanAbi,
        functionName: "getUtilizationBoost",
        args: [harvesterAddress],
      },
      {
        chainId,
        address: harvesterAddress,
        abi: harvesterAbi,
        functionName: "magicTotalDeposits",
      },
      {
        chainId,
        address: contractAddresses.Middleman,
        abi: middlemanAbi,
        functionName: "getHarvesterEmissionsBoost",
        args: [harvesterAddress],
      },
    ],
  });

  const [
    { result: stakingRulesAddresses = [] },
    { result: permitsStakingRulesAddress = zeroAddress },
    { result: boostersStakingRulesAddress = zeroAddress },
    { result: legionsStakingRulesAddress },
    { result: treasuresStakingRulesAddress },
  ] = await readContracts(config, {
    contracts: [
      {
        chainId,
        address: nftHandlerAddress,
        abi: nftHandlerAbi,
        functionName: "getAllStakingRules",
      },
      {
        chainId,
        address: nftHandlerAddress,
        abi: nftHandlerAbi,
        functionName: "getStakingRules",
        args: [permitsAddress, permitsTokenId],
      },
      {
        chainId,
        address: nftHandlerAddress,
        abi: nftHandlerAbi,
        functionName: "getStakingRules",
        args: [
          getContractAddress(chainId, "Consumables"),
          TOKEN_IDS.Consumables.SmallMetabolicBooster,
        ],
      },
      {
        chainId,
        address: nftHandlerAddress,
        abi: nftHandlerAbi,
        functionName: "getStakingRules",
        args: [getContractAddress(chainId, "Legions"), 1n],
      },
      {
        chainId,
        address: nftHandlerAddress,
        abi: nftHandlerAbi,
        functionName: "getStakingRules",
        args: [getContractAddress(chainId, "Treasures"), 1n],
      },
    ],
  });

  return {
    nftHandlerAddress,
    permitsStakingRulesAddress,
    boostersStakingRulesAddress,
    legionsStakingRulesAddress,
    treasuresStakingRulesAddress,
    charactersStakingRulesAddress: stakingRulesAddresses.find(
      (address) =>
        ![
          permitsStakingRulesAddress,
          boostersStakingRulesAddress,
          legionsStakingRulesAddress,
          treasuresStakingRulesAddress,
        ].includes(address),
    ),
    permitsAddress,
    permitsTokenId,
    permitsMagicMaxStakeable,
    totalEmissionsActivated: Number(formatEther(totalEmissionsActivated)),
    totalMagicStaked,
    totalBoost: Number(formatEther(totalBoost)),
  };
};

export const getHarvesterUserInfo = async ({
  chainId,
  harvesterAddress,
  nftHandlerAddress,
  permitsAddress,
  permitsTokenId,
  userAddress,
}: {
  chainId: SupportedChainId;
  harvesterAddress: AddressString;
  nftHandlerAddress: AddressString;
  permitsAddress: AddressString;
  permitsTokenId: bigint;
  userAddress: AddressString;
}) => {
  const contractAddresses = getContractAddresses(chainId);
  const [
    { result: magicBalance = 0n },
    { result: magicAllowance = 0n },
    { result: permitsBalance = 0n },
    { result: permitsApproved = false },
    { result: boostersBalances = [] },
    { result: boostersApproved = false },
    { result: magicMaxStakeable = 0n },
    { result: [magicStaked] = [0n] },
    { result: totalBoost = 0n },
  ] = await readContracts(config, {
    contracts: [
      {
        chainId,
        address: contractAddresses.MAGIC,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [userAddress],
      },
      {
        chainId,
        address: contractAddresses.MAGIC,
        abi: erc20Abi,
        functionName: "allowance",
        args: [userAddress, harvesterAddress],
      },
      {
        chainId,
        address: permitsAddress,
        abi: erc1155Abi,
        functionName: "balanceOf",
        args: [userAddress, permitsTokenId],
      },
      {
        chainId,
        address: permitsAddress,
        abi: erc1155Abi,
        functionName: "isApprovedForAll",
        args: [userAddress, nftHandlerAddress],
      },
      {
        chainId,
        address: contractAddresses.Consumables,
        abi: consumablesAbi,
        functionName: "balanceOfBatch",
        args: [BOOSTER_TOKEN_IDS.map(() => userAddress), BOOSTER_TOKEN_IDS],
      },
      {
        chainId,
        address: contractAddresses.Consumables,
        abi: consumablesAbi,
        functionName: "isApprovedForAll",
        args: [userAddress, nftHandlerAddress],
      },
      {
        chainId,
        address: harvesterAddress,
        abi: harvesterAbi,
        functionName: "getUserDepositCap",
        args: [userAddress],
      },
      {
        chainId,
        address: harvesterAddress,
        abi: harvesterAbi,
        functionName: "getUserGlobalDeposit",
        args: [userAddress],
      },
      {
        chainId,
        address: harvesterAddress,
        abi: harvesterAbi,
        functionName: "getUserBoost",
        args: [userAddress],
      },
    ],
  });
  return {
    magicBalance,
    magicAllowance,
    permitsBalance,
    permitsApproved,
    boostersBalances: BOOSTER_TOKEN_IDS.map((id, i) => [
      Number(id),
      Number(boostersBalances[i] ?? 0),
    ]) as [number, number][],
    boostersApproved,
    magicMaxStakeable,
    magicStaked,
    // Testnet has a timelock boost applied to it
    totalBoost:
      Number(formatEther(totalBoost)) +
      (chainId === arbitrumSepolia.id ? 0.05 : 0),
  };
};

export const getHarvesterBoostersInfo = async ({
  chainId,
  stakingRulesAddress,
}: {
  chainId: SupportedChainId;
  stakingRulesAddress: AddressString;
}) => {
  const [
    { result: maxStakeable = DEFAULT_BOOSTERS_MAX_STAKEABLE },
    { result: lifetimes = DEFAULT_BOOSTERS_LIFETIMES },
    { result: totalBoost = 0n },
    { result: boosters = [] },
  ] = await readContracts(config, {
    contracts: [
      {
        chainId,
        address: stakingRulesAddress,
        abi: boosterStakingRulesAbi,
        functionName: "maxStakeable",
      },
      {
        chainId,
        address: stakingRulesAddress,
        abi: boosterStakingRulesAbi,
        functionName: "extractorLifetimes",
        args: [BOOSTER_TOKEN_IDS],
      },
      {
        chainId,
        address: stakingRulesAddress,
        abi: boosterStakingRulesAbi,
        functionName: "getExtractorsTotalBoost",
      },
      {
        chainId,
        address: stakingRulesAddress,
        abi: boosterStakingRulesAbi,
        functionName: "getExtractors",
      },
    ],
  });

  const lifetimesMap = lifetimes.reduce(
    (acc, curr, i) => ({
      ...acc,
      [BOOSTER_TOKEN_IDS[i].toString()]: Number(curr),
    }),
    {} as Record<string, number>,
  );

  return {
    maxStakeable,
    lifetimes,
    totalBoost,
    boosters: boosters.map(({ tokenId, user, stakedTimestamp }) => ({
      tokenId,
      user,
      endTimestamp:
        Number(stakedTimestamp) + (lifetimesMap[tokenId.toString()] ?? 0),
    })),
  };
};
