import "./instrument";

import * as Sentry from "@sentry/node";

import { createDatabase } from "./db";
import { withCors } from "./middleware/cors";
import { withErrorHandler } from "./middleware/error";
import { withSwagger } from "./middleware/swagger";
import { poolsRoutes } from "./routes/pools";
import { tokensRoutes } from "./routes/tokens";
import type { Context } from "./types";
import { app } from "./utils/app";
import { getEnv } from "./utils/env";

const main = async () => {
  const env = await getEnv();
  const ctx: Context = {
    env,
    db: createDatabase(env.DATABASE_URL),
  };

  // Middleware
  Sentry.setupFastifyErrorHandler(app);
  withCors(app);
  withSwagger(app);
  withErrorHandler(app);

  // Routes
  app.register(poolsRoutes(ctx));
  app.register(tokensRoutes(ctx));

  app.get("/healthcheck", async (_, reply) => {
    reply.send({ status: "ok" });
  });

  // Start server
  await app.ready();
  app.listen({ host: "0.0.0.0", port: Number(env.PORT) }, (err) => {
    if (err) {
      app.log.error("Error starting server:", err);
      process.exit(1);
    }
  });
};

main();
