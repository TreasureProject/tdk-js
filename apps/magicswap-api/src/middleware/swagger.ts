import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import {
  badRequestReplySchema,
  forbiddenReplySchema,
  internalServerErrorReplySchema,
  unauthorizedReplySchema,
} from "../schema/shared";
import type { App } from "../utils/app";

export const withSwagger = (app: App) => {
  app.register(swagger, {
    mode: "dynamic",
    openapi: {
      openapi: "3.1.0",
      info: {
        title: "Magicswap API",
        description:
          "Backend APIs for the Treasure ecosystem's automated market maker Magicswap",
        version: "1.0.0",
        contact: {
          name: "Treasure Engineering",
          email: "engineering@treasure.lol",
        },
      },
      servers: [
        {
          url: "https://api.magicswap.lol",
          description: "Production server",
        },
        {
          url: "https://api-dev.magicswap.lol",
          description: "Development server",
        },
      ],
    },
    swagger: {
      consumes: ["application/json"],
      produces: ["application/json"],
    },
    transform: ({ schema, url }) => {
      const nextSchema = { ...schema };

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

  app.register(swaggerUi, {
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
