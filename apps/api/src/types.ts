import type { PrismaClient } from "@prisma/client";
import type { Engine } from "@thirdweb-dev/engine";
import type { Config as WagmiConfig } from "@wagmi/core";
import type { ThirdwebClient } from "thirdweb";
import type { createAuth } from "thirdweb/auth";

export type ThirdwebAuth = ReturnType<typeof createAuth>;

export type TdkDbSecret = {
  dbname: string;
  engine: string;
  host: string;
  password: string;
  port: number;
  username: string;
};

export type TdkApiEnv = {
  PORT: string;
  DATABASE_URL: string;
  DEFAULT_BACKEND_WALLET: string;
  THIRDWEB_AUTH_DOMAIN: string;
  THIRDWEB_AUTH_PRIVATE_KEY: string;
  THIRDWEB_CLIENT_ID: string;
  THIRDWEB_ENGINE_URL: string;
  THIRDWEB_ENGINE_ACCESS_TOKEN: string;
  THIRDWEB_SECRET_KEY: string;
  TROVE_API_URL: string;
  TROVE_API_KEY: string;
  ZEEVERSE_API_URL: string;
};

export type TdkApiContext = {
  env: TdkApiEnv;
  db: PrismaClient;
  client: ThirdwebClient;
  auth: ThirdwebAuth;
  engine: Engine;
  wagmiConfig: WagmiConfig | undefined;
};

export type ContractType = "ERC721" | "ERC1155";

type OSDisplayType = "number" | "boost_number" | "boost_percentage";

type DisplayType =
  | "default"
  | "numeric"
  | "date"
  | "date_milliseconds"
  | OSDisplayType;

type DisplayOrder = "frequency" | "name" | "frequency_desc";

type NumericRarityType = "top" | "bottom" | "percentMaxValue";

type StringRarityType =
  | "inverseFrequency"
  | "percentMaxInverseFrequency"
  | "logInverseFrequency"
  | "percentMaxLogInverseFrequency";

interface TraitOverride {
  // The type of the trait for display purposes.
  display_type?: DisplayType;

  /**
   * Flags that tweak display behavior.
   */
  // Whether the field should be priority-ordered on token tile attributes. Higher priority means
  // ordered first.
  priority?: number;
  // Whether the trait should be hidden from token tiles and token pages.
  hidden?: boolean;
  // How the trait values should be sorted in the collection filter bar.
  display_order?: DisplayOrder;
  // Whether the trait should be omitted from the collection filter bar.
  omitFromFilter?: boolean;
  // Whether the trait name should have higher sort priority in the collection filter bar. Higher
  // priority means ordered first.
  filterPriority?: number;
  // The super-trait or group name a set of traits should be bundled under.
  superTrait?: string;
  // The name of the trait as it appears under the superTrait's expanded menu/panel.
  subTrait?: string;
  // Whether to combine the subTraits to form a single superTrait attribute at query time.
  combineSubTraits?: boolean;
  // Place this trait in a separate section under the title specified by specialSection.
  specialSection?: string;

  /**
   * Flags that govern rarity calculations.
   */
  // How the rarity score should be computed for a numeric trait..
  numericRarity?: NumericRarityType;
  // How the rarity score should be computed for a string trait.
  stringRarity?: StringRarityType;
  // Ignore trait for rarity computation.
  ignoreRarity?: boolean;
  // Weight assigned to the rarity score for this individual trait. If undefined, default to
  // weight of 1.0.
  rarityWeight?: number;
  // Offset added to the rarity score for this individual trait. If undefined, default to
  // offset of 0.
  rarityOffset?: number;
  // A map that assigns points to particular trait values. Often used if we want the collection's 'Rarity' trait to
  // take precedence for determining rarity.
  rarityPoints?: Record<string, number>;
  // A map from trait value to a custom multiplier for the trait's individual rarity score. Useful for boosting rarity
  // for specific 1-1's that are being drowned out by other ones.
  customRarityMultiplier?: Record<string, number>;

  /**
   * Flags that alter how meta-traits are computed (such as trait count).
   */
  // Whether the trait should be ignored for trait counting purposes.
  ignoreTraitCount?: boolean;

