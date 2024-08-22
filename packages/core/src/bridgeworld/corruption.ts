import { type Config, readContracts } from "@wagmi/core";
import { decodeAbiParameters, parseAbiParameters } from "viem";

import type {
  CorruptionRemoval,
  CorruptionRemovalRecipe,
} from "../../../../apps/api/src/schema";
import { corruptionRemovalAbi } from "../abis/corruptionRemovalAbi";
import { BRIDGEWORLD_CORRUPTION_API_URL } from "../constants";
import type { AddressString } from "../types";
import { getContractAddresses } from "../utils/contracts";

const ERC1155_TOKEN_SET_CORRUPTION_HANDLER_ABI_PARAMS = parseAbiParameters(
  "(uint256 amount, address collection, uint256[] tokenIds)",
);

export const fetchCorruptionRemovalRecipes = async ({
  chainId,
  buildingAddress,
  wagmiConfig,
}: {
  chainId: number;
  buildingAddress: string;
  wagmiConfig: Config;
}): Promise<CorruptionRemovalRecipe[]> => {
  const contractAddresses = getContractAddresses(chainId);
  const [
    { result: corruptionRemovalRecipeIds = [] },
    { result: corruptionRemovalRecipeInfo = [] },
  ] = await readContracts(wagmiConfig, {
    contracts: [
      {
        chainId,
        address: contractAddresses.CorruptionRemoval,
        abi: corruptionRemovalAbi,
        functionName: "recipeIdsForBuilding",
        args: [buildingAddress as AddressString],
      },
      {
        chainId,
        address: contractAddresses.CorruptionRemoval,
        abi: corruptionRemovalAbi,
        functionName: "recipeInfosForBuilding",
        args: [buildingAddress as AddressString],
      },
    ],
  });

  return corruptionRemovalRecipeInfo.map(({ corruptionRemoved, items }, i) => ({
    id: corruptionRemovalRecipeIds[i]?.toString() ?? "",
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
              ERC1155_TOKEN_SET_CORRUPTION_HANDLER_ABI_PARAMS,
              customRequirementData,
            );

          return {
            address: address.toLowerCase(),
            tokenIds: tokenIds.map((tokenId) => Number(tokenId)),
            amount: Number(erc1155Amount),
            customHandler: customHandler.toLowerCase(),
          };
        }

        return {
          address: itemAddress.toLowerCase(),
          tokenIds: [Number(itemId)],
          amount: Number(amount),
        };
      },
    ),
  }));
};

export const fetchCorruptionRemovals = async ({
  chainId,
  buildingAddress,
  userAddress,
}: {
  chainId: number;
  buildingAddress: string;
  userAddress: string;
}): Promise<CorruptionRemoval[]> => {
  const response = await fetch(
    BRIDGEWORLD_CORRUPTION_API_URL[
      chainId as keyof typeof BRIDGEWORLD_CORRUPTION_API_URL
    ] ?? "",
    {
      method: "POST",
      body: JSON.stringify({
        query: `{
        removals(
          where: {
            building: "${buildingAddress.toLowerCase()}"
            user: "${userAddress.toLowerCase()}"
            status_not: Finished
          }
          orderBy: startTimestamp
          orderDirection: asc
        ) {
          requestId
          recipe {
            recipeId
          }
          status
        }
      }`,
      }),
    },
  );
  const {
    data: { removals },
  } = (await response.json()) as {
    data: {
      removals: {
        requestId: string;
        recipe: {
          recipeId: string;
        };
        status: "Started" | "Ready";
      }[];
    };
  };
  return removals.map(({ requestId, recipe: { recipeId }, status }) => ({
    requestId,
    recipeId,
    status,
  }));
};
