import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    onSuccess: "copyfiles .env ./dist",
  },
]);
