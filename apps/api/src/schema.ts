import { type Static, Type } from "@sinclair/typebox";
import { SUPPORTED_CHAINS } from "@treasure-dev/tdk-core";

// Shared
export const ethereumAddressSchema = Type.RegExp("/^0x[a-fA-F0-9]{40}$/g");
export const nullableStringSchema = Type.Union([Type.String(), Type.Null()]);

export const chainIdSchema = Type.Union(
  SUPPORTED_CHAINS.map(({ id }) => Type.Literal(id)),
);

export const errorReplySchema = Type.Object({
  error: Type.String(),
});

export const baseReplySchema: object = {
  400: {
    description: "Bad Request",
    ...errorReplySchema,
  },
  401: {
    description: "Unauthorized",
    ...errorReplySchema,
  },
  403: {
    description: "Forbidden",
    ...errorReplySchema,
  },
  404: {
    description: "Not Found",
    ...errorReplySchema,
  },
  500: {
    description: "Internal Server Error",
    ...errorReplySchema,
  },
};

export type ErrorReply = Static<typeof errorReplySchema>;

// Auth
export const authenticateBodySchema = Type.Object({
  email: Type.String(),
  password: Type.String(),
});

export const authenticateReplySchema = Type.Object({
  projectId: Type.String(),
  token: Type.String(),
});

export const authVerifyBodySchema = Type.Object({
  payload: Type.String(),
});

export const authVerifyReplySchema = Type.Object({
  userId: Type.String(),
  email: Type.String(),
  exp: Type.Optional(Type.Number()),
});

export type AuthenciateBody = Static<typeof authenticateBodySchema>;
export type AuthenticateReply = Static<typeof authenticateReplySchema>;
export type AuthVerifyBody = Static<typeof authVerifyBodySchema>;
export type AuthVerifyReply = Static<typeof authVerifyReplySchema>;

// Harvesters
const tokenSchema = Type.Object({
  address: Type.String(),
  tokenId: Type.Number(),
  name: Type.String(),
  image: Type.String(),
  attributes: Type.Array(
    Type.Object({
      type: Type.String(),
      value: Type.Union([Type.String(), Type.Number()]),
    }),
  ),
});

const inventoryTokenSchema = Type.Intersect([
  tokenSchema,
  Type.Object({
    user: Type.String(),
    balance: Type.Number(),
  }),
]);

const corruptionRemovalRecipe = Type.Object({
  id: Type.String(),
  corruptionRemoved: Type.String(),
  items: Type.Array(
    Type.Object({
      address: Type.String(),
      tokenIds: Type.Array(Type.Number()),
      amount: Type.Number(),
      customHandler: Type.Optional(Type.String()),
    }),
  ),
});

const corruptionRemovalSchema = Type.Object({
  requestId: Type.String(),
  status: Type.Enum({
    Started: "Started",
    Ready: "Ready",
  }),
  corruptionRemoved: Type.String(),
});

const harvesterInfoSchema = Type.Object({
  id: Type.String(),
  // NFT Handler
  nftHandlerAddress: Type.String(),
  // Staking Rules
  permitsStakingRulesAddress: Type.String(),
  boostersStakingRulesAddress: Type.String(),
  legionsStakingRulesAddress: Type.Optional(Type.String()),
  treasuresStakingRulesAddress: Type.Optional(Type.String()),
  charactersStakingRulesAddress: Type.Optional(Type.String()),
  // NFTs settings
  charactersAddress: Type.Optional(Type.String()),
  // Permits settings
  permitsAddress: Type.String(),
  permitsTokenId: Type.Number(),
  permitsMaxStakeable: Type.Number(),
  permitsMagicMaxStakeable: Type.String(),
  // Boosters settings
  boostersMaxStakeable: Type.Number(),
  // MAGIC settings
  magicMaxStakeable: Type.String(),
  // Corruption settings
  corruptionMaxGenerated: Type.String(),
  // Overall state
  totalEmissionsActivated: Type.Number(),
  totalMagicStaked: Type.String(),
  totalBoost: Type.Number(),
  totalBoostersBoost: Type.Number(),
  totalCorruption: Type.String(),
  // Boosters state
  boosters: Type.Array(
    Type.Object({
      tokenId: Type.Number(),
      user: Type.String(),
      endTimestamp: Type.Number(),
    }),
  ),
});

