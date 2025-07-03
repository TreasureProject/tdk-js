import type { Engine } from "@thirdweb-dev/engine";
import type { ThirdwebClient } from "thirdweb";
import type { createAuth as createThirdwebAuth } from "thirdweb/auth";

import type { TdkApiEnv } from "./utils/env";

export type TdkApiContext = {
  env: TdkApiEnv;
  client: ThirdwebClient;
  thirdwebAuth: ReturnType<typeof createThirdwebAuth>;
  engine: Engine;
};
