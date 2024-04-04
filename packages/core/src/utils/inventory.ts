import { arbitrumSepolia } from "viem/chains";

import type { InventoryToken } from "../../../../apps/api/src/schema";
import type { SupportedChainId } from "../types";

const DEFAULT_TROVE_API_URL = "https://trove-api-dev.treasure.lol";

type TokenResponse = {
  collectionAddr: string;
  collectionUrlSlug: string | null;
  tokenId: string;
  metadata: {
    name: string;
    attributes: {
      value: string | number;
      trait_type: string;
    }[];
  };
  image: {
    uri: string;
  };
};

type InventoryTokenResponse = TokenResponse & {
  queryUserQuantityOwned: number;
};

export const fetchUserInventory = async ({
  chainId,
  apiUrl = DEFAULT_TROVE_API_URL,
  apiKey,
  userAddress,
  collectionAddresses,
}: {
  chainId: SupportedChainId;
  apiUrl?: string;
  apiKey: string;
  userAddress: string;
  collectionAddresses: string[];
}): Promise<InventoryToken[]> => {
  const url = new URL(`${apiUrl}/tokens-for-user`);
  url.searchParams.append("userAddress", userAddress);
  url.searchParams.append(
    "slugs",
    collectionAddresses
      .map(
        (collectionAddress) =>
          `${
            chainId === arbitrumSepolia.id ? "arbsepolia" : "arb"
          }/${collectionAddress}`,
      )
      .join(","),
  );
  url.searchParams.append(
    "projection",
    "collectionAddr,collectionUrlSlug,queryUserQuantityOwned,metadata,image",
  );

  const response = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
    },
  });
  const results = await response.json();
  if (!Array.isArray(results)) {
    throw new Error(
      results?.message || "Unknown error fetching user inventory",
    );
  }

  return (results as InventoryTokenResponse[])
    .map(
      ({
        collectionAddr: address,
        tokenId,
        metadata: { name, attributes },
        image: { uri: image },
        queryUserQuantityOwned: balance,
      }): InventoryToken => ({
        user: userAddress,
        address,
        tokenId: Number(tokenId),
        name,
        image,
        attributes: attributes.map(({ trait_type: type, value }) => ({
          type,
          value,
        })),
        balance,
      }),
    )
    .sort((a, b) => a.tokenId - b.tokenId);
};
