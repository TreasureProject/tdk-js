import { type Static, Type } from "@sinclair/typebox";

export const contractArgsReplySchema = Type.Object({
  address: Type.String({ description: "Contract address to call" }),
  functionName: Type.String({ description: "Function name to call" }),
  args: Type.Any({ description: "Arguments to call on the function" }),
  value: Type.Optional(
    Type.String({ description: "Value to send with call, if applicable" }),
  ),
});

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
const tokenSchema = Type.Object(
  {
    id: Type.String({ description: "The unique identifier of the token" }),
    name: Type.String({ description: "The name of the token" }),
    symbol: Type.String({ description: "The symbol of the token" }),
    decimals: Type.Number({
      description: "The number of decimal places for the token",
    }),
    derivedMAGIC: Type.String({
      description: "Derived MAGIC value for the token",
    }),
    isNFT: Type.Boolean({
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
    image: Type.String({ description: "URL of the token image" }),
    isMAGIC: Type.Boolean({
      description: "Boolean indicating if the token is the MAGIC token",
    }),
    isETH: Type.Boolean({
      description: "Boolean indicating if the token is the native token",
    }),
    collections: Type.Array(
      Type.Object({
        id: Type.String({
          description: "The unique identifier of the collection",
        }),
        urlSlug: Type.String({ description: "URL slug for the collection" }),
        tokenIds: Type.Array(Type.String(), {
          description: "Array of token IDs within the collection",
        }),
        name: Type.String({ description: "The name of the collection" }),
        symbol: Type.String({ description: "The symbol of the collection" }),
        type: Type.String({ description: "The type of the collection" }),
        image: Type.String({ description: "URL of the collection image" }),
      }),
      { description: "Array of collections associated with the token" },
    ),
    urlSlug: Type.String({ description: "URL slug for the token" }),
    collectionId: Type.String({
      description:
        "The unique identifier of the collection to which the token belongs",
    }),
    collectionTokenIds: Type.Array(Type.String(), {
      description: "Array of token IDs within the collection",
    }),
    priceUSD: Type.Number({ description: "Price of the token in USD" }),
    reserve: Type.String({ description: "Reserve amount of the token" }),
  },
  { description: "Schema for Tokens" },
);

// Define the schema for DayData with descriptions
const dayDataSchema = Type.Object(
  {
    reserveUSD: Type.String({ description: "Reserve amount in USD" }),
    volumeUSD: Type.String({ description: "Volume in USD" }),
    txCount: Type.String({ description: "Transaction count" }),
  },
  { description: "Schema for daily data" },
);

const poolSchema = Type.Object({
  id: Type.String({
    description: "The unique identifier of the response object",
  }),
  token0: tokenSchema,
  token1: tokenSchema,
  reserve0: Type.String({ description: "Reserve amount for token0" }),
  reserve1: Type.String({ description: "Reserve amount for token1" }),
  reserveUSD: Type.Number({ description: "Total reserve amount in USD" }),
  totalSupply: Type.String({ description: "Total supply of the tokens" }),
  txCount: Type.String({ description: "Transaction count" }),
  volumeUSD: Type.Number({ description: "Volume in USD" }),
  lpFee: Type.String({ description: "Liquidity provider fee" }),
  protocolFee: Type.String({ description: "Protocol fee" }),
  royaltiesFee: Type.String({ description: "Royalties fee" }),
  royaltiesBeneficiary: Type.Union([Type.Null(), Type.String()], {
    description: "Royalties beneficiary, if any",
  }),
  totalFee: Type.String({ description: "Total fee" }),
  dayData: Type.Array(dayDataSchema, { description: "Array of daily data" }),
  name: Type.String({ description: "Name of the response object" }),
  hasNFT: Type.Boolean({
    description: "Boolean indicating if the response object has NFTs",
  }),
  isNFTNFT: Type.Boolean({
    description: "Boolean indicating if the response object is an NFT-NFT",
  }),
  volume24h0: Type.Number({ description: "Volume in the last 24 hours" }),
  volume1w0: Type.Number({ description: "Volume in the last week" }),
  volume24h1: Type.Number({ description: "Volume in the last 24 hours" }),
  volume1w1: Type.Number({ description: "Volume in the last week" }),
});

// Define the schema for the main object with descriptions
export const poolsReplySchema = Type.Object({
  pools: Type.Array(poolSchema, { description: "Array of pools" }),
});

export const poolReplySchema = poolSchema;

export const routeBodySchema = Type.Object({
  tokenInId: Type.String({
    description: "The unique identifier of the `in` token",
  }),
  tokenOutId: Type.String({
    description: "The unique identifier of the `out` token",
  }),
  amount: Type.String({ description: "Amount to calculate route and quote" }),
  isExactOut: Type.Boolean({ description: "Boolean indicating if exact out" }),
});

const legTokenSchema = Type.Object({
  name: Type.String({ description: "Token name" }),
  symbol: Type.String({ description: "Token symbol" }),
  address: Type.String({ description: "Token address" }),
  decimals: Type.Number({ description: "Token decimals" }),
  tokenId: Type.Optional(Type.String({ description: "Token ID" })),
});

const legSchema = Type.Object({
  poolAddress: Type.String({ description: "Pool address" }),
  poolType: Type.String({ description: "Pool type" }),
  poolFee: Type.Number({ description: "Pool fee" }),
  tokenFrom: legTokenSchema,
  tokenTo: legTokenSchema,
  assumedAmountIn: Type.Number({ description: "Assumed amount in" }),
  assumedAmountOut: Type.Number({ description: "Assumed amount out" }),
  swapPortion: Type.Number({ description: "Swap portion" }),
  absolutePortion: Type.Number({ description: "Absolute portion" }),
});

export const routeReplySchema = Type.Object({
  amountIn: Type.String({ description: "Amount in" }),
  amountOut: Type.String({ description: "Amount out" }),
  tokenIn: tokenSchema,
  tokenOut: tokenSchema,
  legs: Type.Array(legSchema, { description: "Array of route legs" }),
  path: Type.Array(Type.String(), {
    description: "Array that defines the swap path",
  }),
  priceImpact: Type.Number({ description: "Price impact" }),
  derivedValue: Type.Number({ description: "Derived value" }),
  lpFee: Type.Number({ description: "Liquidity provider fee" }),
  protocolFee: Type.Number({ description: "Protocol fee" }),
  royaltiesFee: Type.Number({ description: "Royalties fee" }),
});

const nftInputSchema = Type.Object({
  id: Type.String({ description: "The unique identifier of the NFT" }),
  quantity: Type.Number({ description: "The quantity of the NFT" }),
});

export const swapArgsBodySchema = Type.Object({
  tokenInId: Type.String({
    description: "The unique identifier of the `in` token",
  }),
  tokenOutId: Type.String({
    description: "The unique identifier of the `out` token",
  }),
  amountIn: Type.Optional(Type.String({ description: "Amount to swap" })),
  amountOut: Type.Optional(Type.String({ description: "Amount to swap" })),
  path: Type.Array(
    Type.String({ description: "Array that defines the swap path" }),
  ),
  isExactOut: Type.Boolean({ description: "Boolean indicating if exact out" }),
  nftsIn: Type.Optional(
    Type.Array(nftInputSchema, { description: "Array of NFTs to swap in" }),
  ),
  nftsOut: Type.Optional(
    Type.Array(nftInputSchema, { description: "Array of NFTs to swap out" }),
  ),
  slippage: Type.Optional(Type.Number({ description: "Slippage tolerance" })),
  toAddress: Type.Optional(
    Type.String({ description: "Address to send tokens" }),
  ),
});

export const swapBodySchema = Type.Intersect([
  swapArgsBodySchema,
  Type.Object({
    backendWallet: Type.String(),
    simulateTransaction: Type.Optional(Type.Boolean()),
  }),
]);

export const addLiquidityArgsBodySchema = Type.Object({
  nfts0: Type.Optional(
    Type.Array(nftInputSchema, { description: "Array of NFTs for token0" }),
  ),
  nfts1: Type.Optional(
    Type.Array(nftInputSchema, { description: "Array of NFTs for token1" }),
  ),
  amount0: Type.Optional(Type.String({ description: "Amount for token0" })),
  amount1: Type.Optional(Type.String({ description: "Amount for token1" })),
  amount0Min: Type.Optional(
    Type.String({ description: "Minimum amount for token0" }),
  ),
  amount1Min: Type.Optional(
    Type.String({ description: "Minimum amount for token1" }),
  ),
  toAddress: Type.Optional(
    Type.String({ description: "Address to send LP tokens" }),
  ),
});

export const addLiquidityBodySchema = Type.Intersect([
  addLiquidityArgsBodySchema,
  Type.Object({
    backendWallet: Type.String(),
    simulateTransaction: Type.Optional(Type.Boolean()),
  }),
]);

export const removeLiquidityArgsBodySchema = Type.Object({
  nfts0: Type.Optional(
    Type.Array(nftInputSchema, { description: "Array of NFTs for token0" }),
  ),
  nfts1: Type.Optional(
    Type.Array(nftInputSchema, { description: "Array of NFTs for token1" }),
  ),
  amountLP: Type.String({ description: "Amount of LP tokens" }),
  amount0Min: Type.String({ description: "Minimum amount for token0" }),
  amount1Min: Type.String({ description: "Minimum amount for token1" }),
  swapLeftover: Type.Optional(
    Type.Boolean({
      default: true,
      description: "Boolean indicating if swap leftover",
    }),
  ),
  toAddress: Type.Optional(
    Type.String({ description: "Address to send tokens" }),
  ),
});

export const removeLiquidityBodySchema = Type.Intersect([
  removeLiquidityArgsBodySchema,
  Type.Object({
    backendWallet: Type.String(),
    simulateTransaction: Type.Optional(Type.Boolean()),
  }),
]);

const poolParamsSchema = Type.Object({
  id: Type.String(),
});

export type ContractArgsReply = Static<typeof contractArgsReplySchema>;

export type PoolsReply = Static<typeof poolsReplySchema>;

export type PoolParams = Static<typeof poolParamsSchema>;
export type PoolReply = Static<typeof poolReplySchema>;

export type RouteBody = Static<typeof routeBodySchema>;
export type RouteReply = Static<typeof routeReplySchema>;

export type SwapArgsBody = Static<typeof swapArgsBodySchema>;
export type SwapBody = Static<typeof swapBodySchema>;

export type AddLiquidityArgsBody = Static<typeof addLiquidityArgsBodySchema>;
export type AddLiquidityBody = Static<typeof addLiquidityBodySchema>;

export type RemoveLiquidityArgsBody = Static<
  typeof removeLiquidityArgsBodySchema
>;
export type RemoveLiquidityBody = Static<typeof removeLiquidityBodySchema>;
