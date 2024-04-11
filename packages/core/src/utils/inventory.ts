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

const getChainSlug = (chainId: SupportedChainId) =>
  chainId === arbitrumSepolia.id ? "arbsepolia" : "arb";

export const fetchTokens = async ({
  chainId,
  apiKey,
  tokens,
}: {
  chainId: SupportedChainId;
  apiKey: string;
  tokens: { address: string; tokenId: number | string }[];
}) => {
  const chainSlug = getChainSlug(chainId);
  const response = await fetch(`${TROVE_API_URL[chainId]}/batch-tokens`, {
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
  const results = (await response.json()) as TokenResponse[];
  return (results as TokenResponse[])
    .map(
      ({
        collectionAddr: address,
        tokenId,
        metadata: { name, attributes, imageAlt },
        image: { uri: image, originalUri },
      }): Token => ({
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

export const fetchUserInventory = async ({
  chainId,
  apiKey,
  userAddress,
  collectionAddresses = [],
  tokens = [],
  projection = "collectionAddr,collectionUrlSlug,queryUserQuantityOwned,metadata,image",
}: {
  chainId: SupportedChainId;
  apiKey: string;
  userAddress: string;
  collectionAddresses?: string[];
  tokens?: { address: string; tokenId: number | string }[];
  projection?: string;
}): Promise<InventoryToken[]> => {
  const chainSlug = getChainSlug(chainId);
  const url = new URL(`${TROVE_API_URL[chainId]}/tokens-for-user`);
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
      results?.message || "Unknown error fetching user inventory",
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
      }): InventoryToken => ({
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
