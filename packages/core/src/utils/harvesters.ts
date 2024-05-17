import { type Config, readContracts } from "@wagmi/core";
import { erc20Abi, erc721Abi, formatEther, zeroAddress } from "viem";
import { arbitrumSepolia } from "viem/chains";

import type {
  CorruptionRemoval,
  HarvesterCorruptionRemovalInfo,
  HarvesterInfo,
  HarvesterUserInfo,
  InventoryToken,
  Token,
} from "../../../../apps/api/src/schema";
import { boostersStakingRulesAbi } from "../abis/boostersStakingRulesAbi";
import { charactersStakingRulesAbi } from "../abis/charactersStakingRulesAbi";
import { consumablesAbi } from "../abis/consumablesAbi";
import { corruptionAbi } from "../abis/corruptionAbi";
import { erc1155Abi } from "../abis/erc1155Abi";
import { harvesterAbi } from "../abis/harvesterAbi";
import { legionsStakingRulesAbi } from "../abis/legionsStakingRulesAbi";
import { middlemanAbi } from "../abis/middlemanAbi";
import { nftHandlerAbi } from "../abis/nftHandlerAbi";
import { permitsStakingRulesAbi } from "../abis/permitsStakingRulesAbi";
import { BRIDGEWORLD_API_URL, TOKEN_IDS } from "../constants";
import type { AddressString, SupportedChainId } from "../types";
import { sumArray } from "./array";
import { getContractAddress, getContractAddresses } from "./contracts";
import {
  fetchCorruptionRemovalRecipes,
  fetchCorruptionRemovals,
} from "./corruption";
import { fetchTokens, fetchUserInventory } from "./inventory";
import { DEFAULT_WAGMI_CONFIG } from "./wagmi";

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

const fetchIndexedHarvester = async ({
  chainId,
  harvesterAddress,
  userAddress,
}: {
  chainId: SupportedChainId;
  harvesterAddress: string;
  userAddress: string;
}) => {
  const response = await fetch(
    BRIDGEWORLD_API_URL[chainId as keyof typeof BRIDGEWORLD_API_URL],
    {
      method: "POST",
      body: JSON.stringify({
        query: `
      {
        harvester(id: "${harvesterAddress.toLowerCase()}") {
          userStakedCharacters: stakedTokens(
            first: 1000
            where: {
              user: "${userAddress.toLowerCase()}"
              token_: { category: Other }
            }
          ) {
            token {
              contract
              tokenId
            }
            quantity
          }
          userStakedLegions: stakedTokens(
            first: 1000
            where: {
              user: "${userAddress.toLowerCase()}"
              token_: { category: Legion }
            }
          ) {
            token {
              contract
              tokenId
            }
            quantity
          }
        }
      }
      `,
      }),
    },
  );
  const {
    data: { harvester },
  } = (await response.json()) as {
    data: {
      harvester: {
        userStakedCharacters: {
          token: {
            contract: string;
            tokenId: string;
          };
          quantity: string;
        }[];
        userStakedLegions: {
          token: {
            contract: string;
            tokenId: string;
          };
          quantity: string;
        }[];
      };
    };
  };
  return harvester;
};

