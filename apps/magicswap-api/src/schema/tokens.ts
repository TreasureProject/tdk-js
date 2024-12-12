import { type Static, Type } from "@sinclair/typebox";

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

export type Token = Static<typeof tokenSchema>;
