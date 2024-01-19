import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT || 8080),
  DEFAULT_BACKEND_WALLET: process.env.DEFAULT_BACKEND_WALLET ?? "",
  THIRDWEB_AUTH_DOMAIN: process.env.THIRDWEB_AUTH_DOMAIN ?? "",
  THIRDWEB_AUTH_PRIVATE_KEY: process.env.THIRDWEB_AUTH_PRIVATE_KEY ?? "",
  THIRDWEB_ENGINE_URL: process.env.THIRDWEB_ENGINE_URL ?? "",
  THIRDWEB_ENGINE_ACCESS_TOKEN: process.env.THIRDWEB_ENGINE_ACCESS_TOKEN ?? "",
};
