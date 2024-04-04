import { arbitrumSepolia } from "viem/chains";

import type { InventoryToken, Token } from "../../../../apps/api/src/schema";
import { TROVE_API_URL } from "../constants";
import type { SupportedChainId } from "../types";

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

export const fetchTokens = async ({
  chainId,
  apiKey,
  tokens,
}: {
  chainId: SupportedChainId;
  apiKey: string;
  tokens: [string, string | number][]; // [contract, tokenId][]
}) => {
  const response = await fetch(`${TROVE_API_URL[chainId]}/batch-tokens`, {
    method: "POST",
    body: JSON.stringify({
      ids: Array.from(
        new Set(
          tokens.map(
            ([contract, tokenId]) =>
              `${chainId === arbitrumSepolia.id ? "arbsepolia" : "arb"}/${contract}/${tokenId}`,
          ),
        ),
      ),
    }),
    headers: {
      "X-API-Key": apiKey,
    },
  });
  const results = (await response.json()) as TokenResponse[];
  return (results as TokenResponse[])
    .map(
      ({
        collectionAddr: address,
        tokenId,
        metadata: { name, attributes },
        image: { uri: image },
      }): Token => ({
        address,
        tokenId: Number(tokenId),
        name,
        image,
        attributes: attributes.map(({ trait_type: type, value }) => ({
          type,
          value,
        })),
      }),
    )
    .sort((a, b) => a.tokenId - b.tokenId);
};

export const fetchUserInventory = async ({
  chainId,
  apiKey,
  userAddress,
  collectionAddresses,
}: {
  chainId: SupportedChainId;
  apiKey: string;
  userAddress: string;
  collectionAddresses: string[];
}): Promise<InventoryToken[]> => {
  const url = new URL(`${TROVE_API_URL[chainId]}/tokens-for-user`);
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
