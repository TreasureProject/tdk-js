import { type Static, Type } from "@sinclair/typebox";
import {
  nullableStringSchema,
  sessionSchema,
  userProfileSchema,
  userSchema,
} from "./shared";

export const readCurrentUserReplySchema = Type.Intersect([
  userSchema,
  userProfileSchema,
  Type.Object({
    allActiveSigners: Type.Array(sessionSchema),
  }),
]);

export const updateCurrentUserBodySchema = Type.Object({
  emailSecurityPhrase: Type.Optional(nullableStringSchema),
  featuredNftIds: Type.Optional(Type.Array(Type.String())),
  featuredBadgeIds: Type.Optional(Type.Array(Type.String())),
  highlyFeaturedBadgeId: Type.Optional(nullableStringSchema),
  about: Type.Optional(nullableStringSchema),
  pfp: Type.Optional(nullableStringSchema),
  banner: Type.Optional(nullableStringSchema),
  showMagicBalance: Type.Optional(Type.Boolean()),
  showEthBalance: Type.Optional(Type.Boolean()),
  showGemsBalance: Type.Optional(Type.Boolean()),
});

export const updateCurrentUserReplySchema = Type.Intersect([
  userSchema,
  userProfileSchema,
]);

const readCurrentUserSessionsQuerystringSchema = Type.Object({
  chainId: Type.Number(),
});

const CollectionStatus = Type.Union([
  Type.Literal("REGISTERED"),
  Type.Literal("UNREGISTERED"),
]);

const readCurrentUserTokensQuerystringSchema = Type.Object({
  userAddress: Type.String(),
  chains: Type.Optional(Type.Union([Type.Array(Type.String()), Type.String()])),
  collectionStatus: Type.Optional(CollectionStatus),
  slugs: Type.Optional(Type.Union([Type.Array(Type.String()), Type.String()])),
  ids: Type.Optional(Type.Union([Type.Array(Type.String()), Type.String()])), // 'slug/tokenId' or 'chain/collectionAddr/tokenId' format.
  traits: Type.Optional(Type.Union([Type.Array(Type.String()), Type.String()])),
  projection: Type.Optional(Type.String()),
  textSearch: Type.Optional(Type.String()),
  query: Type.Optional(Type.String()),
  showHiddenTraits: Type.Optional(Type.Boolean()),
  showHiddenTags: Type.Optional(Type.Boolean()),
});

const attributeSchema = Type.Object({
  trait_type: Type.Optional(Type.String()),
  value: Type.Union([Type.String(), Type.Number()]),
});

const SecondaryMediaInMetadataSchema = Type.Object({
  description: Type.String(),
  category: Type.Optional(
    Type.Union([
      Type.Literal("skin"),
      Type.Literal("item"),
      Type.Literal("pfp"),
    ])
  ),
  uri: Type.String(),
});

const tokenMetadataSchema = Type.Object({
  image: Type.Optional(Type.String()),
  // Alternative field name for item image.
  imageUrl: Type.Optional(Type.String()),
  // Raw SVG data. Used if image is undefined.
  image_data: Type.Optional(Type.String()),
  // External URL associated with the item's project.
  external_url: Type.Optional(Type.String()),
  // Human readable description.
  description: Type.Optional(Type.String()),
  // Name of the item.
  name: Type.Optional(Type.String()),
  // Array of item's attributes.
  attributes: Type.Optional(Type.Array(attributeSchema)),
  // Optional ERC1155 metadata.
  properties: Type.Optional(Type.Record(Type.String(), Type.Any())),
  // 6-character hex string.
  background_color: Type.Optional(Type.String()),
  // URL to multimedia attachment for item.
  animation_url: Type.Optional(Type.String()),
  // URL to YouTube video.
  youtube_url: Type.Optional(Type.String()),
  // Array of URIs pointing to secondary media related to the token.
  secondary_media: Type.Optional(Type.Array(SecondaryMediaInMetadataSchema)),
});

const ImageDataSchema = Type.Object({
  // Width of original image.
  width: Type.Number(),
  // Height of original image.
  height: Type.Number(),
  // Base64 encoded placeholder URI (if applicable).
  placeholderUri: Type.String(),
  // Hash of image contents.
  contentHash: Type.String(),

  // URL to the cached image.
  uri: Type.String(),
  // Size of image in bytes.
  size: Type.Number(),

  // Content type of the image.
  contentType: Type.String(),
  // URL to original image. (If original image was encoded in the metadata itself, this
  // field will have the value 'encoded'.)
  originalUri: Type.String(),

  // An override to retain GIF format when run through image resizing proxies.
  retainGIF: Type.Optional(Type.Boolean()),
});

