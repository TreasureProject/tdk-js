import { type Static, Type } from "@sinclair/typebox";
import {
  nullableStringSchema,
  sessionSchema,
  userProfileSchema,
  userPublicProfileSchema,
  userSchema,
} from "./shared";

export const readCurrentUserReplySchema = Type.Intersect([
  userSchema,
  userProfileSchema,
  Type.Object({
    sessions: Type.Array(sessionSchema),
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

export const readCurrentUserSessionsQuerystringSchema = Type.Object({
  chainId: Type.Number(),
});

export const readCurrentUserSessionsReplySchema = Type.Array(sessionSchema);

const readUserPublicProfileParamsSchema = Type.Object({
  id: Type.String(),
});

export const readUserPublicProfileReplySchema = userPublicProfileSchema;

const readUserTransactionsParamsSchema = Type.Object({
  id: Type.String(),
});

export const readUserTransactionsQuerystringSchema = Type.Object({
  chainId: Type.Optional(Type.Number()),
  fromAddress: Type.Optional(Type.String()),
  toAddress: Type.Optional(Type.String()),
  page: Type.Optional(Type.Number({ minimum: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 50 })),
});

export const readUserTransactionsReplySchema = Type.Object({
  results: Type.Array(
    Type.Object({
      chainId: Type.Number(),
      blockNumber: Type.String(),
      blockTimestamp: Type.String(),
      transactionHash: Type.String(),
      fromAddress: Type.String(),
      toAddress: Type.String(),
      value: Type.String(),
    }),
  ),
  total: Type.Number(),
});

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
export type ReadUserPublicProfileParams = Static<
  typeof readUserPublicProfileParamsSchema
>;
export type ReadUserPublicProfileReply = Static<
  typeof readUserPublicProfileReplySchema
>;
export type ReadUserTransactionsParams = Static<
  typeof readUserTransactionsParamsSchema
>;
export type ReadUserTransactionsQuerystring = Static<
  typeof readUserTransactionsQuerystringSchema
>;
export type ReadUserTransactionsReply = Static<
  typeof readUserTransactionsReplySchema
>;
