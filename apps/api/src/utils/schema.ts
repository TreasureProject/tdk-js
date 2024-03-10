import { type Static, Type } from "@sinclair/typebox";

import { SUPPORTED_CHAINS } from "./wagmi";

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
