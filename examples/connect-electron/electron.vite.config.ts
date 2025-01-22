import { resolve } from "node:path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

const externalizedDependenciesExcludeList = ["electron-app-package-json"];

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        exclude: externalizedDependenciesExcludeList,
      }),
      nodeResolve(),
    ],
    optimizeDeps: {
      force: true, // TODO: vite cache is not working with monorepo deps updates
    },
    build: {
      outDir: "out/app/dist/main",
      rollupOptions: {
        output: {
          format: "cjs",
        },
      },
    },
  },
  preload: {
    plugins: [
      externalizeDepsPlugin({
        exclude: externalizedDependenciesExcludeList,
      }),
    ],
    optimizeDeps: {
      force: true, // TODO: vite cache is not working with monorepo deps updates
    },
    build: {
      outDir: "out/app/dist/preload",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/preload/index.ts"),
        },
        output: {
          format: "cjs",
        },
      },
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
