import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";

import type { magicswapV2RouterAbi } from "../abis/magicswapV2RouterAbi";
import type { AddressString } from "../types";
import { getContractAddresses } from "../utils/contracts";
import { createPoolFromPair, fetchPair } from "./pools";
import type { NFTInput } from "./types";

type AddLiquidityFunctionName =
  | "addLiquidity"
  | "addLiquidityETH"
  | "addLiquidityNFT"
  | "addLiquidityNFTETH"
  | "addLiquidityNFTNFT";

type RemoveLiquidityFunctionName =
  | "removeLiquidity"
  | "removeLiquidityETH"
  | "removeLiquidityNFT"
  | "removeLiquidityNFTETH"
  | "removeLiquidityNFTNFT";

// Add/remove liquidity only needs a small subset of the Pool type
type LiquidityPoolToken = {
  id: string;
  isNFT: boolean;
  isETH: boolean;
  collectionId: string;
};

type LiquidityPool = {
  token0: LiquidityPoolToken;
  token1: LiquidityPoolToken;
  hasNFT: boolean;
  isNFTNFT: boolean;
};

export const fetchPoolForLiquidity = async ({
  chainId,
  pairId,
}: { chainId: number; pairId: string }): Promise<LiquidityPool> => {
  const pair = await fetchPair({ chainId, pairId });
  if (!pair) {
    throw new Error(`Pool ${pairId} not found on chain ${chainId}`);
  }

  return createPoolFromPair(pair);
};

export const createAddLiquidityArgs = ({
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
  pool: LiquidityPool;
  chainId: number;
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
      typeof magicswapV2RouterAbi,
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
          token: tokenA.id as AddressString,
          collection: Array.from({ length: nftsA.length }).fill(
            tokenA.collectionId,
          ) as AddressString[],
          tokenId: nftsA.map(({ id }) => BigInt(id)),
          amount: nftsA.map(({ quantity }) => BigInt(quantity)),
        },
        {
          token: tokenB.id as AddressString,
          collection: Array.from({ length: nftsB.length }).fill(
            tokenB.collectionId,
          ) as AddressString[],
          tokenId: nftsB.map(({ id }) => BigInt(id)),
          amount: nftsB.map(({ quantity }) => BigInt(quantity)),
        },
        amountAMin,
        amountBMin,
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
            token: tokenB.id as AddressString,
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
          token: tokenA.id as AddressString,
          collection: Array.from({ length: nftsA.length }).fill(
            tokenA.collectionId,
          ) as AddressString[],
          tokenId: nftsA.map(({ id }) => BigInt(id)),
          amount: nftsA.map(({ quantity }) => BigInt(quantity)),
        },
        tokenB.id as AddressString,
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
      args: [
        tokenB.id as AddressString,
        amountB,
        amountBMin,
        amountA,
        toAddress,
        deadline,
      ],
      value: amountA,
    };
  }

  // ERC20-ERC20
  return {
    address: magicSwapV2RouterAddress,
    functionName: "addLiquidity",
    args: [
      tokenA.id as AddressString,
      tokenB.id as AddressString,
      amountA,
      amountB,
      amountAMin,
      amountBMin,
      toAddress,
      deadline,
    ],
  };
};

export const createRemoveLiquidityArgs = ({
  pool,
  chainId,
  amountLP,
  toAddress,
  amount0Min,
  amount1Min,
  nfts0 = [],
  nfts1 = [],
  swapLeftover,
}: {
  pool: LiquidityPool;
  chainId: number;
  toAddress: AddressString;
  amountLP: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  swapLeftover: boolean;
  nfts0?: NFTInput[];
  nfts1?: NFTInput[];
}): {
  address: AddressString;
  functionName: RemoveLiquidityFunctionName;
  args: AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof magicswapV2RouterAbi,
      RemoveLiquidityFunctionName
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
  const amountAMin = isTokenAToken1 ? amount1Min : amount0Min;
  const amountBMin = isTokenAToken1 ? amount0Min : amount1Min;
  const nftsA = isTokenAToken1 ? nfts1 : nfts0;
  const nftsB = isTokenAToken1 ? nfts0 : nfts1;

  // NFT-NFT
  if (pool.isNFTNFT) {
    return {
      address: magicSwapV2RouterAddress,
      functionName: "removeLiquidityNFTNFT",
      args: [
        {
          token: tokenA.id as AddressString,
          collection: Array.from({ length: nftsA.length }).fill(
            tokenA.collectionId,
          ) as AddressString[],
          tokenId: nftsA.map(({ id }) => BigInt(id)),
          amount: nftsA.map(({ quantity }) => BigInt(quantity)),
        },
        {
          token: tokenB.id as AddressString,
          collection: Array.from({ length: nftsB.length }).fill(
            tokenB.collectionId,
          ) as AddressString[],
          tokenId: nftsA.map(({ id }) => BigInt(id)),
          amount: nftsA.map(({ quantity }) => BigInt(quantity)),
        },
        amountLP,
        amountAMin,
        amountBMin,
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
        functionName: "removeLiquidityNFTETH",
        args: [
          {
            token: tokenB.id as AddressString,
            collection: Array.from({ length: nftsB.length }).fill(
              tokenB.collectionId,
            ) as AddressString[],
            tokenId: nftsA.map(({ id }) => BigInt(id)),
            amount: nftsA.map(({ quantity }) => BigInt(quantity)),
          },
          amountLP,
          amountBMin,
          amountAMin,
          toAddress,
          deadline,
          swapLeftover,
        ],
      };
    }
    // NFT-ERC20
    return {
      address: magicSwapV2RouterAddress,
      functionName: "removeLiquidityNFT",
      args: [
        {
          token: tokenA.id as AddressString,
          collection: Array.from({ length: nftsA.length }).fill(
            tokenA.collectionId,
          ) as AddressString[],
          tokenId: nftsA.map(({ id }) => BigInt(id)),
          amount: nftsA.map(({ quantity }) => BigInt(quantity)),
        },
        tokenB.id as AddressString,
        amountLP,
        amountAMin,
        amountBMin,
        toAddress,
        deadline,
        swapLeftover,
      ],
    };
  }

  // ERC20-ETH
  if (pool.token0.isETH || pool.token1.isETH) {
    return {
      address: magicSwapV2RouterAddress,
      functionName: "removeLiquidityETH",
      args: [
        tokenB.id as AddressString,
        amountLP,
        amountBMin,
        amountAMin,
        toAddress,
        deadline,
      ],
    };
  }

  // ERC20-ERC20
  return {
    address: magicSwapV2RouterAddress,
    functionName: "removeLiquidity",
    args: [
      tokenA.id as AddressString,
      tokenB.id as AddressString,
      amountLP,
      amountAMin,
      amountBMin,
      toAddress,
      deadline,
    ],
  };
};
