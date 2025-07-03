import { type Static, Type } from "@sinclair/typebox";
import { AssertError, Value } from "@sinclair/typebox/value";
import "dotenv/config";

// Define remote environment variables schema
const envSchema = Type.Object({
  // API
  PORT: Type.Number({ default: 8080 }),
  // Thirdweb
  THIRDWEB_CLIENT_ID: Type.String(),
  THIRDWEB_ENGINE_URL: Type.String(),
  THIRDWEB_ENGINE_ACCESS_TOKEN: Type.String(),
  THIRDWEB_SECRET_KEY: Type.String(),
  // Treasure Auth
  TREASURE_AUTH_ISSUER: Type.String(),
  TREASURE_AUTH_AUDIENCE: Type.String(),
  // Trove API
  TROVE_API_URL: Type.String({ default: "https://trove-api.treasure.lol" }),
  TROVE_API_KEY: Type.String(),
  // Feature Flags
  ENGINE_MAINTENANCE_MODE_ENABLED: Type.Boolean({ default: false }),
  ENGINE_TRANSACTION_SIMULATION_ENABLED: Type.Boolean({ default: false }),
});

export type TdkApiEnv = Static<typeof envSchema>;

/**
 * Validates and constructs the environment variables object
 * @returns Parsed environment variables
 */
export const getEnv = async () => {
  try {
    const env = Value.Parse(envSchema, process.env);
    return env;
  } catch (err) {
    if (err instanceof AssertError && err.error) {
      throw new Error(`${err.error.message}: ${err.error.path}`);
    }

    throw err;
  }
};
