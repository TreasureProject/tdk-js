import type { AddressString, SupportedChainId } from "../types";
import { getContractAddresses } from "../utils/contracts";
import type { NFTInput, PoolToken } from "./types";

const getAmountMax = (amount: bigint, slippage: number) =>
  amount + (amount * BigInt(Math.ceil(slippage * 1000))) / 1000n;
const getAmountMin = (amount: bigint, slippage: number) =>
  amount - (amount * BigInt(Math.ceil(slippage * 1000))) / 1000n;

const DEFAULT_SLIPPAGE = 0.005;

export const getSwapArgs = ({
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
  tokenIn: PoolToken;
  tokenOut: PoolToken;
  nftsIn?: NFTInput[];
  nftsOut?: NFTInput[];
  amountIn?: bigint;
  amountOut?: bigint;
  isExactOut: boolean;
  chainId: SupportedChainId;
  path: string[];
  slippage?: number;
}): {
  address: AddressString;
  functionName: string;
  args: (string | string[])[];
  value?: bigint;
} => {
  const contractAddresses = getContractAddresses(chainId);
  const magicSwapV2RouterAddress = contractAddresses.MagicswapV2Router;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 30 * 60).toString();

  // From NFT
  if (tokenIn.isNFT) {
    const collectionId = tokenIn.collectionId;

    const collectionsIn = nftsIn.map(() => collectionId as AddressString);
    const tokenIdsIn = nftsIn.map(({ id }) => id);
    const quantitiesIn = nftsIn.map(({ quantity }) => quantity.toString());

    // NFT-NFT
    if (tokenOut.isNFT) {
      const collectionIdOut = tokenOut.collectionId;
      const collectionsOut = nftsOut.map(
        () => collectionIdOut as AddressString,
      );
      const tokenIdsOut = nftsOut.map(({ id }) => id);
      const quantitiesOut = nftsOut.map(({ quantity }) => quantity.toString());

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
          amountOutMin.toString(),
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
        amountOutMin.toString(),
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
    const tokenIdsOut = nftsOut.map(({ id }) => id);
    const quantitiesOut = nftsOut.map(({ quantity }) => quantity.toString());

    // ETH-NFT
    if (tokenOut.isETH) {
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
        amountInMax.toString(),
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
        args: [amountOut.toString(), path, toAddress, deadline],
        value: amountInMax,
      };
    }

    // ETH-ERC20 exact in
    return {
      address: magicSwapV2RouterAddress,
      functionName: "swapExactETHForTokens",
      args: [amountOutMin.toString(), path, toAddress, deadline],
      value: amountIn,
    };
  }

  if (tokenOut.isETH) {
    // ERC20-ETH exact out
    if (isExactOut) {
      return {
        address: magicSwapV2RouterAddress,
        functionName: "swapTokensForExactETH",
        args: [
          amountOut.toString(),
          amountInMax.toString(),
          path,
          toAddress,
          deadline,
        ],
      };
    }

    // ERC20-ETH exact in
    return {
      address: magicSwapV2RouterAddress,
      functionName: "swapExactTokensForETH",
      args: [
        amountIn.toString(),
        amountOutMin.toString(),
        path,
        toAddress,
        deadline,
      ],
    };
  }

  // ERC20-ERC20 exact out
  if (isExactOut) {
    return {
      address: magicSwapV2RouterAddress,
      functionName: "swapTokensForExactTokens",
      args: [
        amountOut.toString(),
        amountInMax.toString(),
        path,
        toAddress,
        deadline,
      ],
    };
  }

  // ERC20-ERC20 exact in
  return {
    address: magicSwapV2RouterAddress,
    functionName: "swapExactTokensForTokens",
    args: [
      amountIn.toString(),
      amountOutMin.toString(),
      path,
      toAddress,
      deadline,
    ],
  };
};
