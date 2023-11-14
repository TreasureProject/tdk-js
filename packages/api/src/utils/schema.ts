import { type Static, Type } from "@sinclair/typebox";

export const ethereumAddressSchema = Type.RegExp("/^0x[a-fA-F0-9]{40}$/g");
export const nullableStringSchema = Type.Union([Type.String(), Type.Null()]);

export const chainIdSchema = Type.Union([
  Type.Literal(42161), // arb
  Type.Literal(421613), // arbgoerli
  Type.Literal(421614), // arbsepolia
]);

export const errorReplySchema = Type.Object({
  error: Type.String(),
});

export const baseReplySchema: object = {
  400: {
    description: "Bad Request",
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