const SecondaryMedia = Type.Object({
  description: Type.String(),
  category: Type.Optional(
    Type.Union([
      Type.Literal("skin"),
      Type.Literal("item"),
      Type.Literal("pfp"),
    ])
  ),
  media: ImageDataSchema,
});

const ActivityTypeSchema = Type.Union([
  Type.Literal("Sale"),
  Type.Literal("Listing"),
  Type.Literal("Bid"),
  Type.Literal("Transfer"),
  Type.Literal("Mint"),
  Type.Literal("Burn"),
]);
const ActivityStatusSchema = Type.Union([
  Type.Literal("ACTIVE"),
  Type.Literal("INACTIVE"),
  Type.Literal("EXPIRED"),
  Type.Literal("CANCELLED"),
  Type.Literal("INVALID"),
]);
const BidTypeSchema = Type.Union([
  Type.Literal("TOKEN"),
  Type.Literal("COLLECTION"),
]);
const SaleTypeSchema = Type.Union([
  Type.Literal("LISTING"),
  Type.Literal("BID"),
]);

const TokenActivityNoPriceLookupSchema = Type.Object({
  // Token identifier fields.
  chain: Type.String(),
  collectionAddr: Type.String(),
  tokenId: Type.String(),

  // Activity type/status/timing.
  activityType: ActivityTypeSchema,
  activityStatus: Type.Union([ActivityStatusSchema, Type.Null()]),
  bidType: Type.Union([BidTypeSchema, Type.Null()]),
  saleType: Type.Union([SaleTypeSchema, Type.Null()]),
  blockNumber: Type.Number(),
  blockTimestamp: Type.String(),
  expiryTimestamp: Type.Union([Type.String(), Type.Null()]), // Applicable to listings/bids.

  // Price data.
  currencyAddr: Type.Union([Type.String(), Type.Null()]),
  pricePerItem: Type.String(),
  quantity: Type.String(),

  // More info about the transaction.
  seller: Type.Union([Type.String(), Type.Null()]),
  buyer: Type.Union([Type.String(), Type.Null()]),
  txHash: Type.Union([Type.String(), Type.Null()]),
});

const PriceSummarySchema = Type.Object({
  floorPrice: Type.Union([Type.String(), Type.Null()]),
  hasActiveListing: Type.Boolean(),
  activeListingSeller: Type.Union([Type.String(), Type.Null()]),
  hasActiveBid: Type.Boolean(),
  highestBidPrice: Type.Union([Type.String(), Type.Null()]),
  lastActivityTimestamp: Type.Union([Type.String(), Type.Null()]),
  listingExpires: Type.Union([Type.String(), Type.Null()]),
  lastSoldPrice: Type.Union([Type.String(), Type.Null()]),
  numListings: Type.Number(),
  quantityListed: Type.Number(),
  unused: Type.Optional(Type.Number()),
  lowestListingObject: Type.Union([
    TokenActivityNoPriceLookupSchema,
    Type.Null(),
  ]),
  highestBidObject: Type.Union([TokenActivityNoPriceLookupSchema, Type.Null()]),
  lastSaleObject: Type.Union([TokenActivityNoPriceLookupSchema, Type.Null()]),
});

const StackStatsSchema = Type.Object({
    // Floor price of the stack.
    floorPrice: Type.Union([Type.String(), Type.Null()]),

    // Total supply of the stack.
    totalSupply: Type.Number(),
    // Supply of the stack minted on chain.
    mintedSupply: Type.Optional(Type.Number()),
    // Supply of the stack not yet minted.
    unmintedSupply: Type.Optional(Type.Number()),
    // Identifying info for the stack.
    chain: Type.String(),
    collectionAddr: Type.String(),
    partitionId: Type.Union([Type.String(), Type.Null()]),
    stackTrait: Type.String(),
    stackValue: Type.Union([Type.String(), Type.Number()]),

    // ISO timestamp of when this entry was last modified.
    cacheLastModified: Type.String(),
});

const RarityScoreComponentSchema = Type.Object({
    trait: Type.String(),
    value: Type.Union([Type.String(), Type.Number()]),
    score: Type.Optional(Type.Number()),
    count: Type.Number(),
});

const TokenRaritySchema = Type.Object({
    // Identifying info for the collection this token belongs to.
    chain: Type.String(),
    collectionAddr: Type.String(),
    // Identifier for the token within the collection.
    tokenId: Type.String(),

    // A numeric rank on rarity (starting from 1 for most rare).
    rank: Type.Number(),

    // A rarity score that is the sum of the inverse frequency of each of the token's trait values.
    // Uses the Rarity Score method described here:
    // https://raritytools.medium.com/ranking-rarity-understanding-rarity-calculation-methods-86ceaeb9b98c.
    score: Type.Optional(Type.Number()),

    // Breakdown of traits contributing to the score.
    scoreBreakdown: Type.Array(RarityScoreComponentSchema),
});

