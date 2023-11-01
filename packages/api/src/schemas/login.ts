import { Type } from "@sinclair/typebox";

import { chainIdSchema, ethereumAddressSchema } from "./common";

export const loginBodySchema = Type.Object({
  project: Type.String(),
  chainId: chainIdSchema,
  address: ethereumAddressSchema,
});