export const getHarvesterInfo = async ({
  chainId,
  harvesterAddress,
  wagmiConfig = DEFAULT_WAGMI_CONFIG,
}: {
  chainId: SupportedChainId;
  harvesterAddress: AddressString;
  wagmiConfig?: Config;
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
  ] = await readContracts(wagmiConfig, {
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
    ],
  });
  const [
    { result: stakingRulesAddresses = [] },
    { result: permitsStakingRulesAddress = zeroAddress },
    { result: boostersStakingRulesAddress = zeroAddress },
    { result: legionsStakingRulesAddress },
    { result: treasuresStakingRulesAddress },
  ] = await readContracts(wagmiConfig, {
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
    { result: charactersAddress = zeroAddress },
  ] = await readContracts(wagmiConfig, {
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
      // TODO: don't call this if no characters staking rules
      {
        chainId,
        address: charactersStakingRulesAddress ?? zeroAddress,
        abi: charactersStakingRulesAbi,
        functionName: "nftAddress",
      },
    ],
  });

  const boostersLifetimesMap = boostersLifetimes.reduce(
    (acc, curr, i) => {
      acc[BOOSTER_TOKEN_IDS[i].toString()] = Number(curr);
      return acc;
    },
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
    charactersAddress,
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
    charactersStakingRulesAddress,
    legionsStakingRulesAddress,
    charactersAddress,
  },
  userAddress,
  inventoryApiUrl,
  inventoryApiKey,
  wagmiConfig = DEFAULT_WAGMI_CONFIG,
}: {
  chainId: SupportedChainId;
  harvesterInfo: HarvesterInfo;
  userAddress: AddressString;
  inventoryApiUrl?: string;
  inventoryApiKey?: string;
  wagmiConfig?: Config;
}): Promise<HarvesterUserInfo> => {
  const contractAddresses = getContractAddresses(chainId);
  const [
    [
      { result: userMagicBalance = 0n },
      { result: userMagicAllowance = 0n },
      { result: userPermitsBalance = 0n },
      { result: userPermitsApproved = false },
      { result: userBoostersBalances = [] },
      { result: userBoostersApproved = false },
      { result: userPermitsMaxStakeable = 0n },
      { result: userPermitsStaked = 0n },
      { result: userCharactersApproved = false },
      { result: userCharactersMaxStakeable = 0n },
      { result: userCharactersStaked = 0n },
      { result: userCharacterMaxBoost = 0n },
      { result: userLegionsApproved = false },
      { result: userLegionsMaxWeightStakeable = 0n },
      { result: userLegionsWeightStaked = 0n },
      { result: userMagicMaxStakeable = 0n },
      { result: [userMagicStaked] = [0n] },
      { result: userTotalBoost = 0n },
      { result: userMagicRewardsClaimable = 0n },
    ],
    indexedHarvester,
  ] = await Promise.all([
    readContracts(wagmiConfig, {
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
        // TODO: don't call this if no characters staking rules
        // TODO: handle non-ERC721 characters?
        {
          chainId,
          address: (charactersAddress ?? zeroAddress) as AddressString,
          abi: erc721Abi,
          functionName: "isApprovedForAll",
          args: [userAddress, nftHandlerAddress as AddressString],
        },
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
          functionName: "amountStaked",
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
          address: contractAddresses.Legions,
          abi: erc721Abi,
          functionName: "isApprovedForAll",
          args: [userAddress, nftHandlerAddress as AddressString],
        },
        // TODO: don't call this if no legions staking rules
        {
          chainId,
          address: (legionsStakingRulesAddress ?? zeroAddress) as AddressString,
          abi: legionsStakingRulesAbi,
          functionName: "maxLegionWeight",
        },
        {
          chainId,
          address: (legionsStakingRulesAddress ?? zeroAddress) as AddressString,
          abi: legionsStakingRulesAbi,
          functionName: "weightStaked",
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
    }),
    fetchIndexedHarvester({
      chainId,
      harvesterAddress,
      userAddress,
    }),
  ]);

  let userInventoryCharacters: InventoryToken[] = [];
  let userInventoryLegions: InventoryToken[] = [];
  let userInventoryBoosters: InventoryToken[] = [];
  let userStakedCharacters: Token[] = [];
  let userStakedLegions: Token[] = [];
  if (inventoryApiUrl && inventoryApiKey) {
    const [stakedTokens, inventoryTokens = []] = await Promise.all([
      fetchTokens({
        chainId,
        apiUrl: inventoryApiUrl,
        apiKey: inventoryApiKey,
        tokens: [
          ...indexedHarvester.userStakedCharacters.map(
            ({ token: { contract: address, tokenId } }) => ({
              address,
              tokenId,
            }),
          ),
          ...indexedHarvester.userStakedLegions.map(
            ({ token: { contract: address, tokenId } }) => ({
              address,
              tokenId,
            }),
          ),
        ],
      }),
      fetchUserInventory({
        chainId,
        apiUrl: inventoryApiUrl,
        apiKey: inventoryApiKey,
        userAddress,
        collectionAddresses: [
          contractAddresses.Consumables,
          ...(charactersAddress ? [charactersAddress] : []),
          ...(legionsStakingRulesAddress ? [contractAddresses.Legions] : []),
        ],
      }),
    ]);

    userStakedCharacters = stakedTokens.filter(
      ({ address }) =>
        address.toLowerCase() === charactersAddress?.toLowerCase(),
    );
    userStakedLegions = stakedTokens.filter(
      ({ address }) =>
        address.toLowerCase() === contractAddresses.Legions.toLowerCase(),
    );
    userInventoryCharacters = inventoryTokens.filter(
      ({ address }) =>
        address.toLowerCase() === charactersAddress?.toLowerCase(),
    );
    userInventoryLegions = inventoryTokens.filter(
      ({ address }) =>
        address.toLowerCase() === contractAddresses.Legions.toLowerCase(),
    );
    userInventoryBoosters = inventoryTokens
      .filter(
        ({ address, tokenId }) =>
          address.toLowerCase() ===
            contractAddresses.Consumables.toLowerCase() &&
          (BOOSTER_TOKEN_IDS as bigint[]).includes(BigInt(tokenId)),
      )
      .sort((a, b) => Number(a.tokenId) - Number(b.tokenId));
  }

  return {
    userMagicBalance: userMagicBalance.toString(),
    userMagicAllowance: userMagicAllowance.toString(),
    userPermitsBalance: Number(userPermitsBalance),
    userPermitsApproved,
    userBoostersBalances: BOOSTER_TOKEN_IDS.reduce(
      (acc, id, i) => {
        acc[Number(id)] = Number(userBoostersBalances[i]);
        return acc;
      },
      {} as Record<number, number>,
    ),
    userInventoryBoosters,
    userBoostersApproved,
    userPermitsMaxStakeable: Number(userPermitsMaxStakeable),
    userPermitsStaked: Number(userPermitsStaked),
    userInventoryCharacters,
    userStakedCharacters,
    userCharactersApproved,
    userCharactersMaxStakeable: Number(userCharactersMaxStakeable),
    userCharactersStaked: Number(userCharactersStaked),
    userCharactersMaxBoost:
      Number(formatEther(userCharacterMaxBoost)) *
      Number(userCharactersMaxStakeable),
    userCharactersBoost: sumArray(
      userStakedCharacters.map(
        ({ attributes }) =>
          Number(
            (
              (attributes.find(({ type }) => type === "Staking Boost")
                ?.value as string | undefined) ?? "0"
            ).replace("%", ""),
          ) / 100,
      ),
    ),
    userInventoryLegions,
    userStakedLegions,
    userLegionsApproved,
    userLegionsMaxWeightStakeable: Number(
      formatEther(userLegionsMaxWeightStakeable),
    ),
    userLegionsWeightStaked: Number(formatEther(userLegionsWeightStaked)),
    userLegionsBoost: sumArray(
      userStakedLegions.map(
        ({ attributes }) =>
          Number(
            (
              (attributes.find(({ type }) => type === "Staking Boost")
                ?.value as string | undefined) ?? "0"
            ).replace("%", ""),
          ) / 100,
      ),
    ),
    userMagicMaxStakeable: userMagicMaxStakeable.toString(),
    userMagicStaked: userMagicStaked.toString(),
    userTotalBoost:
      Number(formatEther(userTotalBoost)) +
      (chainId === arbitrumSepolia.id ? 0.05 : 0), // Testnet has a timelock boost applied to it
    userMagicRewardsClaimable: userMagicRewardsClaimable.toString(),
  };
};

