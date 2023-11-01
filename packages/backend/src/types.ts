import type { Static } from "@sinclair/typebox";

import type { loginBodySchema } from "./schemas/login";
import type {
  readProjectParamsSchema,
  readProjectReplySchema,
} from "./schemas/projects";

export type LoginBody = Static<typeof loginBodySchema>;

export type ReadProjectParams = Static<typeof readProjectParamsSchema>;
export type ReadProjectReply = Static<typeof readProjectReplySchema>;
