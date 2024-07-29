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
    // To NFT
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

    // To Token
    const amountOutMin = isExactOut
      ? amountOut
      : getAmountMin(amountOut, slippage);

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

  // From Token to Token Exact Out
  if (isExactOut) {
    const amountInMax = isExactOut
      ? getAmountMax(amountIn, slippage)
      : amountIn;

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

  // From Token to Token Exact In
  const amountOutMin = isExactOut
    ? amountOut
    : getAmountMin(amountOut, slippage);

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
