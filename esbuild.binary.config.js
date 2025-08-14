import { build } from 'esbuild';

/**
 * Binary-specific esbuild configuration
 * Creates CommonJS bundles compatible with pkg binary compilation
 */

const config = {
  entryPoints: {
    'claude-zen-binary': 'src/main.ts',
    'mcp-server-binary': 'src/interfaces/mcp-stdio/swarm-server.ts',
  },
  bundle: true,
  outdir: 'dist/binary',
  format: 'cjs', // CommonJS for pkg compatibility
  platform: 'node',
  target: 'node16', // Compatible with pkg
  sourcemap: false,
  minify: true, // Minimize for binary size
  keepNames: false,
  treeShaking: true,
  splitting: false,

  // TypeScript support
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.js': 'js',
    '.jsx': 'jsx',
  },

  // Bundle everything for standalone binary
  external: [
    // Only native binaries that can't be bundled
    'better-sqlite3',
    'kuzu',
    '@lancedb/lancedb',
    'canvas',
    'sharp',
    'fsevents',
  ],

  // Binary-specific settings
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.url': '"file://" + __filename',
  },

  banner: {
    js: '#!/usr/bin/env node\n// Claude Code Zen Binary Build\n'
  },

  // Handle path resolution
  resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],

  plugins: [
    {
      name: 'binary-externals',
      setup(build) {
        // External only specific native modules
        build.onResolve({ filter: /^(better-sqlite3|kuzu|@lancedb\/lancedb|canvas|sharp|fsevents)$/ }, (args) => {
          return { path: args.path, external: true };
        });
      },
    }
  ],
};

await build(config);
console.log('📦 Binary-compatible build complete!');