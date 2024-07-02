import { type Static, Type } from "@sinclair/typebox";

// Shared
const nullableStringSchema = Type.Union([Type.String(), Type.Null()]);

const errorReplySchema = Type.Object({
  error: Type.String(),
});

export const baseReplySchema: object = {
  400: {
    description: "Bad Request",
    ...Type.Object({
      error: Type.String({
        description: "Invalid parameters specified with request",
        examples: ["Bad request"],
      }),
    }),
  },
  401: {
    description: "Unauthorized",
    ...Type.Object({
      error: Type.String({
        description: "Invalid authorization token specified with request",
        examples: ["Unauthorized"],
      }),
    }),
  },
  403: {
    description: "Forbidden",
    ...Type.Object({
      error: Type.String({
        description: "Authorization token invalid for the specified resource",
        examples: ["Forbidden"],
      }),
    }),
  },
  404: {
    description: "Not Found",
    ...Type.Object({
      error: Type.String({
        description: "Specified resource was not found",
        examples: ["Not Found"],
      }),
    }),
  },
  500: {
    description: "Internal Server Error",
    ...Type.Object({
      error: Type.String({
        description: "An unexpected error has occurred",
        examples: ["Internal Server Error"],
      }),
    }),
  },
};

export type ErrorReply = Static<typeof errorReplySchema>;

const EXAMPLE_USER_ID = "clxtvrt7p00012e6m8yurr83z";
const EXAMPLE_EMAIL = "example@treasure.lol";
const EXAMPLE_CONTRACT_ADDRESS = "0x539bde0d7dbd336b79148aa742883198bbf60342";
const EXAMPLE_WALLET_ADDRESS = "0x0eB5B03c0303f2F47cD81d7BE4275AF8Ed347576";
const EXAMPLE_QUEUE_ID = "5b6c941c-35ba-4c54-92db-41b39cd06b2d";
const EXAMPLE_TIMESTAMP_1 = "1716638400";
const EXAMPLE_TIMESTAMP_2 = "1719316800";

// Harvesters
const tokenSchema = Type.Object({
  address: Type.String({
    description: "Token contract address",
  }),
  tokenId: Type.Number({
    description: "Token ID",
  }),
  name: Type.String({
    description: "Token name",
  }),
  image: Type.String({
    description: "Token image URL",
  }),
  imageAlt: Type.Optional(
    Type.String({
      description: "Alternative token image URL",
    }),
  ),
  attributes: Type.Array(
    Type.Object({
      type: Type.String({
        description: "Attribute name",
      }),
      value: Type.Union([Type.String(), Type.Number()]),
    }),
  ),
});

const inventoryTokenSchema = Type.Intersect([
  tokenSchema,
  Type.Object({
    user: Type.String({
      description: "Token owner address",
    }),
    balance: Type.Number({
      description: "Token balance for owner",
    }),
  }),
]);

const corruptionRemovalRecipeSchema = Type.Object({
  id: Type.String(),
  corruptionRemoved: Type.String({
    description: "Amount of Corruption removed by recipe",
  }),
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
  recipeId: Type.String(),
  status: Type.Enum({
    Started: "Started",
    Ready: "Ready",
  }),
});

