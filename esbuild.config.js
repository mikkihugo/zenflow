import path from 'node:path';
import { build } from 'esbuild';
import { glob } from 'glob';

const isProduction = process.env.NODE_ENV === 'production';
const isWatch = process.argv.includes('--watch');

// Just 2 entry points: main app + MCP server for swarms
const entryPoints = {
  'claude-zen': 'src/main.ts', // Main application (all modes)
  'mcp-server': 'src/interfaces/mcp/start-server.ts', // MCP stdio server for swarms
};

const config = {
  entryPoints,
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  platform: 'node',
  target: 'node18',
  sourcemap: !isProduction,
  minify: isProduction,
  keepNames: true,
  treeShaking: true,
  splitting: true,
  chunkNames: 'chunks/[name]-[hash]',

  // TypeScript support
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.js': 'js',
    '.jsx': 'jsx',
  },

  // External dependencies (don't bundle node_modules)
  external: [
    'better-sqlite3',
    'kuzu',
    '@lancedb/lancedb',
    'canvas', // if used
    'sharp', // if used
    'fsevents', // Mac-specific
  ],

  // Advanced optimizations
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },

  // Preserve JSX for React
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',

  // Handle path resolution
  resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],

  // Banner for Node.js ESM compatibility
  banner: {
    js: `
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    `,
  },

  // Plugin for handling dynamic imports
  plugins: [
    {
      name: 'node-externals',
      setup(build) {
        // Mark certain packages as external
        build.onResolve({ filter: /^(sqlite3|better-sqlite3|kuzu)$/ }, (args) => {
          return { path: args.path, external: true };
        });
      },
    },
  ],
};

if (isWatch) {
  const ctx = await build({
    ...config,
    incremental: true,
    watch: {
      onRebuild(error, result) {
        if (error) console.error('❌ Build failed:', error);
        else console.log('✅ Build succeeded');
      },
    },
  });
  console.log('👀 Watching for changes...');
} else {
  await build(config);
  console.log('🎉 Build complete!');
}
