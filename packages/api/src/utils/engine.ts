import { Engine } from "@thirdweb-dev/engine";

import { env } from "./env";

export const engine = new Engine({
  url: env.THIRDWEB_ENGINE_URL,
  accessToken: env.THIRDWEB_ENGINE_ACCESS_TOKEN,
});
