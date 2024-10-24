import type { PrismaClient } from "@prisma/client";
import type { Engine } from "@thirdweb-dev/engine";
import type { createAuth } from "@treasure-dev/auth";
import type { Config as WagmiConfig } from "@wagmi/core";
import type { ThirdwebClient } from "thirdweb";
import type { createAuth as createThirdwebAuth } from "thirdweb/auth";

import type { TdkApiEnv } from "./utils/env";

export type TdkApiContext = {
  env: TdkApiEnv;
  db: PrismaClient;
  client: ThirdwebClient;
  auth: ReturnType<typeof createAuth>;
  thirdwebAuth: ReturnType<typeof createThirdwebAuth>;
  engine: Engine;
  wagmiConfig: WagmiConfig;
};
