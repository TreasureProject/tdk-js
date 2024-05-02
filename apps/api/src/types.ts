import type { PrismaClient } from "@prisma/client";
import type { Engine } from "@thirdweb-dev/engine";
import type { ThirdwebClient } from "thirdweb";
import type { createAuth } from "thirdweb/auth";

export type ThirdwebAuth = ReturnType<typeof createAuth>;

export type TdkApiEnv = {
  PORT: string;
  DATABASE_URL: string;
  DEFAULT_BACKEND_WALLET: string;
  THIRDWEB_AUTH_DOMAIN: string;
  THIRDWEB_AUTH_PRIVATE_KEY: string;
  THIRDWEB_ENGINE_URL: string;
  THIRDWEB_ENGINE_ACCESS_TOKEN: string;
  THIRDWEB_SECRET_KEY: string;
  TROVE_API_KEY: string;
  ZEEVERSE_API_URL: string;
};

export type TdkApiContext = {
  env: TdkApiEnv;
  db: PrismaClient;
  client: ThirdwebClient;
  auth: ThirdwebAuth;
  engine: Engine;
};
