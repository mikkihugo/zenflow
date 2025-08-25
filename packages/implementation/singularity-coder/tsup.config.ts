import { defineConfig } from 'tsup';
import { copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  entry: ['src/index.ts', 'src/integration/code-mesh-bridge.ts'],
  format: ['esm'], // Pure ES2022 modules only'
  dts: true, // Enable TypeScript definitions
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
    'typescript',
    'os-utils',
    'systeminformation',
  ],
  onSuccess: () => {
    // Copy WASM files after build
    const pkgDir = resolve(__dirname, 'rust-core/code-mesh-wasm/pkg');'
    const distDir = resolve(__dirname, 'dist');'

    const wasmFiles = [
      'code_mesh_wasm_bg.wasm',
      'code_mesh_wasm.wasm',
      'code_mesh_wasm.js',
    ];

    wasmFiles.forEach((file) => {
      const srcPath = resolve(pkgDir, file);
      const destPath = resolve(distDir, file);
      if (existsSync(srcPath)) {
        copyFileSync(srcPath, destPath);
        console.log(`Copied ${file} to dist/`);`
      }
    });

    return Promise.resolve();
  },
});
