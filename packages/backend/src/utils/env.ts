import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT || 8080),
  DEFAULT_BACKEND_WALLET: process.env.DEFAULT_BACKEND_WALLET ?? "",
  THIRDWEB_ENGINE_URL: process.env.THIRDWEB_ENGINE_URL ?? "",
};
