import { type Static, Type } from "@sinclair/typebox";
import {
  inventoryTokenSchema,
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

const readCurrentUserInventoryQuerystringSchema = Type.Object({
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

export const readCurrentUserSessionsReplySchema = Type.Array(sessionSchema);

export const readCurrentUserInventoryReplySchema = Type.Array(Type.Any());

export type ReadCurrentUserReply = Static<typeof readCurrentUserReplySchema>;
export type ReadCurrentUserSessionsQuerystring = Static<
  typeof readCurrentUserSessionsQuerystringSchema
>;
export type ReadCurrentUserInventoryQuerystring = Static<
  typeof readCurrentUserInventoryQuerystringSchema
>;
export type ReadCurrentUserSessionsReply = Static<
  typeof readCurrentUserSessionsReplySchema
>;
export type ReadCurrentUserInventoryReply = Static<
  typeof readCurrentUserInventoryReplySchema
>;
export type UpdateCurrentUserBody = Static<typeof updateCurrentUserBodySchema>;
export type UpdateCurrentUserReply = Static<
  typeof updateCurrentUserReplySchema
>;
