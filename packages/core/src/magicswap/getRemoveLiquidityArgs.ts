import type { AddressString, SupportedChainId } from "../types";
import { getContractAddresses } from "../utils/contracts";
import type { Pool } from "./fetchPools";
import type { ContractArgs, NFTInput } from "./types";

export const getRemoveLiquidityArgs = ({
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
  pool: Pool;
  chainId: SupportedChainId;
  toAddress: AddressString;
  amountLP: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  swapLeftover: boolean;
  nfts0?: NFTInput[];
  nfts1?: NFTInput[];
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
        amountLP.toString(),
        amountAMin.toString(),
        amountBMin.toString(),
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
            token: tokenB.id,
            collection: Array.from({ length: nftsB.length }).fill(
              tokenB.collectionId,
            ) as AddressString[],
            tokenId: nftsB.map(({ id }) => id),
            amount: nftsB.map(({ quantity }) => quantity.toString()),
          },
          amountLP.toString(),
          amountBMin.toString(),
          amountAMin.toString(),
          toAddress,
          deadline,
          swapLeftover.toString(),
        ],
      };
    }
    // NFT-ERC20
    return {
      address: magicSwapV2RouterAddress,
      functionName: "removeLiquidityNFT",
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
        amountLP.toString(),
        amountAMin.toString(),
        amountBMin.toString(),
        toAddress,
        deadline,
        swapLeftover.toString(),
      ],
    };
  }

  // ERC20-ETH
  if (pool.token0.isETH || pool.token1.isETH) {
    return {
      address: magicSwapV2RouterAddress,
      functionName: "removeLiquidityETH",
      args: [
        tokenB.id,
        amountLP.toString(),
        amountBMin.toString(),
        amountAMin.toString(),
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
      tokenA.id,
      tokenB.id,
      amountLP.toString(),
      amountAMin.toString(),
      amountBMin.toString(),
      toAddress,
      deadline,
    ],
  };
};
