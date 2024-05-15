import { arbitrum } from "viem/chains";

import { CONTRACT_ADDRESSES } from "../constants";
import type {
  AddressString,
  Contract,
  PriceFeedContract,
  Token,
} from "../types";

export const getContractAddresses = (chainId: number) => {
  // TODO: better handling if consumer requests an unsupported chain
  const addresses = CONTRACT_ADDRESSES[chainId];
  return (addresses ?? CONTRACT_ADDRESSES[arbitrum.id]) as Record<
    Contract,
    AddressString
  >;
};

export const getContractAddress = (chainId: number, contract: Contract) =>
  getContractAddresses(chainId)[contract];

export const getTokenPriceFeedContract = (
  token: Token,
): PriceFeedContract | undefined => {
  switch (token) {
    case "MAGIC":
      return "MAGICUSDPriceFeed";
    case "ARB":
      return "ARBUSDPriceFeed";
    case "ETH":
      return "ETHUSDPriceFeed";
    default:
      return undefined;
  }
};
