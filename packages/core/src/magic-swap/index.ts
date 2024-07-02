import { MAGICSWAPV2_API_URL } from "../constants";
import { AddressString, CollectionResponse, SupportedChainId } from "../types";
import { getPairs, getStats } from "./graph-queries";
import {
  FetchTokenItem,
  fetchCollections,
  fetchTokens,
} from "../utils/inventory";
import { Config, readContracts } from "@wagmi/core";
import { DEFAULT_WAGMI_CONFIG } from "../utils/wagmi";
import { uniswapV2PairAbi } from "../abis/uniswapV2PairAbi";
import { parseUnits } from "viem";
import type {
  Pair,
  Collection,
  PoolTokenCollection,
  Token,
  PoolToken,
} from "./types";

const fetchPairs = async ({ chainId }: { chainId: SupportedChainId }) => {
  const response = await fetch(
    MAGICSWAPV2_API_URL[chainId as keyof typeof MAGICSWAPV2_API_URL],
    {
      method: "POST",
      body: JSON.stringify({
        query: getPairs,
      }),
    }
  );
  const {
    data: { pairs },
  } = (await response.json()) as { data: { pairs: Pair[] } };

  return pairs;
};

const fetchStats = async ({ chainId }: { chainId: SupportedChainId }) => {
  const response = await fetch(
    MAGICSWAPV2_API_URL[chainId as keyof typeof MAGICSWAPV2_API_URL],
    {
      method: "POST",
      body: JSON.stringify({
        query: getStats,
      }),
    }
  );
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
  chainId: SupportedChainId;
  inventoryApiUrl: string;
  inventoryApiKey: string;
}) => {
  const pairTokens = pairs.flatMap(({ token0, token1 }) => [token0, token1]);

  const tokensToFetch = [
    ...new Set(
      pairTokens.flatMap(({ vaultCollections }) =>
        vaultCollections.flatMap(
          ({ collection: { id: address }, tokenIds }) =>
            tokenIds?.map((tokenId) => ({ address, tokenId })) ?? []
        )
      )
    ),
  ];

  const collectionAddresses = [
    ...new Set(
      pairTokens.flatMap(({ vaultCollections }) =>
        vaultCollections.map(({ collection: { id } }) => id)
      )
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
  }, {} as Record<string, CollectionResponse>);

  const tokensMap = tokens.reduce((acc, token) => {
    const collection = (acc[token.address.toLowerCase()] ??= {});
    collection[token.tokenId] = token;
    return acc;
  }, {} as Record<string, Record<string, FetchTokenItem>>);

  return { collectionsMap, tokensMap };
};

const createPoolTokenCollection = (
  collection: Collection,
  tokenIds: string[],
  collectionsMap: Record<string, CollectionResponse>
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
  collectionsMap: Record<string, CollectionResponse>,
  tokensMap: Record<string, Record<string, FetchTokenItem>>
) => {
  if (token.isNFT) {
    const vaultCollectionAddresses = token.vaultCollections.map(
      ({ collection: { id } }) => id
    );
    const vaultTokenIds = token.vaultCollections.flatMap(
      ({ tokenIds }) => tokenIds ?? []
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
        ({ type }) => type.toLowerCase() === "type"
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

export const createPoolToken = (
  token: Token,
  collectionsMap: Record<string, CollectionResponse>,
  tokensMap: Record<string, Record<string, FetchTokenItem>>,
  magicUSD: number
): PoolToken => {
  const tokenCollections =
    token.vaultCollections.map(({ collection, tokenIds }) =>
      createPoolTokenCollection(collection, tokenIds ?? [], collectionsMap)
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
      image ?? (token.isNFT ? "" : `/img/tokens/${symbol.toLowerCase()}.png`),
    decimals: Number(token.decimals),
    isMAGIC: symbol.toLowerCase() === "magic",
    collections: tokenCollections,
    urlSlug: tokenCollections[0]?.urlSlug ?? "",
    collectionId: tokenCollections[0]?.id ?? "",
    collectionTokenIds: tokenCollections[0]?.tokenIds ?? [],
    priceUSD: Number(token.derivedMAGIC) * magicUSD,
    reserve: "0",
  };
};

const getPoolAPY = (volume1w: number, reserveUSD: number) => {
  if (reserveUSD === 0) {
    return 0;
  }

  const apr = ((volume1w / 7) * 365 * 0.0025) / reserveUSD;
  return ((1 + apr / 100 / 3650) ** 3650 - 1) * 100;
};

const createPoolFromPair = (
  pair: Pair,
  collectionsMap: Record<string, CollectionResponse>,
  tokensMap: Record<string, Record<string, FetchTokenItem>>,
  magicUSD: number,
  reserves?: [bigint, bigint]
) => {
  const token0 = {
    ...createPoolToken(pair.token0, collectionsMap, tokensMap, magicUSD),
    reserve: (
      reserves?.[0] ?? parseUnits(pair.reserve0, Number(pair.token0.decimals))
    ).toString(),
  };
  const token1 = {
    ...createPoolToken(pair.token1, collectionsMap, tokensMap, magicUSD),
    reserve: (
      reserves?.[1] ?? parseUnits(pair.reserve1, Number(pair.token1.decimals))
    ).toString(),
  };
  const reserveUSD = Number(pair.reserveUSD);
  const volume24h = Number(pair.dayData[0]?.volumeUSD ?? 0);
  const volume1w = pair.dayData.reduce(
    (total, { volumeUSD }) => total + Number(volumeUSD),
    0
  );
  return {
    ...pair,
    name: `${token0.symbol} / ${token1.symbol}`,
    token0,
    token1,
    hasNFT: token0.isNFT || token1.isNFT,
    isNFTNFT: token0.isNFT && token1.isNFT,
    reserveUSD,
    volume24h,
    volume1w,
    apy: getPoolAPY(volume1w, reserveUSD),
    feesUSD: Number(pair.volumeUSD) * Number(pair.lpFee),
    fees24h: volume24h * Number(pair.lpFee),
  };
};

export const fetchPools = async ({
  chainId,
  inventoryApiUrl,
  inventoryApiKey,
  wagmiConfig = DEFAULT_WAGMI_CONFIG,
}: {
  chainId: SupportedChainId;
  inventoryApiUrl: string;
  inventoryApiKey: string;
  wagmiConfig?: Config;
}) => {
  const [pairs, stats] = await Promise.all([
    fetchPairs({ chainId }),
    fetchStats({ chainId }),
  ]);
  const magicUSD = Number(stats.global?.magicUSD ?? 0);

  const { collectionsMap, tokensMap } = await fetchPairAssociatedData({
    pairs,
    chainId,
    inventoryApiUrl,
    inventoryApiKey,
  });

  const reserves = await readContracts(wagmiConfig, {
    contracts: pairs.map(({ id }) => ({
      address: id as AddressString,
      abi: uniswapV2PairAbi,
      functionName: "getReserves",
      chainId,
    })),
  });

  const pools = pairs.map((pair, i) => {
    const reserve = reserves[i] as {
      result: [bigint, bigint, number];
      status: "success" | "reverted";
    };
    return createPoolFromPair(
      pair,
      collectionsMap,
      tokensMap,
      magicUSD,
      reserve?.status === "success"
        ? [reserve.result[0], reserve.result[1]]
        : undefined
    );
  });

  return pools;
};
