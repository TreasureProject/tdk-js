import type { Project } from "@prisma/client";

export type ErrorReply = { error: string };

export type ReadProjectReply =
  | ErrorReply
  | Pick<Project, "slug" | "name" | "icon" | "cover" | "color">;
