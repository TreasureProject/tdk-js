import { type Static, Type } from "@sinclair/typebox";

const EXAMPLE_USER_ID = "clxtvrt7p00012e6m8yurr83z";
const EXAMPLE_EMAIL = "example@treasure.lol";
const EXAMPLE_PHONE_NUMBER = "+13235550000";
export const EXAMPLE_CONTRACT_ADDRESS =
  "0x539bde0d7dbd336b79148aa742883198bbf60342";
export const EXAMPLE_WALLET_ADDRESS =
  "0x0eB5B03c0303f2F47cD81d7BE4275AF8Ed347576";
export const EXAMPLE_QUEUE_ID = "5b6c941c-35ba-4c54-92db-41b39cd06b2d";
const EXAMPLE_TIMESTAMP_1 = "1716638400";
const EXAMPLE_TIMESTAMP_2 = "1719316800";

export const nullableStringSchema = Type.Union([Type.String(), Type.Null()]);

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
  address: Type.String({
    description: "Treasure Account address",
    examples: [EXAMPLE_WALLET_ADDRESS],
  }),
  // Keep previous field name for backwards compatibility
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
  phoneNumber: Type.Union([
    Type.String({
      description: "User phone number",
      examples: [EXAMPLE_PHONE_NUMBER],
    }),
    Type.Null(),
  ]),
});

export const userWithSessionsSchema = Type.Intersect([
  userSchema,
  Type.Object({
    allActiveSigners: Type.Array(sessionSchema),
  }),
]);

export type ErrorReply = Static<typeof errorReplySchema>;
