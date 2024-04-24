import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import "dotenv/config";

import type { TdkApiEnv } from "../types";

const client = new SecretsManagerClient({
  region: "us-east-1",
});

export const getEnv = async (): Promise<TdkApiEnv> => {
  let remoteEnv: TdkApiEnv | undefined;
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: "tdkApiEnv",
      }),
    );

    if (response.SecretString) {
      remoteEnv = JSON.parse(response.SecretString);
    }
  } catch (err) {
    console.error(err);
  }

  return {
    PORT: process.env.PORT ?? remoteEnv?.PORT ?? "8080",
    DATABASE_URL: process.env.DATABASE_URL ?? remoteEnv?.DATABASE_URL ?? "",
    DEFAULT_BACKEND_WALLET:
      process.env.DEFAULT_BACKEND_WALLET ??
      remoteEnv?.DEFAULT_BACKEND_WALLET ??
      "",
    THIRDWEB_AUTH_DOMAIN:
      process.env.THIRDWEB_AUTH_DOMAIN ?? remoteEnv?.THIRDWEB_AUTH_DOMAIN ?? "",
    THIRDWEB_AUTH_PRIVATE_KEY:
      process.env.THIRDWEB_AUTH_PRIVATE_KEY ??
      remoteEnv?.THIRDWEB_AUTH_PRIVATE_KEY ??
      "",
    THIRDWEB_ENGINE_URL:
      process.env.THIRDWEB_ENGINE_URL ?? remoteEnv?.THIRDWEB_ENGINE_URL ?? "",
    THIRDWEB_ENGINE_ACCESS_TOKEN:
      process.env.THIRDWEB_ENGINE_ACCESS_TOKEN ??
      remoteEnv?.THIRDWEB_ENGINE_ACCESS_TOKEN ??
      "",
    THIRDWEB_SECRET_KEY:
      process.env.THIRDWEB_SECRET_KEY ?? remoteEnv?.THIRDWEB_SECRET_KEY ?? "",
    TROVE_API_URL:
      process.env.TROVE_API_URL ??
      remoteEnv?.TROVE_API_URL ??
      "https://trove-api.treasure.lol",
    TROVE_API_KEY: process.env.TROVE_API_KEY ?? remoteEnv?.TROVE_API_KEY ?? "",
    ZEEVERSE_API_URL:
      process.env.ZEEVERSE_API_URL ?? "https://api.zee-verse.com",
  };
};
