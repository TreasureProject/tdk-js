import { type Static, Type } from "@sinclair/typebox";

// Define the schema for VaultCollections with descriptions
const vaultCollectionSchema = Type.Object(
  {
    collection: Type.Object({
      id: Type.String({
        description: "The unique identifier of the collection",
      }),
      type: Type.String({
        description: "The type of the collection, e.g., ERC1155",
      }),
    }),
    tokenIds: Type.Optional(
      Type.Array(Type.String(), {
        description: "An array of token IDs within the collection",
      }),
    ),
  },
  { description: "Schema for Vault Collections" },
);

// Define the schema for Tokens with descriptions and optional vaultCollections
export const tokenSchema = Type.Object(
  {
    chainId: Type.Number(),
    address: Type.String({
      description: "Token address",
    }),
    name: Type.String({ description: "The name of the token" }),
    symbol: Type.String({ description: "The symbol of the token" }),
    decimals: Type.Number({
      description: "The number of decimal places for the token",
    }),
    derivedMagic: Type.String({
      description: "Derived MAGIC value for the token",
    }),
    isNft: Type.Boolean({
      description: "Boolean indicating if the token is an NFT",
    }),
    vaultCollections: Type.Optional(
      Type.Array(vaultCollectionSchema, {
        description:
          "Array of vault collections associated with the token, can be empty or undefined",
      }),
    ),
    type: Type.Optional(
      Type.String({ description: "The type of the token, e.g., ERC721" }),
    ),
    // image: Type.String({ description: "URL of the token image" }),
    isMagic: Type.Boolean({
      description: "Boolean indicating if the token is the MAGIC token",
    }),
    isEth: Type.Boolean({
      description: "Boolean indicating if the token is the native token",
    }),
    // collections: Type.Array(
    //   Type.Object({
    //     id: Type.String({
    //       description: "The unique identifier of the collection",
    //     }),
    //     urlSlug: Type.String({ description: "URL slug for the collection" }),
    //     tokenIds: Type.Array(Type.String(), {
    //       description: "Array of token IDs within the collection",
    //     }),
    //     name: Type.String({ description: "The name of the collection" }),
    //     symbol: Type.String({ description: "The symbol of the collection" }),
    //     type: Type.String({ description: "The type of the collection" }),
    //     image: Type.String({ description: "URL of the collection image" }),
    //   }),
    //   { description: "Array of collections associated with the token" },
    // ),
    // urlSlug: Type.String({ description: "URL slug for the token" }),
    // collectionId: Type.String({
    //   description:
    //     "The unique identifier of the collection to which the token belongs",
    // }),
    // collectionTokenIds: Type.Array(Type.String(), {
    //   description: "Array of token IDs within the collection",
    // }),
    // priceUSD: Type.Number({ description: "Price of the token in USD" }),
    // reserve: Type.String({ description: "Reserve amount of the token" }),
  },
  { description: "Schema for Tokens" },
);

// Define the schema for DayData with descriptions
// const dayDataSchema = Type.Object(
//   {
//     reserveUSD: Type.String({ description: "Reserve amount in USD" }),
//     volumeUSD: Type.String({ description: "Volume in USD" }),
//     txCount: Type.String({ description: "Transaction count" }),
//   },
//   { description: "Schema for daily data" },
// );

export const poolSchema = Type.Object({
  chainId: Type.Number(),
  address: Type.String({
    description: "LP token address",
  }),
  token0: tokenSchema,
  token1: tokenSchema,
  reserve0: Type.String({ description: "Reserve amount for token0" }),
  reserve1: Type.String({ description: "Reserve amount for token1" }),
  reserveUsd: Type.Number({ description: "Total reserve amount in USD" }),
  totalSupply: Type.String({ description: "Total supply of the tokens" }),
  txCount: Type.String({ description: "Transaction count" }),
  volumeUsd: Type.Number({ description: "Volume in USD" }),
  lpFee: Type.String({ description: "Liquidity provider fee" }),
  protocolFee: Type.String({ description: "Protocol fee" }),
  royaltiesFee: Type.String({ description: "Royalties fee" }),
  royaltiesBeneficiary: Type.Union([Type.Null(), Type.String()], {
    description: "Royalties beneficiary, if any",
  }),
  totalFee: Type.String({ description: "Total fee" }),
  // dayData: Type.Array(dayDataSchema, { description: "Array of daily data" }),
  // name: Type.String({ description: "Name of the response object" }),
  // hasNFT: Type.Boolean({
  //   description: "Boolean indicating if the response object has NFTs",
  // }),
  // isNFTNFT: Type.Boolean({
  //   description: "Boolean indicating if the response object is an NFT-NFT",
  // }),
  // volume24h0: Type.Number({ description: "Volume in the last 24 hours" }),
  // volume1w0: Type.Number({ description: "Volume in the last week" }),
  // volume24h1: Type.Number({ description: "Volume in the last 24 hours" }),
  // volume1w1: Type.Number({ description: "Volume in the last week" }),
});

export type Token = Static<typeof tokenSchema>;
export type Pool = Static<typeof poolSchema>;
