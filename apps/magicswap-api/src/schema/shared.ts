import { type Static, Type } from "@sinclair/typebox";

const errorReplySchema = Type.Object({
  error: Type.String(),
});

export const badRequestReplySchema: object = {
  400: {
    description: "Bad Request",
    ...Type.Object({
      error: Type.String({
        description: "Invalid parameters specified with request",
        examples: ["Bad request"],
      }),
    }),
  },
};

export const unauthorizedReplySchema: object = {
  401: {
    description: "Unauthorized",
    ...Type.Object({
      error: Type.String({
        description: "Invalid authorization token specified with request",
        examples: ["Unauthorized"],
      }),
    }),
  },
};

export const forbiddenReplySchema: object = {
  403: {
    description: "Forbidden",
    ...Type.Object({
      error: Type.String({
        description: "Authorization token invalid for the specified resource",
        examples: ["Forbidden"],
      }),
    }),
  },
};

export const notFoundReplySchema: object = {
  404: {
    description: "Not Found",
    ...Type.Object({
      error: Type.String({
        description: "Specified resource was not found",
        examples: ["Not Found"],
      }),
    }),
  },
};

export const internalServerErrorReplySchema: object = {
  500: {
    description: "Internal Server Error",
    ...Type.Object({
      error: Type.String({
        description: "An unexpected error has occurred",
        examples: ["Internal Server Error"],
      }),
    }),
  },
};

export type ErrorReply = Static<typeof errorReplySchema>;
