import { readContracts } from "@wagmi/core";
import {
  decodeAbiParameters,
  erc20Abi,
  formatEther,
  parseAbiParameters,
  zeroAddress,
} from "viem";
import { arbitrumSepolia } from "viem/chains";

import type {
  HarvesterInfo,
  HarvesterUserInfo,
} from "../../../../apps/api/src/schema";
import { boostersStakingRulesAbi } from "../abis/boostersStakingRulesAbi";
import { charactersStakingRulesAbi } from "../abis/charactersStakingRulesAbi";
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
    { result: corruptionRemovalRecipeIds = [] },
    { result: corruptionRemovalRecipes = [] },
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
        functionName: "recipeIdsForBuilding",
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

  const charactersStakingRulesAddress = stakingRulesAddresses.find(
    (address) =>
      ![
        permitsStakingRulesAddress,
        boostersStakingRulesAddress,
        legionsStakingRulesAddress,
        treasuresStakingRulesAddress,
      ].includes(address),
  );

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
    charactersStakingRulesAddress,
    permitsAddress,
    permitsTokenId: Number(permitsTokenId),
    permitsMaxStakeable: Number(permitsMaxStakeable),
    permitsMagicMaxStakeable: permitsMagicMaxStakeable.toString(),
    magicMaxStakeable: (
      permitsMaxStakeable * permitsMagicMaxStakeable
    ).toString(),
    boostersMaxStakeable: Number(boostersMaxStakeable),
    corruptionMaxGenerated: corruptionMaxGenerated.toString(),
    corruptionRemovalRecipes: corruptionRemovalRecipes.map(
      ({ corruptionRemoved, items }, i) => ({
        id: corruptionRemovalRecipeIds[i].toString(),
        corruptionRemoved: corruptionRemoved.toString(),
        items: items.map(
          ({
            itemAddress,
            itemId,
            amount,
            customHandler,
            customRequirementData,
          }) => {
            if (
              customHandler.toLowerCase() ===
              contractAddresses.ERC1155TokenSetCorruptionHandler
            ) {
              const [{ amount: erc1155Amount, collection: address, tokenIds }] =
                decodeAbiParameters(
                  parseAbiParameters(
                    "(uint256 amount, address collection, uint256[] tokenIds)",
                  ),
                  customRequirementData,
                );

              return {
                address,
                tokenIds: tokenIds.map((tokenId) => Number(tokenId)),
                amount: Number(erc1155Amount),
                customHandler,
              };
            }

            return {
              address: itemAddress,
              tokenIds: [Number(itemId)],
              amount: Number(amount),
            };
          },
        ),
      }),
    ),
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
    charactersStakingRulesAddress,
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
    { result: userCharactersMaxStakeable = 0n },
    { result: userCharactersStaked = 0n },
    { result: userCharacterMaxBoost = 0n },
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
      // TODO: don't call this for if no characters staking rules
      {
        chainId,
        address: (charactersStakingRulesAddress ??
          zeroAddress) as AddressString,
        abi: charactersStakingRulesAbi,
        functionName: "maxStakeablePerUser",
      },
      {
        chainId,
        address: (charactersStakingRulesAddress ??
          zeroAddress) as AddressString,
        abi: charactersStakingRulesAbi,
        // TODO: change this to be generic
        functionName: "zeeAmountStaked",
        args: [userAddress],
      },
      {
        chainId,
        address: (charactersStakingRulesAddress ??
          zeroAddress) as AddressString,
        abi: charactersStakingRulesAbi,
        // TODO: change this to be generic
        functionName: "levelToUserDepositBoost",
        args: [50n],
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
    userCharactersMaxStakeable: Number(userCharactersMaxStakeable),
    userCharactersStaked: Number(userCharactersStaked),
    userCharactersMaxBoost:
      Number(formatEther(userCharacterMaxBoost)) *
      Number(userCharactersMaxStakeable),
    userCharactersBoost: 0, // TODO: calculate
    userMagicMaxStakeable: userMagicMaxStakeable.toString(),
    userMagicStaked: userMagicStaked.toString(),
    userTotalBoost:
      Number(formatEther(userTotalBoost)) +
      (chainId === arbitrumSepolia.id ? 0.05 : 0), // Testnet has a timelock boost applied to it
    userMagicRewardsClaimable: userMagicRewardsClaimable.toString(),
  };
};
