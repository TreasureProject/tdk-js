import "./instrument";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { PrismaClient } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { Engine } from "@thirdweb-dev/engine";
import type { SupportedChainId } from "@treasure-dev/tdk-core";
import { SUPPORTED_CHAINS } from "@treasure-dev/tdk-core";
import type { Transport } from "@wagmi/core";
import { http, createConfig, fallback } from "@wagmi/core";
import Fastify from "fastify";
import { createThirdwebClient } from "thirdweb";
import { createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";

import { withAuth } from "./middleware/auth";
import { withChain } from "./middleware/chain";
import { withCors } from "./middleware/cors";
import { withErrorHandler } from "./middleware/error";
import { withSwagger } from "./middleware/swagger";
import { authRoutes } from "./routes/auth";
import { harvestersRoutes } from "./routes/harvesters";
import { magicswapRoutes } from "./routes/magicswap";
import { projectsRoutes } from "./routes/projects";
import { transactionsRoutes } from "./routes/transactions";
import { usersRoutes } from "./routes/users";
import type { TdkApiContext } from "./types";
import { getEnv } from "./utils/env";

const main = async () => {
  const app = Fastify().withTypeProvider<TypeBoxTypeProvider>();

  const env = await getEnv();
  const client = createThirdwebClient({ secretKey: env.THIRDWEB_SECRET_KEY });
  const ctx: TdkApiContext = {
    env,
    db: new PrismaClient({
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
    }),
    client,
    auth: createAuth({
      domain: env.THIRDWEB_AUTH_DOMAIN!,
      client,
      adminAccount: privateKeyToAccount({
        client,
        privateKey: env.THIRDWEB_AUTH_PRIVATE_KEY!,
      }),
      login: {
        uri: `https://${env.THIRDWEB_AUTH_DOMAIN}`,
      },
    }),
    engine: new Engine({
      url: env.THIRDWEB_ENGINE_URL,
      accessToken: env.THIRDWEB_ENGINE_ACCESS_TOKEN,
    }),
    wagmiConfig: env.THIRDWEB_CLIENT_ID
      ? createConfig({
          chains: SUPPORTED_CHAINS,
          transports: SUPPORTED_CHAINS.reduce(
            (acc, chain) => {
              acc[chain.id] = fallback([
                http(
                  `https://${chain.id}.rpc.thirdweb.com/${env.THIRDWEB_CLIENT_ID}`,
                ),
                http(),
              ]);
              return acc;
            },
            {} as Record<SupportedChainId, Transport>,
          ),
        })
      : undefined,
  };

  // Middleware
  Sentry.setupFastifyErrorHandler(app);
  await withSwagger(app);
  await withCors(app);
  await withErrorHandler(app);
  await withChain(app);
  await withAuth(app, ctx);

  // Routes
  await Promise.all([
    app.register(authRoutes(ctx)),
    app.register(usersRoutes(ctx)),
    app.register(projectsRoutes(ctx)),
    app.register(transactionsRoutes(ctx)),
    app.register(harvestersRoutes(ctx)),
    app.register(magicswapRoutes(ctx)),
  ]);

  app.get("/healthcheck", async (_, reply) => {
    try {
      await ctx.db.$queryRaw`SELECT 1`;
    } catch (_) {
      return reply
        .code(500)
        .send({ status: "error", message: "Error connecting to database" });
    }

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
  app.listen({ host: "0.0.0.0", port: Number(env.PORT) }, (err, address) => {
    if (err) {
      console.error("Error starting server:", err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
  });
};

main();
