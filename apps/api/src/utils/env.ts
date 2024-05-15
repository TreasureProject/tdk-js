import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import "dotenv/config";

import type { TdkApiEnv, TdkDbSecret } from "../types";

const AWS_REGION = process.env.AWS_REGION ?? "us-east-1";
const DATABASE_SECRET_NAME =
  process.env.DATABASE_SECRET_NAME ?? "noumena-tdk-db";
const API_ENV_SECRET_NAME = process.env.API_ENV_SECRET_NAME ?? "tdkApiEnv";

const client = new SecretsManagerClient({
  region: AWS_REGION,
});

const getSecretJson = async (name: string) => {
  console.log("Fetching secret:", name);

  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: name,
      }),
    );

    if (response.SecretString) {
      return JSON.parse(response.SecretString);
    }
  } catch (err) {
    console.error(`Error fetching ${name} secret:`, err);
  }

  return undefined;
};

const getDatabaseUrl = async () => {
  if (process.env.DATABASE_URL) {
    console.log("Using database connection string from environment");
    return process.env.DATABASE_URL;
  }

  const secret = (await getSecretJson(DATABASE_SECRET_NAME)) as
    | TdkDbSecret
    | undefined;
  if (!secret) {
    console.error("No database connection string found");
    return undefined;
  }

  console.log("Using database connection string from secret");
  const { engine, username, password, host, port, dbname } = secret;
  return `${engine}://${username}:${password}@${host}:${port}/${dbname}`;
};

export const getEnv = async (): Promise<TdkApiEnv> => {
  const [databaseUrl, envSecret] = (await Promise.all([
    getDatabaseUrl(),
    getSecretJson(API_ENV_SECRET_NAME),
  ])) as [string | undefined, TdkApiEnv | undefined];
  return {
    PORT: process.env.PORT ?? envSecret?.PORT ?? "8080",
    DATABASE_URL: databaseUrl ?? "",
    DEFAULT_BACKEND_WALLET:
      process.env.DEFAULT_BACKEND_WALLET ??
      envSecret?.DEFAULT_BACKEND_WALLET ??
      "",
    THIRDWEB_AUTH_DOMAIN:
      process.env.THIRDWEB_AUTH_DOMAIN ?? envSecret?.THIRDWEB_AUTH_DOMAIN ?? "",
    THIRDWEB_AUTH_PRIVATE_KEY:
      process.env.THIRDWEB_AUTH_PRIVATE_KEY ??
      envSecret?.THIRDWEB_AUTH_PRIVATE_KEY ??
      "",
    THIRDWEB_CLIENT_ID:
      process.env.THIRDWEB_CLIENT_ID ?? envSecret?.THIRDWEB_CLIENT_ID ?? "",
    THIRDWEB_ENGINE_URL:
      process.env.THIRDWEB_ENGINE_URL ?? envSecret?.THIRDWEB_ENGINE_URL ?? "",
    THIRDWEB_ENGINE_ACCESS_TOKEN:
      process.env.THIRDWEB_ENGINE_ACCESS_TOKEN ??
      envSecret?.THIRDWEB_ENGINE_ACCESS_TOKEN ??
      "",
    THIRDWEB_SECRET_KEY:
      process.env.THIRDWEB_SECRET_KEY ?? envSecret?.THIRDWEB_SECRET_KEY ?? "",
    TROVE_API_URL:
      process.env.TROVE_API_URL ??
      envSecret?.TROVE_API_URL ??
      "https://trove-api.treasure.lol",
    TROVE_API_KEY: process.env.TROVE_API_KEY ?? envSecret?.TROVE_API_KEY ?? "",
    ZEEVERSE_API_URL:
      process.env.ZEEVERSE_API_URL ?? "https://api.zee-verse.com",
  };
};
