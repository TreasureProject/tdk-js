import { type Static, Type } from "@sinclair/typebox";
import { nullableStringSchema } from "./shared";

const EXAMPLE_CHAIN_ID = 978658;
const EXAMPLE_USER_ID = "clxtvrt7p00012e6m8yurr83z";
const EXAMPLE_EMAIL = "example@treasure.lol";
const EXAMPLE_CONTRACT_ADDRESS = "0x539bde0d7dbd336b79148aa742883198bbf60342";
const EXAMPLE_WALLET_ADDRESS = "0x0eB5B03c0303f2F47cD81d7BE4275AF8Ed347576";
const EXAMPLE_TIMESTAMP_1 = "1716638400";
const EXAMPLE_TIMESTAMP_2 = "1719316800";

export const sessionSchema = Type.Object({
  isAdmin: Type.Boolean(),
  signer: Type.String({
    description: "Address granted this permission",
    examples: [EXAMPLE_WALLET_ADDRESS],
  }),
  approvedTargets: Type.Array(
    Type.String({
      examples: [EXAMPLE_CONTRACT_ADDRESS],
    }),
  ),
  nativeTokenLimitPerTransaction: Type.String({
    description:
      "Maximum amount of native token that can be transferred in a single transaction, specified in wei",
    examples: ["1000000000000000000"],
  }),
  startTimestamp: Type.String({
    description: "Session start time, in seconds",
    examples: [EXAMPLE_TIMESTAMP_1],
  }),
  endTimestamp: Type.String({
    description: "Session end time, in seconds",
    examples: [EXAMPLE_TIMESTAMP_2],
  }),
});

export const userSchema = Type.Object({
  id: Type.String({
    description: "User unique identifier",
    examples: [EXAMPLE_USER_ID],
  }),
  email: Type.Union([
    Type.String({
      description: "User email address",
      examples: [EXAMPLE_EMAIL],
    }),
    Type.Null(),
  ]),
  address: Type.String({
    description: "Treasure Account address for the requested chain",
    examples: [EXAMPLE_WALLET_ADDRESS],
  }),
  externalWalletAddress: Type.Union([
    Type.String({
      description: "User wallet address",
      examples: [EXAMPLE_WALLET_ADDRESS],
    }),
    Type.Null(),
  ]),
  smartAccounts: Type.Array(
    Type.Object({
      chainId: Type.Number({
        description: "Chain ID",
        examples: [EXAMPLE_CHAIN_ID],
      }),
      address: Type.String({
        description: "Treasure Account address for the given chain",
        examples: [EXAMPLE_WALLET_ADDRESS],
      }),
    }),
  ),
});

export const userPublicProfileSchema = Type.Object({
  tag: nullableStringSchema,
  discriminant: Type.Union([Type.Number(), Type.Null()]),
  featuredNftIds: Type.Array(Type.String()),
  featuredBadgeIds: Type.Array(Type.String()),
  highlyFeaturedBadgeId: nullableStringSchema,
  about: nullableStringSchema,
  pfp: nullableStringSchema,
  banner: nullableStringSchema,
  socialAccounts: Type.Array(
    Type.Object({
      network: Type.Union([
        Type.Literal("DISCORD"),
        Type.Literal("STEAM"),
        Type.Literal("TWITCH"),
        Type.Literal("TWITTER"),
      ]),
      accountId: Type.String(),
      accountName: Type.String(),
      accountHandle: nullableStringSchema,
      isPublic: Type.Boolean(),
    }),
  ),
});

export const userProfileSchema = Type.Intersect([
  userPublicProfileSchema,
  Type.Object({
    emailSecurityPhrase: nullableStringSchema,
    emailSecurityPhraseUpdatedAt: nullableStringSchema,
    showMagicBalance: Type.Boolean(),
    showEthBalance: Type.Boolean(),
    showGemsBalance: Type.Boolean(),
    testnetFaucetLastUsedAt: nullableStringSchema,
  }),
]);

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

export const updateCurrentUserReplySchema = userProfileSchema;

const updateCurrentUserMigrationBodySchema = Type.Object({
  id: Type.String(),
});

export const updateCurrentUserMigrationReplySchema = userProfileSchema;

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
export type UpdateCurrentUserMigrationBody = Static<
  typeof updateCurrentUserMigrationBodySchema
>;
export type UpdateCurrentUserMigrationReply = Static<
  typeof updateCurrentUserMigrationReplySchema
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
