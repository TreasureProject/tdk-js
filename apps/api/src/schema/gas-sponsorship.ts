import { type Static, Type } from "@sinclair/typebox";

export const validateBodySchema = Type.Object({
  clientId: Type.String(),
  chainId: Type.Number(),
  userOp: Type.Object({
    sender: Type.String(),
    targets: Type.Array(Type.String()),
    gasLimit: Type.String(),
    gasPrice: Type.String(),
    data: Type.Object({
      targets: Type.Array(Type.String()),
      callDatas: Type.Array(Type.String()),
      values: Type.Array(Type.String()),
    }),
  }),
});

export const validateReplySchema = Type.Object({
  isAllowed: Type.Boolean(),
  reason: Type.Optional(Type.String()),
});

const validateParamsSchema = Type.Object({
  partnerId: Type.String(),
});

export type ValidateParams = Static<typeof validateParamsSchema>;
export type ValidateReply = Static<typeof validateReplySchema>;
export type ValidateBody = Static<typeof validateBodySchema>;
