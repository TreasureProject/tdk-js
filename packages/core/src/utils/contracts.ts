import { zeroAddress } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";

import type {
  AddressString,
  Contract,
  PriceFeedContract,
  Token,
} from "../types";

export const CONTRACT_ADDRESSES: Record<
  number,
  Record<Contract, AddressString>
> = {
  [arbitrum.id]: {
    MAGIC: "0x539bde0d7dbd336b79148aa742883198bbf60342",
    ARB: "0x912ce59144191c1204e64559fe8253a0e49e6548",
    MAGICUSDPriceFeed: "0x47e55ccec6582838e173f252d08afd8116c2202d",
    ARBUSDPriceFeed: "0xb2a824043730fe05f3da2efafa1cbbe83fa548d6",
    ETHUSDPriceFeed: "0x639fe6ab55c921f74e7fac1ee960c0b6293ba612",
    PaymentsModule: "0xf325ac5c9dc74a3c3b7f2474a709154e9f6bc194",
    TreasureLoginAccountFactory: zeroAddress,
  },
  [arbitrumSepolia.id]: {
    MAGIC: "0x55d0cf68a1afe0932aff6f36c87efa703508191c",
    ARB: zeroAddress,
    MAGICUSDPriceFeed: "0x0fb99723aee6f420bead13e6bbb79b7e6f034298",
    ARBUSDPriceFeed: zeroAddress,
    ETHUSDPriceFeed: "0xd30e2101a97dcbaebcbc04f14c3f624e67a35165",
    PaymentsModule: "0x06e308c2ed6168afd158a4b495b084e9677f4e1d",
    TreasureLoginAccountFactory: "0xfa9db4a45418688d14224b7782a44a8401f68be7",
  },
};

export const getContractAddresses = (chainId: number) => {
  const addresses = CONTRACT_ADDRESSES[chainId];
  return addresses ?? CONTRACT_ADDRESSES[arbitrum.id];
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
