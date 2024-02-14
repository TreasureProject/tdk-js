import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import "dotenv/config";

const client = new SecretsManagerClient({
  region: "us-west-2",
});

type Env = {
  PORT: string;
  DATABASE_URL: string;
  DEFAULT_BACKEND_WALLET: string;
  THIRDWEB_AUTH_DOMAIN: string;
  THIRDWEB_AUTH_PRIVATE_KEY: string;
  THIRDWEB_ENGINE_URL: string;
  THIRDWEB_ENGINE_ACCESS_TOKEN: string;
  THIRDWEB_SECRET_KEY: string;
};

export const getEnv = async (): Promise<Env> => {
  let remoteEnv: Env | undefined;
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
  };
};
