import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { type Static, Type } from "@sinclair/typebox";
import { AssertError, Value } from "@sinclair/typebox/value";
import "dotenv/config";

import { DEFAULT_TDK_ECOSYSTEM_ID } from "@treasure-dev/tdk-core";
import { log } from "./log";

// Parse local environment variables
const { AWS_REGION, DATABASE_SECRET_NAME, API_ENV_SECRET_NAME, DATABASE_URL } =
  Value.Parse(
    Type.Object({
      AWS_REGION: Type.String({ default: "us-east-1" }),
      DATABASE_SECRET_NAME: Type.String({ default: "production-identity-db" }),
      API_ENV_SECRET_NAME: Type.String({ default: "tdkApiEnv" }),
      DATABASE_URL: Type.Optional(Type.String()),
    }),
    process.env,
  );

// Define remote environment variables schema
const envSchema = Type.Object({
  PORT: Type.Number({ default: 8080 }),
  DATABASE_URL: Type.String(),
  THIRDWEB_CLIENT_ID: Type.String(),
  THIRDWEB_ENGINE_URL: Type.String(),
  THIRDWEB_ENGINE_ACCESS_TOKEN: Type.String(),
  THIRDWEB_SECRET_KEY: Type.String(),
  THIRDWEB_ECOSYSTEM_ID: Type.TemplateLiteral(
    [Type.Literal("ecosystem."), Type.String()],
    { default: DEFAULT_TDK_ECOSYSTEM_ID },
  ),
  THIRDWEB_ECOSYSTEM_PARTNER_ID: Type.String(),
  TREASURE_AUTH_KMS_KEY: Type.String(),
  TREASURE_AUTH_ISSUER: Type.String(),
  TREASURE_AUTH_AUDIENCE: Type.String(),
  TROVE_API_URL: Type.String({ default: "https://trove-api.treasure.lol" }),
  TROVE_API_KEY: Type.String(),
  ENGINE_MAINTENANCE_MODE_ENABLED: Type.Boolean({ default: false }),
  ENGINE_TRANSACTION_SIMULATION_ENABLED: Type.Boolean({ default: false }),
});

export type TdkApiEnv = Static<typeof envSchema>;

// Create AWS Secrets Manager client
const client = new SecretsManagerClient({
  region: AWS_REGION,
});

/**
 * Fetches a secret from AWS Secrets Manager and parses it as JSON
 * @param name AWS Secrets Manager secret name
 * @returns Parsed secret data
 */
const getSecretJson = async (name: string) => {
  log.info(`Fetching secret: ${name}`);

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
    log.warn(`Could not fetch secret ${name}: ${err}`);
  }

  return undefined;
};

/**
 * Constructs a database connection string from the local environment variables or the database secret
 * @returns Database connection string
 */
const getDatabaseUrl = async () => {
  if (DATABASE_URL) {
    log.info("Using database connection string from environment");
    return DATABASE_URL;
  }

  const secret = (await getSecretJson(DATABASE_SECRET_NAME)) as
    | {
        dbname: string;
        engine: string;
        host: string;
        password: string;
        port: number;
        username: string;
      }
    | undefined;
  if (!secret) {
    return undefined;
  }

  log.info("Using database connection string from secret");
  const { engine, username, password, host, port, dbname } = secret;
  return `${engine}://${username}:${password}@${host}:${port}/${dbname}`;
};

/**
 * Validates and constructs the environment variables object by combining local environment variables and secrets
 * @returns Parsed environment variables
 */
export const getEnv = async () => {
  const [databaseUrl, envSecret] = (await Promise.all([
    getDatabaseUrl(),
    getSecretJson(API_ENV_SECRET_NAME),
  ])) as [string | undefined, object | undefined];
  try {
    const env = Value.Parse(envSchema, {
      ...envSecret,
      ...process.env,
      DATABASE_URL: databaseUrl,
    });
    return env;
  } catch (err) {
    if (err instanceof AssertError && err.error) {
      throw new Error(`${err.error.message}: ${err.error.path}`);
    }

    throw err;
  }
};
