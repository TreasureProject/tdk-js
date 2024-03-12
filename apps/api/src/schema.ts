import { type Static, Type } from "@sinclair/typebox";

import { SUPPORTED_CHAINS } from "./utils/wagmi";

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
export const readHarvesterParamsSchema = Type.Object({
  id: Type.String(),
});

export const readHarvesterReplySchema = Type.Object({
  id: Type.String(),
  nftHandlerAddress: Type.String(),
  permitsAddress: Type.String(),
  permitsTokenId: Type.String(),
  permitsDepositCap: Type.String(),
  userMagicBalance: Type.String(),
  userPermitsBalance: Type.Number(),
  userMagicAllowance: Type.String(),
  userApprovedPermits: Type.Boolean(),
  userDepositCap: Type.String(),
  userDepositAmount: Type.String(),
});

export type ReadHarvesterParams = Static<typeof readHarvesterParamsSchema>;
export type ReadHarvesterReply = Static<typeof readHarvesterReplySchema>;

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
