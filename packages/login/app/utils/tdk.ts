import { TDKAPI } from "@treasure/tdk-api";

import { env } from "./env";

export const tdk = new TDKAPI(env.VITE_TDK_API_URL);
