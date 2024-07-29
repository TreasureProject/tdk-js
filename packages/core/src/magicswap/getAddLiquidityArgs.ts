import type { AddressString, SupportedChainId } from "../types";
import { getContractAddresses } from "../utils/contracts";
import type { Pool } from "./fetchPools";
import type { ContractArgs, NFTInput } from "./types";

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
  functionName: string;
  args: (ContractArgs | Record<string, ContractArgs>)[];
  value?: bigint;
} => {
  const contractAddresses = getContractAddresses(chainId);
  const magicSwapV2RouterAddress = contractAddresses.MagicswapV2Router;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 60).toString();

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
      functionName: "addLiquidityNftNft",
      args: [
        {
          token: tokenA.id,
          collection: Array.from({ length: nftsA.length }).fill(
            tokenA.collectionId,
          ) as AddressString[],
          tokenId: nftsA.map(({ id }) => id),
          amount: nftsA.map(({ quantity }) => quantity.toString()),
        },
        {
          token: tokenB.id,
          collection: Array.from({ length: nftsB.length }).fill(
            tokenB.collectionId,
          ) as AddressString[],
          tokenId: nftsB.map(({ id }) => id),
          amount: nftsB.map(({ quantity }) => quantity.toString()),
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
            tokenId: nftsB.map(({ id }) => id),
            amount: nftsB.map(({ quantity }) => quantity.toString()),
          },
          amountA.toString(),
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
          tokenId: nftsA.map(({ id }) => id),
          amount: nftsA.map(({ quantity }) => quantity.toString()),
        },
        tokenB.id,
        amountB.toString(),
        amountBMin.toString(),
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
        tokenB.id,
        amountB.toString(),
        amountBMin.toString(),
        amountA.toString(),
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
      tokenA.id,
      tokenB.id,
      amountA.toString(),
      amountB.toString(),
      amountAMin.toString(),
      amountBMin.toString(),
      toAddress,
      deadline,
    ],
  };
};
