import { type Static, Type } from "@sinclair/typebox";
import { EXAMPLE_WALLET_ADDRESS, nullableStringSchema } from "./shared";
import {
  sessionSchema,
  userProfileSchema,
  userPublicProfileSchema,
  userSchema,
} from "./users";

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
  adminAccount: Type.Optional(Type.Object({
    payload: loginPayloadSchema,
    signature: Type.String(),
  })),
  authTokenDurationSec: Type.Optional(
    Type.Integer({
      minimum: 3_600, // 1 minute
      maximum: 604_800, // 1 week
      default: 86_400, // 1 day
    }),
  ),
});

export const loginReplySchema = Type.Object({
  token: Type.String({
    description: "Authorization token for the logged in user",
  }),
  user: Type.Intersect([
    userSchema,
    userProfileSchema,
    Type.Object({
      sessions: Type.Array(sessionSchema),
    }),
  ]),
  legacyProfiles: Type.Array(
    Type.Intersect([
      Type.Object({
        id: Type.String(),
        legacyAddress: nullableStringSchema,
      }),
      Type.Omit(userPublicProfileSchema, ["socialAccounts"]),
    ]),
  ),
});

export const loginCustomBodySchema = Type.Object({
  payload: Type.String(),
});

export const loginCustomReplySchema = Type.Object({
  userId: Type.String(),
  email: Type.String(),
  exp: Type.Number(),
});

export type ReadLoginPayloadQuerystring = Static<
  typeof readLoginPayloadQuerystringSchema
>;
export type ReadLoginPayloadReply = Static<typeof readLoginPayloadReplySchema>;
export type LoginBody = Static<typeof loginBodySchema>;
export type LoginReply = Static<typeof loginReplySchema>;
export type LoginCustomBody = Static<typeof loginCustomBodySchema>;
export type LoginCustomReply = Static<typeof loginCustomReplySchema>;
