import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";

import type { magicSwapV2RouterABI } from "../abis/magicSwapV2RouterAbi";
import type { AddressString, SupportedChainId } from "../types";
import { getContractAddresses } from "../utils/contracts";
import type { Pool } from "./fetchPools";
import type { NFTInput } from "./types";

type AddLiquidityFunctionName =
  | "addLiquidity"
  | "addLiquidityETH"
  | "addLiquidityNFT"
  | "addLiquidityNFTETH"
  | "addLiquidityNFTNFT";

export const getAddLiquidityArgs = ({
  pool,
  chainId,
  toAddress,
  nfts0 = [],
  nfts1 = [],
  amount0 = 0n,
  amount1 = 0n,
  amount0Min = 0n,
  amount1Min = 0n,
}: {
  pool: Pool;
  chainId: SupportedChainId;
  toAddress: AddressString;
  nfts0?: NFTInput[];
  nfts1?: NFTInput[];
  amount0?: bigint;
  amount1?: bigint;
  amount0Min?: bigint;
  amount1Min?: bigint;
}): {
  address: AddressString;
  functionName: AddLiquidityFunctionName;
  args: AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof magicSwapV2RouterABI,
      AddLiquidityFunctionName
    >["inputs"],
    "inputs"
  >;
  value?: bigint;
} => {
  const contractAddresses = getContractAddresses(chainId);
  const magicSwapV2RouterAddress = contractAddresses.MagicswapV2Router;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 60);

  const isTokenAToken1 =
    pool.token1.isETH ||
    (pool.token1.isNFT && !pool.isNFTNFT && !pool.token0.isETH);
  const tokenA = isTokenAToken1 ? pool.token1 : pool.token0;
  const tokenB = isTokenAToken1 ? pool.token0 : pool.token1;
  const amountA = isTokenAToken1 ? amount1 : amount0;
  const amountB = isTokenAToken1 ? amount0 : amount1;
  const amountAMin = isTokenAToken1 ? amount1Min : amount0Min;
  const amountBMin = isTokenAToken1 ? amount0Min : amount1Min;
  const nftsA = isTokenAToken1 ? nfts1 : nfts0;
  const nftsB = isTokenAToken1 ? nfts0 : nfts1;

  // NFT-NFT
  if (pool.isNFTNFT) {
    return {
      address: magicSwapV2RouterAddress,
      functionName: "addLiquidityNFTNFT",
      args: [
        {
          token: tokenA.id,
          collection: Array.from({ length: nftsA.length }).fill(
            tokenA.collectionId,
          ) as AddressString[],
          tokenId: nftsA.map(({ id }) => BigInt(id)),
          amount: nftsA.map(({ quantity }) => BigInt(quantity)),
        },
        {
          token: tokenB.id,
          collection: Array.from({ length: nftsB.length }).fill(
            tokenB.collectionId,
          ) as AddressString[],
          tokenId: nftsB.map(({ id }) => BigInt(id)),
          amount: nftsB.map(({ quantity }) => BigInt(quantity)),
        },
        toAddress,
        deadline,
      ],
    };
  }

  if (pool.hasNFT) {
    // NFT-ETH
    if (pool.token0.isETH || pool.token1.isETH) {
      return {
        address: magicSwapV2RouterAddress,
        functionName: "addLiquidityNFTETH",
        args: [
          {
            token: tokenB.id,
            collection: Array.from({ length: nftsB.length }).fill(
              tokenB.collectionId,
            ) as AddressString[],
            tokenId: nftsB.map(({ id }) => BigInt(id)),
            amount: nftsB.map(({ quantity }) => BigInt(quantity)),
          },
          amountA,
          toAddress,
          deadline,
        ],
        value: amountA,
      };
    }

    // NFT-ERC20
    return {
      address: magicSwapV2RouterAddress,
      functionName: "addLiquidityNFT",
      args: [
        {
          token: tokenA.id,
          collection: Array.from({ length: nftsA.length }).fill(
            tokenA.collectionId,
          ) as AddressString[],
          tokenId: nftsA.map(({ id }) => BigInt(id)),
          amount: nftsA.map(({ quantity }) => BigInt(quantity)),
        },
        tokenB.id,
        amountB,
        amountBMin,
        toAddress,
        deadline,
      ],
    };
  }

  // ERC20-ETH
  if (pool.token0.isETH || pool.token1.isETH) {
    return {
      address: magicSwapV2RouterAddress,
      functionName: "addLiquidityETH",
      args: [tokenB.id, amountB, amountBMin, amountA, toAddress, deadline],
      value: amountA,
    };
  }

  // ERC20-ERC20
  return {
    address: magicSwapV2RouterAddress,
    functionName: "addLiquidity",
    args: [
      tokenA.id,
      tokenB.id,
      amountA,
      amountB,
      amountAMin,
      amountBMin,
      toAddress,
      deadline,
    ],
  };
};
