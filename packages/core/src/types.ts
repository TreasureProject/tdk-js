import type { ThirdwebClient } from "thirdweb";

import type { TDKAPI } from "./api";

// Treasure Connect
export type TreasureConnectClient = ThirdwebClient;

export type SessionOptions = {
  backendWallet: string;
  approvedTargets: string[];
  nativeTokenLimitPerTransaction?: bigint;
  sessionDurationSec?: number;
  sessionMinDurationLeftSec?: number;
};

export type ConnectConfig = {
  apiUri?: string;
  chainId?: number;
  sessionOptions?: SessionOptions;
};


export const SocialConnectMethodMap = {
  google: true,
  telegram: true,
  discord: true,
  apple: true
}

export type SocialConnectMethod = keyof typeof SocialConnectMethodMap;

export type ConnectMethod =
  | SocialConnectMethod
  | "email"
  | "passkey"
  | "wallet";

export type UserContext = {
  id: string;
  address: string;
  email: string | null;
  // Keep previous field name for backwards compatibility
  smartAccountAddress: string;
};

// General transactions
export type AddressString = `0x${string}`;

// Contracts
type TokenContract = "MAGIC" | "ARB" | "VEE" | "CRV";
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
type MagicswapContract = "MagicswapV2Router";
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
  | TokenContract
  | BridgeworldContract
  | MagicswapContract
  | ZeeverseContract;

// Approvals
export type TokenStandard = "ERC20" | "ERC721" | "ERC1155";

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
