import { TDKAPI } from "@treasure/tdk-api";

export const tdk = new TDKAPI(import.meta.env.VITE_TDK_API_URL);
