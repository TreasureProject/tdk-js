import { Type } from "@sinclair/typebox";

import { nullStringSchema } from "./common";

export const readProjectParamsSchema = Type.Object({
  slug: Type.String(),
});

export const readProjectReplySchema = Type.Object({
  slug: Type.String(),
  name: Type.String(),
  icon: nullStringSchema,
  cover: nullStringSchema,
  color: nullStringSchema,
});
