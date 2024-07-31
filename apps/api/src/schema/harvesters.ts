import { type Static, Type } from "@sinclair/typebox";

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
