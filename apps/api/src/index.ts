import "./instrument";

import * as Sentry from "@sentry/node";
import { Engine } from "@thirdweb-dev/engine";
import { createThirdwebClient } from "thirdweb";
import { createAuth as createThirdwebAuth } from "thirdweb/auth";
import { privateKeyAccount, randomPrivateKey } from "thirdweb/wallets";

import { withAuth } from "./middleware/auth";
import { withChain } from "./middleware/chain";
import { withCors } from "./middleware/cors";
import { withErrorHandler } from "./middleware/error";
import { withSwagger } from "./middleware/swagger";
import { authRoutes } from "./routes/auth";
import { magicswapRoutes } from "./routes/magicswap";
import { transactionsRoutes } from "./routes/transactions";
import { usersRoutes } from "./routes/users";
import type { TdkApiContext } from "./types";
import { app } from "./utils/app";
import { getEnv } from "./utils/env";

const main = async () => {
  const env = await getEnv();
  const client = createThirdwebClient({ secretKey: env.THIRDWEB_SECRET_KEY });
  const ctx: TdkApiContext = {
    env,
    client,
    thirdwebAuth: createThirdwebAuth({
      // ZEE: Replace this with your own admin account (preferrable a KMS account)
      adminAccount: privateKeyAccount({
        client,
        privateKey: randomPrivateKey(),
      }),
      domain: env.TREASURE_AUTH_ISSUER,
      client,
    }),
    engine: new Engine({
      url: env.THIRDWEB_ENGINE_URL,
      accessToken: env.THIRDWEB_ENGINE_ACCESS_TOKEN,
    }),
  };

  // Middleware
  Sentry.setupFastifyErrorHandler(app);
  withCors(app);
  withSwagger(app);
  withErrorHandler(app);
  withChain(app);
  withAuth(app, ctx);

  // Routes
  app.register(authRoutes(ctx));
  app.register(usersRoutes(ctx));
  app.register(transactionsRoutes(ctx));
  app.register(magicswapRoutes(ctx));

  app.get("/healthcheck", async (_, reply) => {
    try {
      await ctx.engine.default.getJson();
    } catch (_) {
      return reply.code(500).send({
        status: "error",
        message: "Error connecting to Thirdweb Engine",
      });
    }

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
