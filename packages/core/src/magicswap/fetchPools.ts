import { defineChain, getContract, readContract, toUnits } from "thirdweb";

import { uniswapV2PairAbi } from "../abis/uniswapV2PairAbi";
import { MAGICSWAPV2_API_URL } from "../constants";
import type { TreasureConnectClient } from "../types";
import { fetchCollections, fetchTokens } from "../utils/inventory";
import { getPair, getPairs, getStats } from "./graph-queries";
import type {
  Collection,
  CollectionsMap,
  Pair,
  PoolToken,
  PoolTokenCollection,
  Token,
  TokensByCollectionMap,
} from "./types";

const fetchPairs = async ({ chainId }: { chainId: number }) => {
  const apiUrl = MAGICSWAPV2_API_URL[chainId];
  if (!apiUrl) {
    throw new Error(`No API configured for chain ${chainId}`);
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({
      query: getPairs,
    }),
  });
  const {
    data: { pairs },
  } = (await response.json()) as { data: { pairs: Pair[] } };

  return pairs;
};

const fetchPair = async ({
  chainId,
  pairId,
}: { chainId: number; pairId: string }) => {
  const apiUrl = MAGICSWAPV2_API_URL[chainId];
  if (!apiUrl) {
    throw new Error(`No API configured for chain ${chainId}`);
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({
      query: getPair,
      variables: { id: pairId },
    }),
  });
  const {
    data: { pair },
  } = (await response.json()) as { data: { pair: Pair | null } };

  return pair;
};

const fetchStats = async ({ chainId }: { chainId: number }) => {
  const apiUrl = MAGICSWAPV2_API_URL[chainId];
  if (!apiUrl) {
    throw new Error(`No API configured for chain ${chainId}`);
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify({
      query: getStats,
    }),
  });
  const { data } = (await response.json()) as {
    data: {
      factories: {
        reserveNFT: string;
        txCount: string;
        magicUSD: string;
      }[];
      dayDatas: { volumeUSD: string }[];
    };
  };
  const { factories = [], dayDatas = [] } = data ?? {};

  return {
    global: factories[0] as
      | {
          reserveNFT: string;
          txCount: string;
          magicUSD: string;
        }
      | undefined,
    day: dayDatas[0] as { volumeUSD: string } | undefined,
  };
};

const fetchPairAssociatedData = async ({
  pairs,
  chainId,
  inventoryApiUrl,
  inventoryApiKey,
}: {
  pairs: Pair[];
  chainId: number;
  inventoryApiUrl: string;
  inventoryApiKey: string;
}) => {
  const pairTokens = pairs.flatMap(({ token0, token1 }) => [token0, token1]);

  const tokensToFetch = [
    ...new Set(
      pairTokens.flatMap(({ vaultCollections }) =>
        vaultCollections.flatMap(
          ({ collection: { id: address }, tokenIds }) =>
            tokenIds?.map((tokenId) => ({ address, tokenId })) ?? [],
        ),
      ),
    ),
  ];

  const collectionAddresses = [
    ...new Set(
      pairTokens.flatMap(({ vaultCollections }) =>
        vaultCollections.map(({ collection: { id } }) => id),
      ),
    ),
  ];

  const [collections, tokens] = await Promise.all([
    fetchCollections({
      chainId,
      apiUrl: inventoryApiUrl,
      apiKey: inventoryApiKey,
      addresses: collectionAddresses,
    }),
    fetchTokens({
      chainId,
      apiUrl: inventoryApiUrl,
      apiKey: inventoryApiKey,
      tokens: tokensToFetch,
    }),
  ]);

  const collectionsMap = collections.reduce((acc, collection) => {
    acc[collection.collectionAddr.toLowerCase()] = collection;
    return acc;
  }, {} as CollectionsMap);

  const tokensMap = tokens.reduce((acc, token) => {
    const tokenAddress = token.address.toLowerCase();
    if (!acc[tokenAddress]) {
      acc[tokenAddress] = {};
    }

    acc[tokenAddress][token.tokenId] = token;
    return acc;
  }, {} as TokensByCollectionMap);

  return { collectionsMap, tokensMap };
};

