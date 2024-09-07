import type { PrismaClient } from "@prisma/client";
import type { Engine } from "@thirdweb-dev/engine";
import type { createAuth } from "@treasure-dev/auth";
import type { Config as WagmiConfig } from "@wagmi/core";
import type { ThirdwebClient } from "thirdweb";
import type { createAuth as createThirdwebAuth } from "thirdweb/auth";

export type TdkDbSecret = {
  dbname: string;
  engine: string;
  host: string;
  password: string;
  port: number;
  username: string;
};

export type TdkApiEnv = {
  PORT: string;
  DATABASE_URL: string;
  DEFAULT_BACKEND_WALLET: string;
  THIRDWEB_AUTH_DOMAIN: string;
  THIRDWEB_AUTH_PRIVATE_KEY: string;
  THIRDWEB_CLIENT_ID: string;
  THIRDWEB_ENGINE_URL: string;
  THIRDWEB_ENGINE_ACCESS_TOKEN: string;
  THIRDWEB_SECRET_KEY: string;
  TROVE_API_URL: string;
  TROVE_API_KEY: string;
  ENGINE_MAINTENANCE_MODE_ENABLED: boolean;
};

export type TdkApiContext = {
  env: TdkApiEnv;
  db: PrismaClient;
  client: ThirdwebClient;
  auth: ReturnType<typeof createAuth>;
  thirdwebAuth: ReturnType<typeof createThirdwebAuth>;
  engine: Engine;
  wagmiConfig: WagmiConfig;
};
