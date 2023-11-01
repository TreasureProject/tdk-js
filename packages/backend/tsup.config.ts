import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs"],
    onSuccess: "copyfiles .env ./dist",
  },
  {
    entry: ["src/types.ts"],
    dts: {
      only: true,
    },
  },
]);
