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
  sourcemap: true, // Always enable for TS linking
  minify: false, // Disable for better TS linking and debugging
  keepNames: true,
  treeShaking: true,
  splitting: false, // Disable to avoid linking issues
  // chunkNames: 'chunks/[name]-[hash]',

  // TypeScript support
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.js': 'js',
    '.jsx': 'jsx',
  },

  // External dependencies (only native/binary - bundle everything else for FULL system)
  external: [
    // Only native/binary dependencies that cannot be bundled
    'better-sqlite3',
    'kuzu',
    '@lancedb/lancedb',
    'canvas',
    'sharp',
    'fsevents',
    
    // Native modules that must stay external
    'pty.js',
  ],

  // Bundle everything else for complete system
  // This will create a FULL bundle with all features

  // Advanced optimizations
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },

  // Preserve JSX for React
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',

  // Handle path resolution
  resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],

  // No banner needed when everything is external

  // Plugin for handling dynamic imports
  plugins: [
    {
      name: 'node-externals',
      setup(build) {
        // Only external native/binary modules - bundle everything else
        build.onResolve({ filter: /^[^.\/]/ }, (args) => {
          // Skip if it's already in explicit external list
          if (args.path.startsWith('.') || args.path.startsWith('/')) return;
          // Only externalize specific native modules that can't be bundled
          const nativeModules = ['better-sqlite3', 'kuzu', '@lancedb/lancedb', 'canvas', 'sharp', 'fsevents', 'pty.js'];
          if (nativeModules.includes(args.path) || nativeModules.some(mod => args.path.startsWith(mod))) {
            return { path: args.path, external: true };
          }
          // Bundle everything else
          return;
        });
        
        // Handle terminal-kit README files that contain XML-like syntax
        build.onLoad({ filter: /terminal-kit.*\/README$/ }, () => {
          return {
            contents: '// Terminal-kit README file ignored during build',
            loader: 'js'
          };
        });
      },
    },
    {
      name: 'transform-dynamic-imports',
      setup(build) {
        // Transform TypeScript dynamic imports to JavaScript
        build.onLoad({ filter: /\.(ts|tsx)$/ }, async (args) => {
          const fs = await import('fs');
          const contents = await fs.promises.readFile(args.path, 'utf8');
          
          // Transform .ts/.tsx imports to .js in dynamic imports
          const transformedContents = contents
            .replace(/await import\(\s*['"`]([^'"`]+)\.ts['"`]\s*\)/g, "await import('$1.js')")
            .replace(/await import\(\s*['"`]([^'"`]+)\.tsx['"`]\s*\s*\)/g, "await import('$1.js')");
          
          return {
            contents: transformedContents,
            loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts'
          };
        });
      }
    }
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