const harvesterUserInfoSchema = Type.Object({
  userMagicBalance: Type.String(),
  userMagicAllowance: Type.String(),
  userPermitsBalance: Type.Number(),
  userPermitsApproved: Type.Boolean(),
  userBoostersBalances: Type.Record(Type.Number(), Type.Number()),
  userBoostersApproved: Type.Boolean(),
  userTotalBoost: Type.Number(),
  userPermitsMaxStakeable: Type.Number(),
  userPermitsStaked: Type.Number(),
  userInventoryCharacters: Type.Array(inventoryTokenSchema),
  userStakedCharacters: Type.Array(tokenSchema),
  userCharactersApproved: Type.Boolean(),
  userCharactersMaxStakeable: Type.Number(),
  userCharactersStaked: Type.Number(),
  userCharactersMaxBoost: Type.Number(),
  userCharactersBoost: Type.Number(),
  userMagicMaxStakeable: Type.String(),
  userMagicStaked: Type.String(),
  userMagicRewardsClaimable: Type.String(),
});

export const readHarvesterParamsSchema = Type.Object({
  id: Type.String(),
});

export const readHarvesterReplySchema = Type.Composite([
  harvesterInfoSchema,
  Type.Partial(harvesterUserInfoSchema),
]);

export const readHarvesterCorruptionRemovalParamsSchema = Type.Object({
  id: Type.String(),
});

export const readHarvesterCorruptionRemovalReplySchema = Type.Object({
  corruptionRemovalRecipes: Type.Array(corruptionRemovalRecipe),
  userInventoryCorruptionRemovalRecipeItems: Type.Array(inventoryTokenSchema),
  userCorruptionRemovals: Type.Array(corruptionRemovalSchema),
});

export type Token = Static<typeof tokenSchema>;
export type InventoryToken = Static<typeof inventoryTokenSchema>;
export type CorruptionRemovalRecipe = Static<typeof corruptionRemovalRecipe>;
export type CorruptionRemoval = Static<typeof corruptionRemovalSchema>;
export type HarvesterInfo = Static<typeof harvesterInfoSchema>;
export type HarvesterUserInfo = Static<typeof harvesterUserInfoSchema>;
export type ReadHarvesterParams = Static<typeof readHarvesterParamsSchema>;
export type ReadHarvesterReply = Static<typeof readHarvesterReplySchema>;
export type ReadHarvesterCorruptionRemovalParams = Static<
  typeof readHarvesterCorruptionRemovalParamsSchema
>;
export type ReadHarvesterCorruptionRemovalReply = Static<
  typeof readHarvesterCorruptionRemovalReplySchema
>;

// Projects
export const readProjectParamsSchema = Type.Object({
  slug: Type.String(),
});

export const readProjectReplySchema = Type.Object({
  slug: Type.String(),
  name: Type.String(),
  backendWallets: Type.Array(Type.String()),
  callTargets: Type.Array(Type.String()),
  redirectUris: Type.Array(Type.String()),
  customAuth: Type.Boolean(),
  icon: nullableStringSchema,
  cover: nullableStringSchema,
  color: nullableStringSchema,
});

export type ReadProjectParams = Static<typeof readProjectParamsSchema>;
export type ReadProjectReply = Static<typeof readProjectReplySchema>;

// Contracts
export const readContractBodySchema = Type.Object({
  address: Type.String(),
  functionName: Type.String(),
  args: Type.Optional(Type.Any()),
});

export const readContractReplySchema = Type.Object({
  result: Type.Any(),
});

export type ReadContractBody = Static<typeof readContractBodySchema>;
export type ReadContractReply = Static<typeof readContractReplySchema>;

// Transactions
export const createTransactionBodySchema = Type.Object({
  address: Type.String(),
  functionName: Type.String(),
  args: Type.Any(),
});

export const createTransactionReplySchema = Type.Object({
  queueId: Type.String(),
});

export const readTransactionParamsSchema = Type.Object({
  queueId: Type.String(),
});

export const readTransactionReplySchema = Type.Object({
  status: nullableStringSchema,
  transactionHash: nullableStringSchema,
  errorMessage: nullableStringSchema,
});

export type CreateTransactionBody = Static<typeof createTransactionBodySchema>;
export type CreateTransactionReply = Static<
  typeof createTransactionReplySchema
>;
export type ReadTransactionParams = Static<typeof readTransactionParamsSchema>;
export type ReadTransactionReply = Static<typeof readTransactionReplySchema>;

// Users
export const readCurrentUserReplySchema = Type.Object({
  id: Type.String(),
  smartAccountAddress: Type.String(),
  email: nullableStringSchema,
});

export type ReadCurrentUserReply = Static<typeof readCurrentUserReplySchema>;
