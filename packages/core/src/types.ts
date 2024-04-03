import type { TransactionReceipt } from "viem";

import type { SUPPORTED_CHAIN_IDS } from "./constants";

// General transactions
export type AddressString = `0x${string}`;
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];
export type OnSuccessFn = (data?: TransactionReceipt) => void;
export type OnErrorFn = (error?: Error) => void;

// Contracts
export type PriceFeedContract =
  | "MAGICUSDPriceFeed"
  | "ARBUSDPriceFeed"
  | "ETHUSDPriceFeed";
export type BridgeworldContract =
  // General
  | "Middleman"
  // Tokens
  | "Corruption"
  // NFTs
  | "BalancerCrystals"
  | "Consumables"
  | "Legions"
  | "Treasures"
  // Harvesters
  | "HarvesterAfarit"
  | "NftHandlerAfarit"
  | "HarvesterAsiterra"
  | "NftHandlerAsiterra"
  | "HarvesterEmberwing"
  | "NftHandlerEmberwing"
  | "HarvesterEmerion"
  | "NftHandlerEmerion"
  | "HarvesterKameji"
  | "NftHandlerKameji"
  | "HarvesterLupusMagus"
  | "NftHandlerLupusMagus"
  | "HarvesterShinoba"
  | "NftHandlerShinoba"
  | "HarvesterThundermane"
  | "NftHandlerThundermane"
  // Gameplay
  | "CorruptionRemoval";
export type ZeeverseContract = "ZeeverseZee" | "ZeeverseItems";
export type Contract =
  | "MAGIC"
  | "ARB"
  | "PaymentsModule"
  | "ManagedAccountFactory"
  | PriceFeedContract
  | BridgeworldContract
  | ZeeverseContract;

// Approvals
export type TokenStandard = "ERC20" | "ERC721" | "ERC1155";

// Payments
export type Token = "ARB" | "MAGIC" | "ETH" | AddressString;
export type Currency = Token | "USD";
