import { Type } from "@sinclair/typebox";

import { chainIdSchemaType, ethereumAddressSchemaType } from "./common";

export const loginBodySchema = Type.Object({
  project: Type.String(),
  chainId: chainIdSchemaType,
  address: ethereumAddressSchemaType,
});
