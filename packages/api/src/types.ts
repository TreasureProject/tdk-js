import type { Static } from "@sinclair/typebox";

import type { errorSchema } from "./schemas/common";
import type { loginBodySchema } from "./schemas/login";
import type {
  readProjectParamsSchema,
  readProjectReplySchema,
} from "./schemas/projects";

export type ErrorReply = Static<typeof errorSchema>;

export type LoginBody = Static<typeof loginBodySchema>;

export type ReadProjectParams = Static<typeof readProjectParamsSchema>;
export type ReadProjectReply = Static<typeof readProjectReplySchema>;
