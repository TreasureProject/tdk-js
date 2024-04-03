import { readContracts } from "@wagmi/core";
import { erc20Abi, formatEther, zeroAddress } from "viem";
import { arbitrumSepolia } from "viem/chains";

import type {
  HarvesterInfo,
  HarvesterUserInfo,
} from "../../../../apps/api/src/schema";
import { boostersStakingRulesAbi } from "../abis/boostersStakingRulesAbi";
import { consumablesAbi } from "../abis/consumablesAbi";
import { corruptionAbi } from "../abis/corruptionAbi";
import { corruptionRemovalAbi } from "../abis/corruptionRemovalAbi";
import { erc1155Abi } from "../abis/erc1155Abi";
import { harvesterAbi } from "../abis/harvesterAbi";
import { middlemanAbi } from "../abis/middlemanAbi";
import { nftHandlerAbi } from "../abis/nftHandlerAbi";
import { permitsStakingRulesAbi } from "../abis/permitsStakingRulesAbi";
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
}): Promise<HarvesterInfo> => {
  const contractAddresses = getContractAddresses(chainId);

  // Fetch global and config data
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
    { result: [, , , , , corruptionMaxGenerated = 0n] = [] },
    { result: totalCorruption = 0n },
    // { result: corruptionRecipes = []}
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
      {
        chainId,
        address: contractAddresses.Corruption,
        abi: corruptionAbi,
        functionName: "addressToStreamInfo",
        args: [harvesterAddress],
      },
      {
        chainId,
        address: contractAddresses.Corruption,
        abi: corruptionAbi,
        functionName: "balanceOf",
        args: [harvesterAddress],
      },
      {
        chainId,
        address: contractAddresses.CorruptionRemoval,
        abi: corruptionRemovalAbi,
        functionName: "recipeInfosForBuilding",
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

  // Fetch staking rules data
  const [
    { result: permitsMaxStakeable = 0n },
    { result: boostersMaxStakeable = DEFAULT_BOOSTERS_MAX_STAKEABLE },
    { result: boostersLifetimes = DEFAULT_BOOSTERS_LIFETIMES },
    { result: totalBoostersBoost = 0n },
    { result: boosters = [] },
  ] = await readContracts(config, {
    contracts: [
      {
        chainId,
        address: permitsStakingRulesAddress,
        abi: permitsStakingRulesAbi,
        functionName: "maxStakeableTotal",
      },
      {
        chainId,
        address: boostersStakingRulesAddress,
        abi: boostersStakingRulesAbi,
        functionName: "maxStakeable",
      },
      {
        chainId,
        address: boostersStakingRulesAddress,
        abi: boostersStakingRulesAbi,
        functionName: "extractorLifetimes",
        args: [BOOSTER_TOKEN_IDS],
      },
      {
        chainId,
        address: boostersStakingRulesAddress,
        abi: boostersStakingRulesAbi,
        functionName: "getExtractorsTotalBoost",
      },
      {
        chainId,
        address: boostersStakingRulesAddress,
        abi: boostersStakingRulesAbi,
        functionName: "getExtractors",
      },
    ],
  });

  const boostersLifetimesMap = boostersLifetimes.reduce(
    (acc, curr, i) => ({
      ...acc,
      [BOOSTER_TOKEN_IDS[i].toString()]: Number(curr),
    }),
    {} as Record<string, number>,
  );

  return {
    id: harvesterAddress,
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
    permitsTokenId: Number(permitsTokenId),
    permitsMaxStakeable: Number(permitsMaxStakeable),
    permitsMagicMaxStakeable: permitsMagicMaxStakeable.toString(),
    magicMaxStakeable: (
      permitsMaxStakeable * permitsMagicMaxStakeable
    ).toString(),
    boostersMaxStakeable: Number(boostersMaxStakeable),
    corruptionMaxGenerated: corruptionMaxGenerated.toString(),
    totalEmissionsActivated: Number(formatEther(totalEmissionsActivated)),
    totalMagicStaked: totalMagicStaked.toString(),
    totalBoost: Number(formatEther(totalBoost)),
    totalBoostersBoost: Number(formatEther(totalBoostersBoost)),
    totalCorruption: totalCorruption.toString(),
    boosters: boosters.map(({ tokenId, user, stakedTimestamp }) => ({
      tokenId: Number(tokenId),
      user,
      endTimestamp:
        Number(stakedTimestamp) +
        (boostersLifetimesMap[tokenId.toString()] ?? 0),
    })),
  };
};

export const getHarvesterUserInfo = async ({
  chainId,
  harvesterInfo: {
    id: harvesterAddress,
    nftHandlerAddress,
    permitsStakingRulesAddress,
    permitsAddress,
    permitsTokenId,
  },
  userAddress,
}: {
  chainId: SupportedChainId;
  harvesterInfo: HarvesterInfo;
  userAddress: AddressString;
}): Promise<HarvesterUserInfo> => {
  const contractAddresses = getContractAddresses(chainId);
  const [
    { result: userMagicBalance = 0n },
    { result: userMagicAllowance = 0n },
    { result: userPermitsBalance = 0n },
    { result: userPermitsApproved = false },
    { result: userBoostersBalances = [] },
    { result: userBoostersApproved = false },
    { result: userPermitsMaxStakeable = 0n },
    { result: userPermitsStaked = 0n },
    { result: userMagicMaxStakeable = 0n },
    { result: [userMagicStaked] = [0n] },
    { result: userTotalBoost = 0n },
    { result: userMagicRewardsClaimable = 0n },
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
        args: [userAddress, harvesterAddress as AddressString],
      },
      {
        chainId,
        address: permitsAddress as AddressString,
        abi: erc1155Abi,
        functionName: "balanceOf",
        args: [userAddress, BigInt(permitsTokenId)],
      },
      {
        chainId,
        address: permitsAddress as AddressString,
        abi: erc1155Abi,
        functionName: "isApprovedForAll",
        args: [userAddress, nftHandlerAddress as AddressString],
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
        args: [userAddress, nftHandlerAddress as AddressString],
      },
      {
        chainId,
        address: permitsStakingRulesAddress as AddressString,
        abi: permitsStakingRulesAbi,
        functionName: "maxStakeablePerUser",
      },
      {
        chainId,
        address: permitsStakingRulesAddress as AddressString,
        abi: permitsStakingRulesAbi,
        functionName: "getAmountStaked",
        args: [userAddress],
      },
      {
        chainId,
        address: harvesterAddress as AddressString,
        abi: harvesterAbi,
        functionName: "getUserDepositCap",
        args: [userAddress],
      },
      {
        chainId,
        address: harvesterAddress as AddressString,
        abi: harvesterAbi,
        functionName: "getUserGlobalDeposit",
        args: [userAddress],
      },
      {
        chainId,
        address: harvesterAddress as AddressString,
        abi: harvesterAbi,
        functionName: "getUserBoost",
        args: [userAddress],
      },
      {
        chainId,
        address: harvesterAddress as AddressString,
        abi: harvesterAbi,
        functionName: "pendingRewardsAll",
        args: [userAddress],
      },
    ],
  });
  return {
    userMagicBalance: userMagicBalance.toString(),
    userMagicAllowance: userMagicAllowance.toString(),
    userPermitsBalance: Number(userPermitsBalance),
    userPermitsApproved,
    userBoostersBalances: BOOSTER_TOKEN_IDS.reduce(
      (acc, id, i) => ({
        ...acc,
        [Number(id)]: Number(userBoostersBalances[i]),
      }),
      {} as Record<number, number>,
    ),
    userBoostersApproved,
    userPermitsMaxStakeable: Number(userPermitsMaxStakeable),
    userPermitsStaked: Number(userPermitsStaked),
    userMagicMaxStakeable: userMagicMaxStakeable.toString(),
    userMagicStaked: userMagicStaked.toString(),
    // Testnet has a timelock boost applied to it
    userTotalBoost:
      Number(formatEther(userTotalBoost)) +
      (chainId === arbitrumSepolia.id ? 0.05 : 0),
    userMagicRewardsClaimable: userMagicRewardsClaimable.toString(),
  };
};
