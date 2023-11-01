import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

export const withOpenApi = async (app: FastifyInstance) => {
  await app.register(swagger, {
    mode: "dynamic",
    openapi: {
      info: {
        title: "thirdweb Engine",
        description: "The most powerful backend engine for web3 apps.",
        version: "0.0.2",
        license: {
          name: "Apache 2.0",
          url: "http://www.apache.org/licenses/LICENSE-2.0.html",
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "For Secure Server-Server Calls",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
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
