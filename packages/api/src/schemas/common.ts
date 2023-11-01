import { Type } from "@sinclair/typebox";

export const ethereumAddressSchema = Type.RegExp("/^0x[a-fA-F0-9]{40}$/g");
export const nullStringSchema = Type.Union([Type.String(), Type.Null()]);

export const chainIdSchema = Type.Union([
  Type.Literal(42161), // arb
  Type.Literal(421613), // arbgoerli
]);

export const errorSchema = Type.Object({
  error: Type.String(),
});

export const baseReplySchema: object = {
  400: {
    description: "Bad Request",
    ...errorSchema,
  },
  404: {
    description: "Not Found",
    ...errorSchema,
  },
  500: {
    description: "Internal Server Error",
    ...errorSchema,
  },
};
