#!/usr/bin/env node
import * as esbuild from 'esbuild';
import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}

// Find all TypeScript files in src
const entryPoints = await glob('src/**/*.ts', {
  ignore: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**', '**/sparc/**', '**/tools/**'],
});

console.log(`📦 Building ${entryPoints.length} TypeScript files...`);

// Build with esbuild
try {
  await esbuild.build({
    entryPoints,
    bundle: false,
    format: 'esm',
    target: 'es2022',
    platform: 'node',
    outdir: 'dist',
    preserveSymlinks: true,
    sourcemap: true,
    loader: {
      '.ts': 'ts',
      '.tsx': 'tsx',
    },
    logLevel: 'info',
  });

  console.log('✅ Build completed successfully!');

  // Count output files
  const jsFiles = await glob('dist/**/*.js');
  console.log(`📊 Generated ${jsFiles.length} JavaScript files`);
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