export const fetchHarvesterCorruptionRemovalInfo = async ({
  chainId,
  harvesterAddress,
  userAddress,
  inventoryApiUrl,
  inventoryApiKey,
  wagmiConfig = DEFAULT_WAGMI_CONFIG,
}: {
  chainId: SupportedChainId;
  harvesterAddress: string;
  userAddress?: string;
  inventoryApiUrl?: string;
  inventoryApiKey?: string;
  wagmiConfig?: Config;
}): Promise<HarvesterCorruptionRemovalInfo> => {
  const corruptionRemovalAddress = getContractAddress(
    chainId,
    "CorruptionRemoval",
  );
  const corruptionRemovalRecipes = await fetchCorruptionRemovalRecipes({
    chainId,
    buildingAddress: harvesterAddress,
    wagmiConfig,
  });

  let userCorruptionRemovals: CorruptionRemoval[] = [];
  let userInventoryCorruptionRemovalRecipeItems: InventoryToken[] = [];
  let userApprovalsCorruptionRemovalRecipeItems: Record<
    string,
    {
      operator: string;
      approved: boolean;
    }
  > = {};
  if (userAddress) {
    // Prep mapping of addresses to operator for Corruption removal approval
    const addressesToOperator: Record<string, string> = {};
    for (const { items } of corruptionRemovalRecipes) {
      for (const { address, customHandler } of items) {
        if (!addressesToOperator[address]) {
          addressesToOperator[address.toLowerCase()] = (
            customHandler ?? corruptionRemovalAddress
          ).toLowerCase();
        }
      }
    }
    const addressesAndOperators = Object.entries(addressesToOperator);

    const [corruptionRemovals, approvals, inventoryTokens = []] =
      await Promise.all([
        fetchCorruptionRemovals({
          chainId,
          buildingAddress: harvesterAddress,
          userAddress,
        }),
        readContracts(wagmiConfig, {
          contracts: addressesAndOperators.map(([address, operator]) => ({
            chainId,
            address: address as AddressString,
            // TODO: change this to be generic
            abi: erc1155Abi,
            functionName: "isApprovedForAll",
            args: [userAddress, operator as AddressString],
          })),
        }),
        ...(inventoryApiUrl && inventoryApiKey
          ? [
              fetchUserInventory({
                chainId,
                apiUrl: inventoryApiUrl,
                apiKey: inventoryApiKey,
                userAddress,
                collectionAddresses: corruptionRemovalRecipes.flatMap(
                  ({ items }) => items.map(({ address }) => address),
                ),
              }),
            ]
          : []),
      ]);

    userCorruptionRemovals = corruptionRemovals;
    // TODO: filter Corruption Removal recipe item inventory to only include relevant token IDs
    userInventoryCorruptionRemovalRecipeItems = inventoryTokens;
    userApprovalsCorruptionRemovalRecipeItems = approvals.reduce(
      (acc, { result }, i) => {
        acc[addressesAndOperators[i][0]] = {
          operator: addressesAndOperators[i][1],
          approved: !!result,
        };
        return acc;
      },
      {} as Record<
        string,
        {
          operator: string;
          approved: boolean;
        }
      >,
    );
  }

  return {
    corruptionRemovalRecipes,
    userInventoryCorruptionRemovalRecipeItems,
    userApprovalsCorruptionRemovalRecipeItems,
    userCorruptionRemovals,
  };
};
