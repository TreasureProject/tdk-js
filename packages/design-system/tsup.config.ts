import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  splitting: true,
  sourcemap: true,
  clean: true,
  format: ['cjs', 'esm'],
  skipNodeModulesBundle: true,
  dts: true,
});
