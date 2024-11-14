import { type Config, readContracts } from "@wagmi/core";
import { ZERO_ADDRESS, toEther } from "thirdweb";
import { arbitrumSepolia } from "thirdweb/chains";

import type {
  HarvesterInfo,
  HarvesterUserInfo,
  InventoryToken,
  Token,
} from "../../../../apps/api/src/schema";
import { boostersStakingRulesAbi } from "../abis/boostersStakingRulesAbi";
import { charactersStakingRulesAbi } from "../abis/charactersStakingRulesAbi";
import { consumablesAbi } from "../abis/consumablesAbi";
import { erc20Abi } from "../abis/erc20Abi";
import { erc721Abi } from "../abis/erc721Abi";
import { erc1155Abi } from "../abis/erc1155Abi";
import { harvesterAbi } from "../abis/harvesterAbi";
import { legionsStakingRulesAbi } from "../abis/legionsStakingRulesAbi";
import { middlemanAbi } from "../abis/middlemanAbi";
import { nftHandlerAbi } from "../abis/nftHandlerAbi";
import { permitsStakingRulesAbi } from "../abis/permitsStakingRulesAbi";
import { BRIDGEWORLD_API_URL, TOKEN_IDS } from "../constants";
import type { AddressString } from "../types";
import { sumArray } from "../utils/array";
import { getContractAddress, getContractAddresses } from "../utils/contracts";
import { fetchTokens, fetchUserInventory } from "../utils/inventory";

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
  chainId: number;
  harvesterAddress: string;
  userAddress: string;
}) => {
  const apiUrl = BRIDGEWORLD_API_URL[chainId];
  if (!apiUrl) {
    throw new Error(`No Bridgeworld API URL found for chain ID ${chainId}`);
  }

  const response = await fetch(apiUrl, {
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
  });
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
  wagmiConfig,
}: {
  chainId: number;
  harvesterAddress: AddressString;
  wagmiConfig: Config;
}): Promise<HarvesterInfo> => {
  const contractAddresses = getContractAddresses(chainId);

  // Fetch global and config data
  const [
    { result: nftHandlerAddress = ZERO_ADDRESS },
    {
      result: [permitsAddress, permitsTokenId, permitsMagicMaxStakeable] = [
        ZERO_ADDRESS,
        0n,
        0n,
      ] as const,
    },
    { result: totalEmissionsActivated = 0n },
    { result: totalMagicStaked = 0n },
    { result: totalBoost = 0n },
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
    ],
  });
  const [
    { result: stakingRulesAddresses = [] },
    { result: permitsStakingRulesAddress = ZERO_ADDRESS },
    { result: boostersStakingRulesAddress = ZERO_ADDRESS },
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
    { result: charactersAddress = ZERO_ADDRESS },
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
        address: charactersStakingRulesAddress ?? ZERO_ADDRESS,
        abi: charactersStakingRulesAbi,
        functionName: "nftAddress",
      },
    ],
  });

  const boostersLifetimesMap = boostersLifetimes.reduce(
    (acc, curr, i) => {
      const tokenId = BOOSTER_TOKEN_IDS[i];
      if (tokenId) {
        acc[tokenId.toString()] = Number(curr);
      }

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
    totalEmissionsActivated: Number(toEther(totalEmissionsActivated)),
    totalMagicStaked: totalMagicStaked.toString(),
    totalBoost: Number(toEther(totalBoost)),
    totalBoostersBoost: Number(toEther(totalBoostersBoost)),
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
  wagmiConfig,
}: {
  chainId: number;
  harvesterInfo: HarvesterInfo;
  userAddress: AddressString;
  inventoryApiUrl?: string;
  inventoryApiKey?: string;
  wagmiConfig: Config;
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
      {
        result: [userMagicStaked] = [0n],
      },
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
          address: (charactersAddress ?? ZERO_ADDRESS) as AddressString,
          abi: erc721Abi,
          functionName: "isApprovedForAll",
          args: [userAddress, nftHandlerAddress as AddressString],
        },
        {
          chainId,
          address: (charactersStakingRulesAddress ??
            ZERO_ADDRESS) as AddressString,
          abi: charactersStakingRulesAbi,
          functionName: "maxStakeablePerUser",
        },
        {
          chainId,
          address: (charactersStakingRulesAddress ??
            ZERO_ADDRESS) as AddressString,
          abi: charactersStakingRulesAbi,
          functionName: "amountStaked",
          args: [userAddress],
        },
        {
          chainId,
          address: (charactersStakingRulesAddress ??
            ZERO_ADDRESS) as AddressString,
          abi: charactersStakingRulesAbi,
          // TODO: change this to be generic
          functionName: "levelToUserDepositBoost",
          args: [100n],
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
          address: (legionsStakingRulesAddress ??
            ZERO_ADDRESS) as AddressString,
          abi: legionsStakingRulesAbi,
          functionName: "maxLegionWeight",
        },
        {
          chainId,
          address: (legionsStakingRulesAddress ??
            ZERO_ADDRESS) as AddressString,
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
      Number(toEther(userCharacterMaxBoost)) *
      Number(userCharactersMaxStakeable),
    userCharactersBoost: sumArray(
      userStakedCharacters.map(
        ({ attributes }) =>
          Number(
            (
              (attributes.find(({ type }) => type === "Staking Boost")?.value as
                | string
                | undefined) ?? "0"
            ).replace("%", ""),
          ) / 100,
      ),
    ),
    userInventoryLegions,
    userStakedLegions,
    userLegionsApproved,
    userLegionsMaxWeightStakeable: Number(
      toEther(userLegionsMaxWeightStakeable),
    ),
    userLegionsWeightStaked: Number(toEther(userLegionsWeightStaked)),
    userLegionsBoost: sumArray(
      userStakedLegions.map(
        ({ attributes }) =>
          Number(
            (
              (attributes.find(({ type }) => type === "Staking Boost")?.value as
                | string
                | undefined) ?? "0"
            ).replace("%", ""),
          ) / 100,
      ),
    ),
    userMagicMaxStakeable: userMagicMaxStakeable.toString(),
    userMagicStaked: userMagicStaked.toString(),
    userTotalBoost:
      Number(toEther(userTotalBoost)) +
      (chainId === arbitrumSepolia.id ? 0.05 : 0), // Testnet has a timelock boost applied to it
    userMagicRewardsClaimable: userMagicRewardsClaimable.toString(),
  };
};
