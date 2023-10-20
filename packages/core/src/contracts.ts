import { zeroAddress } from "viem";
import { arbitrum, arbitrumGoerli } from "viem/chains";

import type { Currency, Token } from "./payments/types";
import type { AddressString } from "./types";

export type PriceFeedContract =
  | "MAGICUSDPriceFeed"
  | "ARBUSDPriceFeed"
  | "ETHUSDPriceFeed";

export type TreasureContract =
  | "MAGIC"
  | "ARB"
  | "PaymentsModule"
  | PriceFeedContract;

export const TREASURE_CONTRACT_ADDRESSES: Record<
  number,
  Record<TreasureContract, AddressString>
> = {
  [arbitrum.id]: {
    MAGIC: "0x539bde0d7dbd336b79148aa742883198bbf60342",
    ARB: "0x912ce59144191c1204e64559fe8253a0e49e6548",
    MAGICUSDPriceFeed: "0x47e55ccec6582838e173f252d08afd8116c2202d",
    ARBUSDPriceFeed: "0xb2a824043730fe05f3da2efafa1cbbe83fa548d6",
    ETHUSDPriceFeed: "0x639fe6ab55c921f74e7fac1ee960c0b6293ba612",
    PaymentsModule: "0xf325ac5c9dc74a3c3b7f2474a709154e9f6bc194",
  },
  [arbitrumGoerli.id]: {
    MAGIC: "0x88f9efb3a7f728fdb2b8872fe994c84b1d148f65",
    ARB: "0xf861378b543525ae0c47d33c90c954dc774ac1f9",
    MAGICUSDPriceFeed: "0xd28ba6ca3bb72bf371b80a2a0a33cbcf9073c954",
    ARBUSDPriceFeed: "0x2ee9bfb2d319b31a573ea15774b755715988e99d",
    ETHUSDPriceFeed: "0x62cae0fa2da220f43a51f86db2edb36dca9a5a08",
    PaymentsModule: "0x366a17839a625b87b114be0ab5a45a979959702b",
  },
};

export const getTreasureContractAddresses = (chainId: number) => {
  const addresses = TREASURE_CONTRACT_ADDRESSES[chainId];
  return addresses ?? TREASURE_CONTRACT_ADDRESSES[arbitrum.id];
};

export const getTreasureContractAddress = (
  chainId: number,
  contract: TreasureContract,
) => getTreasureContractAddresses(chainId)[contract];

export const getTokenAddress = (chainId: number, token: Token) => {
  const contractAddresses = getTreasureContractAddresses(chainId);
  switch (token) {
    case "ARB":
    case "MAGIC":
      return contractAddresses[token];
    case "ETH":
      return zeroAddress;
    default:
      return token;
  }
};

export const getCurrencyAddress = (chainId: number, currency: Currency) =>
  currency === "USD" ? zeroAddress : getTokenAddress(chainId, currency);

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