const harvesterInfoSchema = Type.Object({
  id: Type.String(),
  // NFT Handler
  nftHandlerAddress: Type.String({
    description: "Contract address of the Harvester's NFT handler",
  }),
  // Staking Rules
  permitsStakingRulesAddress: Type.String({
    description:
      "Contract address of the Harvester's Ancient Permits staking rules",
  }),
  boostersStakingRulesAddress: Type.String({
    description: "Contract address of the Harvester's Boosters staking rules",
  }),
  legionsStakingRulesAddress: Type.Optional(
    Type.String({
      description:
        "Contract address of the Harvester's Legions staking rules, if applicable",
    }),
  ),
  treasuresStakingRulesAddress: Type.Optional(
    Type.String({
      description:
        "Contract address of the Harvester's Treasures staking rules, if applicable",
    }),
  ),
  charactersStakingRulesAddress: Type.Optional(
    Type.String({
      description:
        "Contract address of the Harvester's characters staking rules, if applicable",
    }),
  ),
  // NFTs settings
  charactersAddress: Type.Optional(
    Type.String({
      description:
        "Contract address of the Harvester's characters NFT, if applicable",
    }),
  ),
  // Permits settings
  permitsAddress: Type.String({
    description: "Contract address of the Harvester's Ancient Permits",
  }),
  permitsTokenId: Type.Number({
    description: "Token ID of the Harvester's Ancient Permits",
  }),
  permitsMaxStakeable: Type.Number({
    description: "Maximum amount of Ancient Permits that can be staked",
  }),
  permitsMagicMaxStakeable: Type.String({
    description:
      "Maximum amount of MAGIC that can be staked per Ancient Permit",
  }),
  // Boosters settings
  boostersMaxStakeable: Type.Number({
    description: "Maximum amount of Boosters that can be staked at once",
  }),
  // MAGIC settings
  magicMaxStakeable: Type.String({
    description: "Maximum amount of MAGIC that can be staked",
  }),
  // Corruption settings
  corruptionMaxGenerated: Type.String({
    description: "Maximum Corruption level",
  }),
  // Overall state
  totalEmissionsActivated: Type.Number({
    description: "Percentage of emissions currently activated",
  }),
  totalMagicStaked: Type.String({
    description: "Total amount of MAGIC staked",
  }),
  totalBoost: Type.Number({
    description: "Total boost / mining power",
  }),
  totalBoostersBoost: Type.Number({
    description: "Total boost from Boosters",
  }),
  totalCorruption: Type.String({
    description: "Current Corruption level",
  }),
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
  userMagicBalance: Type.String({
    description: "User's MAGIC balance",
  }),
  userMagicAllowance: Type.String({
    description: "Allowance of user's MAGIC approval for the Harvester",
  }),
  userPermitsBalance: Type.Number({
    description: "Current user's Ancient Permits balance",
  }),
  userPermitsApproved: Type.Boolean({
    description:
      "True if user has approved the Harvester to transfer Ancient Permits",
  }),
  userBoostersBalances: Type.Record(
    Type.Number({
      description: "Booster token ID",
    }),
    Type.Number({
      description: "User's booster balance",
    }),
  ),
  userBoostersApproved: Type.Boolean({
    description: "True if user has approved the Harvester to transfer Boosters",
  }),
  userInventoryBoosters: Type.Array(inventoryTokenSchema),
  userTotalBoost: Type.Number({
    description: "User's total boost / mining power",
  }),
  userPermitsMaxStakeable: Type.Number({
    description:
      "Maximum amount of Ancient Permits that can be staked by a single user",
  }),
  userPermitsStaked: Type.Number({
    description: "Amount of Ancient Permits staked by the user",
  }),
  userInventoryCharacters: Type.Array(inventoryTokenSchema),
  userStakedCharacters: Type.Array(tokenSchema),
  userCharactersApproved: Type.Boolean({
    description:
      "True if user has approved the Harvester to transfer the characters NFT",
  }),
  userCharactersMaxStakeable: Type.Number({
    description:
      "Maximum amount of characters that can be staked by a single user",
  }),
  userCharactersStaked: Type.Number({
    description: "Amount of characters staked by the user",
  }),
  userCharactersMaxBoost: Type.Number({
    description:
      "Maximum boost that can be achieved by staking characters for a single user",
  }),
  userCharactersBoost: Type.Number({
    description: "User's total boost from characters",
  }),
  userInventoryLegions: Type.Array(inventoryTokenSchema),
  userStakedLegions: Type.Array(tokenSchema),
  userLegionsApproved: Type.Boolean({
    description: "True if user has approved the Harvester to transfer Legions",
  }),
  userLegionsMaxWeightStakeable: Type.Number({
    description:
      "Maximum weight of Legions that can be staked by a single user",
  }),
  userLegionsWeightStaked: Type.Number({
    description: "Weight of Legions staked by the user",
  }),
  userLegionsBoost: Type.Number({
    description: "User's total boost from Legions",
  }),
  userMagicMaxStakeable: Type.String({
    description: "Maximum amount of MAGIC that can be staked by the user",
  }),
  userMagicStaked: Type.String({
    description: "Amount of MAGIC staked by the user",
  }),
  userMagicRewardsClaimable: Type.String({
    description: "Amount of MAGIC rewards claimable by the user",
  }),
});

