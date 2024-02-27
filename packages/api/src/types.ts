import type { PrismaClient } from "@prisma/client";
import type { Engine } from "@thirdweb-dev/engine";

import type { SUPPORTED_CHAIN_IDS } from "./utils/wagmi";

export type TdkApiEnv = {
  PORT: string;
  DATABASE_URL: string;
  DEFAULT_BACKEND_WALLET: string;
  THIRDWEB_AUTH_DOMAIN: string;
  THIRDWEB_AUTH_PRIVATE_KEY: string;
  THIRDWEB_ENGINE_URL: string;
  THIRDWEB_ENGINE_ACCESS_TOKEN: string;
  THIRDWEB_SECRET_KEY: string;
  ZEEVERSE_API_URL: string;
};

export type TdkApiContext = {
  env: TdkApiEnv;
  db: PrismaClient;
  engine: Engine;
};

export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];
