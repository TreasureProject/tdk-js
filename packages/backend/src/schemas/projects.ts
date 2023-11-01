import { Type } from "@sinclair/typebox";

import { nullStringSchemaType } from "./common";

export const readProjectParamsSchema = Type.Object({
  slug: Type.String(),
});

export const readProjectReplySchema = Type.Object({
  slug: Type.String(),
  name: Type.String(),
  icon: nullStringSchemaType,
  cover: nullStringSchemaType,
  color: nullStringSchemaType,
});