const userTokenSchema = Type.Object({
  contractType: Type.Union([Type.Literal("ERC721"), Type.Literal("ERC1155")]),
  // Chain on which the collection resides.
  chain: Type.String(),
  // Contract address for the collection this token belongs to.
  collectionAddr: Type.String(),
  // Identifier for the token within the collection.
  tokenId: Type.String(),
  // Address of token's current owner.
  currentOwner: Type.String(),
  // Address of token's true/actual owner (e.g., user-owner of a token that is currently staked in
  // a contract).
  trueOwner: Type.Optional(Type.String()),
  // UNIX timestamp seconds of when this token was minted.
  mintTimestamp: Type.Union([Type.String(), Type.Null()]),
  // Total supply of the token (relevant for ERC1155). For ERC721, this should be 1.
  tokenSupply: Type.Number(),
  // Cached JSON metadata for the token.
  metadata: tokenMetadataSchema,
  // The source of the metadata, which could be a tokenURI or a string indicating where the
  // metadata came from.
  metadataSource: Type.String(),
  // Data for rendering the image.
  image: ImageDataSchema,
  // Data for rending the animation.
  animation: Type.Union([ImageDataSchema, Type.Null()]),
  // List of secondary images/animations to include with the token.
  secondaryMedia: Type.Optional(Type.Array(SecondaryMedia)),

  // Price summary for the Token.
  priceSummary: PriceSummarySchema,
  // The floor price for the colleciton/partition/stack this Token belongs to. Populated at API
  // query time.
  referenceFloorPrice: Type.Optional(Type.Union([Type.String(), Type.Null()])),

  // Timestamp when full cached entry (image + metadata + price) was last modified. Uses ISO format.
  cacheLastModified: Type.Optional(Type.String()),
  // Timestamp when metadata + price was last modified. Uses ISO format.
  metadataLastModified: Type.Optional(Type.String()),
  // Timestamp when price was last modified. Uses ISO format.
  priceLastModified: Type.Optional(Type.String()),

  // URL slug for the collection of this token. Populated at API query time.
  collectionUrlSlug: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  // URL slug for the parent collection if this token belongs to a merged collection. Populated at API query time.
  parentUrlSlug: Type.Optional(Type.String()),
  // Whether the token is staked or locked.
  isStaked: Type.Optional(Type.Boolean()),
  // Counter on the number of attempts to burn this token. When the number of attempts meets or
  // exceeds the threshold, then the token will be burned. If the token is know to still exist,
  // the burnAttempts counter will be reset.
  burnAttempts: Type.Optional(Type.Number()),
  // An indicator on whether this token is burned.
  isBurned: Type.Optional(Type.Boolean()),
  // Whether the trait used for stacking (deduplicating) the token result.
  stackTrait: Type.Optional(Type.String()),
  // Stats about this stack of tokens (if applicable).
  stackStats: Type.Optional(Type.Union([StackStatsSchema, Type.Null()])),

  // Rarity info for the token. Populated at API query time.
  rarity: Type.Optional(Type.Union([TokenRaritySchema, Type.Null()])),

  // Query user's address and the token quantity owned byt that user. Populated at API query time.
  queryUserAddress: Type.Optional(Type.String()),
  queryUserQuantityOwned: Type.Optional(Type.Number()),

  // Minimal cartridge metadata for the game this token belongs to (if the collection is defined).
  // Populated at API query time.
  cartridge: Type.Optional(Type.Object({
    cartridgeTag: Type.String(),
    displayName: Type.Optional(Type.String()), // Populated during getAccountSettings account transform.
  })),

  // If the token has a custom maximum expiry date, the frontend will configure listing/bid options to provde this as
  // an option.
  maxExpiry:  Type.Optional(Type.Object({
    label: Type.String(),
    date: Type.String(), // ISO date.
  })),
});

export const readCurrentUserSessionsReplySchema = Type.Array(sessionSchema);

export const readCurrentUserTokensReplySchema = Type.Array(userTokenSchema);

export type ReadCurrentUserReply = Static<typeof readCurrentUserReplySchema>;
export type ReadCurrentUserSessionsQuerystring = Static<
  typeof readCurrentUserSessionsQuerystringSchema
>;
export type ReadCurrentUserTokensQuerystring = Static<
  typeof readCurrentUserTokensQuerystringSchema
>;
export type ReadCurrentUserSessionsReply = Static<
  typeof readCurrentUserSessionsReplySchema
>;
export type ReadCurrentUserTokensReply = Static<
  typeof readCurrentUserTokensReplySchema
>;
export type UpdateCurrentUserBody = Static<typeof updateCurrentUserBodySchema>;
export type UpdateCurrentUserReply = Static<
  typeof updateCurrentUserReplySchema
>;
