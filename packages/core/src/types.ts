import type { TransactionReceipt } from "viem";

import type { PROJECT_SLUGS } from "./constants";

// Projects
export type ProjectSlug = (typeof PROJECT_SLUGS)[number];

// General transactions
export type AddressString = `0x${string}`;
export type OnSuccessFn = (data?: TransactionReceipt) => void;
export type OnErrorFn = (error?: Error) => void;

// Contracts
export type PriceFeedContract =
  | "MAGICUSDPriceFeed"
  | "ARBUSDPriceFeed"
  | "ETHUSDPriceFeed";
export type BridgeworldContract =
  | "BalancerCrystals"
  | "Consumables"
  | "CorruptionRemoval"
  | "Legions"
  | "Treasures"
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
  | "NftHandlerThundermane";
export type ZeeverseContract = "ZeeverseZee" | "ZeeverseItems";
export type Contract =
  | "MAGIC"
  | "ARB"
  | "PaymentsModule"
  | "TreasureLoginAccountFactory"
  | PriceFeedContract
  | BridgeworldContract
  | ZeeverseContract;

// Approvals
export type TokenStandard = "ERC20" | "ERC721" | "ERC1155";

// Payments
export type Token = "ARB" | "MAGIC" | "ETH" | AddressString;
export type Currency = Token | "USD";