const readHarvesterParamsSchema = Type.Object({
  id: Type.String(),
});

export const readHarvesterReplySchema = Type.Composite([
  harvesterInfoSchema,
  Type.Partial(harvesterUserInfoSchema),
]);

const readHarvesterCorruptionRemovalParamsSchema = Type.Object({
  id: Type.String(),
});

export const readHarvesterCorruptionRemovalReplySchema = Type.Object({
  corruptionRemovalRecipes: Type.Array(corruptionRemovalRecipeSchema),
  userInventoryCorruptionRemovalRecipeItems: Type.Array(inventoryTokenSchema),
  userApprovalsCorruptionRemovalRecipeItems: Type.Record(
    Type.String(),
    Type.Object({
      operator: Type.String(),
      approved: Type.Boolean(),
    }),
  ),
  userCorruptionRemovals: Type.Array(corruptionRemovalSchema),
});

export type Token = Static<typeof tokenSchema>;
export type InventoryToken = Static<typeof inventoryTokenSchema>;
export type CorruptionRemovalRecipe = Static<
  typeof corruptionRemovalRecipeSchema
>;
export type CorruptionRemoval = Static<typeof corruptionRemovalSchema>;
export type HarvesterInfo = Static<typeof harvesterInfoSchema>;
export type HarvesterUserInfo = Static<typeof harvesterUserInfoSchema>;
export type HarvesterCorruptionRemovalInfo = Static<
  typeof readHarvesterCorruptionRemovalReplySchema
>;
export type ReadHarvesterParams = Static<typeof readHarvesterParamsSchema>;
export type ReadHarvesterReply = Static<typeof readHarvesterReplySchema>;
export type ReadHarvesterCorruptionRemovalParams = Static<
  typeof readHarvesterCorruptionRemovalParamsSchema
>;
export type ReadHarvesterCorruptionRemovalReply = Static<
  typeof readHarvesterCorruptionRemovalReplySchema
>;

