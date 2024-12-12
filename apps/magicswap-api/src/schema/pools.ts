import { type Static, Type } from "@sinclair/typebox";
import { tokenSchema } from "./tokens";

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

export type Pool = Static<typeof poolSchema>;
