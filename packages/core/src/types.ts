import type { ThirdwebClient } from "thirdweb";

import type { TDKAPI } from "./api";

// Treasure Connect
export type EcosystemIdString = `ecosystem.${string}`;
export type TreasureConnectClient = ThirdwebClient;

export type AuthOptions = {
  authTokenDurationSec?: number;
};

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
  authOptions?: AuthOptions;
  sessionOptions?: SessionOptions;
};

export type UserContext = {
  id: string;
  email: string | null;
  address: string;
  tag: string | null;
  discriminant: number | null;
  smartAccounts: {
    chainId: number;
    address: string;
    ecosystemWalletAddress: string;
  }[];
};

// General transactions
export type AddressString = `0x${string}`;

// Contracts
export type Contract =
  // Tokens
  | "ETH"
  | "MAGIC"
  | "WMAGIC"
  | "SMOL"
  | "VEE"
  | "USDC"
  | "CRV"
  // Bridgeworld
  | "Middleman"
  | "BalancerCrystals"
  | "Consumables"
  | "Legions"
  | "Treasures"
  // Magicswap
  | "MagicswapV2Router"
  // Treasure Misc
  | "BulkTransferHelper"
  | "TreasureConduit"
  | "TopazNFT"
  | "TreasureBanners";

// Approvals
export type TokenStandard = "ERC20" | "ERC721" | "ERC1155";

// API
export type Transaction = Awaited<
  ReturnType<(typeof TDKAPI)["prototype"]["transaction"]["get"]>
>;
export type User = Awaited<
  ReturnType<(typeof TDKAPI)["prototype"]["user"]["me"]>
>;
export type LegacyProfile = Awaited<
  ReturnType<(typeof TDKAPI)["prototype"]["auth"]["logIn"]>
>["legacyProfiles"][number];
export type Session = Awaited<
  ReturnType<(typeof TDKAPI)["prototype"]["user"]["getSessions"]>
>[number];
export type MagicswapPool = Awaited<
  ReturnType<(typeof TDKAPI)["prototype"]["magicswap"]["getPool"]>
>;
export type MagicswapRoute = Awaited<
  ReturnType<(typeof TDKAPI)["prototype"]["magicswap"]["getRoute"]>
>;

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
