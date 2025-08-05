#!/usr/bin/env node
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}

// Find all TypeScript files in src
const entryPoints = glob.sync('src/**/*.ts', {
  ignore: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**']
});

// Build with esbuild
esbuild.build({
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
    '.tsx': 'tsx'
  },
  external: [
    'node:*',
    'react',
    'react-dom',
    '@swc/*',
    'esbuild',
    'typescript'
  ],
  logLevel: 'info'
}).then(() => {
  console.log('✅ Build completed successfully!');
}).catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});