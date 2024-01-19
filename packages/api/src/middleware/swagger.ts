import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

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
