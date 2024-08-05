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

export const readCurrentUserSessionsReplySchema = Type.Array(sessionSchema);

export type ReadCurrentUserReply = Static<typeof readCurrentUserReplySchema>;
export type ReadCurrentUserSessionsQuerystring = Static<
  typeof readCurrentUserSessionsQuerystringSchema
>;
export type ReadCurrentUserSessionsReply = Static<
  typeof readCurrentUserSessionsReplySchema
>;
export type UpdateCurrentUserBody = Static<typeof updateCurrentUserBodySchema>;
export type UpdateCurrentUserReply = Static<
  typeof updateCurrentUserReplySchema
>;
