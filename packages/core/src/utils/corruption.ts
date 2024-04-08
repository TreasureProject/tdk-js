import { readContracts } from "@wagmi/core";
import { decodeAbiParameters, parseAbiParameters } from "viem";

import type {
  CorruptionRemoval,
  CorruptionRemovalRecipe,
} from "../../../../apps/api/src/schema";
import { corruptionRemovalAbi } from "../abis/corruptionRemovalAbi";
import { BRIDGEWORLD_CORRUPTION_API_URL } from "../constants";
import type { AddressString, SupportedChainId } from "../types";
import { getContractAddresses } from "./contracts";
import { config } from "./wagmi";

const ERC1155_TOKEN_SET_CORRUPTION_HANDLER_ABI_PARAMS = parseAbiParameters(
  "(uint256 amount, address collection, uint256[] tokenIds)",
);

export const fetchCorruptionRemovalRecipes = async ({
  chainId,
  buildingAddress,
}: {
  chainId: SupportedChainId;
  buildingAddress: string;
}): Promise<CorruptionRemovalRecipe[]> => {
  const contractAddresses = getContractAddresses(chainId);
  const [
    { result: corruptionRemovalRecipeIds = [] },
    { result: corruptionRemovalRecipeInfo = [] },
  ] = await readContracts(config, {
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
              ERC1155_TOKEN_SET_CORRUPTION_HANDLER_ABI_PARAMS,
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
  }));
};

export const fetchCorruptionRemovals = async ({
  chainId,
  buildingAddress,
  userAddress,
}: {
  chainId: SupportedChainId;
  buildingAddress: string;
  userAddress: string;
}) => {
  const response = await fetch(BRIDGEWORLD_CORRUPTION_API_URL[chainId], {
    method: "POST",
    body: JSON.stringify({
      query: `{
        removals(
          where: {
            building: "${buildingAddress.toLowerCase()}"
            user: "${userAddress.toLowerCase()}
            status_not: Finished
          }
          orderBy: startTimestamp
          orderDirection: asc
        ) {
          requestId
          status
          corruptionRemoved
        }
      }`,
    }),
  });
  const {
    data: { removals },
  } = (await response.json()) as {
    data: {
      removals: CorruptionRemoval[];
    };
  };
  return removals;
};