const createPoolTokenCollection = (
  collection: Collection,
  tokenIds: string[],
  collectionsMap: CollectionsMap,
): PoolTokenCollection => {
  const {
    urlSlug = "",
    displayName: name = collection.id,
    symbol = "?",
    contractType: type = "ERC721",
    thumbnailUri: image = "",
  } = collectionsMap[collection.id] ?? {};
  return {
    id: collection.id,
    urlSlug,
    tokenIds,
    name,
    symbol,
    type,
    image,
  };
};

const createTokenMetadata = (
  token: Token,
  collectionsMap: CollectionsMap,
  tokensMap: TokensByCollectionMap,
) => {
  if (token.isNFT) {
    const vaultCollectionAddresses = token.vaultCollections.map(
      ({ collection: { id } }) => id,
    );
    const vaultTokenIds = token.vaultCollections.flatMap(
      ({ tokenIds }) => tokenIds ?? [],
    );
    const vaultCollection = vaultCollectionAddresses[0]
      ? collectionsMap[vaultCollectionAddresses[0]]
      : undefined;
    const vaultToken =
      vaultCollectionAddresses[0] && vaultTokenIds[0]
        ? tokensMap[vaultCollectionAddresses[0]]?.[vaultTokenIds[0]]
        : undefined;

    // Vault is a single collection with a single token ID defined
    if (
      vaultCollectionAddresses.length === 1 &&
      vaultTokenIds.length === 1 &&
      vaultToken
    ) {
      return {
        name: vaultToken.name,
        image: vaultToken.image,
      };
    }

    // Vault is multiple collections with multiple token IDs defined
    if (
      vaultCollectionAddresses.length > 0 &&
      vaultTokenIds.length > 1 &&
      vaultToken
    ) {
      const type = vaultToken?.attributes.find(
        ({ type }) => type.toLowerCase() === "type",
      )?.value;
      if (type) {
        return {
          name: `${type}s`,
          image: vaultToken.image,
        };
      }
    }

    return {
      name: vaultCollectionAddresses
        .map((address) => collectionsMap[address]?.displayName ?? address)
        .join(" & "),
      image: vaultCollection?.thumbnailUri,
    };
  }

  return { name: token.name, image: undefined };
};

const createPoolToken = (
  token: Token,
  collectionsMap: CollectionsMap,
  tokensMap: TokensByCollectionMap,
  magicUSD: number,
): PoolToken => {
  const tokenCollections =
    token.vaultCollections.map(({ collection, tokenIds }) =>
      createPoolTokenCollection(collection, tokenIds ?? [], collectionsMap),
    ) ?? [];
  const { name, image } = createTokenMetadata(token, collectionsMap, tokensMap);
  const symbol = token.isNFT ? name : token.symbol.toUpperCase();
  return {
    ...token,
    ...(tokenCollections[0]?.type
      ? {
          type: tokenCollections[0]?.type,
        }
      : {}),
    name,
    symbol,
    image:
      image ??
      (token.isNFT
        ? ""
        : `https://magicswap.lol/img/tokens/${symbol.toLowerCase()}.png`),
    decimals: Number(token.decimals),
    collections: tokenCollections,
    urlSlug: tokenCollections[0]?.urlSlug ?? "",
    collectionId: tokenCollections[0]?.id ?? "",
    collectionTokenIds: tokenCollections[0]?.tokenIds ?? [],
    priceUSD: Number(token.derivedMAGIC) * magicUSD,
    reserve: "0",
  };
};

