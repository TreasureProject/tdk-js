import "./instrument";

import { PrismaClient } from "@prisma/client";
import * as Sentry from "@sentry/node";
import { Engine } from "@thirdweb-dev/engine";
import { createAuth } from "@treasure-dev/auth";
import {
  TREASURE_CHAIN_DEFINITION,
  TREASURE_TOPAZ_CHAIN_DEFINITION,
} from "@treasure-dev/tdk-core";
import { http, createConfig, fallback } from "@wagmi/core";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  sepolia,
} from "@wagmi/core/chains";
import { createThirdwebClient, getUser } from "thirdweb";
import { createAuth as createThirdwebAuth } from "thirdweb/auth";
import { defineChain } from "viem";

import { withAuth } from "./middleware/auth";
import { withChain } from "./middleware/chain";
import { withCors } from "./middleware/cors";
import { withErrorHandler } from "./middleware/error";
import { withSwagger } from "./middleware/swagger";
import { authRoutes } from "./routes/auth";
import { harvestersRoutes } from "./routes/harvesters";
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
    db: new PrismaClient({
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
    }),
    client,
    auth: createAuth({
      kmsKey: env.TREASURE_AUTH_KMS_KEY,
      issuer: env.TREASURE_AUTH_ISSUER,
      audience: env.TREASURE_AUTH_AUDIENCE,
    }),
    thirdwebAuth: createThirdwebAuth({
      domain: env.TREASURE_AUTH_ISSUER,
      client,
    }),
    engine: new Engine({
      url: env.THIRDWEB_ENGINE_URL,
      accessToken: env.THIRDWEB_ENGINE_ACCESS_TOKEN,
    }),
    wagmiConfig: createConfig({
      chains: [
        arbitrum,
        arbitrumSepolia,
        mainnet,
        sepolia,
        base,
        baseSepolia,
        defineChain(TREASURE_CHAIN_DEFINITION),
        defineChain(TREASURE_TOPAZ_CHAIN_DEFINITION),
      ],
      transports: {
        [arbitrum.id]: fallback([
          http(
            `https://${arbitrum.id}.rpc.thirdweb.com/${env.THIRDWEB_CLIENT_ID}`,
          ),
          http(),
        ]),
        [arbitrumSepolia.id]: fallback([
          http(
            `https://${arbitrumSepolia.id}.rpc.thirdweb.com/${env.THIRDWEB_CLIENT_ID}`,
          ),
          http(),
        ]),
        [mainnet.id]: fallback([
          http(
            `https://${mainnet.id}.rpc.thirdweb.com/${env.THIRDWEB_CLIENT_ID}`,
          ),
          http(),
        ]),
        [sepolia.id]: fallback([
          http(
            `https://${sepolia.id}.rpc.thirdweb.com/${env.THIRDWEB_CLIENT_ID}`,
          ),
          http(),
        ]),
        [base.id]: fallback([
          http(`https://${base.id}.rpc.thirdweb.com/${env.THIRDWEB_CLIENT_ID}`),
          http(),
        ]),
        [baseSepolia.id]: fallback([
          http(
            `https://${baseSepolia.id}.rpc.thirdweb.com/${env.THIRDWEB_CLIENT_ID}`,
          ),
          http(),
        ]),
        [TREASURE_CHAIN_DEFINITION.id]: fallback([
          http(
            `https://${TREASURE_CHAIN_DEFINITION.id}.rpc.thirdweb.com/${env.THIRDWEB_CLIENT_ID}`,
          ),
          http(),
        ]),
        [TREASURE_TOPAZ_CHAIN_DEFINITION.id]: fallback([
          http(
            `https://${TREASURE_TOPAZ_CHAIN_DEFINITION.id}.rpc.thirdweb.com/${env.THIRDWEB_CLIENT_ID}`,
          ),
          http(),
        ]),
      },
    }),
    getThirdwebUser: async ({ ecosystemWalletAddress }) =>
      getUser({
        client,
        ecosystem: {
          id: env.THIRDWEB_ECOSYSTEM_ID,
          partnerId: env.THIRDWEB_ECOSYSTEM_PARTNER_ID,
        },
        walletAddress: ecosystemWalletAddress,
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
  app.register(harvestersRoutes(ctx));
  app.register(magicswapRoutes(ctx));

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
  app.listen({ host: "0.0.0.0", port: Number(env.PORT) }, (err) => {
    if (err) {
      app.log.error("Error starting server:", err);
      process.exit(1);
    }
  });
};

main();
