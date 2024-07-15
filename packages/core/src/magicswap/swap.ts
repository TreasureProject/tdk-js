import { type Config, connect, mock, readContract } from "@wagmi/core";
import { erc20Abi } from "viem";
import { erc1155Abi } from "../abis/erc1155Abi";
import type { AddressString, SupportedChainId } from "../types";
import { getContractAddresses } from "../utils/contracts";
import { DEFAULT_WAGMI_CONFIG } from "../utils/wagmi";
import type { Pool } from "./fetchPools";
import { getSwapRoute } from "./getSwapRoute";
import type { PoolToken } from "./types";

type NFTInput = { id: string; quantity: number };

const getAmountMax = (amount: bigint, slippage: number) =>
  amount + (amount * BigInt(Math.ceil(slippage * 1000))) / 1000n;
const getAmountMin = (amount: bigint, slippage: number) =>
  amount - (amount * BigInt(Math.ceil(slippage * 1000))) / 1000n;

const DEFAULT_SLIPPAGE = 0.005;

export const swap = async ({
  pools,
  toAddress,
  tokenInId,
  tokenOutId,
  nftsIn,
  nftsOut,
  amountIn = "0",
  amountOut = "0",
  isExactOut,
  chainId,
  slippage = DEFAULT_SLIPPAGE,
  wagmiConfig = DEFAULT_WAGMI_CONFIG,
}: {
  pools: Pool[];
  toAddress: AddressString;
  tokenInId: string;
  tokenOutId: string;
  nftsIn: NFTInput[];
  nftsOut: NFTInput[];
  amountIn?: string;
  amountOut?: string;
  isExactOut: boolean;
  chainId: SupportedChainId;
  slippage?: number;
  wagmiConfig?: Config;
}) => {
  await connect(wagmiConfig, {
    chainId,
    connector: mock({
      accounts: ["0x8c59E81e2553104d0B4F3dE19D0eD347055BB218"],
    }),
  });

  const poolTokens = pools
    .flatMap(({ token0, token1 }) => [token0, token1])
    .reduce(
      (acc, poolToken) => {
        acc[poolToken.id] = poolToken;
        return acc;
      },
      {} as Record<string, PoolToken>,
    );

  const tokenIn = poolTokens[tokenInId];
  const tokenOut = poolTokens[tokenOutId];
  const contractAddresses = getContractAddresses(chainId);
  const magicSwapV2RouterAddress = contractAddresses.MagicSwapV2Router;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 60);

  // From NFT
  if (tokenIn.isNFT) {
    // To NFT
    if (tokenOut.isNFT) throw new Error("NFT to NFT swaps are not supported");

    // To Token
    const collectionId = tokenIn.collectionId;
    const amountOutMin = isExactOut
      ? BigInt(amountOut)
      : getAmountMin(BigInt(amountOut), slippage);

    const route = getSwapRoute({
      pools,
      tokenInId,
      tokenOutId,
      amount: amountOut,
      isExactOut,
    });

    const collectionsIn = nftsIn.map(() => collectionId as AddressString);
    const tokenIdsIn = nftsIn.map(({ id }) => BigInt(id));
    const quantitiesIn = nftsIn.map(({ quantity }) => BigInt(quantity));
    const path = route.path;
    const approved = await readContract(wagmiConfig, {
      address: tokenIn.collectionId as AddressString,
      abi: erc1155Abi,
      functionName: "isApprovedForAll",
      args: [toAddress, magicSwapV2RouterAddress],
    });

    return {
      approved,
      swap: {
        functionName: "swapNftForTokens",
        args: [
          collectionsIn,
          tokenIdsIn,
          quantitiesIn,
          amountOutMin,
          path,
          toAddress,
          deadline,
        ],
      },
    };
  }

  // From Token to NFT
  const approved = await readContract(wagmiConfig, {
    address: tokenIn.id as AddressString,
    abi: erc20Abi,
    functionName: "allowance",
    args: [toAddress, magicSwapV2RouterAddress],
  });

  if (tokenOut.isNFT) {
    const collectionId = tokenOut.collectionId;
    const amountInMax = isExactOut
      ? getAmountMax(BigInt(amountIn), slippage)
      : BigInt(amountIn);

    const route = getSwapRoute({
      pools,
      tokenInId,
      tokenOutId,
      amount: nftsOut
        .reduce((acc, { quantity }) => acc + quantity, 0)
        .toString(),
      isExactOut,
    });

    const collectionsOut = nftsOut.map(() => collectionId as AddressString);
    const tokenIdsOut = nftsOut.map(({ id }) => BigInt(id));
    const quantitiesOut = nftsOut.map(({ quantity }) => BigInt(quantity));
    const path = route.path;

    return {
      approved,
      swap: {
        functionName: "swapTokensForNft",
        args: [
          collectionsOut,
          tokenIdsOut,
          quantitiesOut,
          amountInMax,
          path,
          toAddress,
          deadline,
        ],
      },
    };
  }

  const route = getSwapRoute({
    pools,
    tokenInId,
    tokenOutId,
    amount: amountOut,
    isExactOut,
  });

  // From Token to Token Exact Out
  if (isExactOut) {
    const amountInMax = isExactOut
      ? getAmountMax(BigInt(amountIn), slippage)
      : BigInt(amountIn);

    return {
      swap: {
        functionName: "swapTokensForExactTokens",
        args: [BigInt(amountOut), amountInMax, route.path, toAddress, deadline],
      },
    };
  }

  // From Token to Token Exact In
  const amountOutMin = isExactOut
    ? BigInt(amountOut)
    : getAmountMin(BigInt(amountOut), slippage);

  return {
    swap: {
      functionName: "swapExactTokensForTokens",
      args: [BigInt(amountIn), amountOutMin, route.path, toAddress, deadline],
    },
  };
};
