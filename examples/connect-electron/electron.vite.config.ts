import { resolve } from "node:path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), nodeResolve()],
    optimizeDeps: {
      force: true, // TODO: vite cache is not working with monorepo deps updates
    },
    build: {
      outDir: "out/app/dist/main",
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    optimizeDeps: {
      force: true, // TODO: vite cache is not working with monorepo deps updates
    },
    build: {
      outDir: "out/app/dist/preload",
    },
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
      },
    },
    plugins: [react(), nodeResolve()],
    optimizeDeps: {
      force: true, // TODO: vite cache is not working with monorepo deps updates
    },
    build: {
      outDir: "out/app/dist/renderer",
    },
  },
});
