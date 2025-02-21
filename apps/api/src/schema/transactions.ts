import { type Static, Type } from "@sinclair/typebox";
import {
  EXAMPLE_CONTRACT_ADDRESS,
  EXAMPLE_QUEUE_ID,
  EXAMPLE_WALLET_ADDRESS,
  nullableStringSchema,
} from "./shared";

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

const txOverridesSchema = Type.Object({
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
});

const txArgsSchema = Type.Array(
  Type.Union([
    Type.String({
      description: "Arguments to call on the function",
      examples: [[EXAMPLE_WALLET_ADDRESS, "1000000000000000000"]],
    }),
    Type.Tuple([Type.String(), Type.String()]),
    Type.Object({}),
    Type.Array(Type.Any()),
    Type.Any(),
  ]),
);

export const createTransactionBodySchema = Type.Object({
  address: Type.String({
    description: "Address of the contract to call",
    examples: [EXAMPLE_CONTRACT_ADDRESS],
  }),
  abi: Type.Optional(
    Type.Union([Type.Array(abiSchema), Type.String(), Type.Null()]),
  ),
  functionName: Type.String({
    description: "Function to call on the contract",
    examples: ["transfer"],
  }),
  args: txArgsSchema,
  txOverrides: Type.Optional(txOverridesSchema),
  backendWallet: Type.String(),
  simulateTransaction: Type.Optional(Type.Boolean()),
});

export const createTransactionReplySchema = Type.Object({
  queueId: Type.String({
    description: "Transaction queue ID",
    examples: [EXAMPLE_QUEUE_ID],
  }),
});

export const createRawTransactionBodySchema = Type.Object({
  to: Type.String({
    description: "Target address",
    examples: [EXAMPLE_WALLET_ADDRESS],
  }),
  value: Type.Optional(
    Type.String({
      description: "Amount of native token to send, in wei",
      examples: ["1000000000000000000"],
    }),
  ),
  data: Type.String({
    description: "Raw transaction data",
  }),
  txOverrides: Type.Optional(Type.Omit(txOverridesSchema, ["value"])),
  backendWallet: Type.String(),
  simulateTransaction: Type.Optional(Type.Boolean()),
});

export const createRawTransactionReplySchema = Type.Object({
  queueId: Type.String({
    description: "Transaction queue ID",
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

export type TransactionArguments = Static<typeof txArgsSchema>;
export type TransactionOverrides = Static<typeof txOverridesSchema>;
export type CreateTransactionBody = Static<typeof createTransactionBodySchema>;
export type CreateTransactionReply = Static<
  typeof createTransactionReplySchema
>;
export type CreateRawTransactionBody = Static<
  typeof createRawTransactionBodySchema
>;
export type CreateRawTransactionReply = Static<
  typeof createRawTransactionReplySchema
>;
export type ReadTransactionParams = Static<typeof readTransactionParamsSchema>;
export type ReadTransactionReply = Static<typeof readTransactionReplySchema>;