  // For display_type == 'numeric', these specify the max/min values seen, as well as the minimum
  // step seen between consecutive values.
  valueMin?: number;
  valueMax?: number;
  valueStep?: number;
}

// Attribute as defined in https://docs.opensea.io/docs/metadata-standards.
export interface Attribute extends TraitOverride {
  trait_type?: string;
  value: string | number;
}

export interface SecondaryMediaInMetadata {
  description: string;
  category?: "skin" | "item" | "pfp";
  uri: string;
}

// TokenMetadata as defined in https://docs.opensea.io/docs/metadata-standards.
export interface TokenMetadata {
  // URL to item image.
  image?: string;
  // Alternative field name for item image.
  imageUrl?: string;
  // Raw SVG data. Used if image is undefined.
  image_data?: string;
  // External URL associated with the item's project.
  external_url?: string;
  // Human readable description.
  description?: string;
  // Name of the item.
  name?: string;
  // Array of item's attributes.
  attributes?: Attribute[];
  // Optional ERC1155 metadata.
  properties?: Record<string, any>;
  // 6-character hex string.
  background_color?: string;
  // URL to multimedia attachment for item.
  animation_url?: string;
  // URL to YouTube video.
  youtube_url?: string;

  /**
   * TROVE SPECIFIC FIELDS
   */

  // Array of URIs pointing to secondary media related to the token.
  secondary_media?: SecondaryMediaInMetadata[];
}

export interface ImageData {
  // Width of original image.
  width: number;
  // Height of original image.
  height: number;
  // Base64 encoded placeholder URI (if applicable).
  placeholderUri: string;
  // Hash of image contents.
  contentHash: string;

  // URL to the cached image.
  uri: string;
  // Size of image in bytes.
  size: number;

  // Content type of the image.
  contentType: string;
  // URL to original image. (If original image was encoded in the metadata itself, this
  // field will have the value 'encoded'.)
  originalUri: string;

  // An override to retain GIF format when run through image resizing proxies.
  retainGIF?: boolean;
}

export interface SecondaryMedia {
  description: string;
  category?: "skin" | "item" | "pfp";
  media: ImageData;
}

export type ActivityType = 'Sale' | 'Listing' | 'Bid' | 'Transfer' | 'Mint' | 'Burn';
export type ActivityStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'CANCELLED' | 'INVALID';
export type BidType = 'TOKEN' | 'COLLECTION';
export type SaleType = 'LISTING' | 'BID';


export interface TokenActivityNoPriceLookup {
  // Token identifier fields.
  chain: string;
  collectionAddr: string;
  tokenId: string;

  // Activity type/status/timing.
  activityType: ActivityType;
  activityStatus: ActivityStatus | null;
  bidType: BidType | null;
  saleType: SaleType | null;
  blockNumber: number;
  blockTimestamp: string;
  expiryTimestamp: string | null; // Applicable to listings/bids.

  // Price data.
  currencyAddr: string | null;
  pricePerItem: string;
  quantity: string;

  // More info about the transaction.
  seller: string | null;
  buyer: string | null;
  txHash: string | null;
}

export interface PriceSummary {
  floorPrice: string | null;
  hasActiveListing: boolean;
  activeListingSeller: string | null;
  hasActiveBid: boolean;
  highestBidPrice: string | null;
  lastActivityTimestamp: string | null;
  listingExpires: string | null;
  lastSoldPrice: string | null;
  numListings: number;
  quantityListed: number;
  unused?: number;
  lowestListingObject: TokenActivityNoPriceLookup | null;
  highestBidObject: TokenActivityNoPriceLookup | null;
  lastSaleObject: TokenActivityNoPriceLookup | null;
}

export interface GatheredStackStats {
    // Floor price of the stack.
    floorPrice: string | null;

    // Total supply of the stack.
    totalSupply: number;
    // Supply of the stack minted on chain.
    mintedSupply?: number;
    // Supply of the stack not yet minted.
    unmintedSupply?: number;
}

