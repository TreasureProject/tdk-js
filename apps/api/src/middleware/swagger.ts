import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

import { baseReplySchema } from "../schema";

export const withSwagger = async (app: FastifyInstance) => {
  await app.register(swagger, {
    mode: "dynamic",
    openapi: {
      info: {
        title: "Treasure Development Kit API",
        description:
          "Backend APIs for the Treasure Development Kit powering the Treasure Web3 gaming ecosystem",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          authToken: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Authentication token obtained by calling POST /login",
          },
        },
      },
    },
    swagger: {
      consumes: ["application/json"],
      produces: ["application/json"],
    },
    transform: ({ schema, url }) => {
      const nextSchema = { ...schema };

      if (url.startsWith("/auth") || url.startsWith("/login")) {
        nextSchema.tags = ["auth"];
      } else if (url.startsWith("/harvesters")) {
        nextSchema.tags = ["harvesters"];
      } else if (url.startsWith("/projects")) {
        nextSchema.tags = ["projects"];
      } else if (url.startsWith("/transactions")) {
        nextSchema.tags = ["transactions"];
      } else if (url.startsWith("/users")) {
        nextSchema.tags = ["users"];
      }

      if (nextSchema.response) {
        nextSchema.response = {
          ...nextSchema.response,
          ...baseReplySchema,
        };
      }

      return { schema: nextSchema, url };
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/",
    initOAuth: {},
    uiConfig: {
      docExpansion: "none",
      // filter: true, // This options enables search bar to allow serach by tags
      deepLinking: true,
      displayOperationId: false,
      layout: "BaseLayout",
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });
};
