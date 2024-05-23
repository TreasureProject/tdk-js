import type { TransactionReceipt } from "viem";

import type { SUPPORTED_CHAIN_IDS } from "./constants";

// General transactions
export type AddressString = `0x${string}`;
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];
export type OnSuccessFn = (data?: TransactionReceipt) => void;
export type OnErrorFn = (error?: Error) => void;

// Contracts
type TokenContract = "MAGIC" | "ARB" | "VEE";
export type PriceFeedContract =
  | "MAGICUSDPriceFeed"
  | "ARBUSDPriceFeed"
  | "ETHUSDPriceFeed";
type BridgeworldContract =
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
  | "CorruptionRemoval"
  | "ERC1155TokenSetCorruptionHandler";
type ZeeverseContract = "ZeeverseZee" | "ZeeverseItems" | "ZeeverseVeeClaimer";
export type Contract =
  | "PaymentsModule"
  | "ManagedAccountFactory"
  | "BulkTransferHelper"
  | "TreasureConduit"
  | TokenContract
  | PriceFeedContract
  | BridgeworldContract
  | ZeeverseContract;

// Approvals
export type TokenStandard = "ERC20" | "ERC721" | "ERC1155";

// Payments
export type Token = "ARB" | "MAGIC" | "ETH" | AddressString;
export type Currency = Token | "USD";