export interface StackStats extends GatheredStackStats {
    // Identifying info for the stack.
    chain: string;
    collectionAddr: string;
    partitionId: string | null;
    stackTrait: string;
    stackValue: string | number;

    // ISO timestamp of when this entry was last modified.
    cacheLastModified: string;
}

export interface RarityScoreComponent {
    trait: string;
    value: string | number;
    score?: number;
    count: number;
}

export interface TokenRarity {
    // Identifying info for the collection this token belongs to.
    chain: string;
    collectionAddr: string;
    // Identifier for the token within the collection.
    tokenId: string;

    // A numeric rank on rarity (starting from 1 for most rare).
    rank: number;

    // A rarity score that is the sum of the inverse frequency of each of the token's trait values.
    // Uses the Rarity Score method described here:
    // https://raritytools.medium.com/ranking-rarity-understanding-rarity-calculation-methods-86ceaeb9b98c.
    score?: number;

    // Breakdown of traits contributing to the score.
    scoreBreakdown: RarityScoreComponent[];
}



// TokenDetails (metadata, image metadata, etc) for a given token. This will be stored in the DB.
export interface Token {
  // Type of contract.
  contractType: ContractType;
  // Chain on which the collection resides.
  chain: string;
  // Contract address for the collection this token belongs to.
  collectionAddr: string;
  // Identifier for the token within the collection.
  tokenId: string;
  // Address of token's current owner.
  currentOwner: string;
  // Address of token's true/actual owner (e.g., user-owner of a token that is currently staked in
  // a contract).
  trueOwner?: string;
  // UNIX timestamp seconds of when this token was minted.
  mintTimestamp: string | null;
  // Total supply of the token (relevant for ERC1155). For ERC721, this should be 1.
  tokenSupply: number;
  // Cached JSON metadata for the token.
  metadata: TokenMetadata;
  // The source of the metadata, which could be a tokenURI or a string indicating where the
  // metadata came from.
  metadataSource: string;
  // Data for rendering the image.
  image: ImageData;
  // Data for rending the animation.
  animation: ImageData | null;
  // List of secondary images/animations to include with the token.
  secondaryMedia?: SecondaryMedia[];

  // Price summary for the Token.
  priceSummary: PriceSummary;
  // The floor price for the colleciton/partition/stack this Token belongs to. Populated at API
  // query time.
  referenceFloorPrice?: string | null;

  // Timestamp when full cached entry (image + metadata + price) was last modified. Uses ISO format.
  cacheLastModified?: string;
  // Timestamp when metadata + price was last modified. Uses ISO format.
  metadataLastModified?: string;
  // Timestamp when price was last modified. Uses ISO format.
  priceLastModified?: string;

  // URL slug for the collection of this token. Populated at API query time.
  collectionUrlSlug?: string | null;
  // URL slug for the parent collection if this token belongs to a merged collection. Populated at API query time.
  parentUrlSlug?: string;
  // Whether the token is staked or locked.
  isStaked?: boolean;
  // Counter on the number of attempts to burn this token. When the number of attempts meets or
  // exceeds the threshold, then the token will be burned. If the token is know to still exist,
  // the burnAttempts counter will be reset.
  burnAttempts?: number;
  // An indicator on whether this token is burned.
  isBurned?: boolean;
  // Whether the trait used for stacking (deduplicating) the token result.
  stackTrait?: string;
  // Stats about this stack of tokens (if applicable).
  stackStats?: StackStats | null;

  // Rarity info for the token. Populated at API query time.
  rarity?: TokenRarity | null;

  // Query user's address and the token quantity owned byt that user. Populated at API query time.
  queryUserAddress?: string;
  queryUserQuantityOwned?: number;

  // Minimal cartridge metadata for the game this token belongs to (if the collection is defined).
  // Populated at API query time.
  cartridge?: {
    cartridgeTag: string;
    displayName?: string; // Populated during getAccountSettings account transform.
  };

  // If the token has a custom maximum expiry date, the frontend will configure listing/bid options to provde this as
  // an option.
  maxExpiry?: {
    label: string;
    date: string; // ISO date.
  };
}
