import { arbitrum, arbitrumSepolia } from "thirdweb/chains";

import {
  TREASURE_CHAIN_DEFINITION,
  TREASURE_TOPAZ_CHAIN_DEFINITION,
} from "../constants";
import type { CollectionResponse } from "../types";

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
    imageAlt?: string;
  };
  image: {
    uri: string;
    originalUri?: string;
  };
};

type InventoryTokenResponse = TokenResponse & {
  queryUserQuantityOwned: number;
};

const CHAIN_ID_TO_SLUG_MAP = {
  [arbitrum.id]: "arb",
  [arbitrumSepolia.id]: "arbsepolia",
  [TREASURE_TOPAZ_CHAIN_DEFINITION.id]: "topaz",
  [TREASURE_CHAIN_DEFINITION.id]: "treasure",
} as const;

const getChainSlug = (chainId: number) =>
  CHAIN_ID_TO_SLUG_MAP[chainId] ?? "arb";

export type InventoryTokenItem = Awaited<
  ReturnType<typeof fetchTokens>
>[number];

export const fetchTokens = async ({
  chainId,
  apiUrl,
  apiKey,
  tokens,
}: {
  chainId: number;
  apiUrl: string;
  apiKey: string;
  tokens: { address: string; tokenId: number | string }[];
}) => {
  const chainSlug = getChainSlug(chainId);
  const response = await fetch(`${apiUrl}/batch-tokens`, {
    method: "POST",
    body: JSON.stringify({
      ids: Array.from(
        new Set(
          tokens.map(
            ({ address, tokenId }) => `${chainSlug}/${address}/${tokenId}`,
          ),
        ),
      ),
    }),
    headers: {
      "X-API-Key": apiKey,
    },
  });
  const results = await response.json();
  if (!Array.isArray(results)) {
    throw new Error(
      `Error fetching tokens: ${results?.message ?? "Unknown error"}`,
    );
  }

  return (results as TokenResponse[])
    .map(
      ({
        collectionAddr: address,
        tokenId,
        metadata: { name, attributes, imageAlt },
        image: { uri: image, originalUri },
      }) => ({
        address,
        tokenId: Number(tokenId),
        name,
        image,
        imageAlt: imageAlt ?? originalUri,
        attributes: attributes.map(({ trait_type: type, value }) => ({
          type,
          value,
        })),
      }),
    )
    .sort((a, b) => a.tokenId - b.tokenId);
};

export const fetchCollections = async ({
  chainId,
  apiUrl,
  apiKey,
  addresses,
}: {
  chainId: number;
  apiUrl: string;
  apiKey: string;
  addresses: string[];
}) => {
  const chainSlug = getChainSlug(chainId);
  const url = new URL(`${apiUrl}/batch-collections`);
  url.searchParams.set(
    "slugs",
    addresses.map((address) => `${chainSlug}/${address}`).join(","),
  );
  const response = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
    },
  });
  const results = (await response.json()) as CollectionResponse[];

  return results;
};

export const fetchUserInventory = async ({
  chainId,
  apiUrl,
  apiKey,
  userAddress,
  collectionAddresses = [],
  tokens = [],
  projection = "collectionAddr,collectionUrlSlug,queryUserQuantityOwned,metadata,image",
}: {
  chainId: number;
  apiUrl: string;
  apiKey: string;
  userAddress: string;
  collectionAddresses?: string[];
  tokens?: { address: string; tokenId: number | string }[];
  projection?: string;
}) => {
  const chainSlug = getChainSlug(chainId);
  const url = new URL(`${apiUrl}/tokens-for-user`);
  url.searchParams.append("userAddress", userAddress);
  url.searchParams.append("projection", projection);
  if (tokens.length > 0) {
    url.searchParams.append(
      "ids",
      tokens
        .map(({ address, tokenId }) => `${chainSlug}/${address}/${tokenId}`)
        .join(","),
    );
  } else if (collectionAddresses.length > 0) {
    url.searchParams.append(
      "slugs",
      collectionAddresses.map((address) => `${chainSlug}/${address}`).join(","),
    );
  }

  const response = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
    },
  });
  const results = await response.json();
  if (!Array.isArray(results)) {
    throw new Error(
      `Error fetching user inventory: ${results?.message ?? "Unknown error"}`,
    );
  }

  return (results as InventoryTokenResponse[])
    .map(
      ({
        collectionAddr: address,
        tokenId,
        metadata: { name, attributes, imageAlt },
        image: { uri: image, originalUri },
        queryUserQuantityOwned: balance,
      }) => ({
        user: userAddress,
        address,
        tokenId: Number(tokenId),
        name,
        image,
        imageAlt: imageAlt ?? originalUri,
        attributes: attributes.map(({ trait_type: type, value }) => ({
          type,
          value,
        })),
        balance,
      }),
    )
    .sort((a, b) => a.tokenId - b.tokenId);
};