const createPoolFromPair = (
  pair: Pair,
  collectionsMap: CollectionsMap,
  tokensMap: TokensByCollectionMap,
  magicUSD: number,
  reserves?: [bigint, bigint],
) => {
  const token0 = {
    ...createPoolToken(pair.token0, collectionsMap, tokensMap, magicUSD),
    reserve: (
      reserves?.[0] ?? toUnits(pair.reserve0, Number(pair.token0.decimals))
    ).toString(),
  };
  const token1 = {
    ...createPoolToken(pair.token1, collectionsMap, tokensMap, magicUSD),
    reserve: (
      reserves?.[1] ?? toUnits(pair.reserve1, Number(pair.token1.decimals))
    ).toString(),
  };

  const reserveUSD = Number(pair.reserveUSD);
  const dayTime = Math.floor(Date.now() / 1000) - 60 * 60 * 24;
  const dayData = pair.dayData.find(({ date }) => Number(date) >= dayTime);
  const weekTime = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 7;
  const weekData = pair.dayData.filter(({ date }) => Number(date) >= weekTime);
  return {
    ...pair,
    name: `${token0.symbol} / ${token1.symbol}`,
    token0,
    token1,
    hasNFT: token0.isNFT || token1.isNFT,
    isNFTNFT: token0.isNFT && token1.isNFT,
    reserveUSD,
    volume0: Number(pair.volume0),
    volume1: Number(pair.volume1),
    volumeUSD: Number(pair.volumeUSD),
    volume24h0: Number(dayData?.volume0 ?? 0),
    volume24h1: Number(dayData?.volume1 ?? 0),
    volume24hUSD: Number(dayData?.volumeUSD ?? 0),
    volume1w0: weekData.reduce(
      (total, { volume0 }) => total + Number(volume0),
      0,
    ),
    volume1w1: weekData.reduce(
      (total, { volume1 }) => total + Number(volume1),
      0,
    ),
    volume1wUSD: weekData.reduce(
      (total, { volumeUSD }) => total + Number(volumeUSD),
      0,
    ),
  };
};

const buildPools = async ({
  client,
  chainId,
  stats,
  pairs,
  inventoryApiUrl,
  inventoryApiKey,
}: {
  client: TreasureConnectClient;
  chainId: number;
  pairs: Pair[];
  stats: Awaited<ReturnType<typeof fetchStats>>;
  inventoryApiUrl: string;
  inventoryApiKey: string;
}) => {
  const [{ collectionsMap, tokensMap }, ...reserves] = await Promise.all([
    fetchPairAssociatedData({
      pairs,
      chainId,
      inventoryApiUrl,
      inventoryApiKey,
    }),
    ...pairs.map(({ id }) => {
      const contract = getContract({
        client,
        chain: defineChain(chainId),
        address: id,
        abi: uniswapV2PairAbi,
      });
      return readContract({
        contract,
        method: "getReserves",
      });
    }),
  ]);

  const magicUSD = Number(stats.global?.magicUSD ?? 0);
  const pools = pairs.map((pair, i) =>
    createPoolFromPair(pair, collectionsMap, tokensMap, magicUSD, [
      reserves[i]?.[0] ?? 0n,
      reserves[i]?.[1] ?? 0n,
    ]),
  );

  return pools;
};

export const fetchPools = async ({
  client,
  chainId,
  inventoryApiUrl,
  inventoryApiKey,
}: {
  client: TreasureConnectClient;
  chainId: number;
  inventoryApiUrl: string;
  inventoryApiKey: string;
}) => {
  const [pairs, stats] = await Promise.all([
    fetchPairs({ chainId }),
    fetchStats({ chainId }),
  ]);

  return buildPools({
    client,
    chainId,
    pairs,
    stats,
    inventoryApiUrl,
    inventoryApiKey,
  });
};

export const fetchPool = async ({
  client,
  chainId,
  pairId,
  inventoryApiUrl,
  inventoryApiKey,
}: {
  client: TreasureConnectClient;
  chainId: number;
  pairId: string;
  inventoryApiUrl: string;
  inventoryApiKey: string;
}) => {
  const [pair, stats] = await Promise.all([
    fetchPair({ chainId, pairId }),
    fetchStats({ chainId }),
  ]);
  if (!pair) {
    throw new Error(`Pool ${pairId} not found on chain ${chainId}`);
  }

  const [pool] = await buildPools({
    client,
    chainId,
    pairs: [pair],
    stats,
    inventoryApiUrl,
    inventoryApiKey,
  });

  return pool;
};

export type Pool = ReturnType<typeof createPoolFromPair>;
