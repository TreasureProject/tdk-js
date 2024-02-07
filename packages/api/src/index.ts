import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { PrismaClient } from "@prisma/client";
import { Engine } from "@thirdweb-dev/engine";
import Fastify from "fastify";

import { withAuth } from "./middleware/auth";
import { withChain } from "./middleware/chain";
import { withCors } from "./middleware/cors";
import { withErrorHandler } from "./middleware/error";
import { withProject } from "./middleware/project";
import { withSwagger } from "./middleware/swagger";
import { contractsRoutes } from "./routes/contracts";
import { harvestersRoutes } from "./routes/harvesters";
import { projectsRoutes } from "./routes/projects";
import { transactionsRoutes } from "./routes/transactions";
import type { TdkApiContext } from "./types";
import { getEnv } from "./utils/env";

const main = async () => {
  const app = Fastify().withTypeProvider<TypeBoxTypeProvider>();

  const env = await getEnv();
  const ctx: TdkApiContext = {
    env,
    db: new PrismaClient({
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
    }),
    engine: new Engine({
      url: env.THIRDWEB_ENGINE_URL,
      accessToken: env.THIRDWEB_ENGINE_ACCESS_TOKEN,
    }),
  };

  // Middleware
  await withCors(app);
  await withErrorHandler(app);
  await withChain(app);
  await withProject(app, ctx);
  await withAuth(app, ctx);
  await withSwagger(app);

  // Routes
  await Promise.all([
    app.register(projectsRoutes(ctx)),
    app.register(contractsRoutes(ctx)),
    app.register(transactionsRoutes(ctx)),
    app.register(harvestersRoutes),
  ]);

  app.get("/healthcheck", async (_, reply) => reply.send("OK"));

  // Start server
  await app.ready();
  app.listen({ host: "0.0.0.0", port: Number(env.PORT) }, (err, address) => {
    if (err) {
      console.error("Error starting server:", err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
  });
};

main();