// Projects
const readProjectParamsSchema = Type.Object({
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

// Transactions
const abiTypeSchema = Type.Object({
  type: Type.Optional(Type.String()),
  name: Type.Optional(Type.String()),
  stateMutability: Type.Optional(Type.String()),
  components: Type.Optional(
    Type.Array(
      Type.Object({
        type: Type.Optional(Type.String()),
        name: Type.Optional(Type.String()),
        internalType: Type.Optional(Type.String()),
      }),
    ),
  ),
});

const abiSchema = Type.Object({
  type: Type.String(),
  name: Type.Optional(Type.String()),
  inputs: Type.Array(abiTypeSchema),
  stateMutability: Type.Optional(Type.String()),
});

export const createTransactionBodySchema = Type.Object({
  address: Type.String({
    description: "The address of the contract to call",
    examples: [EXAMPLE_CONTRACT_ADDRESS],
  }),
  abi: Type.Optional(
    Type.Union([Type.Array(abiSchema), Type.String(), Type.Null()]),
  ),
  functionName: Type.String({
    description: "The function to call on the contract",
    examples: ["transfer"],
  }),
  args: Type.Array(
    Type.Union([
      Type.String({
        description: "The arguments to call on the function",
        examples: [[EXAMPLE_WALLET_ADDRESS, "1000000000000000000"]],
      }),
      Type.Tuple([Type.String(), Type.String()]),
      Type.Object({}),
      Type.Array(Type.Any()),
      Type.Any(),
    ]),
  ),
  txOverrides: Type.Optional(
    Type.Object({
      value: Type.Optional(
        Type.String({
          examples: ["10000000000"],
          description: "Amount of native currency to send",
        }),
      ),
      gas: Type.Optional(
        Type.String({
          examples: ["530000"],
          description: "Gas limit for the transaction",
        }),
      ),
      maxFeePerGas: Type.Optional(
        Type.String({
          examples: ["1000000000"],
          description: "Maximum fee per gas",
        }),
      ),
      maxPriorityFeePerGas: Type.Optional(
        Type.String({
          examples: ["1000000000"],
          description: "Maximum priority fee per gas",
        }),
      ),
    }),
  ),
  backendWallet: Type.Optional(Type.String()),
});

export const createTransactionReplySchema = Type.Object({
  queueId: Type.String({
    description: "The transaction queue ID",
    examples: [EXAMPLE_QUEUE_ID],
  }),
});

export const createSendNativeTransactionBodySchema = Type.Object({
  to: Type.String({
    description: "The recipient address",
    examples: [EXAMPLE_WALLET_ADDRESS],
  }),
  amount: Type.String({
    description: "The amount to send, in wei",
    examples: ["1000000000000000000"],
  }),
  backendWallet: Type.Optional(Type.String()),
});

export const createSendNativeTransactionReplySchema = Type.Object({
  queueId: Type.String({
    description: "The transaction queue ID",
    examples: [EXAMPLE_QUEUE_ID],
  }),
});

const readTransactionParamsSchema = Type.Object({
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
export type CreateSendNativeTransactionBody = Static<
  typeof createSendNativeTransactionBodySchema
>;
export type CreateSendNativeTransactionReply = Static<
  typeof createSendNativeTransactionReplySchema
>;
export type ReadTransactionParams = Static<typeof readTransactionParamsSchema>;
export type ReadTransactionReply = Static<typeof readTransactionReplySchema>;

// Users
const sessionSchema = Type.Object({
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

const userSchema = Type.Object({
  id: Type.String({
    description: "User unique identifier",
    examples: [EXAMPLE_USER_ID],
  }),
  smartAccountAddress: Type.String({
    description: "Treasure Account address",
    examples: [EXAMPLE_WALLET_ADDRESS],
  }),
  email: Type.Union([
    Type.String({
      description: "User email address",
      examples: [EXAMPLE_EMAIL],
    }),
    Type.Null(),
  ]),
  allActiveSigners: Type.Array(sessionSchema),
});

export const readCurrentUserReplySchema = userSchema;

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

// Auth
const loginPayloadSchema = Type.Object({
  domain: Type.String(),
  address: Type.String(),
  statement: Type.String(),
  uri: Type.Optional(Type.String()),
  version: Type.String(),
  chain_id: Type.Optional(Type.String()),
  nonce: Type.String(),
  issued_at: Type.String(),
  expiration_time: Type.String(),
  invalid_before: Type.String(),
  resources: Type.Optional(Type.Array(Type.String())),
});

export const readLoginPayloadQuerystringSchema = Type.Object({
  address: Type.String({
    description: "Smart wallet address used to generate payload",
    examples: [EXAMPLE_WALLET_ADDRESS],
  }),
});

export const readLoginPayloadReplySchema = loginPayloadSchema;

export const loginBodySchema = Type.Object({
  payload: loginPayloadSchema,
  signature: Type.String(),
});

export const loginReplySchema = Type.Object({
  token: Type.String({
    description: "Authorization token for the logged in user",
  }),
  user: userSchema,
});

export type ReadLoginPayloadQuerystring = Static<
  typeof readLoginPayloadQuerystringSchema
>;
export type ReadLoginPayloadReply = Static<typeof readLoginPayloadReplySchema>;
export type LoginBody = Static<typeof loginBodySchema>;
export type LoginReply = Static<typeof loginReplySchema>;
