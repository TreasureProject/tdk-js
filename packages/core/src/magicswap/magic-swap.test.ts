import { arbitrumSepolia } from "viem/chains";
import { describe, expect, it } from "vitest";

import {
  fetchPool,
  fetchPools,
  getAddLiquidityArgs,
  getSwapArgs,
  getSwapRoute,
} from "./index";

describe("magic-swap", () => {
  // it("should fetch pairs", async () => {
  //   const pools = await fetchPools({
  //     chainId: arbitrumSepolia.id,
  //     inventoryApiUrl: "https://trove-api-dev.treasure.lol",
  //     inventoryApiKey: "oP5gtcE5Mb1vAoBz2J5Ad",
  //   });

  //   console.log(pools);

  //   expect(pools.length).toBeGreaterThan(0);
  // }, 100000);

  it("should generate addLiquidityArgs", async () => {
    const pool = await fetchPool({
      chainId: arbitrumSepolia.id,
      pairId: "0x0626699bc82858c16ae557b2eaad03a58cfcc8bd",
      inventoryApiUrl: "https://trove-api-dev.treasure.lol",
      inventoryApiKey: "oP5gtcE5Mb1vAoBz2J5Ad",
    });

    const addLiquidityArgs = getAddLiquidityArgs({
      pool,
      chainId: 421614,
      toAddress: "0xadc762Ae2CCA8E154cB12DfeC5cc95d31aBC00DD",
      amount0: 186858224586059131204n,
      amount1: 1000000000000000000n,
      amount0Min: 184989642340198539892n,
      amount1Min: 990000000000000000n,
      nfts0: undefined,
      nfts1: [{ id: "51", quantity: 1 }],
    });

    console.log(addLiquidityArgs.args);

    // expect(pools.length).toBeGreaterThan(0);
  }, 100000);

  // it("should calculate routes", async () => {
  //   const pools = await fetchPools({
  //     chainId: arbitrumSepolia.id,
  //     inventoryApiUrl: "https://trove-api-dev.treasure.lol",
  //     inventoryApiKey: "oP5gtcE5Mb1vAoBz2J5Ad",
  //   });

  //   const swapRoute = getSwapRoute({
  //     pools,
  //     tokenInId: "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
  //     tokenOutId: "0xd30e91d5cd201d967c908d9e74f6cea9efe35e06",
  //     amount: "1",
  //     isExactOut: true,
  //   });
  //   console.log(swapRoute);
  //   console.log(swapRoute.legs);
  //   expect(swapRoute).toBeDefined();
  // }, 100000);

  // it("should swap", async () => {
  //   const pools = await fetchPools({
  //     chainId: arbitrumSepolia.id,
  //     inventoryApiUrl: "https://trove-api-dev.treasure.lol",
  //     inventoryApiKey: "oP5gtcE5Mb1vAoBz2J5Ad",
  //   });

  //   // Token to NFT
  //   const tokenToNftRoute = getSwapRoute({
  //     pools,
  //     tokenInId: "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
  //     tokenOutId: "0xd30e91d5cd201d967c908d9e74f6cea9efe35e06",
  //     amount: "200",
  //     isExactOut: true,
  //   });

  //   const tokenToNftArgs = getSwapArgs({
  //     chainId: arbitrumSepolia.id,
  //     pools,
  //     toAddress: "0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E",
  //     tokenInId: "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
  //     tokenOutId: "0xd30e91d5cd201d967c908d9e74f6cea9efe35e06",
  //     nftsIn: [],
  //     nftsOut: [
  //       { id: "39", quantity: 1 },
  //       { id: "52", quantity: 3 },
  //     ],
  //     amountIn: BigInt("200"),
  //     isExactOut: true,
  //     path: tokenToNftRoute.path,
  //   });
  //   console.log(tokenToNftArgs.swap);

  //   // NFT to Token
  //   const nftToTokenRoute = getSwapRoute({
  //     pools,
  //     tokenInId: "0xd30e91d5cd201d967c908d9e74f6cea9efe35e06",
  //     tokenOutId: "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
  //     amount: "200",
  //     isExactOut: true,
  //   });

  //   const nftToTokenArgs = getSwapArgs({
  //     chainId: arbitrumSepolia.id,
  //     pools,
  //     toAddress: "0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E",
  //     tokenInId: "0xd30e91d5cd201d967c908d9e74f6cea9efe35e06",
  //     tokenOutId: "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
  //     nftsIn: [
  //       { id: "39", quantity: 1 },
  //       { id: "52", quantity: 3 },
  //     ],
  //     nftsOut: [],
  //     amountOut: BigInt("200"),
  //     isExactOut: true,
  //     path: nftToTokenRoute.path,
  //   });
  //   console.log(nftToTokenArgs.swap);
  //   // console.log(swapRoute.legs);
  //   // expect(swapResult).toBeDefined();
  // }, 100000);
});
