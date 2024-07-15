import type { TransactionReceipt } from "viem";

import type { TDKAPI } from "./api";
import type { SUPPORTED_CHAIN_IDS } from "./constants";

// General transactions
export type AddressString = `0x${string}`;
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];
export type OnSuccessFn = (data?: TransactionReceipt) => void;
export type OnErrorFn = (error?: Error) => void;

// Contracts
type TokenContract = "MAGIC" | "ARB" | "VEE" | "CRV";
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
type ZeeverseContract =
  | "ZeeverseZee"
  | "ZeeverseItems"
  | "ZeeverseVeeClaimer"
  | "ZeeverseLlama"
  | "ZeeverseLlamaEvolve"
  | "ZeeverseGame";
export type Contract =
  | "PaymentsModule"
  | "ManagedAccountFactory"
  | "BulkTransferHelper"
  | "TreasureConduit"
  | "RubyNFT"
  | "MagicSwapV2Router"
  | TokenContract
  | PriceFeedContract
  | BridgeworldContract
  | ZeeverseContract;

// Approvals
export type TokenStandard = "ERC20" | "ERC721" | "ERC1155";

// Payments
export type Token = "ARB" | "MAGIC" | "ETH" | AddressString;
export type Currency = Token | "USD";

// API
export type Project = Awaited<
  ReturnType<(typeof TDKAPI)["prototype"]["project"]["findBySlug"]>
>;
export type Transaction = Awaited<
  ReturnType<(typeof TDKAPI)["prototype"]["transaction"]["get"]>
>;
export type User = Awaited<
  ReturnType<(typeof TDKAPI)["prototype"]["user"]["me"]>
>;
export type Session = Awaited<
  ReturnType<(typeof TDKAPI)["prototype"]["user"]["getSessions"]>
>[number];

export type CollectionResponse = {
  contractType: "ERC721" | "ERC1155";
  daoFee: number;
  quantityTotal: number;
  tokenDisplayName: { singular: string; plural: string };
  currency: string;
  lastModified: string;
  highestCollectionBid: null;
  royaltyFee: number;
  displayName: string;
  contractName: string;
  numOwners: number;
  numTokens: number;
  ceilingPrice: null;
  tags: string[];
  thumbnailUri: string;
  flags: {
    supportsRarity: boolean;
    supportsTokenBids: boolean;
    supportsCollectionBids: boolean;
  };
  urlSlug: string;
  symbol: string;
  cartridge: null;
  related: string;
  collectionAddr: string;
  collectionTraitsOverride: object;
  tagPriority: object;
  quantityListed: number;
  pk2: string;
  partitionId: null;
  royaltyRecipient: null;
  externalUrls: {
    twitter: string;
    website: string;
    game: string;
    discord: string;
    docs: string;
    treasureTools: string;
    instagram: string;
  };
  pk1: string;
  chain: string;
  collectionTraitsValuePriorities: object;
  sk1: string;
  sk2: string;
  tokensLastSynced: string;
  cacheLastModified: string;
  description: string;
  sk5: string;
  floorPrice: null;
};
