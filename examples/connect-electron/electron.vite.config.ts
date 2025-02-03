import { resolve } from "node:path";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  main: {
    plugins: [tsconfigPaths(), nodeResolve()],
    optimizeDeps: {
      force: true, // TODO: vite cache is not working with monorepo deps updates
    },
    build: {
      outDir: "out/app/dist/main",
      rollupOptions: {
        output: {
          format: "cjs",
        },
        preserveSymlinks: true,
      },
    },
  },
  preload: {
    plugins: [tsconfigPaths()],
    optimizeDeps: {
      force: true, // TODO: vite cache is not working with monorepo deps updates
    },
    build: {
      outDir: "out/app/dist/preload",
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/preload/index.ts"),
        },
        preserveSymlinks: true,
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
      rollupOptions: {
        input: {
          launcher: resolve(__dirname, "src/renderer/index.html"),
          authComplete: resolve(__dirname, "src/renderer/auth/index.html"),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === "authComplete") {
              return "auth/auth-bundle.js";
            }
            return "assets/[name].js";
          },
          assetFileNames: () => "public/[name][extname]",
        },
      },
    },
  },
});
