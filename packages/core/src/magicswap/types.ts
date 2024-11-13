import type { CollectionResponse } from "../types";
import type { InventoryTokenItem } from "../utils/inventory";

export type Token = {
  id: string;
  name: string;
  symbol: string;
  isNFT: boolean;
  isMAGIC: boolean;
  isETH: boolean;
  decimals: string;
  derivedMAGIC: string;
  vaultCollections: {
    collection: {
      id: string;
      type: string;
    };
    tokenIds?: string[];
  }[];
};

export type Collection = NonNullable<
  Token["vaultCollections"]
>[number]["collection"];

export type Pair = {
  id: string;
  token0: Token;
  token1: Token;
  reserve0: string;
  reserve1: string;
  volume0: string;
  volume1: string;
  reserveUSD: string;
  volumeUSD: string;
  lpFee: string;
  totalSupply: string;
  txCount: string;
  protocolFee: string;
  royaltiesFee: string;
  royaltiesBeneficiary: string;
  totalFee: string;
  dayData: {
    volumeUSD: string;
    date: string;
    volume0: string;
    volume1: string;
    reserveUSD: string;
    txCount: string;
  }[];
};

export type PoolTokenCollection = {
  id: string;
  urlSlug: string;
  tokenIds: string[];
  name: string;
  symbol: string;
  type: "ERC721" | "ERC1155";
  image: string;
};

export type PoolToken = Omit<Token, "decimals"> & {
  type?: "ERC721" | "ERC1155";
  decimals: number;
  image: string;
  isMAGIC: boolean;
  collections: PoolTokenCollection[];
  urlSlug: string;
  collectionId: string;
  collectionTokenIds: string[];
  priceUSD: number;
  reserve: string;
};

export type CollectionsMap = Record<string, CollectionResponse>;
export type TokensByCollectionMap = Record<
  string,
  Record<string, InventoryTokenItem>
>;

export type NFTInput = { id: string; quantity: number };
