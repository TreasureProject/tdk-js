import { type Static, Type } from "@sinclair/typebox";

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

export const readCurrentUserReplySchema = Type.Object({
  address: Type.String({
    description: "Treasure Account address for the requested chain",
    examples: [EXAMPLE_WALLET_ADDRESS],
  }),
  sessions: Type.Array(sessionSchema),
});

export type ReadCurrentUserReply = Static<typeof readCurrentUserReplySchema>;
