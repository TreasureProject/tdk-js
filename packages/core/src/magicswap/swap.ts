import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";

import type { magicswapV2RouterAbi } from "../abis/magicswapV2RouterAbi";
import type { AddressString } from "../types";
import { getContractAddresses } from "../utils/contracts";
import { createPoolFromPair, fetchPairs } from "./pools";
import type { NFTInput } from "./types";

type SwapFunctionName =
  | "swapExactTokensForTokens"
  | "swapTokensForExactTokens"
  | "swapExactTokensForETH"
  | "swapTokensForExactETH"
  | "swapETHForExactTokens"
  | "swapExactETHForTokens"
  | "swapTokensForNft"
  | "swapNftForTokens"
  | "swapETHForNft"
  | "swapNftForETH"
  | "swapNftForNft";

// Swap only needs a small subset of the PoolToken type
type SwapPoolToken = {
  id: string;
  isNFT: boolean;
  isETH: boolean;
  collectionId: string;
};

type SwapPool = {
  token0: SwapPoolToken;
  token1: SwapPoolToken;
};

const getAmountMax = (amount: bigint, slippage: number) =>
  amount + (amount * BigInt(Math.ceil(slippage * 1000))) / 1000n;
const getAmountMin = (amount: bigint, slippage: number) =>
  amount - (amount * BigInt(Math.ceil(slippage * 1000))) / 1000n;

const DEFAULT_SLIPPAGE = 0.005;

export const fetchPoolsForSwap = async ({
  chainId,
}: { chainId: number }): Promise<SwapPool[]> => {
  const pairs = await fetchPairs({ chainId });
  return pairs.map((pair) => createPoolFromPair(pair));
};

export const createSwapArgs = ({
  toAddress,
  tokenIn,
  tokenOut,
  nftsIn = [],
  nftsOut = [],
  amountIn = 0n,
  amountOut = 0n,
  isExactOut,
  path,
  chainId,
  slippage = DEFAULT_SLIPPAGE,
}: {
  toAddress: AddressString;
  tokenIn: SwapPoolToken;
  tokenOut: SwapPoolToken;
  nftsIn?: NFTInput[];
  nftsOut?: NFTInput[];
  amountIn?: bigint;
  amountOut?: bigint;
  isExactOut: boolean;
  chainId: number;
  path: AddressString[];
  slippage?: number;
}): {
  address: AddressString;
  functionName: SwapFunctionName;
  args: AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof magicswapV2RouterAbi, SwapFunctionName>["inputs"],
    "inputs"
  >;
  value?: bigint;
} => {
  const contractAddresses = getContractAddresses(chainId);
  const magicSwapV2RouterAddress = contractAddresses.MagicswapV2Router;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 60);

  // From NFT
  if (tokenIn.isNFT) {
    const collectionId = tokenIn.collectionId;

    const collectionsIn = nftsIn.map(() => collectionId as AddressString);
    const tokenIdsIn = nftsIn.map(({ id }) => BigInt(id));
    const quantitiesIn = nftsIn.map(({ quantity }) => BigInt(quantity));

    // NFT-NFT
    if (tokenOut.isNFT) {
      const collectionIdOut = tokenOut.collectionId;
      const collectionsOut = nftsOut.map(
        () => collectionIdOut as AddressString,
      );
      const tokenIdsOut = nftsOut.map(({ id }) => BigInt(id));
      const quantitiesOut = nftsOut.map(({ quantity }) => BigInt(quantity));

      return {
        address: magicSwapV2RouterAddress,
        functionName: "swapNftForNft",
        args: [
          collectionsIn,
          tokenIdsIn,
          quantitiesIn,
          collectionsOut,
          tokenIdsOut,
          quantitiesOut,
          path,
          toAddress,
          deadline,
        ],
      };
    }

    const amountOutMin = isExactOut
      ? amountOut
      : getAmountMin(amountOut, slippage);

    // NFT-ETH
    if (tokenOut.isETH) {
      return {
        address: magicSwapV2RouterAddress,
        functionName: "swapNftForETH",
        args: [
          collectionsIn,
          tokenIdsIn,
          quantitiesIn,
          amountOutMin,
          path,
          toAddress,
          deadline,
        ],
      };
    }

    // NFT-ERC20
    return {
      address: magicSwapV2RouterAddress,
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
    };
  }

  // From Token to NFT
  if (tokenOut.isNFT) {
    const collectionId = tokenOut.collectionId;
    const amountInMax = isExactOut
      ? getAmountMax(amountIn, slippage)
      : amountIn;

    const collectionsOut = nftsOut.map(() => collectionId as AddressString);
    const tokenIdsOut = nftsOut.map(({ id }) => BigInt(id));
    const quantitiesOut = nftsOut.map(({ quantity }) => BigInt(quantity));

    // ETH-NFT
    if (tokenIn.isETH) {
      return {
        address: magicSwapV2RouterAddress,
        functionName: "swapETHForNft",
        args: [
          collectionsOut,
          tokenIdsOut,
          quantitiesOut,
          path,
          toAddress,
          deadline,
        ],
        value: amountInMax,
      };
    }

    // ERC20-NFT
    return {
      address: magicSwapV2RouterAddress,
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
    };
  }

  const amountInMax = isExactOut ? getAmountMax(amountIn, slippage) : amountIn;
  const amountOutMin = isExactOut
    ? amountOut
    : getAmountMin(amountOut, slippage);

  if (tokenIn.isETH) {
    // ETH-ERC20 exact out
    if (isExactOut) {
      return {
        address: magicSwapV2RouterAddress,
        functionName: "swapETHForExactTokens",
        args: [amountOut, path, toAddress, deadline],
        value: amountInMax,
      };
    }

    // ETH-ERC20 exact in
    return {
      address: magicSwapV2RouterAddress,
      functionName: "swapExactETHForTokens",
      args: [amountOutMin, path, toAddress, deadline],
      value: amountIn,
    };
  }

  if (tokenOut.isETH) {
    // ERC20-ETH exact out
    if (isExactOut) {
      return {
        address: magicSwapV2RouterAddress,
        functionName: "swapTokensForExactETH",
        args: [amountOut, amountInMax, path, toAddress, deadline],
      };
    }

    // ERC20-ETH exact in
    return {
      address: magicSwapV2RouterAddress,
      functionName: "swapExactTokensForETH",
      args: [amountIn, amountOutMin, path, toAddress, deadline],
    };
  }

  // ERC20-ERC20 exact out
  if (isExactOut) {
    return {
      address: magicSwapV2RouterAddress,
      functionName: "swapTokensForExactTokens",
      args: [amountOut, amountInMax, path, toAddress, deadline],
    };
  }

  // ERC20-ERC20 exact in
  return {
    address: magicSwapV2RouterAddress,
    functionName: "swapExactTokensForTokens",
    args: [amountIn, amountOutMin, path, toAddress, deadline],
  };
};
