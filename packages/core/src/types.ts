import type { TransactionReceipt } from "viem";

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
  | "Consumables"
  | "HarvesterAfarit"
  | "NftHandlerAfarit"
  | "HarvesterAsiterra"
  | "NftHandlerAsiterra"
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
export type Contract =
  | "MAGIC"
  | "ARB"
  | "PaymentsModule"
  | "TreasureLoginAccountFactory"
  | BridgeworldContract
  | PriceFeedContract;

// Approvals
export type TokenStandard = "ERC20" | "ERC721" | "ERC1155";

// Payments
export type Token = "ARB" | "MAGIC" | "ETH" | AddressString;
export type Currency = Token | "USD";
