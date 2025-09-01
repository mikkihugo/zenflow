
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false, // Skip DTS generation with tsup, use tsc instead
  clean: true,
  outDir: 'dist',
  target: 'es2022',
  splitting: false,
  sourcemap: true,
  minify: false,
  external: ['xstate', 'eventemitter3', 'immer', 'zod'],
});
