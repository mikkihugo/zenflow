import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/integration/code-mesh-bridge.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  outDir: 'dist',
  target: 'es2022',
  platform: 'node',
  external: [
    '@claude-zen/foundation',
    '@claude-zen/llm-routing',
    'fast-glob',
    'ignore',
    'typescript'
  ]
});