import type { Database } from "./db";
import type { Env } from "./utils/env";

export type Context = {
  env: Env;
  db: Database;
};
