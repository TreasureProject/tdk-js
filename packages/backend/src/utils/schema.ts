import { Type } from "@sinclair/typebox";

export const ethereumAddressSchemaType = Type.RegExp("/^0x[a-fA-F0-9]{40}$/g");
export const nullStringSchemaType = Type.Union([Type.String(), Type.Null()]);

export const chainIdSchemaType = Type.Union([
  Type.Literal(42161), // arb
  Type.Literal(421613), // arbgoerli
]);

export const errorSchemaType = Type.Object({
  error: Type.String(),
});

export const baseReplySchema: object = {
  400: {
    description: "Bad Request",
    ...errorSchemaType,
  },
  404: {
    description: "Not Found",
    ...errorSchemaType,
  },
  500: {
    description: "Internal Server Error",
    ...errorSchemaType,
  },
};
