import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";
import {
  badRequestReplySchema,
  forbiddenReplySchema,
  internalServerErrorReplySchema,
  unauthorizedReplySchema,
} from "../schema";

export const withSwagger = async (app: FastifyInstance) => {
  await app.register(swagger, {
    mode: "dynamic",
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "Treasure Development Kit API",
        description:
          "Backend APIs for the Treasure Development Kit powering the Treasure Web3 gaming ecosystem",
        version: "1.0.0",
        contact: {
          name: "Treasure Engineering",
          email: "engineering@treasure.lol",
        },
      },
      servers: [
        {
          url: "https://tdk-api.treasure.lol",
          description: "Production server",
        },
        {
          url: "https://tdk-api.spellcaster.lol",
          description: "Development server",
        },
      ],
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

      if (url.startsWith("/login")) {
        nextSchema.tags = ["auth"];
      } else if (url.startsWith("/harvesters")) {
        nextSchema.tags = ["harvesters"];
      } else if (url.startsWith("/magicswap")) {
        nextSchema.tags = ["magicswap"];
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
          // 400 possible if endpoint accepts body payload
          ...(nextSchema.body
            ? {
                ...badRequestReplySchema,
              }
            : undefined),
          // 401 and 403 possible if endpoint requires authentication
          ...(nextSchema.security
            ? {
                ...unauthorizedReplySchema,
                ...forbiddenReplySchema,
              }
            : undefined),
          ...internalServerErrorReplySchema,
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
